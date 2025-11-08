# Devnet Deployment Guide

Complete guide to deploying PANGI programs and frontend to Solana Devnet.

## Overview

Devnet is Solana's public testing network where you can:
- Test programs with real network conditions
- Share your dApp with testers
- Validate before mainnet deployment
- Get free SOL from faucets

**Current Devnet Deployment:**
- Token Program: `BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA`
- NFT Program: `etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE`
- Vault Program: `5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2`
- Distribution Program: `bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq`

## Prerequisites

- Completed [Local Development Setup](./local-development.md)
- Solana CLI configured
- Anchor CLI installed
- Programs built successfully
- Devnet SOL for deployment (~10 SOL)

## Step 1: Configure for Devnet

### Switch Solana CLI to Devnet

```bash
# Set cluster to devnet
solana config set --url devnet

# Verify configuration
solana config get
```

**Expected output:**
```
Config File: /home/user/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/user/.config/solana/id.json
Commitment: confirmed
```

### Get Devnet SOL

```bash
# Airdrop SOL (may need to run multiple times)
solana airdrop 2
solana airdrop 2
solana airdrop 2

# Check balance
solana balance
```

You need at least **5-10 SOL** for deployment.

**Alternative Faucets:**
- [faucet.solana.com](https://faucet.solana.com/)
- [QuickNode Faucet](https://faucet.quicknode.com/solana/devnet)
- [SolFaucet](https://solfaucet.com/)

## Step 2: Update Anchor Configuration

### Edit `Anchor.toml`

```toml
[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[programs.devnet]
pangi_token = "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA"
pangi_nft = "etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE"
pangi_vault = "5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2"
special_distribution = "bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

### Generate Program Keypairs (First Time Only)

If deploying for the first time:

```bash
# Generate keypairs for each program
solana-keygen new --outfile target/deploy/pangi_token-keypair.json
solana-keygen new --outfile target/deploy/pangi_nft-keypair.json
solana-keygen new --outfile target/deploy/pangi_vault-keypair.json
solana-keygen new --outfile target/deploy/special_distribution-keypair.json

# Get program IDs
solana-keygen pubkey target/deploy/pangi_token-keypair.json
solana-keygen pubkey target/deploy/pangi_nft-keypair.json
solana-keygen pubkey target/deploy/pangi_vault-keypair.json
solana-keygen pubkey target/deploy/special_distribution-keypair.json
```

**Update `Anchor.toml` and `lib.rs` files with these IDs.**

## Step 3: Build Programs

```bash
# Clean previous builds
anchor clean

# Build all programs
anchor build

# Verify build
ls -lh target/deploy/*.so
```

**Expected output:**
```
-rw-r--r-- 1 user user 234K pangi_token.so
-rw-r--r-- 1 user user 189K pangi_nft.so
-rw-r--r-- 1 user user 256K pangi_vault.so
-rw-r--r-- 1 user user 198K special_distribution.so
```

## Step 4: Deploy Programs

### Deploy All Programs

```bash
anchor deploy --provider.cluster devnet
```

**Expected output:**
```
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: /home/user/.config/solana/id.json

Deploying program "pangi_token"...
Program Id: BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
Deploy success

Deploying program "pangi_nft"...
Program Id: etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE
Deploy success

Deploying program "pangi_vault"...
Program Id: 5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2
Deploy success

Deploying program "special_distribution"...
Program Id: bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq
Deploy success
```

### Deploy Individual Program

```bash
# Deploy specific program
anchor deploy --program-name pangi_token --provider.cluster devnet
```

### Verify Deployment

```bash
# Check program account
solana program show BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA --url devnet
```

**Expected output:**
```
Program Id: BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: <ADDRESS>
Authority: <YOUR_WALLET>
Last Deployed In Slot: 123456789
Data Length: 234567 (0x39447) bytes
Balance: 1.67 SOL
```

## Step 5: Initialize Programs

### Initialize Token Program

```typescript
// scripts/initialize-token.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PangiToken } from "../target/types/pangi_token";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PangiToken as Program<PangiToken>;

  // Derive tax config PDA
  const [taxConfigPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("tax_config")],
    program.programId
  );

  // Initialize
  const tx = await program.methods
    .initialize({
      taxRate: 200,  // 2%
      conservationFund: new anchor.web3.PublicKey("CONSERVATION_WALLET"),
      liquidityPool: new anchor.web3.PublicKey("LP_WALLET"),
      treasury: new anchor.web3.PublicKey("TREASURY_WALLET"),
    })
    .accounts({
      authority: provider.wallet.publicKey,
      taxConfig: taxConfigPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Token program initialized:", tx);
}

main();
```

Run:
```bash
ts-node scripts/initialize-token.ts
```

### Initialize Distribution Program

```typescript
// scripts/initialize-distribution.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SpecialDistribution } from "../target/types/special_distribution";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SpecialDistribution as Program<SpecialDistribution>;

  const TOTAL_ALLOCATION = new anchor.BN(63_000_000).mul(
    new anchor.BN(10).pow(new anchor.BN(9))
  );

  const [distributionConfigPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("distribution_config")],
    program.programId
  );

  const tx = await program.methods
    .initializeDistribution({
      totalAllocation: TOTAL_ALLOCATION,
    })
    .accounts({
      authority: provider.wallet.publicKey,
      distributionConfig: distributionConfigPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Distribution program initialized:", tx);
}

main();
```

Run:
```bash
ts-node scripts/initialize-distribution.ts
```

## Step 6: Create Token Mint

```bash
# Create PANGI token mint
spl-token create-token --decimals 9 --url devnet

# Example output:
# Creating token 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be

# Create token account for yourself
spl-token create-account 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet

# Mint initial supply (1 billion tokens)
spl-token mint 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be 1000000000 --url devnet
```

**Save the token mint address!**

## Step 7: Configure Frontend

### Update Environment Variables

Create `pangi-dapp/.env.local`:

```bash
# Network
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com

# Program IDs
NEXT_PUBLIC_TOKEN_PROGRAM_ID=BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
NEXT_PUBLIC_NFT_PROGRAM_ID=etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE
NEXT_PUBLIC_VAULT_PROGRAM_ID=5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2
NEXT_PUBLIC_DISTRIBUTION_PROGRAM_ID=bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq

# Token Mint
NEXT_PUBLIC_TOKEN_MINT=6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be

# PDAs (derived from programs)
NEXT_PUBLIC_TAX_CONFIG_PDA=3qygDfXDqAMcqzmqj6K3crtuSx1VbyjNrA6csEGqRZjS
NEXT_PUBLIC_DISTRIBUTION_CONFIG_PDA=F99537D8BByU6ZhJjEe1r6Gdz1dxVtqQVbw7vn4K6to2
```

### Update Constants File

Edit `pangi-dapp/lib/constants.ts`:

```typescript
import { PublicKey } from "@solana/web3.js";

// Network
export const NETWORK = "devnet";
export const RPC_ENDPOINT = "https://api.devnet.solana.com";

// Program IDs
export const PANGI_TOKEN_PROGRAM_ID_STR = "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA";
export const PANGI_VAULT_PROGRAM_ID_STR = "5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2";
export const PANGI_NFT_PROGRAM_ID_STR = "etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE";
export const SPECIAL_DISTRIBUTION_PROGRAM_ID_STR = "bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq";
export const PANGI_TOKEN_MINT_STR = "6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be";

// Lazy-loaded PublicKeys
let _PANGI_TOKEN_PROGRAM_ID: PublicKey | null = null;
let _PANGI_VAULT_PROGRAM_ID: PublicKey | null = null;
let _PANGI_NFT_PROGRAM_ID: PublicKey | null = null;
let _SPECIAL_DISTRIBUTION_PROGRAM_ID: PublicKey | null = null;
let _PANGI_TOKEN_MINT: PublicKey | null = null;

export const PANGI_TOKEN_PROGRAM_ID = () => 
  _PANGI_TOKEN_PROGRAM_ID || (_PANGI_TOKEN_PROGRAM_ID = new PublicKey(PANGI_TOKEN_PROGRAM_ID_STR));
export const PANGI_VAULT_PROGRAM_ID = () => 
  _PANGI_VAULT_PROGRAM_ID || (_PANGI_VAULT_PROGRAM_ID = new PublicKey(PANGI_VAULT_PROGRAM_ID_STR));
export const PANGI_NFT_PROGRAM_ID = () => 
  _PANGI_NFT_PROGRAM_ID || (_PANGI_NFT_PROGRAM_ID = new PublicKey(PANGI_NFT_PROGRAM_ID_STR));
export const SPECIAL_DISTRIBUTION_PROGRAM_ID = () => 
  _SPECIAL_DISTRIBUTION_PROGRAM_ID || (_SPECIAL_DISTRIBUTION_PROGRAM_ID = new PublicKey(SPECIAL_DISTRIBUTION_PROGRAM_ID_STR));
export const PANGI_TOKEN_MINT = () => 
  _PANGI_TOKEN_MINT || (_PANGI_TOKEN_MINT = new PublicKey(PANGI_TOKEN_MINT_STR));
```

## Step 8: Deploy Frontend

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd pangi-dapp
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add all variables from `.env.local`

**Your dApp is now live!** 🎉

### Option B: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   cd pangi-dapp
   npm run build
   netlify deploy --prod --dir=.next
   ```

4. **Set Environment Variables**
   - Netlify dashboard → Site settings → Environment variables
   - Add all variables

### Option C: GitHub Pages

1. **Update `next.config.ts`**
   ```typescript
   const nextConfig = {
     output: 'export',
     basePath: '/pangi-ecosystem',
     images: {
       unoptimized: true,
     },
   };
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npx gh-pages -d out
   ```

## Step 9: Verify Deployment

### Test Programs

```bash
# View program on Solana Explorer
open "https://explorer.solana.com/address/BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA?cluster=devnet"

# Check program account
solana program show BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA --url devnet
```

### Test Frontend

1. Visit your deployed URL
2. Connect Phantom wallet (set to Devnet)
3. Verify:
   - Wallet connects successfully
   - SOL balance displays
   - PANGI balance displays (if you have tokens)
   - Program IDs are correct

### Run Integration Tests

```bash
# Test against devnet
cd pangi-dapp
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com npm test
```

## Step 10: Post-Deployment Tasks

### Create Vaults

```typescript
// scripts/create-vaults.ts
import * as anchor from "@coral-xyz/anchor";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PangiVault;

  // Create standard vault
  const tx1 = await program.methods
    .createVault({
      rewardRate: new anchor.BN(1_000_000),  // 0.001 PANGI/sec
      evolutionRate: new anchor.BN(1),        // 1 point/sec
    })
    .accounts({
      authority: provider.wallet.publicKey,
      vault: vaultPDA,
      rewardPool: rewardPoolAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Standard vault created:", tx1);

  // Create premium vault
  const tx2 = await program.methods
    .createVault({
      rewardRate: new anchor.BN(2_000_000),  // 0.002 PANGI/sec
      evolutionRate: new anchor.BN(2),        // 2 points/sec
    })
    .accounts({
      authority: provider.wallet.publicKey,
      vault: premiumVaultPDA,
      rewardPool: premiumRewardPoolAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Premium vault created:", tx2);
}

main();
```

### Fund Reward Pools

```bash
# Transfer PANGI to vault reward pools
spl-token transfer \
  6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be \
  10000000 \
  <VAULT_REWARD_POOL_ADDRESS> \
  --url devnet
```

### Register Special NFTs

```typescript
// scripts/register-special-nfts.ts
// Register the 25 special NFTs with distribution program
```

## Monitoring

### Track Transactions

```bash
# Monitor program transactions
solana logs BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA --url devnet
```

### Check Program Balance

```bash
# View program account balance
solana balance BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA --url devnet
```

### Analytics

Use Solana Explorer to track:
- Transaction volume
- Active users
- Token transfers
- NFT mints

## Updating Programs

### Upgrade Program

```bash
# Build new version
anchor build

# Deploy upgrade
anchor upgrade target/deploy/pangi_token.so \
  --program-id BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA \
  --provider.cluster devnet
```

### Update Frontend

```bash
cd pangi-dapp
git pull
npm install
vercel --prod
```

## Security Checklist

- [ ] Program IDs match deployed programs
- [ ] Authority keys are secure
- [ ] Upgrade authority is set correctly
- [ ] Tax configuration is correct
- [ ] Reward pools are funded
- [ ] Frontend environment variables are set
- [ ] RPC endpoint is reliable
- [ ] Error handling is implemented
- [ ] Rate limiting is configured
- [ ] Monitoring is set up

## Cost Estimation

**Devnet Deployment Costs (Free SOL):**
- Program deployment: ~2 SOL per program
- Account creation: ~0.002 SOL per account
- Transactions: ~0.000005 SOL per transaction

**Total for initial deployment: ~10 SOL (free on devnet)**

## Next Steps

- 📖 [Mainnet Deployment](./mainnet-deployment.md) - Go to production
- 🐛 [Troubleshooting](./troubleshooting.md) - Common issues
- 📊 [Monitoring Guide](#) - Track your deployment

---

**Questions?** Join our [Discord](#) or email dev@pangi.io
