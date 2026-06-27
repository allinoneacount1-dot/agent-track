import { ok, err, printJson, printPretty, resolveChain, getApiKeys, validateTxHash } from "../utils.js";
import { getTx as getSolTx } from "../providers/solscan.js";
import { getTx as getEthTx } from "../providers/etherscan.js";
import { getTx as getBscTx } from "../providers/bscscan.js";
import type { Chain, OutputFormat, TxData } from "../types.js";

export async function tx(hash: string, chainOpt?: string, format: OutputFormat = "json") {
  const h = validateTxHash(hash);
  let chain: Chain;
  try { chain = resolveChain(chainOpt, h); }
  catch (e) { printJson(err("solana", (e as Error).message)); process.exit(1); }

  const keys = getApiKeys();

  try {
    let data: TxData;
    switch (chain) {
      case "solana":
        data = await getSolTx(h);
        break;
      case "ethereum": {
        if (!keys.etherscan) { printJson(err(chain, "ETHERSCAN_API_KEY not set")); process.exit(1); }
        data = await getEthTx(h, keys.etherscan);
        break;
      }
      case "bsc": {
        if (!keys.bscscan) { printJson(err(chain, "BSCSCAN_API_KEY not set")); process.exit(1); }
        data = await getBscTx(h, keys.bscscan);
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
