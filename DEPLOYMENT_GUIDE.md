# PANGI Ecosystem - Complete Deployment Guide

Step-by-step guide to deploy PANGI programs to Solana devnet.

## 📋 Pre-Deployment Checklist

Run the automated checklist:
```bash
./scripts/deployment-checklist.sh
```

This will verify:
- ✅ Prerequisites (Solana CLI, Anchor, Node.js)
- ✅ Configuration (devnet, wallet balance)
- ✅ Project build status
- ✅ Tests passing
- ✅ Documentation complete
- ✅ Scripts ready

## 🚀 Deployment Steps

### Step 1: Verify Environment

```bash
# Check Solana CLI
solana --version

# Check Anchor CLI
anchor --version

# Configure devnet
solana config set --url https://api.devnet.solana.com

# Check wallet balance
solana balance

# Request airdrop if needed
solana airdrop 2
```

### Step 2: Run Tests

```bash
cd pangi-dapp

# Run all CommonJS tests (144 tests)
npm test

# Run all ESM tests (36 tests)
npm run test:esm

# Test individual programs
npm run test:token
npm run test:nft
npm run test:vault
npm run test:distribution
```

**Expected:** All 180 tests passing ✅

### Step 3: Build Programs

```bash
# Return to root directory
cd ..

# Clean previous build
anchor clean

# Build all programs
anchor build
```

**Expected output:**
```
Building pangi-token...
Building pangi-nft...
Building pangi-vault...
Building special-distribution...
Build successful!
```

### Step 4: Get Program IDs

```bash
# Extract program IDs from keypairs
./scripts/get-program-ids.sh
```

**Example output:**
```
✅ PANGI Token Program
   Program ID: BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA

✅ PANGI NFT Program
   Program ID: etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE

✅ PANGI Vault Program
   Program ID: <YOUR_VAULT_PROGRAM_ID>

✅ Special Distribution Program
   Program ID: <YOUR_DISTRIBUTION_PROGRAM_ID>
```

### Step 5: Update Program IDs

Update `pangi-dapp/lib/constants.ts`:

```typescript
import { PublicKey } from '@solana/web3.js';

// Program IDs (update after deployment)
export const PANGI_TOKEN_PROGRAM_ID = new PublicKey('BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA');
export const PANGI_NFT_PROGRAM_ID = new PublicKey('etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE');
export const PANGI_VAULT_PROGRAM_ID = new PublicKey('YOUR_VAULT_PROGRAM_ID');
export const SPECIAL_DISTRIBUTION_PROGRAM_ID = new PublicKey('YOUR_DISTRIBUTION_PROGRAM_ID');

// Token mint address
export const PANGI_TOKEN_MINT = new PublicKey('6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be');
```

Also update `scripts/check-program-status.sh` with the new IDs.

### Step 6: Deploy to Devnet

```bash
# Deploy all programs
anchor deploy --provider.cluster devnet
```

**Expected output:**
```
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: <YOUR_WALLET>
Deploying program "pangi_token"...
Program Id: BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA

Deploying program "pangi_nft"...
Program Id: etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE

Deploying program "pangi_vault"...
Program Id: <VAULT_PROGRAM_ID>

Deploying program "special_distribution"...
Program Id: <DISTRIBUTION_PROGRAM_ID>

Deploy success!
```

**Note:** Deployment costs ~5-10 SOL. Ensure sufficient balance.

### Step 7: Verify Deployment

```bash
# Check all program statuses
./scripts/check-program-status.sh
```

**Expected:** All programs showing as deployed ✅

### Step 8: Initialize Programs

```bash
# Initialize token program with tax config
anchor run initialize-token --provider.cluster devnet

# Initialize distribution config
anchor run initialize-distribution --provider.cluster devnet
```

**Note:** You may need to create these scripts in `Anchor.toml`:

```toml
[scripts]
initialize-token = "ts-node scripts/initialize-token.ts"
initialize-distribution = "ts-node scripts/initialize-distribution.ts"
```

### Step 9: Setup Token Accounts

```bash
# Create token accounts for testing
./scripts/setup-token-accounts.sh
```

**Expected output:**
```
✅ Recipient wallet created
✅ Sender token account created
✅ Recipient token account created
```

### Step 10: Test Token Transfers

```bash
# Test P2P transfer (1% tax)
./scripts/test-token-transfer.sh 100

# Test larger transfer
./scripts/test-token-transfer.sh 1000

# Test whale transfer (2% tax)
./scripts/test-token-transfer.sh 15000000
```

**Expected:** Transfers succeed with correct tax applied ✅

## 🔍 Verification Commands

### Check Program Deployment
```bash
# Check specific program
solana program show BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA --url devnet

# Check all programs
./scripts/check-program-status.sh
```

### Check Token Mint
```bash
# Check if token mint exists
spl-token account-info 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet

# List all token accounts
spl-token accounts 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet
```

### Check Balances
```bash
# Sender balance
spl-token balance 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet

# Recipient balance
spl-token balance 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --owner /tmp/pangi-recipient.json --url devnet
```

### View on Explorer
```bash
# Program
https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet

# Transaction
https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet

# Token mint
https://explorer.solana.com/address/6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be?cluster=devnet
```

## 🧪 Testing Scenarios

### Scenario 1: P2P Transfer (1% Tax)
```bash
./scripts/test-token-transfer.sh 1000
```
**Expected:**
- Sender loses: 1000 PANGI
- Recipient receives: 990 PANGI
- Tax collected: 10 PANGI (1%)

### Scenario 2: Exchange Deposit (0.5% Tax)
Requires program call with exchange flag.

### Scenario 3: Whale Transfer (2% Tax)
```bash
./scripts/test-token-transfer.sh 15000000
```
**Expected:**
- Sender loses: 15,000,000 PANGI
- Recipient receives: 14,700,000 PANGI
- Tax collected: 300,000 PANGI (2%)

### Scenario 4: Conservation Reward (0% Tax)
Requires program call with reward flag.

## 🐛 Troubleshooting

### Error: Insufficient Balance
```bash
# Request more SOL
solana airdrop 2

# Check balance
solana balance
```

### Error: Program Not Found
```bash
# Verify deployment
solana program show <PROGRAM_ID> --url devnet

# Redeploy if needed
anchor deploy --provider.cluster devnet
```

### Error: Account Not Found
```bash
# Create token accounts
./scripts/setup-token-accounts.sh

# Or manually
spl-token create-account 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet
```

### Error: Transaction Failed
```bash
# Check recent transactions
solana transaction-history $(solana address) --url devnet

# View program logs
solana logs --url devnet | grep pangi
```

### Error: Airdrop Rate Limit
```bash
# Wait a few minutes
# Or use faucet: https://faucet.solana.com/
```

## 📊 Deployment Costs

Approximate SOL costs on devnet:

| Item | Cost |
|------|------|
| Token Program | ~2 SOL |
| NFT Program | ~2 SOL |
| Vault Program | ~2 SOL |
| Distribution Program | ~2 SOL |
| Token Mint | ~0.01 SOL |
| Token Accounts | ~0.002 SOL each |
| **Total** | **~8-10 SOL** |

**Note:** Devnet SOL is free via airdrops.

## ✅ Post-Deployment Checklist

- [ ] All programs deployed successfully
- [ ] Program IDs updated in constants.ts
- [ ] Token mint initialized
- [ ] Token accounts created
- [ ] Test transfers successful
- [ ] Tax calculations verified
- [ ] Conservation fund receiving tax
- [ ] Frontend connected to devnet
- [ ] Explorer links working
- [ ] Documentation updated

## 🎯 Next Steps

### 1. Frontend Integration
```bash
cd pangi-dapp
npm run dev
```
Connect wallet (set to devnet) and test:
- Token transfers
- NFT minting
- Vault operations
- Distribution claims

### 2. Load Testing
Test with multiple concurrent transactions:
```bash
for i in {1..50}; do
  ./scripts/test-token-transfer.sh 10 &
done
wait
```

### 3. User Testing
- Share devnet link with test users
- Collect feedback
- Fix issues
- Iterate

### 4. Security Review
- Review all program logic
- Check for vulnerabilities
- Test edge cases
- Audit smart contracts

### 5. Mainnet Preparation
- Final security audit
- Update program IDs for mainnet
- Prepare deployment plan
- Set up monitoring

## 📚 Resources

- **Solana Explorer:** https://explorer.solana.com/?cluster=devnet
- **Devnet Faucet:** https://faucet.solana.com/
- **Anchor Docs:** https://www.anchor-lang.com/
- **SPL Token:** https://spl.solana.com/token
- **Solana Cookbook:** https://solanacookbook.com/

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review `DEVNET_TESTING.md` for detailed testing guide
3. Run `./scripts/deployment-checklist.sh` to verify setup
4. Check Solana Explorer for transaction details
5. Review program logs: `solana logs --url devnet`

---

**Ready to deploy?**
```bash
./scripts/deployment-checklist.sh
anchor build
anchor deploy --provider.cluster devnet
./scripts/check-program-status.sh
```

🎉 **Good luck with your deployment!**
