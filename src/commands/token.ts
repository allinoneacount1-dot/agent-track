import { ok, err, printJson, resolveChain, getApiKeys } from "../utils.js";
import { getToken as getSolToken } from "../providers/solscan.js";
import { getToken as getEthToken } from "../providers/etherscan.js";
import { getToken as getBscToken } from "../providers/bscscan.js";

export async function token(address: string, chainOpt?: string) {
  const chain = resolveChain(chainOpt, address);
  const keys = getApiKeys();

  try {
    let data;
    switch (chain) {
      case "solana":
        data = await getSolToken(address);
        break;
      case "ethereum":
        if (!keys.etherscan) {
          printJson(err(chain, "ETHERSCAN_API_KEY not set"));
          process.exit(1);
        }
        data = await getEthToken(address, keys.etherscan);
        break;
      case "bsc":
        if (!keys.bscscan) {
          printJson(err(chain, "BSCSCAN_API_KEY not set"));
          process.exit(1);
        }
        data = await getBscToken(address, keys.bscscan);
        break;
    }
    printJson(ok(chain, data));
  } catch (e) {
    printJson(err(chain, (e as Error).message));
    process.exit(1);
  }
}
