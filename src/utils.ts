import type { Chain, CliResponse } from "./types.js";

export function getApiKeys() {
  return {
    solscan: process.env.SOLSCAN_API_KEY || "",
    etherscan: process.env.ETHERSCAN_API_KEY || "",
    bscscan: process.env.BSCSCAN_API_KEY || "",
  };
}

export function detectChain(input: string): Chain | null {
  if (input.startsWith("0x")) {
    if (input.length === 42 || input.length === 66) return "ethereum";
    return null;
  }
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input)) return "solana";
  return null;
}

export function ok<T>(chain: Chain, data: T): CliResponse<T> {
  return { status: "ok", chain, data };
}

export function err(chain: Chain, message: string): CliResponse {
  return { status: "error", chain, error: message };
}

export function printJson(data: unknown) {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

export async function apiFetch(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": "agent-track/0.1.0" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export function resolveChain(chainOpt: string | undefined, input: string): Chain {
  if (chainOpt) {
    const c = chainOpt.toLowerCase();
    if (["solana", "ethereum", "bsc"].includes(c)) return c as Chain;
    throw new Error(`Unsupported chain: ${chainOpt}. Use: solana, ethereum, bsc`);
  }
  const detected = detectChain(input);
  if (!detected) throw new Error(`Cannot detect chain for "${input}". Use --chain flag.`);
  return detected;
}
