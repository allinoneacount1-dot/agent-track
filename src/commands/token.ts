import { ok, err, printJson, printPretty, resolveChain, getApiKeys, validateAddress } from "../utils.js";
import { getToken as getSolToken } from "../providers/solscan.js";
import { getToken as getEthToken } from "../providers/etherscan.js";
import { getToken as getBscToken } from "../providers/bscscan.js";
import type { Chain, OutputFormat, TokenData } from "../types.js";

export async function token(address: string, chainOpt?: string, format: OutputFormat = "json") {
  const addr = validateAddress(address);
  let chain: Chain;
  try { chain = resolveChain(chainOpt, addr); }
  catch (e) { printJson(err("solana", (e as Error).message)); process.exit(1); }

  const keys = getApiKeys();

  try {
    let data: TokenData;
    switch (chain) {
      case "solana":
        data = await getSolToken(addr);
        break;
      case "ethereum": {
        if (!keys.etherscan) { printJson(err(chain, "ETHERSCAN_API_KEY not set")); process.exit(1); }
        data = await getEthToken(addr, keys.etherscan);
        break;
      }
      case "bsc": {
        if (!keys.bscscan) { printJson(err(chain, "BSCSCAN_API_KEY not set")); process.exit(1); }
        data = await getBscToken(addr, keys.bscscan);
        break;
      }
    }
    const response = ok(chain, data);
    format === "json" ? printJson(response) : printPretty(response, format);
  } catch (e) {
    printJson(err(chain, (e as Error).message));
    process.exit(1);
  }
}
