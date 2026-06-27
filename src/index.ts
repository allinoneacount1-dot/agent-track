#!/usr/bin/env node

import { Command } from "commander";
import { wallet } from "./commands/wallet.js";
import { contract } from "./commands/contract.js";
import { token } from "./commands/token.js";
import { tx } from "./commands/tx.js";
import { portfolio } from "./commands/portfolio.js";
import { compare } from "./commands/compare.js";
import { top } from "./commands/top.js";
import { gas } from "./commands/gas.js";
import { bulk } from "./commands/bulk.js";
import type { OutputFormat } from "./types.js";

const pkg = {
  name: "agent-track",
  version: "0.3.0",
  description: "Multi-chain onchain data tracker for AI agents — Solana, Ethereum, BSC. Pure JSON output.",
};

const program = new Command();

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version);

program
  .command("wallet")
  .description("Get wallet balance, token holdings, and recent transactions")
  .argument("<address>", "Wallet address")
  .option("-c, --chain <chain>", "Force chain: solana, ethereum, bsc")
  .option("-p, --pretty", "Human-readable colored output")
  .action(async (address, opts) => {
    const fmt: OutputFormat = opts.pretty ? "pretty" : "json";
    await wallet(address, opts.chain, fmt);
  });

program
  .command("contract")
  .description("Get contract source code, ABI, and verification status")
  .argument("<address>", "Contract address")
  .option("-c, --chain <chain>", "Force chain: solana, ethereum, bsc")
  .option("-p, --pretty", "Human-readable colored output")
  .action(async (address, opts) => {
    const fmt: OutputFormat = opts.pretty ? "pretty" : "json";
    await contract(address, opts.chain, fmt);
  });

program
  .command("token")
  .description("Get token info, holders, and supply")
  .argument("<address>", "Token mint/contract address")
  .option("-c, --chain <chain>", "Force chain: solana, ethereum, bsc")
  .option("-p, --pretty", "Human-readable colored output")
  .action(async (address, opts) => {
    const fmt: OutputFormat = opts.pretty ? "pretty" : "json";
    await token(address, opts.chain, fmt);
  });

program
  .command("tx")
  .description("Get transaction details, status, and gas used")
  .argument("<hash>", "Transaction hash")
  .option("-c, --chain <chain>", "Force chain: solana, ethereum, bsc")
  .option("-p, --pretty", "Human-readable colored output")
  .action(async (hash, opts) => {
    const fmt: OutputFormat = opts.pretty ? "pretty" : "json";
    await tx(hash, opts.chain, fmt);
  });

program
  .command("portfolio")
  .description("Aggregate wallet portfolio with total USD value")
  .argument("<address>", "Wallet address")
  .option("-c, --chain <chain>", "Force chain: solana, ethereum, bsc")
  .action(async (address, opts) => {
    await portfolio(address, opts.chain);
  });

program
  .command("compare")
  .description("Compare two wallets side by side")
  .argument("<address1>", "First wallet address")
  .argument("<address2>", "Second wallet address")
  .option("--chain1 <chain>", "Force chain for first wallet")
  .option("--chain2 <chain>", "Force chain for second wallet")
  .action(async (addr1, addr2, opts) => {
    await compare(addr1, addr2, opts.chain1, opts.chain2);
  });

program
  .command("top")
  .description("Get top token holders — whale watch")
  .argument("<mint>", "Token mint address (Solana)")
  .option("-l, --limit <number>", "Number of holders", "20")
  .action(async (mint, opts) => {
    await top(mint, parseInt(opts.limit, 10));
  });

program
  .command("gas")
  .description("Get current gas prices for Ethereum and/or BSC")
  .option("-c, --chain <chain>", "ethereum or bsc (default: both)")
  .action(async (opts) => {
    await gas(opts.chain);
  });

program
  .command("bulk")
  .description("Check multiple wallets at once")
  .argument("<addresses...>", "One or more wallet addresses")
  .option("-c, --chain <chain>", "Force chain for all wallets")
  .action(async (addresses, opts) => {
    await bulk(addresses, opts.chain);
  });

program.parse(process.argv);
