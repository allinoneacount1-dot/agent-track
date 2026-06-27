import { apiFetch } from "../utils.js";
import type { WalletData, TokenBalance, TxBrief, TxData, TokenData, ContractData } from "../types.js";

const BASE = "https://api.solscan.io";

export async function getWallet(address: string): Promise<WalletData> {
  const [acct, tokensData] = await Promise.all([
    apiFetch(`${BASE}/account/${address}`),
    apiFetch(`${BASE}/account/tokens?address=${address}`),
  ]);

  const a = acct as Record<string, unknown>;
  const acctData = a.data as Record<string, unknown> || a;
  const td = tokensData as Record<string, unknown>;

  const solBalance = String(Number(acctData.lamports || acctData.sol || 0) / 1e9);

  const rawTokens = (td.data || []) as Array<Record<string, unknown>>;
  const tokens: TokenBalance[] = rawTokens.map((t) => ({
    symbol: (t.symbol as string) || (t.tokenSymbol as string) || "",
    name: (t.name as string) || (t.tokenName as string) || "",
    mint: (t.address as string) || (t.tokenAddress as string) || (t.mint as string) || "",
    balance: (t.amount as string) || (t.tokenAmount as string) || String(t.tokenBalance || "0"),
    usdValue: t.usdValue ? String(Number(t.usdValue).toFixed(2)) : undefined,
    decimals: (t.decimals as number) || (t.tokenDecimals as number) || undefined,
  }));

  return { address, balance: solBalance, tokens, recentTx: [] };
}

export async function getTx(hash: string): Promise<TxData> {
  const raw = await apiFetch(`${BASE}/transaction/${hash}`);
  const d = raw as Record<string, unknown>;
  const signers = (d.signer as string[]) || [];
  return {
    hash,
    block: (d.blockNumber as number) || (d.slot as number) || 0,
    timestamp: String((d.blockTime as number) || (d.timestamp as number) || 0),
    from: signers[0] || "",
    to: ((d.parsedInstruction as Array<Record<string, unknown>>)?.[0]?.programId as string) || "",
    value: String(Number(d.solAmount || d.lamportChange || 0) / 1e9),
    fee: String(Number(d.fee || 0) / 1e9),
    status: (d.status as string) === "Success" ? "success" : "failed",
  };
}

export async function getToken(address: string): Promise<TokenData> {
  const raw = await apiFetch(`${BASE}/token?address=${address}`);
  const d = raw as Record<string, unknown>;
  const info = (d.data as Record<string, unknown>) || d;
  const priceData = (d.price as Record<string, unknown>) || {};
  return {
    address,
    name: (info.name as string) || "",
    symbol: (info.symbol as string) || "",
    decimals: (info.decimals as number) || 0,
    totalSupply: String(info.totalSupply || info.supply || "0"),
    holders: (info.holderCount as number) || (info.holders as number) || undefined,
    price: priceData.price ? String(priceData.price) : undefined,
    marketCap: priceData.marketCap ? String(priceData.marketCap) : undefined,
  };
}

export async function getContract(_address: string): Promise<ContractData> {
  return {
    address: _address,
    verified: true,
    name: "Solana Program",
    compiler: "Solana BPF",
    license: "Open Source (on-chain IDL)",
  };
}
