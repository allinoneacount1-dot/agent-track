import { ok, err, printJson, printPretty, resolveChain, getApiKeys, validateAddress } from "../utils.js";
import { getContract as getSolContract } from "../providers/solscan.js";
import { getContract as getEthContract } from "../providers/etherscan.js";
import { getContract as getBscContract } from "../providers/bscscan.js";
import type { Chain, OutputFormat, ContractData } from "../types.js";

export async function contract(address: string, chainOpt?: string, format: OutputFormat = "json") {
  const addr = validateAddress(address);
  let chain: Chain;
  try { chain = resolveChain(chainOpt, addr); }
  catch (e) { printJson(err("solana", (e as Error).message)); process.exit(1); }

  const keys = getApiKeys();

  try {
    let data: ContractData;
    switch (chain) {
      case "solana":
        data = await getSolContract(addr);
        break;
      case "ethereum": {
        if (!keys.etherscan) { printJson(err(chain, "ETHERSCAN_API_KEY not set")); process.exit(1); }
        data = await getEthContract(addr, keys.etherscan);
        break;
      }
      case "bsc": {
        if (!keys.bscscan) { printJson(err(chain, "BSCSCAN_API_KEY not set")); process.exit(1); }
        data = await getBscContract(addr, keys.bscscan);
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
