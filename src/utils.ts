import type { Chain, CliResponse, OutputFormat } from "./types.js";
import chalk from "chalk";

/* ─── Config ────────────────────────────────────────── */

export function getApiKeys() {
  return {
    solscan: process.env.SOLSCAN_API_KEY || "",
    etherscan: process.env.ETHERSCAN_API_KEY || "",
    bscscan: process.env.BSCSCAN_API_KEY || "",
  };
}

/* ─── Chain Detection ───────────────────────────────── */

const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function detectChain(input: string): Chain | null {
  if (input.startsWith("0x")) {
    if (input.length === 42) return "ethereum";
    if (input.length === 66) return "ethereum";
    return null;
  }
  if (SOLANA_RE.test(input)) return "solana";
  return null;
}

export function resolveChain(chainOpt: string | undefined, input: string): Chain {
  if (chainOpt) {
    const c = chainOpt.toLowerCase();
    if (["solana", "ethereum", "bsc"].includes(c)) return c as Chain;
    throw new Error(`Unsupported chain: "${chainOpt}". Use: solana, ethereum, bsc`);
  }
  const detected = detectChain(input);
  if (!detected) {
    throw new Error(
      `Cannot detect chain for "${input.slice(0, 20)}...". Use --chain flag.`
    );
  }
  return detected;
}

/* ─── Response Builders ─────────────────────────────── */

export function ok<T>(chain: Chain, data: T): CliResponse<T> {
  return { status: "ok", chain, data };
}

export function err(chain: Chain, message: string): CliResponse {
  return { status: "error", chain, error: message };
}

/* ─── Output ────────────────────────────────────────── */

export function printJson(data: unknown) {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

export function printPretty(data: CliResponse, format: OutputFormat) {
  if (format === "json" || !process.stdout.isTTY) {
    printJson(data);
    return;
  }
  if (data.status === "error") {
    console.error(chalk.red(`✗ ${data.error}`));
    return;
  }

  const d = data.data as Record<string, unknown>;
  if (!d) return;

  // Wallet
  if (d.address && d.balance !== undefined) {
    console.log(chalk.bold("\nWallet"));
    console.log(`  ${chalk.dim("Address")}  ${chalk.cyan(d.address as string)}`);
    console.log(`  ${chalk.dim("Balance")}  ${chalk.green(d.balance as string)} ${chalk.dim(`(${data.chain})`)}`);

    const tokens = d.tokens as Array<Record<string, unknown>> | undefined;
    if (tokens?.length) {
      console.log(chalk.bold("\nTokens"));
      for (const t of tokens) {
        const usd = t.usdValue ? chalk.dim(` ~$${t.usdValue}`) : "";
        console.log(`  ${chalk.yellow(t.symbol as string).padEnd(10)} ${(t.balance as string).padStart(16)}${usd}`);
      }
    }

    const txs = d.recentTx as Array<Record<string, unknown>> | undefined;
    if (txs?.length) {
      console.log(chalk.bold("\nRecent Transactions"));
      for (const tx of txs) {
        const icon = tx.status === "success" ? chalk.green("✓") : tx.status === "failed" ? chalk.red("✗") : chalk.dim("○");
        console.log(`  ${icon} ${chalk.dim(tx.hash as string).slice(0, 20)}…  ${(tx.type as string).padEnd(8)} ${tx.value} ${chalk.dim(tx.timestamp as string)}`);
      }
    }
    console.log();
    return;
  }

  // Contract
  if (d.verified !== undefined) {
    console.log(chalk.bold("\nContract"));
    console.log(`  ${chalk.dim("Address")}    ${chalk.cyan(d.address as string)}`);
    console.log(`  ${chalk.dim("Verified")}   ${d.verified ? chalk.green("Yes") : chalk.red("No")}`);
    if (d.name) console.log(`  ${chalk.dim("Name")}      ${d.name}`);
    if (d.compiler) console.log(`  ${chalk.dim("Compiler")}  ${d.compiler}`);
    if (d.license) console.log(`  ${chalk.dim("License")}   ${d.license}`);
    if (d.abi) console.log(`  ${chalk.dim("ABI")}       ${(d.abi as string).length > 100 ? chalk.dim("(truncated)") : d.abi}`);
    console.log();
    return;
  }

  // TX
  if (d.block !== undefined) {
    console.log(chalk.bold("\nTransaction"));
    const statusIcon = d.status === "success" ? chalk.green("✓ Success") : d.status === "failed" ? chalk.red("✗ Failed") : chalk.dim("○ Pending");
    console.log(`  ${chalk.dim("Hash")}    ${chalk.cyan(d.hash as string)}`);
    console.log(`  ${chalk.dim("Status")}  ${statusIcon}`);
    console.log(`  ${chalk.dim("Block")}   ${d.block}`);
    console.log(`  ${chalk.dim("From")}   ${chalk.cyan(d.from as string)}`);
    console.log(`  ${chalk.dim("To")}     ${chalk.cyan(d.to as string)}`);
    console.log(`  ${chalk.dim("Value")}  ${chalk.green(d.value as string)}`);
    console.log(`  ${chalk.dim("Fee")}    ${(d.fee as string) || "—"}`);
    if (d.gasUsed) console.log(`  ${chalk.dim("Gas")}    ${d.gasUsed} used @ ${d.gasPrice} gwei`);
    console.log();
    return;
  }

  // Token
  if (d.symbol !== undefined) {
    console.log(chalk.bold("\nToken"));
    console.log(`  ${chalk.dim("Address")}  ${chalk.cyan(d.address as string)}`);
    console.log(`  ${chalk.dim("Name")}     ${d.name}`);
    console.log(`  ${chalk.dim("Symbol")}   ${chalk.yellow(d.symbol as string)}`);
    console.log(`  ${chalk.dim("Supply")}   ${(d.totalSupply as string) || "—"}`);
    if (d.holders) console.log(`  ${chalk.dim("Holders")}  ${d.holders}`);
    if (d.price) console.log(`  ${chalk.dim("Price")}   $${d.price}`);
    console.log();
    return;
  }

  // fallback
  printJson(data);
}

/* ─── HTTP with Retry ───────────────────────────────── */

const RETRIABLE = [408, 429, 500, 502, 503, 504];

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function apiFetch(url: string, retries = 3): Promise<unknown> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "agent-track/0.2.0" },
        signal: AbortSignal.timeout(15_000),
      });

      if (res.ok) return res.json();

      if (attempt < retries && RETRIABLE.includes(res.status)) {
        const wait = Math.min(1000 * 2 ** attempt, 10_000);
        console.error(chalk.dim(`[retry ${attempt + 1}/${retries}] HTTP ${res.status} — waiting ${wait}ms`));
        await sleep(wait);
        continue;
      }

      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    } catch (e) {
      if (attempt < retries && (e as Error).name === "TimeoutError") {
        const wait = Math.min(1000 * 2 ** attempt, 10_000);
        console.error(chalk.dim(`[retry ${attempt + 1}/${retries}] timeout — waiting ${wait}ms`));
        await sleep(wait);
        continue;
      }
      throw e;
    }
  }
  throw new Error("Max retries exceeded");
}

/* ─── Input Validation ──────────────────────────────── */

export function validateAddress(input: string): string {
  const s = input.trim();
  if (!s) throw new Error("Address is required");
  if (s.startsWith("0x") && s.length !== 42) {
    throw new Error(`Invalid EVM address length: ${s.length}. Expected 42 chars (0x + 40 hex).`);
  }
  if (!s.startsWith("0x") && !SOLANA_RE.test(s)) {
    throw new Error(`Invalid address format: "${s.slice(0, 16)}…". Expected base58 (Solana) or 0x-prefixed (EVM).`);
  }
  return s;
}

export function validateTxHash(input: string): string {
  const s = input.trim();
  if (!s) throw new Error("Transaction hash is required");
  if (s.startsWith("0x") && s.length !== 66) {
    throw new Error(`Invalid EVM tx hash length: ${s.length}. Expected 66 chars.`);
  }
  return s;
}
