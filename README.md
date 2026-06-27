# agent-track

CLI untuk track wallet, contract, token, dan transaksi di **Solana**, **Ethereum**, dan **BSC**. Output pure JSON — cocok buat agent framework kayak Hermes, OpenCLAw, Claude Code, dan sejenisnya.

```
npx agent-track wallet <address>
npx agent-track contract <address>
npx agent-track token <address>
npx agent-track tx <hash>
```

## Install

```bash
npm install -g agent-track
```

Atau langsung via `npx` tanpa install:

```bash
npx agent-track wallet So11111111111111111111111111111111111111112
```

## Usage

### Wallet

```bash
agent-track wallet 7xKX...3sF9
agent-track wallet 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --chain ethereum
agent-track wallet 0x... --chain bsc
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
      { "symbol": "USDC", "name": "USD Coin", "mint": "EPjFW...", "balance": "8450.00" }
    ],
    "recentTx": [
      { "hash": "5KtN...", "type": "send", "value": "10.5", "timestamp": "1719500000", "status": "success" }
    ]
  }
}
```

### Contract

```bash
agent-track contract 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D --chain ethereum
```

Output: source code, ABI, compiler version, license, verification status.

### Token

```bash
agent-track token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --chain solana
```

Output: name, symbol, decimals, total supply, holders.

### Transaction

```bash
agent-track tx 5KtN3qCjKgmPqFxmP3mQykAz7mUGKTuLXMGLFQ4WqBg --chain solana
```

Output: block, from, to, value, fee, status, gas.

## Chain Detection

CLI auto-detect chain dari format address:
- `0x` + 40 hex chars → **Ethereum / BSC** (gunakan `--chain` untuk bedain)
- Base58 (32-44 chars) → **Solana**

Override dengan `--chain solana | ethereum | bsc`.

## API Keys

Buat file `.env` di working directory atau set environment variables:

```env
SOLSCAN_API_KEY=your_key
ETHERSCAN_API_KEY=your_key
BSCSCAN_API_KEY=your_key
```

Dapatkan free API key:
- [Solscan API](https://solscan.io/api)
- [Etherscan API](https://etherscan.io/myapikey)
- [BscScan API](https://bscscan.com/myapikey)

> Solscan tidak butuh API key untuk request basic.

## Output Format

Semua output **JSON** ke stdout. Stderr dipake buat error message. Exit code:
- `0` → sukses
- `1` → error

Cocok diparsing oleh agent/AI tools.

## Development

```bash
git clone https://github.com/allinoneacount1-dot/agent-track
cd agent-track
npm install
npm run dev wallet <address>
```

## License

MIT
