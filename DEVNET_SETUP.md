# PANGI Devnet Setup & Verification

## Quick Verification

Run the automated verification script:

```bash
./scripts/verify-devnet.sh
```

## Manual Verification Steps

### 1. Check Solana CLI Installation

```bash
solana --version
```

If not installed:
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### 2. Configure Devnet

```bash
# Set RPC URL to devnet
solana config set --url https://api.devnet.solana.com

# Verify configuration
solana config get
```

Expected output:
```
Config File: /home/user/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/user/.config/solana/id.json
Commitment: confirmed
```

### 3. Check Wallet Balance

```bash
# Check current balance
solana balance

# Request airdrop if needed (2 SOL)
solana airdrop 2

# Verify new balance
solana balance
```

### 4. Verify PANGI Token Mint

```bash
# Check if token mint exists on devnet
spl-token account-info 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url https://api.devnet.solana.com
```

Expected output (if deployed):
```
Address: 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be
Balance: <amount>
Mint: 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be
Owner: <owner_pubkey>
State: Initialized
```

If not found:
```
Error: Account not found
```
This means the token hasn't been deployed yet.

## Deploy Programs to Devnet

### 1. Build Programs

```bash
anchor build
```

### 2. Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

This will deploy all 4 programs:
- `pangi_token` - Token with dynamic tax
- `pangi_nft` - NFT evolution system
- `pangi_vault` - NFT-linked vaults
- `special_distribution` - Token distribution

### 3. Initialize Programs

After deployment, initialize the programs:

```bash
# Initialize token program with tax config
anchor run initialize-token --provider.cluster devnet

# Initialize distribution config
anchor run initialize-distribution --provider.cluster devnet
```

## Program IDs

Update these in your code after deployment:

```typescript
// lib/constants.ts
export const PANGI_TOKEN_PROGRAM_ID = 'YOUR_DEPLOYED_TOKEN_PROGRAM_ID';
export const PANGI_NFT_PROGRAM_ID = 'YOUR_DEPLOYED_NFT_PROGRAM_ID';
export const PANGI_VAULT_PROGRAM_ID = 'YOUR_DEPLOYED_VAULT_PROGRAM_ID';
export const SPECIAL_DISTRIBUTION_PROGRAM_ID = 'YOUR_DEPLOYED_DISTRIBUTION_PROGRAM_ID';
```

## Testing on Devnet

### Run Integration Tests

```bash
# Run all tests
npm test

# Run ESM tests
npm run test:esm

# Test individual programs
npm run test:token
npm run test:nft
npm run test:vault
npm run test:distribution
```

### Test with Frontend

```bash
cd pangi-dapp
npm run dev
```

Visit http://localhost:3000 and connect your wallet (set to devnet).

## Troubleshooting

### Airdrop Rate Limit

If you hit the airdrop rate limit:
```bash
# Wait a few minutes and try again
solana airdrop 1

# Or use a devnet faucet:
# https://faucet.solana.com/
```

### Account Not Found

If token mint is not found:
1. Ensure programs are deployed: `anchor deploy --provider.cluster devnet`
2. Initialize the token: `anchor run initialize-token --provider.cluster devnet`
3. Verify deployment: `solana program show <PROGRAM_ID> --url devnet`

### Connection Issues

If you can't connect to devnet:
```bash
# Try different RPC endpoints
solana config set --url https://api.devnet.solana.com
# or
solana config set --url https://devnet.helius-rpc.com
```

## Useful Commands

```bash
# Check program deployment
solana program show <PROGRAM_ID> --url devnet

# View transaction
solana confirm <SIGNATURE> --url devnet

# Get account info
solana account <ACCOUNT_ADDRESS> --url devnet

# List token accounts
spl-token accounts --url devnet

# Transfer tokens
spl-token transfer <TOKEN_MINT> <AMOUNT> <RECIPIENT> --url devnet
```

## Resources

- [Solana Devnet Faucet](https://faucet.solana.com/)
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [SPL Token CLI](https://spl.solana.com/token)
