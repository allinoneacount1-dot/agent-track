# agent-track

Multi-chain onchain data tracker untuk **AI agents**. Track wallet, contract, token, dan transaksi di **Solana**, **Ethereum**, dan **BSC** — pure JSON output, gak perlu API key buat Solana.

```
npx agent-track wallet <address>
npx agent-track portfolio <address>
npx agent-track compare <addr1> <addr2>
```

## Fitur

| Command       | Description                                        | API Key Required |
|---------------|----------------------------------------------------|------------------|
| `wallet`      | Balance, token holdings, recent tx                 | Solana: ✗, EVM: ✓ |
| `contract`    | Source code, ABI, compiler, verification status    | Solana: ✗, EVM: ✓ |
| `token`       | Info, supply, holders, price                       | Solana: ✗, EVM: ✓ |
| `tx`          | Detail transaksi (block, from, to, value, fee, gas)| Solana: ✗, EVM: ✓ |
| `portfolio`   | Aggregate semua token + total USD value            | Solana: ✗, EVM: ✓ |
| `compare`     | Bandingin dua wallet side-by-side                  | Solana: ✗, EVM: ✓ |

## Install

```bash
npm install -g agent-track
```

Atau langsung via `npx`:

```bash
npx agent-track wallet So11111111111111111111111111111111111111112
```

## Usage

### Wallet
```bash
agent-track wallet 7xKX...3sF9                           # Solana (auto)
agent-track wallet 0xd8dA6...A96045 --chain ethereum      # EVM (manual)
agent-track wallet 0x... --pretty                         # pretty terminal
```

Output:
```json
{
  "status": "ok",
  "chain": "solana",
  "data": {
    "address": "7xKX...3sF9",
    "balance": "124.32",
    "tokens": [
      { "symbol": "USDC", "name": "USD Coin", "mint": "EPjFW...", "balance": "8450.00", "usdValue": "8450.00" }
    ],
    "recentTx": [...]
  }
}
```

### Portfolio
```bash
agent-track portfolio So11111111111111111111111111111111111111112
```
→ Aggregate semua token + total USD value. Satu langkah langsung tau nilai wallet.

### Compare
```bash
agent-track compare 7xKX...3sF9 0xd8dA6...A96045
```
→ Bandingin dua wallet sekaligus, beda chain pun bisa.

## Chain Detection

CLI auto-detect chain dari format address:
- **0x** + 40/64 hex chars → Ethereum / BSC (pakai `--chain` buat bedain)
- **Base58** (32-44 chars) → Solana

Override: `--chain solana | ethereum | bsc`

## Output Format

### JSON (default — buat agent)

Pure JSON ke **stdout**. Stderr dipake buat retry log, gak campur aduk.

### Pretty (optional)

```
agent-track wallet <addr> --pretty
```
→ Colored terminal output pake chalk.

## Agent-First Design

agent-track dirancang khusus buat AI agent framework kayak **Hermes**, **OpenCLAw**, Claude Code, dll:

| Feature | Why |
|---------|-----|
| Pure JSON stdout | Agent gampang parse, gak perlu strip teks |
| Stderr for logging | Retry/log messages gak ngerusak output |
| Exit codes | 0 = ok, 1 = error — agent tau kapan harus retry |
| Auto-detect chain | Agent gak perlu nebak chain |
| Rich data | Metadata, USD value, konteks harga — langsung siap analisa |
| No API key for Solana | Bisa jalan tanpa setup |
| Retry + backoff | HTTP 429/5xx otomatis retry 3x |

## API Keys

Buat `.env` atau set environment vars:

```env
ETHERSCAN_API_KEY=your_key
BSCSCAN_API_KEY=your_key
```

Dapatkan: [Etherscan](https://etherscan.io/myapikey) · [BscScan](https://bscscan.com/myapikey)

> Solscan tidak butuh API key untuk request basic.

## Development

```bash
git clone https://github.com/allinoneacount1-dot/agent-track
cd agent-track
npm install
npm test                          # 19 unit tests
npm run dev wallet <address>      # quick test
```

## License

MIT
