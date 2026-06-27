#!/usr/bin/env node

import { Command } from "commander";
import { wallet } from "./commands/wallet.js";
import { contract } from "./commands/contract.js";
import { token } from "./commands/token.js";
import { tx } from "./commands/tx.js";

const pkg = { name: "agent-track", version: "0.1.0", description: "Track wallets, contracts, tokens, and transactions across Solana, Ethereum, and BSC." };

const program = new Command();

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version);

program
  .command("wallet")
  .description("Get wallet balance, token holdings, and recent transactions")
  .argument("<address>", "Wallet address")
  .option("-c, --chain <chain>", "Chain: solana, ethereum, bsc")
  .action(async (address, opts) => { await wallet(address, opts.chain); });

program
  .command("contract")
  .description("Get contract source code, ABI, and verification status")
  .argument("<address>", "Contract address")
  .option("-c, --chain <chain>", "Chain: solana, ethereum, bsc")
  .action(async (address, opts) => { await contract(address, opts.chain); });

program
  .command("token")
  .description("Get token info, holders, and supply")
  .argument("<address>", "Token mint / contract address")
  .option("-c, --chain <chain>", "Chain: solana, ethereum, bsc")
  .action(async (address, opts) => { await token(address, opts.chain); });

program
  .command("tx")
  .description("Get transaction details, status, and gas")
  .argument("<hash>", "Transaction hash")
  .option("-c, --chain <chain>", "Chain: solana, ethereum, bsc")
  .action(async (hash, opts) => { await tx(hash, opts.chain); });

program.parse(process.argv);
