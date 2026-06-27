import { ok, err, printJson, resolveChain, getApiKeys, validateAddress } from "../utils.js";
import { getWallet as getSolWallet } from "../providers/solscan.js";
import { getWallet as getEthWallet } from "../providers/etherscan.js";
import { getWallet as getBscWallet } from "../providers/bscscan.js";
import type { Chain, PortfolioData } from "../types.js";

export async function portfolio(address: string, chainOpt?: string) {
  const addr = validateAddress(address);
  let chain: Chain;
  try { chain = resolveChain(chainOpt, addr); }
  catch (e) { printJson(err("solana", (e as Error).message)); process.exit(1); }

  const keys = getApiKeys();

  try {
    let walletData;
    switch (chain) {
      case "solana":
        walletData = await getSolWallet(addr);
        break;
      case "ethereum": {
        if (!keys.etherscan) {
          printJson(err(chain, "ETHERSCAN_API_KEY not set"));
          process.exit(1);
        }
        walletData = await getEthWallet(addr, keys.etherscan);
        break;
      }
      case "bsc": {
        if (!keys.bscscan) {
          printJson(err(chain, "BSCSCAN_API_KEY not set"));
          process.exit(1);
        }
        walletData = await getBscWallet(addr, keys.bscscan);
        break;
      }
    }

    const tokensWithUsd = walletData.tokens.filter((t) => t.usdValue);
    const totalUsd =
      parseFloat(walletData.balance) +
      tokensWithUsd.reduce((sum, t) => sum + parseFloat(t.usdValue || "0"), 0);

    const data: PortfolioData = {
      address: addr,
      chain,
      totalUsd: isNaN(totalUsd) ? 0 : totalUsd,
      solBalance: walletData.balance,
      tokens: walletData.tokens.filter((t) => parseFloat(t.balance) > 0),
    };

    printJson(ok(chain, data));
  } catch (e) {
    printJson(err(chain, (e as Error).message));
    process.exit(1);
  }
}
