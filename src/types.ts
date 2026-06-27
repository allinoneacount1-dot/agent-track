export type Chain = "solana" | "ethereum" | "bsc";

export type OutputFormat = "json" | "pretty";

export interface CliOpts {
  chain?: string;
  format?: OutputFormat;
}

export interface CliResponse<T = unknown> {
  status: "ok" | "error";
  chain: Chain;
  data?: T;
  error?: string;
}

export interface WalletData {
  address: string;
  balance: string;
  tokens: TokenBalance[];
  recentTx: TxBrief[];
}

export interface TokenBalance {
  symbol: string;
  name: string;
  mint: string;
  balance: string;
  usdValue?: string;
  decimals?: number;
}

export interface TxBrief {
  hash: string;
  type: "send" | "receive" | "swap" | "other";
  value: string;
  timestamp: string;
  status: "success" | "failed" | "pending";
}

export interface ContractData {
  address: string;
  verified: boolean;
  name?: string;
  compiler?: string;
  license?: string;
  sourceCode?: string;
  abi?: string;
}

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  holders?: number;
  price?: string;
  marketCap?: string;
}

export interface TxData {
  hash: string;
  block: number;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  fee: string;
  status: "success" | "failed" | "pending";
  gasUsed?: string;
  gasPrice?: string;
}

export interface PortfolioData {
  address: string;
  chain: Chain;
  totalUsd: number;
  solBalance: string;
  tokens: TokenBalance[];
}

export interface CompareData {
  left: WalletData;
  right: WalletData;
  leftChain: Chain;
  rightChain: Chain;
}

export interface TopHolderData {
  mint: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: string;
  holders: HolderEntry[];
}

export interface HolderEntry {
  address: string;
  amount: string;
  percentage: string;
  rank: number;
}

export interface GasData {
  chain: Chain;
  slow: string;
  standard: string;
  fast: string;
  unit: string;
  timestamp: string;
}

export interface BulkData {
  wallets: WalletData[];
  chain: Chain;
  totalUsd: number;
}
