import { apiFetch } from "../utils.js";
import type { WalletData, TokenBalance, TxBrief, TxData, TokenData, ContractData } from "../types.js";

const BASE = "https://api.solscan.io";

export async function getWallet(address: string): Promise<WalletData> {
  const [acct, tokensData, txs] = await Promise.all([
    apiFetch(`${BASE}/account/${address}`),
    apiFetch(`${BASE}/account/tokens?address=${address}`),
    apiFetch(`${BASE}/account/transactions?address=${address}&limit=10`),
  ]);

  const a = acct as Record<string, unknown>;
  const td = tokensData as Record<string, unknown>;
  const tx = txs as Record<string, unknown>;

  const tokens: TokenBalance[] = ((td.data || []) as Array<Record<string, unknown>>).map(
    (t: Record<string, unknown>) => ({
      symbol: (t.symbol as string) || "",
      name: (t.name as string) || "",
      mint: (t.address as string) || (t.tokenAddress as string) || "",
      balance: (t.amount as string) || (t.tokenAmount as string) || "0",
      usdValue: t.usdValue ? String(t.usdValue) : undefined,
    })
  );

  const recentTx: TxBrief[] = ((tx.data || []) as Array<Record<string, unknown>>).map(
    (t: Record<string, unknown>) => ({
      hash: (t.txHash as string) || "",
      type: "other",
      value: (t.lamportChange as string) || "0",
      timestamp: String((t.blockTime as number) || 0),
      status: (t.status as string) === "Success" ? "success" : "failed",
    })
  );

  return {
    address,
    balance: String((a.data as Record<string, unknown>)?.lamports || "0"),
    tokens,
    recentTx,
  };
}

export async function getTx(hash: string): Promise<TxData> {
  const raw = await apiFetch(`${BASE}/transaction/${hash}`);
  const d = raw as Record<string, unknown>;
  return {
    hash,
    block: (d.blockNumber as number) || 0,
    timestamp: String((d.blockTime as number) || 0),
    from: ((d.signer as string[]) || [])[0] || "",
    to: "",
    value: "0",
    fee: String(d.fee || "0"),
    status: (d.status as string) === "Success" ? "success" : "failed",
  };
}

export async function getToken(address: string): Promise<TokenData> {
  const raw = await apiFetch(`${BASE}/token?address=${address}`);
  const d = raw as Record<string, unknown>;
  const info = d.data as Record<string, unknown> || d;
  return {
    address,
    name: (info.name as string) || "",
    symbol: (info.symbol as string) || "",
    decimals: (info.decimals as number) || 0,
    totalSupply: String((info.supply as string) || (info.totalSupply as string) || "0"),
    holders: info.holderCount as number || info.holders as number,
  };
}

export async function getContract(_address: string): Promise<ContractData> {
  return {
    address: _address,
    verified: false,
    name: "Unknown (Solana programs are verified via on-chain IDL)",
  };
}
