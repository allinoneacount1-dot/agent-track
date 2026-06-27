import { ok, err, printJson, resolveChain, getApiKeys, validateAddress } from "../utils.js";
import { getWallet as getSolWallet } from "../providers/solscan.js";
import { getWallet as getEthWallet } from "../providers/etherscan.js";
import { getWallet as getBscWallet } from "../providers/bscscan.js";
import type { Chain, WalletData, CompareData } from "../types.js";

async function fetchWallet(
  address: string,
  chainOpt: string | undefined
): Promise<{ data: WalletData; chain: Chain }> {
  const addr = validateAddress(address);
  const chain = resolveChain(chainOpt, addr);
  const keys = getApiKeys();

  let data: WalletData;
  switch (chain) {
    case "solana":
      data = await getSolWallet(addr);
      break;
    case "ethereum": {
      if (!keys.etherscan) throw new Error("ETHERSCAN_API_KEY not set");
      data = await getEthWallet(addr, keys.etherscan);
      break;
    }
    case "bsc": {
      if (!keys.bscscan) throw new Error("BSCSCAN_API_KEY not set");
      data = await getBscWallet(addr, keys.bscscan);
      break;
    }
  }
  return { data, chain };
}

export async function compare(addr1: string, addr2: string, chain1Opt?: string, chain2Opt?: string) {
  try {
    const [left, right] = await Promise.all([
      fetchWallet(addr1, chain1Opt),
      fetchWallet(addr2, chain2Opt),
    ]);

    const result: CompareData = {
      left: left.data,
      right: right.data,
      leftChain: left.chain,
      rightChain: right.chain,
    };

    printJson(ok("solana" as Chain, result));
  } catch (e) {
    printJson(err("solana" as Chain, (e as Error).message));
    process.exit(1);
  }
}
