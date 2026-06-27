import { ok, err, printJson, getApiKeys } from "../utils.js";
import { getGas as getEthGas } from "../providers/etherscan.js";
import { getGas as getBscGas } from "../providers/bscscan.js";
import type { Chain, GasData } from "../types.js";

export async function gas(chainOpt?: string) {
  const keys = getApiKeys();

  if (chainOpt) {
    const c = chainOpt.toLowerCase() as Chain;
    try {
      let data: GasData;
      switch (c) {
        case "ethereum":
          if (!keys.etherscan) {
            printJson(err(c, "ETHERSCAN_API_KEY not set"));
            process.exit(1);
          }
          data = await getEthGas(keys.etherscan);
          break;
        case "bsc":
          if (!keys.bscscan) {
            printJson(err(c, "BSCSCAN_API_KEY not set"));
            process.exit(1);
          }
          data = await getBscGas(keys.bscscan);
          break;
        default:
          printJson(err(c, `Gas tracker not available for ${c}`));
          process.exit(1);
      }
      printJson(ok(c, data));
    } catch (e) {
      printJson(err(c, (e as Error).message));
      process.exit(1);
    }
    return;
  }

  // No chain specified → fetch both
  if (!keys.etherscan && !keys.bscscan) {
    printJson(err("ethereum", "Set ETHERSCAN_API_KEY or BSCSCAN_API_KEY to use gas tracker"));
    process.exit(1);
  }

  try {
    const results: GasData[] = [];
    if (keys.etherscan) {
      const eth = await getEthGas(keys.etherscan);
      results.push(eth);
    }
    if (keys.bscscan) {
      const bsc = await getBscGas(keys.bscscan);
      results.push(bsc);
    }
    printJson(ok("ethereum", { chains: results }));
  } catch (e) {
    printJson(err("ethereum", (e as Error).message));
    process.exit(1);
  }
}
