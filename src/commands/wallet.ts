import { ok, err, printJson, printPretty, resolveChain, getApiKeys, validateAddress } from "../utils.js";
import { getWallet as getSolWallet } from "../providers/solscan.js";
import { getWallet as getEthWallet } from "../providers/etherscan.js";
import { getWallet as getBscWallet } from "../providers/bscscan.js";
import type { Chain, OutputFormat, WalletData } from "../types.js";

export async function wallet(address: string, chainOpt?: string, format: OutputFormat = "json") {
  const addr = validateAddress(address);
  let chain: Chain;
  try {
    chain = resolveChain(chainOpt, addr);
  } catch (e) {
    printJson(err("solana", (e as Error).message));
    process.exit(1);
  }

  const keys = getApiKeys();

  try {
    let data: WalletData;
    switch (chain) {
      case "solana":
        data = await getSolWallet(addr);
        break;
      case "ethereum": {
        if (!keys.etherscan) {
          printJson(err(chain, "ETHERSCAN_API_KEY not set. Get one at https://etherscan.io/myapikey"));
          process.exit(1);
        }
        data = await getEthWallet(addr, keys.etherscan);
        break;
      }
      case "bsc": {
        if (!keys.bscscan) {
          printJson(err(chain, "BSCSCAN_API_KEY not set. Get one at https://bscscan.com/myapikey"));
          process.exit(1);
        }
        data = await getBscWallet(addr, keys.bscscan);
        break;
      }
    }
    const response = ok(chain, data);
    if (format === "json") {
      printJson(response);
    } else {
      printPretty(response, format);
    }
  } catch (e) {
    printJson(err(chain, (e as Error).message));
    process.exit(1);
  }
}
