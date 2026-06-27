import { ok, err, printJson, resolveChain, getApiKeys, validateAddress } from "../utils.js";
import { getWallet as getSolWallet } from "../providers/solscan.js";
import { getWallet as getEthWallet } from "../providers/etherscan.js";
import { getWallet as getBscWallet } from "../providers/bscscan.js";
import type { Chain, WalletData, BulkData } from "../types.js";

export async function bulk(addresses: string[], chainOpt?: string) {
  if (addresses.length === 0) {
    printJson(err("solana", "At least one address is required"));
    process.exit(1);
  }

  const validated = addresses.map((a) => validateAddress(a));
  const chain = chainOpt
    ? (chainOpt.toLowerCase() as Chain)
    : resolveChain(undefined, validated[0]);

  const keys = getApiKeys();
  const results: WalletData[] = [];

  try {
    const fetchers = validated.map((addr) => {
      switch (chain) {
        case "solana":
          return getSolWallet(addr);
        case "ethereum":
          if (!keys.etherscan) throw new Error("ETHERSCAN_API_KEY not set");
          return getEthWallet(addr, keys.etherscan);
        case "bsc":
          if (!keys.bscscan) throw new Error("BSCSCAN_API_KEY not set");
          return getBscWallet(addr, keys.bscscan);
      }
    });

    const wallets = await Promise.all(fetchers);

    let totalUsd = 0;
    for (const w of wallets) {
      totalUsd += parseFloat(w.balance);
      for (const t of w.tokens) {
        if (t.usdValue) totalUsd += parseFloat(t.usdValue);
      }
    }

    const data: BulkData = {
      wallets,
      chain,
      totalUsd: isNaN(totalUsd) ? 0 : totalUsd,
    };

    printJson(ok(chain, data));
  } catch (e) {
    printJson(err(chain, (e as Error).message));
    process.exit(1);
  }
}
