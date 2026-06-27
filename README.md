# agent-track

Multi-chain onchain data tracker untuk **AI agents**. Track wallet, contract, token, dan transaksi di **Solana**, **Ethereum**, dan **BSC** — pure JSON output, no API key needed for Solana.

```
npx agent-track wallet <address>
npx agent-track portfolio <address>
npx agent-track top <mint>
npx agent-track gas
npx agent-track bulk <addr1> <addr2> <addr3>
```

---

## Install

```bash
npm install -g agent-track
```

Atau langsung via `npx` tanpa install:

```bash
npx agent-track wallet So11111111111111111111111111111111111111112
```

---

## Commands

| Command       | Description                                        | Solana     | EVM        |
|---------------|----------------------------------------------------|------------|------------|
| `wallet`      | Balance, token holdings, recent tx                 | No API key | Need key   |
| `portfolio`   | Aggregate all tokens + total USD value             | No API key | Need key   |
| `compare`     | Compare two wallets side by side                   | No API key | Need key   |
| `top`         | Top token holders — whale watch                    | No API key | —          |
| `gas`         | Current gas prices (Ethereum / BSC)                | —          | Need key   |
| `bulk`        | Check multiple wallets at once                     | No API key | Need key   |
| `token`       | Token info, supply, holders, price                 | No API key | Need key   |
| `contract`    | Source code, ABI, compiler, verification status    | No API key | Need key   |
| `tx`          | Transaction details (block, from, to, value, fee)  | No API key | Need key   |

---

## Usage

### wallet

Get balance, token holdings, and recent transactions for any address.

```bash
agent-track wallet So11111111111111111111111111111111111111112
agent-track wallet 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --chain ethereum
agent-track wallet 0x... --chain bsc
agent-track wallet <addr> --pretty
```

Output:

```json
{
  "status": "ok",
  "chain": "solana",
  "data": {
    "address": "So11111111111111111111111111111111111111112",
    "balance": "124.32",
    "tokens": [
      {
        "symbol": "USDC",
        "name": "USD Coin",
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "balance": "8450.00",
        "usdValue": "8450.00"
      }
    ],
    "recentTx": [
      {
        "hash": "5KtN3qCjKgmPqFxmP3mQykAz7mUGKTuLXMGLFQ4WqBg",
        "type": "send",
        "value": "10.5",
        "timestamp": "1719500000",
        "status": "success"
      }
    ]
  }
}
```

---

### portfolio

Aggregate all token holdings with total USD value. One call = complete wallet snapshot.

```bash
agent-track portfolio So11111111111111111111111111111111111111112
agent-track portfolio 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --chain ethereum
```

Output:

```json
{
  "status": "ok",
  "chain": "solana",
  "data": {
    "address": "So11111111111111111111111111111111111111112",
    "chain": "solana",
    "totalUsd": 320450.82,
    "solBalance": "124.32",
    "tokens": [
      {
        "symbol": "USDC",
        "name": "USD Coin",
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "balance": "8450.00",
        "usdValue": "8450.00"
      }
    ]
  }
}
```

Agent bisa langsung ambil `data.totalUsd` buat tau total nilai wallet tanpa perlu manual sum.

---

### top — 🐋 whale watch

Get top token holders ranked by balance with percentage of total supply. No API key needed.

```bash
agent-track top EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
agent-track top DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263 --limit 50
```

Output:

```json
{
  "status": "ok",
  "chain": "solana",
  "data": {
    "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "tokenName": "USD Coin",
    "tokenSymbol": "USDC",
    "totalSupply": "45000000000000000",
    "holders": [
      {
        "address": "7xKX8kABJqj2dkTFaHPL8q3Gm2K3JGgGjqKnXPtATqGt",
        "amount": "2500000000000000",
        "percentage": "5.5556",
        "rank": 1
      },
      {
        "address": "9xYZ...",
        "amount": "1800000000000000",
        "percentage": "4.0000",
        "rank": 2
      }
    ]
  }
}
```

Agent bisa langsung analisa:
- `jq '.data.holders[:5]'` → top 5 whales
- `jq '.data.holders[] | select(.percentage > 2)'` → holders with >2% supply
- Deteksi concentration risk: `jq '[.data.holders[:3][] | .percentage | tonumber] | add'`

---

### gas — ⛽ gas tracker

Get current gas prices for Ethereum and/or BSC. If no chain specified, fetches both.

```bash
agent-track gas                                # both chains
agent-track gas --chain ethereum               # eth only
agent-track gas -c bsc                        # bsc only
```

Output:

```json
{
  "status": "ok",
  "chain": "ethereum",
  "data": {
    "chains": [
      {
        "chain": "ethereum",
        "slow": "5",
        "standard": "8",
        "fast": "12",
        "unit": "gwei",
        "timestamp": "1719500000"
      },
      {
        "chain": "bsc",
        "slow": "3",
        "standard": "5",
        "fast": "8",
        "unit": "gwei",
        "timestamp": "1719500000"
      }
    ]
  }
}
```

Agent bisa compare gas price antar chain, recommend timing transaksi.

---

### bulk

Check multiple wallets in a single call. Parallel fetch with aggregated total USD.

```bash
agent-track bulk So11111111111111111111111111111111111111112 EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
agent-track bulk <addr1> <addr2> --chain ethereum
```

Output:

```json
{
  "status": "ok",
  "chain": "solana",
  "data": {
    "wallets": [
      { "address": "So11...", "balance": "124.32", "tokens": [...] },
      { "address": "EPjF...", "balance": "42.50", "tokens": [...] }
    ],
    "chain": "solana",
    "totalUsd": 245000.00
  }
}
```

Satu response langsung tau semua wallet + aggregate value. Cocok buat:
- Cek treasury / multisig wallets
- Monitor team allocation
- Portfolio tracking banyak address

---

### compare

Compare two wallets across any chain. Returns both wallets in a single response.

```bash
agent-track compare So11111111111111111111111111111111111111112 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
agent-track compare <addr1> <addr2> --chain1 solana --chain2 ethereum
```

---

### token

Get token metadata, supply, holders, and price info.

```bash
agent-track token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
agent-track token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 --chain ethereum
```

Output:

```json
{
  "status": "ok",
  "chain": "solana",
  "data": {
    "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "name": "USD Coin",
    "symbol": "USDC",
    "decimals": 6,
    "totalSupply": "45000000000000000",
    "holders": 1245000,
    "price": "1.00",
    "marketCap": "45000000000"
  }
}
```

---

### contract

Get contract source code, ABI, compiler version, verification status, and license.

```bash
agent-track contract 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D --chain ethereum
```

---

### tx

Get transaction details: block, status, from, to, value, fee, gas used, gas price.

```bash
agent-track tx 5KtN3qCjKgmPqFxmP3mQykAz7mUGKTuLXMGLFQ4WqBg
agent-track tx 0x4e5a...f5a --chain ethereum
```

---

## Chain Detection

```
So11111111111111111111111111111111111111112  → solana
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045  → ethereum (ambiguous with BSC)
```

**Ambiguous**: `0x` addresses work on both Ethereum and BSC. Use `--chain` flag:

```bash
agent-track wallet 0x... --chain ethereum
agent-track wallet 0x... --chain bsc
```

---

## Output Format

### JSON (default) — for AI agents

Pure JSON written to **stdout**. Stderr reserved for retry logs — never mixed.

```
$ agent-track wallet <addr>
{ "status": "ok", "chain": "solana", "data": { ... } }

$ echo $?
0
```

### Pretty (optional) — for humans

```bash
agent-track wallet <addr> --pretty
```

Colored terminal output with chalk.

---

## Agent Integration

### Hermes / OpenCLAw / Claude Code

```bash
# Get wallet balance
npx agent-track wallet So11... | jq '.data.balance'

# Whale watch — tokens with >2% concentration
npx agent-track top EPjFW... | jq '.data.holders[] | select(.percentage > 2)'

# Gas comparison
npx agent-track gas | jq '.data.chains[] | {chain: .chain, fast: .fast}'

# Portfolio of multiple wallets
npx agent-track bulk <addr1> <addr2> | jq '.data.totalUsd'
```

### Error handling

```json
// Success: exit 0
{ "status": "ok", "chain": "solana", "data": { ... } }

// Error: exit 1
{ "status": "error", "chain": "solana", "error": "Address is required" }
```

---

## API Keys

EVM chains require a free API key:

```bash
# .env
ETHERSCAN_API_KEY=your_key_here
BSCSCAN_API_KEY=your_key_here
```

Get free keys: [Etherscan](https://etherscan.io/myapikey) · [BscScan](https://bscscan.com/myapikey)

> Solana via Solscan — no API key required. Works out of the box.

---

## Agent-First Design

| Feature               | Why it matters                                          |
|-----------------------|---------------------------------------------------------|
| Pure JSON to stdout   | Agent parses directly — no text stripping               |
| Stderr for logging    | Retry messages don't corrupt JSON                       |
| Exit codes            | 0 = ok, 1 = error — agent knows retry decision          |
| Auto chain detection  | Agent doesn't guess the chain                           |
| Rich enriched data    | USD values, metadata, price — ready for analysis        |
| No API key (Solana)   | Zero-config, works immediately                          |
| Retry with backoff    | HTTP 429/5xx auto-retries 3x                            |
| Input validation      | Clear errors before any API call                        |
| Timeout protection    | 15s timeout per request — never hangs                    |

---

## Development

```bash
git clone https://github.com/allinoneacount1-dot/agent-track
cd agent-track
npm install
npm test                              # 19 unit tests
npm run dev wallet <address>          # quick test
```

---

## License

MIT
