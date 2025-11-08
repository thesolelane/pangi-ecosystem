# Local Development Guide

Complete guide to setting up and running PANGI locally for development.

## Prerequisites

### Required Software

- **Rust** 1.70+ - [Install](https://rustup.rs/)
- **Solana CLI** 1.18+ - [Install](https://docs.solana.com/cli/install-solana-cli-tools)
- **Anchor** 0.32+ - [Install](https://www.anchor-lang.com/docs/installation)
- **Node.js** 18+ - [Install](https://nodejs.org/)
- **npm** or **yarn**
- **Git**

### Verify Installation

```bash
# Check Rust
rustc --version
# Expected: rustc 1.70.0 or higher

# Check Solana
solana --version
# Expected: solana-cli 1.18.0 or higher

# Check Anchor
anchor --version
# Expected: anchor-cli 0.32.0 or higher

# Check Node.js
node --version
# Expected: v18.0.0 or higher

# Check npm
npm --version
# Expected: 9.0.0 or higher
```

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/thesolelane/pangi-ecosystem.git
cd pangi-ecosystem
```

### 2. Install Dependencies

#### Rust Dependencies

```bash
# Update Rust
rustup update

# Add Solana target
rustup target add bpfel-unknown-unknown
```

#### Frontend Dependencies

```bash
cd pangi-dapp
npm install
cd ..
```

### 3. Configure Solana CLI

```bash
# Set to localhost for local development
solana config set --url localhost

# Create a local keypair (if you don't have one)
solana-keygen new --outfile ~/.config/solana/id.json

# Check your configuration
solana config get
```

Expected output:
```
Config File: /home/user/.config/solana/cli/config.yml
RPC URL: http://localhost:8899
WebSocket URL: ws://localhost:8900/ (computed)
Keypair Path: /home/user/.config/solana/id.json
Commitment: confirmed
```

## Running Local Validator

### Start Solana Test Validator

Open a new terminal and run:

```bash
solana-test-validator
```

This starts a local Solana blockchain on your machine.

**Expected output:**
```
Ledger location: test-ledger
Log: test-ledger/validator.log
⠁ Initializing...
Identity: 5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG
Genesis Hash: 4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY
Version: 1.18.0
Shred Version: 13286
Gossip Address: 127.0.0.1:1024
TPU Address: 127.0.0.1:1027
JSON RPC URL: http://127.0.0.1:8899
⠁ 00:00:15 | Processed Slot: 10 | Confirmed Slot: 10 | Finalized Slot: 0
```

**Keep this terminal running** while developing.

### Airdrop SOL to Your Wallet

In a new terminal:

```bash
# Airdrop 10 SOL to your wallet
solana airdrop 10

# Check your balance
solana balance
```

Expected: `10 SOL`

## Building Programs

### Build All Programs

```bash
# From project root
anchor build
```

This compiles all four Solana programs:
- `pangi-token`
- `pangi-nft`
- `pangi-vault`
- `special-distribution`

**Expected output:**
```
Building pangi-token...
Building pangi-nft...
Building pangi-vault...
Building special-distribution...
✓ Build successful
```

### Build Individual Program

```bash
# Build specific program
cd programs/pangi-token
cargo build-bpf
cd ../..
```

### Get Program IDs

```bash
# Display all program IDs
anchor keys list
```

**Example output:**
```
pangi_token: BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
pangi_nft: etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE
pangi_vault: 5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2
special_distribution: bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq
```

## Deploying Programs Locally

### Deploy All Programs

```bash
anchor deploy
```

This deploys all programs to your local validator.

**Expected output:**
```
Deploying cluster: http://localhost:8899
Upgrade authority: /home/user/.config/solana/id.json
Deploying program "pangi_token"...
Program Id: BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA

Deploying program "pangi_nft"...
Program Id: etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE

Deploying program "pangi_vault"...
Program Id: 5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2

Deploying program "special_distribution"...
Program Id: bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq

Deploy success
```

### Deploy Individual Program

```bash
anchor deploy --program-name pangi_token
```

### Verify Deployment

```bash
# Check program account
solana program show BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
```

## Running Tests

### Run All Tests

```bash
# Anchor tests (Rust)
anchor test

# Frontend tests (TypeScript)
cd pangi-dapp
npm test
cd ..
```

### Run Specific Test Suite

```bash
# Token program tests
anchor test --skip-local-validator -- --test token_program

# NFT program tests
anchor test --skip-local-validator -- --test nft_program

# Vault program tests
anchor test --skip-local-validator -- --test vault_program

# Distribution program tests
anchor test --skip-local-validator -- --test distribution_program
```

### Run Frontend Tests

```bash
cd pangi-dapp

# Run all tests
npm test

# Run specific test file
npm test -- WalletInfo.test.tsx

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Running the Frontend

### Development Server

```bash
cd pangi-dapp
npm run dev
```

**Expected output:**
```
> pangi-dapp@0.1.0 dev
> next dev

   ▲ Next.js 16.0.1
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.100:3000

 ✓ Starting...
 ✓ Ready in 2.1s
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create `.env.local` in `pangi-dapp/`:

```bash
# RPC Endpoint
NEXT_PUBLIC_RPC_ENDPOINT=http://localhost:8899

# Program IDs (from anchor keys list)
NEXT_PUBLIC_TOKEN_PROGRAM_ID=BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
NEXT_PUBLIC_NFT_PROGRAM_ID=etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE
NEXT_PUBLIC_VAULT_PROGRAM_ID=5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2
NEXT_PUBLIC_DISTRIBUTION_PROGRAM_ID=bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq

# Token Mint Address (after initialization)
NEXT_PUBLIC_TOKEN_MINT=6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be
```

## Development Workflow

### Typical Development Cycle

1. **Start Local Validator**
   ```bash
   solana-test-validator
   ```

2. **Make Changes to Program**
   ```bash
   # Edit programs/pangi-token/src/lib.rs
   vim programs/pangi-token/src/lib.rs
   ```

3. **Build and Deploy**
   ```bash
   anchor build
   anchor deploy
   ```

4. **Run Tests**
   ```bash
   anchor test --skip-local-validator
   ```

5. **Update Frontend**
   ```bash
   cd pangi-dapp
   # Frontend auto-reloads on file changes
   ```

### Hot Reload

The frontend supports hot reload:
- Edit any `.tsx` or `.ts` file
- Save the file
- Browser automatically refreshes

For program changes:
- Must rebuild and redeploy
- Restart frontend if program IDs change

## Debugging

### View Program Logs

```bash
# Tail validator logs
solana logs
```

**Example output:**
```
Streaming transaction logs. Confirmed commitment
Transaction executed in slot 12345:
  Signature: 5j7s...
  Status: Ok
  Log Messages:
    Program BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA invoke [1]
    Program log: Instruction: Initialize
    Program log: Tax rate set to 200 basis points
    Program BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA success
```

### Debug Specific Transaction

```bash
# Get transaction details
solana confirm -v <TRANSACTION_SIGNATURE>
```

### Inspect Account Data

```bash
# View account info
solana account <ACCOUNT_ADDRESS>

# View token account
spl-token account-info <TOKEN_ACCOUNT_ADDRESS>
```

### Frontend Debugging

```bash
# Enable verbose logging
cd pangi-dapp
NEXT_PUBLIC_DEBUG=true npm run dev
```

Check browser console for detailed logs.

## Common Issues

### Issue: "Program not found"

**Solution:**
```bash
# Ensure validator is running
solana-test-validator

# Redeploy programs
anchor deploy
```

### Issue: "Insufficient funds"

**Solution:**
```bash
# Airdrop more SOL
solana airdrop 10
```

### Issue: "Transaction simulation failed"

**Causes:**
1. Account doesn't exist
2. Insufficient SOL for rent
3. Invalid instruction data

**Debug:**
```bash
# Check account
solana account <ADDRESS>

# View detailed error
solana confirm -v <TX_SIGNATURE>
```

### Issue: "Anchor build fails"

**Solution:**
```bash
# Clean build artifacts
anchor clean

# Rebuild
anchor build
```

### Issue: "Frontend can't connect to wallet"

**Solutions:**
1. Install Phantom wallet extension
2. Switch wallet to localhost network
3. Refresh the page
4. Check browser console for errors

### Issue: "Port 8899 already in use"

**Solution:**
```bash
# Kill existing validator
pkill solana-test-validator

# Restart
solana-test-validator
```

## Advanced Configuration

### Custom Validator Settings

```bash
# Start with custom settings
solana-test-validator \
  --ledger test-ledger \
  --reset \
  --quiet \
  --bpf-program BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA target/deploy/pangi_token.so
```

### Faster Slot Times

```bash
# Faster slots for testing (400ms)
solana-test-validator --slots-per-epoch 32
```

### Clone Mainnet Accounts

```bash
# Clone account from mainnet
solana-test-validator \
  --clone <ACCOUNT_ADDRESS> \
  --url mainnet-beta
```

## Performance Tips

### Speed Up Builds

```bash
# Use cargo cache
export CARGO_INCREMENTAL=1

# Parallel builds
cargo build-bpf --jobs 4
```

### Reduce Test Time

```bash
# Skip validator startup
anchor test --skip-local-validator

# Run specific test
anchor test --skip-local-validator -- --test token_program
```

### Frontend Optimization

```bash
# Use Turbopack (faster than Webpack)
npm run dev --turbo

# Disable source maps in development
GENERATE_SOURCEMAP=false npm run dev
```

## Development Tools

### Recommended VS Code Extensions

- **Rust Analyzer** - Rust language support
- **Solana Snippets** - Solana code snippets
- **Anchor Snippets** - Anchor framework snippets
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting

### Useful Commands

```bash
# Format Rust code
cargo fmt

# Lint Rust code
cargo clippy

# Format TypeScript code
cd pangi-dapp
npm run lint

# Check TypeScript types
npm run type-check
```

## Next Steps

- 📖 [Devnet Deployment](./devnet-deployment.md) - Deploy to Solana Devnet
- 🐛 [Troubleshooting](./troubleshooting.md) - Common issues and solutions
- 🧪 [Testing Guide](../developer-docs/testing.md) - Write comprehensive tests

---

**Need Help?** Join our [Discord](#) or email dev@pangi.io
