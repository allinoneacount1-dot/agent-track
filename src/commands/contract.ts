import { ok, err, printJson, resolveChain, getApiKeys } from "../utils.js";
import { getContract as getSolContract } from "../providers/solscan.js";
import { getContract as getEthContract } from "../providers/etherscan.js";
import { getContract as getBscContract } from "../providers/bscscan.js";

export async function contract(address: string, chainOpt?: string) {
  const chain = resolveChain(chainOpt, address);
  const keys = getApiKeys();

  try {
    let data;
    switch (chain) {
      case "solana":
        data = await getSolContract(address);
        break;
      case "ethereum":
        if (!keys.etherscan) {
          printJson(err(chain, "ETHERSCAN_API_KEY not set"));
          process.exit(1);
        }
        data = await getEthContract(address, keys.etherscan);
        break;
      case "bsc":
        if (!keys.bscscan) {
          printJson(err(chain, "BSCSCAN_API_KEY not set"));
          process.exit(1);
        }
        data = await getBscContract(address, keys.bscscan);
        break;
    }
    printJson(ok(chain, data));
  } catch (e) {
    printJson(err(chain, (e as Error).message));
    process.exit(1);
  }
}
