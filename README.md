# agent-track

Multi-chain onchain data tracker untuk **AI agents**. Track wallet, contract, token, dan transaksi di **Solana**, **Ethereum**, dan **BSC** — pure JSON output, no API key needed for Solana.

```
npx agent-track wallet <address>
npx agent-track portfolio <address>
npx agent-track compare <addr1> <addr2>
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

Agent bisa langsung ambil `data.totalUsd` buat tau total nilai wallet tanpa perlu looping.

---

### compare

Compare two wallets across any chain. Returns both wallets in a single response.

```bash
agent-track compare So11111111111111111111111111111111111111112 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
agent-track compare <addr1> <addr2> --chain1 solana --chain2 ethereum
```

Output:

```json
{
  "status": "ok",
  "chain": "solana",
  "data": {
    "left": { "address": "So11...", "balance": "124.32", "tokens": [...], "recentTx": [...] },
    "right": { "address": "0xd8...", "balance": "3.45", "tokens": [...], "recentTx": [...] },
    "leftChain": "solana",
    "rightChain": "ethereum"
  }
}
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
agent-track contract So11111111111111111111111111111111111111112
```

Output:

```json
{
  "status": "ok",
  "chain": "ethereum",
  "data": {
    "address": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "verified": true,
    "name": "UniswapV2Router02",
    "compiler": "v0.6.6+commit.6c089d02",
    "license": "MIT",
    "sourceCode": "// SPDX-License-Identifier: MIT\npragma solidity =0.6.6;...",
    "abi": "[{\"inputs\":[...]}]"
  }
}
```

---

### tx

Get transaction details: block, status, from, to, value, fee, gas used, gas price.

```bash
agent-track tx 5KtN3qCjKgmPqFxmP3mQykAz7mUGKTuLXMGLFQ4WqBg
agent-track tx 0x4e5a4a81c6b4f5eb7a5944b32a5f76f1f5c5f5a5b5c5d5e5f5a5b5c5d5e5f5a --chain ethereum
```

Output:

```json
{
  "status": "ok",
  "chain": "solana",
  "data": {
    "hash": "5KtN3qCjKgmPqFxmP3mQykAz7mUGKTuLXMGLFQ4WqBg",
    "block": 284592103,
    "timestamp": "1719500000",
    "from": "7xKX8kABJqj2dkTFaHPL8q3Gm2K3JGgGjqKnXPtATqGt",
    "to": "So11111111111111111111111111111111111111112",
    "value": "10.5",
    "fee": "0.000005",
    "status": "success",
    "gasUsed": "50000",
    "gasPrice": "0.0001"
  }
}
```

---

## Chain Detection

CLI auto-detects chain from address format:

```
So11111111111111111111111111111111111111112  → solana
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045  → ethereum (ambiguous with BSC)
```

**Ambiguous**: `0x` addresses are valid on both Ethereum and BSC. Use `--chain` to disambiguate:

```bash
agent-track wallet 0x... --chain ethereum
agent-track wallet 0x... --chain bsc
```

---

## Output Format

### JSON (default) — for AI agents

Pure JSON written to **stdout**. Stderr is reserved for retry logs and warnings — never mixed.

```
$ agent-track wallet <addr>
{ "status": "ok", "chain": "solana", "data": { ... } }

$ echo $?
0
```

### Pretty (optional) — for humans

Colored terminal output with chalk:

```
agent-track wallet <addr> --pretty
```

---

## Agent Integration

### Hermes / OpenCLAw / Claude Code

```bash
# Get wallet data as JSON
AGENT_OUTPUT=$(npx agent-track wallet So11111111111111111111111111111111111111112)
echo "$AGENT_OUTPUT" | jq '.data.balance'

# Portfolio analysis
npx agent-track portfolio <address>

# Compare two wallets
npx agent-track compare <addr1> <addr2>

# Chain of commands
npx agent-track wallet <addr> | jq '.data.tokens[] | select(.usdValue > "100") | .symbol'
```

### Error handling pattern

```json
// Success: exit code 0
{ "status": "ok", "chain": "solana", "data": { ... } }

// Error: exit code 1
{ "status": "error", "chain": "solana", "error": "Address is required" }
```

---

## API Keys

EVM chains (Ethereum, BSC) require a free API key from the block explorer.

Create a `.env` file or set environment variables:

```bash
# .env
ETHERSCAN_API_KEY=your_key_here
BSCSCAN_API_KEY=your_key_here
```

Get your free API key:

| Chain      | Explorer                          | API Key Page                                    |
|------------|-----------------------------------|-------------------------------------------------|
| Solana     | Solscan                           | Not required                                    |
| Ethereum   | Etherscan                         | https://etherscan.io/myapikey                   |
| BSC        | BscScan                           | https://bscscan.com/myapikey                    |

> Solana queries go through Solscan's public API — no API key required for basic usage.

---

## Agent-First Design

agent-track is engineered for AI agent frameworks like **Hermes**, **OpenCLAw**, Claude Code, and custom agents.

| Feature               | Why it matters for agents                                             |
|-----------------------|-----------------------------------------------------------------------|
| Pure JSON to stdout   | Agent reads directly — no text stripping needed                       |
| Stderr for logging     | Retry messages don't corrupt JSON parse                               |
| Exit codes             | `0` = success, `1` = error — agent knows when to retry                |
| Auto chain detection   | Agent doesn't need to guess the chain                                 |
| Rich enriched data     | USD values, metadata, price context — ready for analysis              |
| No API key (Solana)    | Zero-config setup, works out of the box                               |
| Retry with backoff     | HTTP 429/5xx automatically retries 3x with exponential backoff        |
| Input validation       | Clear error messages before hitting any API                           |
| Timeout protection     | 15s timeout per request — never hangs                                 |

---

## Development

```bash
git clone https://github.com/allinoneacount1-dot/agent-track
cd agent-track
npm install
npm test                          # 19 unit tests
npm run dev wallet <address>      # quick test without installing
```

---

## License

MIT
