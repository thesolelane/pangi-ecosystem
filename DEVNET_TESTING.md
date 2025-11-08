# PANGI Devnet Testing Guide

Complete guide for testing PANGI token transfers with dynamic tax on Solana devnet.

## Prerequisites

### 1. Install Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### 2. Install SPL Token CLI
```bash
cargo install spl-token-cli
```

### 3. Verify Installation
```bash
solana --version
spl-token --version
```

## Quick Start

### Automated Setup
```bash
# 1. Verify devnet connection
./scripts/verify-devnet.sh

# 2. Setup token accounts
./scripts/setup-token-accounts.sh

# 3. Test token transfer
./scripts/test-token-transfer.sh 100
```

## Manual Setup

### Step 1: Configure Devnet
```bash
# Set RPC URL to devnet
solana config set --url https://api.devnet.solana.com

# Verify configuration
solana config get
```

Expected output:
```
RPC URL: https://api.devnet.solana.com
```

### Step 2: Fund Your Wallet
```bash
# Check balance
solana balance

# Request airdrop (2 SOL)
solana airdrop 2

# Verify balance
solana balance
```

### Step 3: Create Recipient Wallet
```bash
# Create new keypair
solana-keygen new --outfile /tmp/pangi-recipient.json --no-passphrase

# Get recipient address
RECIPIENT=$(solana-keygen pubkey /tmp/pangi-recipient.json)
echo "Recipient: $RECIPIENT"

# Fund recipient for rent
solana transfer $RECIPIENT 0.1 --allow-unfunded-recipient
```

### Step 4: Create Token Accounts
```bash
# Token mint address
TOKEN_MINT="6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be"

# Create sender token account
spl-token create-account $TOKEN_MINT --url devnet

# Create recipient token account
spl-token create-account $TOKEN_MINT --owner /tmp/pangi-recipient.json --url devnet
```

### Step 5: Mint Tokens (if needed)
```bash
# Mint 10,000 PANGI to your account
spl-token mint $TOKEN_MINT 10000 --url devnet

# Check balance
spl-token balance $TOKEN_MINT --url devnet
```

## Testing Token Transfers

### Test 1: P2P Transfer (1% Tax)
```bash
# Transfer 1000 PANGI
RECIPIENT_ACCOUNT=$(spl-token accounts $TOKEN_MINT --owner /tmp/pangi-recipient.json --url devnet | grep -oP '(?<=Account: )[A-Za-z0-9]+' | head -1)

spl-token transfer $TOKEN_MINT 1000 $RECIPIENT_ACCOUNT --url devnet

# Expected:
# - Sender loses: 1000 PANGI
# - Recipient receives: 990 PANGI (1% tax = 10 PANGI)
# - Conservation fund: +10 PANGI
```

### Test 2: Exchange Deposit (0.5% Tax)
```bash
# Mark recipient as exchange (requires program call)
# Transfer 10,000 PANGI

spl-token transfer $TOKEN_MINT 10000 $RECIPIENT_ACCOUNT --url devnet

# Expected with exchange flag:
# - Sender loses: 10,000 PANGI
# - Recipient receives: 9,950 PANGI (0.5% tax = 50 PANGI)
# - Conservation fund: +50 PANGI
```

### Test 3: Whale Transfer (2% Tax)
```bash
# Transfer >10M PANGI (whale threshold)
spl-token transfer $TOKEN_MINT 15000000 $RECIPIENT_ACCOUNT --url devnet

# Expected:
# - Sender loses: 15,000,000 PANGI
# - Recipient receives: 14,700,000 PANGI (2% tax = 300,000 PANGI)
# - Conservation fund: +300,000 PANGI
```

### Test 4: Conservation Reward (0% Tax)
```bash
# Requires program call with reward flag
# No tax applied for conservation rewards
```

## Verify Results

### Check Balances
```bash
# Sender balance
spl-token balance $TOKEN_MINT --url devnet

# Recipient balance
spl-token balance $TOKEN_MINT --owner /tmp/pangi-recipient.json --url devnet

# All token accounts
spl-token accounts $TOKEN_MINT --url devnet
```

### View Transaction
```bash
# Get transaction signature from transfer output
# View on Solana Explorer
https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
```

### Check Conservation Fund
```bash
# List all token accounts for the mint
spl-token accounts $TOKEN_MINT --url devnet

# The conservation fund account will show accumulated tax
```

## Using Anchor Program

For proper tax calculation, use the program's `transfer_with_tax` instruction:

### TypeScript Example
```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const provider = new AnchorProvider(connection, wallet, {});
const program = new Program(idl, programId, provider);

// Transfer with tax
await program.methods
  .transferWithTax(new BN(1000_000_000_000)) // 1000 PANGI
  .accounts({
    from: senderTokenAccount,
    to: recipientTokenAccount,
    conservationFund: conservationFundAccount,
    authority: wallet.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    taxConfig: taxConfigPDA,
  })
  .rpc();
```

### CLI Example (using Anchor)
```bash
# Transfer with tax calculation
anchor run transfer-tokens \
  --provider.cluster devnet \
  -- \
  --amount 1000 \
  --recipient $RECIPIENT_ACCOUNT
```

## Tax Rate Summary

| Transfer Type | Tax Rate | Threshold | Example |
|--------------|----------|-----------|---------|
| P2P Transfer | 1% | Default | 1000 → 990 received |
| Exchange Deposit | 0.5% | Flagged | 10000 → 9950 received |
| Whale Transfer | 2% | >10M PANGI | 15M → 14.7M received |
| Conservation Reward | 0% | Flagged | 1000 → 1000 received |

## Troubleshooting

### Error: Account Not Found
```bash
# Token mint not deployed
# Solution: Deploy the program first
anchor deploy --provider.cluster devnet
anchor run initialize-token --provider.cluster devnet
```

### Error: Insufficient Balance
```bash
# Not enough SOL for transaction fees
# Solution: Request airdrop
solana airdrop 2

# Not enough tokens
# Solution: Mint more tokens
spl-token mint $TOKEN_MINT 10000 --url devnet
```

### Error: Invalid Account Owner
```bash
# Token account doesn't exist
# Solution: Create token account
spl-token create-account $TOKEN_MINT --url devnet
```

### Tax Not Applied
```bash
# Using standard SPL transfer instead of program
# Solution: Use the program's transfer_with_tax instruction
# Standard spl-token transfer bypasses custom logic
```

## Testing Checklist

- [ ] Devnet configured
- [ ] Wallet funded (>1 SOL)
- [ ] Token accounts created
- [ ] Tokens minted
- [ ] P2P transfer tested (1% tax)
- [ ] Exchange transfer tested (0.5% tax)
- [ ] Whale transfer tested (2% tax)
- [ ] Balances verified
- [ ] Conservation fund checked
- [ ] Transactions viewed on explorer

## Advanced Testing

### Test Conservation Fund Growth
```bash
# Perform multiple transfers
for i in {1..10}; do
  spl-token transfer $TOKEN_MINT 100 $RECIPIENT_ACCOUNT --url devnet
  sleep 2
done

# Check conservation fund balance
spl-token accounts $TOKEN_MINT --url devnet | grep -A 5 "conservation"
```

### Test Whale Threshold
```bash
# Just below threshold (9.99M)
spl-token transfer $TOKEN_MINT 9990000 $RECIPIENT_ACCOUNT --url devnet

# Just above threshold (10.01M)
spl-token transfer $TOKEN_MINT 10010000 $RECIPIENT_ACCOUNT --url devnet

# Compare tax amounts
```

### Load Testing
```bash
# Multiple concurrent transfers
for i in {1..50}; do
  spl-token transfer $TOKEN_MINT 10 $RECIPIENT_ACCOUNT --url devnet &
done
wait

# Check all succeeded
```

## Monitoring

### Watch Balances
```bash
# Continuous monitoring
watch -n 5 'spl-token balance $TOKEN_MINT --url devnet'
```

### Transaction History
```bash
# Get recent transactions
solana transaction-history $(solana address) --url devnet
```

### Program Logs
```bash
# View program logs
solana logs --url devnet | grep pangi
```

## Resources

- **Solana Explorer:** https://explorer.solana.com/?cluster=devnet
- **Devnet Faucet:** https://faucet.solana.com/
- **SPL Token Docs:** https://spl.solana.com/token
- **Anchor Docs:** https://www.anchor-lang.com/

## Next Steps

After successful devnet testing:

1. **Security Audit** - Review all program logic
2. **Load Testing** - Test with high transaction volume
3. **Frontend Integration** - Connect dApp to devnet
4. **User Testing** - Get feedback from test users
5. **Mainnet Preparation** - Final checklist before deployment

---

**Ready to test?** Run the automated setup:
```bash
./scripts/setup-token-accounts.sh
./scripts/test-token-transfer.sh 100
```
