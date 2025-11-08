# Gitpod Guide — PANGI (Solana + Anchor + Next.js)

This repo is Gitpod-ready. Open it in Gitpod (via the browser extension or prefix repo URL with `https://gitpod.io/#`).

## What you get
- Custom container with **Node 20**, **pnpm**, **Rust stable**
- Scripts to install **Solana CLI** and **Anchor**
- Exposed ports for **Next.js** (3000) and **solana-test-validator** (8899/8900/9900)
- Workspace tasks to install, build, and start

## First run
1. Gitpod will build the image and run `scripts/install-solana-anchor.sh`.
2. It will generate a devnet keypair at `~/.config/solana/id.json` if none exists.
3. Fill your `.env` (you can start by renaming `.env.devnet.example`).

## Commands
- **Check toolchain**  
  `solana --version && anchor --version`
- **Run smoke test** (reads IDLs + .env)  
  `./scripts/run-smoke.sh`
- **Start Next.js**  
  Gitpod task “Dev server” runs `pnpm dev` / `yarn dev` / `npm run dev` on port 3000.

## Tips
- Fund your devnet key: `solana airdrop 2` (repeat if needed).
- If your IDLs are in `target/idl`, use `./scripts/generate-idl.sh` to copy into `/idl` for the smoke script.
- Put your program IDs and collection mint in `.env`:
  ```
  PANGI_DOMAINS_PROGRAM_ID=...
  PANGI_WALLET_PROGRAM_ID=...
  PANGI_NFT_PROGRAM_ID=...
  PANGI_COLLECTION_MINT=...
  TEST_MASTER_NFT_MINT=...
  ```
