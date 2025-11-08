# PANGI — Devnet Runbook (Quick Wins)

This checklist assumes your programs are already deployed on **devnet**.

## 0) Fill env + program IDs
Copy `.env.devnet.example` → `.env` and fill the values.
- `ANCHOR_PROVIDER_URL`: https://api.devnet.solana.com (or your RPC)
- `ANCHOR_WALLET`: absolute path to the keypair that controls the root/admin
- `PANGI_COLLECTION_MINT`: verified collection mint for your NFTs
- `PANGI_DOMAINS_PROGRAM_ID`, `PANGI_WALLET_PROGRAM_ID`, `PANGI_NFT_PROGRAM_ID`: your devnet IDs

## 1) Publish IDLs (so clients can call your program)
```bash
anchor build              # if needed, to regenerate target/idl
./scripts/generate-idl.sh # copies to ./idl
# (Optional) host IDLs on a public endpoint for frontends
```

## 2) Initialize Root (one-time per deployment)
- Set treasury address (where fees flow)
- Set policy knobs: `default_max_per_nft = 5`, `paused = false`, `reclaim_on_close = false`
You can add a small TS helper or use the smoke script template below.

## 3) Mint/hold a test NFT in your verified collection
- Ensure Token Metadata shows the collection **verified**
- If you rely on editions, pick a serial you can read in your client

## 4) Smoke-test the whole flow (owner only)  
Use the provided template `scripts/devnet_smoke.ts`:
- `createWallet(nftMint)` → auto-claim root domain `<edition>nft.pangi.sol`
- `createSubdomain('docs')` → `docs.<edition>nft.pangi.sol` (quota 3–5)
- `setToC` → write encrypted ToC pointer/hash
- `createSubdomain('tokens')` → token vault
- `depositSPL` / `withdrawSPL` to verify authority gating

## 5) Guardian test (delegation)
- `grantGuardian(subdomain='docs', guardianNftMint, ttl=72h, perms=READ|WRITE)`
- From a separate wallet that **owns the guardian NFT**, run `updateDocVault()`; creating NEW subdomains should **fail**

## 6) Fees (optional now, but wire soon)
- Set `treasury`
- Turn on `fee_subdomain_create` and `fee_guardian_grant`
- Emit `FeeCollected` events; check treasury balance after actions

## 7) Observability
- Print/emit events: `SubdomainCreated`, `GuardianGranted`, `ToCUpdated`, `Withdrawal`
- Stand up a tiny listener (Helius/webhook or your own RPC listener) to index wallets/domains

## 8) Frontend demo (1 hour)
- Next.js page with wallet adapter
- Buttons: Create Wallet, Add Docs Vault, Add Token Vault, Grant Guardian(24h), View ToC
- Show: “Subdomains used: X/5”, status chips for guardian TTL/perms

---

## Troubleshooting quickies
- **Owner checks failing:** verify current owner of the **master NFT** (not guardian) and collection verification
- **PDA collisions:** all labels must be lowercase a–z 0–9 and hyphen, <= 32 chars
- **Quota stuck:** if using global per-NFT quota, remember it’s not freed unless `reclaim_on_close=true`
- **RPC 429 or compute errors:** add ComputeBudget ix (limit + small priority fee) to client transactions
