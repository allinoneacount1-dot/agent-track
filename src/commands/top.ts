import { ok, err, printJson, validateAddress } from "../utils.js";
import { getTopHolders } from "../providers/solscan.js";

export async function top(mint: string, limit: number) {
  const addr = validateAddress(mint);

  try {
    const data = await getTopHolders(addr, Math.min(Math.max(limit, 1), 100));
    printJson(ok("solana", data));
  } catch (e) {
    printJson(err("solana", (e as Error).message));
    process.exit(1);
  }
}
