import { ok, err, printJson, resolveChain, getApiKeys } from "../utils.js";
import { getTx as getSolTx } from "../providers/solscan.js";
import { getTx as getEthTx } from "../providers/etherscan.js";
import { getTx as getBscTx } from "../providers/bscscan.js";

export async function tx(hash: string, chainOpt?: string) {
  const chain = resolveChain(chainOpt, hash);
  const keys = getApiKeys();

  try {
    let data;
    switch (chain) {
      case "solana":
        data = await getSolTx(hash);
        break;
      case "ethereum":
        if (!keys.etherscan) {
          printJson(err(chain, "ETHERSCAN_API_KEY not set"));
          process.exit(1);
        }
        data = await getEthTx(hash, keys.etherscan);
        break;
      case "bsc":
        if (!keys.bscscan) {
          printJson(err(chain, "BSCSCAN_API_KEY not set"));
          process.exit(1);
        }
        data = await getBscTx(hash, keys.bscscan);
        break;
    }
    printJson(ok(chain, data));
  } catch (e) {
    printJson(err(chain, (e as Error).message));
    process.exit(1);
  }
}
