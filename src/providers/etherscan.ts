import { apiFetch } from "../utils.js";
import type { WalletData, TokenBalance, TxBrief, TxData, TokenData, ContractData } from "../types.js";

const BASE = "https://api.etherscan.io/api";

function buildUrl(module: string, action: string, params: Record<string, string>, apiKey: string) {
  const search = new URLSearchParams({ module, action, apikey: apiKey, ...params });
  return `${BASE}?${search}`;
}

export async function getWallet(address: string, apiKey: string): Promise<WalletData> {
  const [balRaw, txsRaw, tokensRaw] = await Promise.all([
    apiFetch(buildUrl("account", "balance", { address, tag: "latest" }, apiKey)),
    apiFetch(buildUrl("account", "txlist", { address, page: "1", offset: "10", sort: "desc" }, apiKey)),
    apiFetch(buildUrl("account", "tokentx", { address, page: "1", offset: "20", sort: "desc" }, apiKey)).catch(() => null),
  ]);

  const balance = String(Number((balRaw as Record<string, unknown>).result || 0) / 1e18);

  const txs = ((txsRaw as Record<string, unknown>).result as Array<Record<string, unknown>>) || [];
  const recentTx: TxBrief[] = txs.map((t) => ({
    hash: (t.hash as string) || "",
    type: (t.to as string || "").toLowerCase() === address.toLowerCase() ? "receive" : "send",
    value: String(Number(t.value || 0) / 1e18),
    timestamp: (t.timeStamp as string) || "0",
    status: (t.isError as string) === "0" ? "success" : "failed",
  }));

  const rawTokenList = tokensRaw
    ? ((tokensRaw as Record<string, unknown>).result as Array<Record<string, unknown>>) || []
    : [];
  const seen = new Set<string>();
  const tokens: TokenBalance[] = [];
  for (const t of rawTokenList) {
    const key = (t.contractAddress as string) || "";
    if (seen.has(key)) continue;
    seen.add(key);
    tokens.push({
      symbol: (t.tokenSymbol as string) || "",
      name: (t.tokenName as string) || "",
      mint: key,
      balance: String(Number(t.value || 0) / 10 ** Number(t.tokenDecimal || 18)),
      usdValue: undefined,
    });
  }

  return { address, balance, tokens, recentTx };
}

export async function getContract(address: string, apiKey: string): Promise<ContractData> {
  const raw = await apiFetch(
    buildUrl("contract", "getsourcecode", { address }, apiKey)
  );
  const result = ((raw as Record<string, unknown>).result as Array<Record<string, unknown>>)?.[0];
  if (!result) return { address, verified: false };

  const verified = (result.SourceCode as string)?.length > 0;
  return {
    address,
    verified,
    name: (result.ContractName as string) || undefined,
    compiler: (result.CompilerVersion as string) || undefined,
    license: (result.LicenseType as string) || undefined,
    sourceCode: verified ? ((result.SourceCode as string)?.slice(0, 2000) + "...") : undefined,
    abi: (result.ABI as string) || undefined,
  };
}

export async function getToken(address: string, apiKey: string): Promise<TokenData> {
  const raw = await apiFetch(
    buildUrl("token", "tokeninfo", { contractaddress: address }, apiKey)
  );
  const info = (raw as Record<string, unknown>).result as Record<string, unknown> || {};
  return {
    address,
    name: (info.name as string) || "",
    symbol: (info.symbol as string) || "",
    decimals: Number(info.divisor || info.decimals || 0),
    totalSupply: String(info.totalSupply || info.supply || "0"),
    holders: info.holdersCount as number || undefined,
    price: info.price ? String(info.price) : undefined,
  };
}

export async function getTx(hash: string, apiKey: string): Promise<TxData> {
  const [txRaw, receiptRaw] = await Promise.all([
    apiFetch(buildUrl("proxy", "eth_getTransactionByHash", { txhash: hash }, apiKey)),
    apiFetch(buildUrl("proxy", "eth_getTransactionReceipt", { txhash: hash }, apiKey)),
  ]);

  const tx = (txRaw as Record<string, unknown>).result as Record<string, unknown> || {};
  const receipt = (receiptRaw as Record<string, unknown>).result as Record<string, unknown> || {};

  return {
    hash,
    block: Number(tx.blockNumber || 0),
    timestamp: "",
    from: (tx.from as string) || "",
    to: (tx.to as string) || "",
    value: String(Number(tx.value || 0) / 1e18),
    fee: String(Number(receipt.gasUsed || 0) * Number(receipt.effectiveGasPrice || 0) / 1e18),
    status: (receipt.status as string) === "0x1" ? "success" : "failed",
    gasUsed: String(receipt.gasUsed || 0),
    gasPrice: String(Number(receipt.effectiveGasPrice || 0) / 1e9),
  };
}
