import { ok, err, printJson, resolveChain, getApiKeys } from "../utils.js";
import { getWallet as getSolWallet } from "../providers/solscan.js";
import { getWallet as getEthWallet } from "../providers/etherscan.js";
import { getWallet as getBscWallet } from "../providers/bscscan.js";
import type { Chain } from "../types.js";

export async function wallet(address: string, chainOpt?: string) {
  const chain = resolveChain(chainOpt, address);
  const keys = getApiKeys();

  try {
    let data;
    switch (chain) {
      case "solana":
        data = await getSolWallet(address);
        break;
      case "ethereum":
        if (!keys.etherscan) {
          printJson(err(chain, "ETHERSCAN_API_KEY not set"));
          process.exit(1);
        }
        data = await getEthWallet(address, keys.etherscan);
        break;
      case "bsc":
        if (!keys.bscscan) {
          printJson(err(chain, "BSCSCAN_API_KEY not set"));
          process.exit(1);
        }
        data = await getBscWallet(address, keys.bscscan);
        break;
    }
    printJson(ok(chain, data));
  } catch (e) {
    printJson(err(chain, (e as Error).message));
    process.exit(1);
  }
}
