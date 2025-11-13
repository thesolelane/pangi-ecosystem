# PANGI Ecosystem - Scripts & Documentation

## 📜 Available Scripts

### Deployment Scripts

#### 1. Deployment Checklist
```bash
./scripts/deployment-checklist.sh
```
**What it does:**
- Checks all prerequisites
- Verifies configuration
- Validates project build
- Checks test status
- Verifies program deployment
- Reviews documentation
- Validates scripts

#### 2. Get Program IDs
```bash
./scripts/get-program-ids.sh
```
**What it does:**
- Reads program IDs from keypairs
- Displays all 4 program IDs
- Provides update instructions
- Shows example code

#### 3. Check Program Status
```bash
./scripts/check-program-status.sh
```
**What it does:**
- Checks if programs are deployed
- Shows program details
- Displays recent transactions
- Verifies token mint
- Provides deployment summary

### Testing Scripts

#### 4. Test Connection (Simple)
```bash
node scripts/test-connection.js
```
**What it does:**
- Connects to Solana devnet
- Verifies wallet setup
- Checks program deployment status
- Displays program information
- No complex IDL parsing required

**Note:** The full `test-real-transfer.js` script is currently blocked by an IDL format incompatibility. See `IDL_ISSUE.md` for details. Use the simple connection test instead.

#### 5. Verify Devnet Setup
```bash
./scripts/verify-devnet.sh
```
**What it does:**
- Checks Solana CLI installation
- Verifies devnet connection
- Checks wallet balance
- Requests airdrop if needed
- Verifies token mint existence

#### 5. Setup Token Accounts
```bash
./scripts/setup-token-accounts.sh
```
**What it does:**
- Creates recipient wallet
- Creates sender token account
- Creates recipient token account
- Funds accounts for rent
- Displays account information

#### 6. Test Token Transfer
```bash
./scripts/test-token-transfer.sh [AMOUNT]
```
**What it does:**
- Transfers PANGI tokens with tax
- Calculates expected tax (1% P2P)
- Verifies balances before/after
- Shows tax collected
- Provides explorer link

**Examples:**
```bash
./scripts/test-token-transfer.sh 100      # Transfer 100 PANGI
./scripts/test-token-transfer.sh 1000     # Transfer 1000 PANGI
./scripts/test-token-transfer.sh 15000000 # Whale transfer (2% tax)
```

## 📚 Documentation Files

### 1. QUICK_START.md
**Quick reference guide**
- Essential commands
- Test status
- Project structure
- Troubleshooting

### 2. TEST_SUMMARY.md
**Complete test documentation**
- 180 tests breakdown
- Test coverage by program
- Configuration details
- Success metrics

### 3. DEVNET_SETUP.md
**Devnet deployment guide**
- Solana CLI installation
- Configuration steps
- Program deployment
- Initialization procedures

### 4. DEVNET_TESTING.md
**Token transfer testing guide**
- Manual setup steps
- Transfer testing scenarios
- Tax rate verification
- Troubleshooting guide

## 🚀 Quick Workflow

### First Time Setup
```bash
# 1. Run deployment checklist
./scripts/deployment-checklist.sh

# 2. Run all tests
cd pangi-dapp
npm test && npm run test:esm

# 3. Build and deploy
anchor build
anchor deploy --provider.cluster devnet

# 4. Get and update program IDs
./scripts/get-program-ids.sh
# Update lib/constants.ts with the IDs

# 5. Verify deployment
./scripts/check-program-status.sh

# 6. Setup token accounts
./scripts/setup-token-accounts.sh

# 7. Test transfers
./scripts/test-token-transfer.sh 100
```

### Daily Development
```bash
# Run tests
npm test

# Test specific program
npm run test:token

# Start frontend
npm run dev

# Test on devnet
./scripts/test-token-transfer.sh 1000
```

## 📋 Script Locations

```
pangi-ecosystem/
├── scripts/
│   ├── deployment-checklist.sh    # Pre-deployment validation
│   ├── get-program-ids.sh         # Extract program IDs
│   ├── check-program-status.sh    # Verify deployment
│   ├── verify-devnet.sh           # Devnet verification
│   ├── setup-token-accounts.sh    # Account setup
│   └── test-token-transfer.sh     # Transfer testing
├── QUICK_START.md                 # Quick reference
├── TEST_SUMMARY.md                # Test documentation
├── DEVNET_SETUP.md                # Deployment guide
├── DEVNET_TESTING.md              # Testing guide
└── README_SCRIPTS.md              # This file
```

## 🎯 Common Tasks

### Check Test Status
```bash
cd pangi-dapp
npm test                    # 144 CommonJS tests
npm run test:esm            # 36 ESM tests
```

### Deploy to Devnet
```bash
anchor build
anchor deploy --provider.cluster devnet
```

### Setup Testing Environment
```bash
./scripts/verify-devnet.sh
./scripts/setup-token-accounts.sh
```

### Test Token Transfers
```bash
# P2P transfer (1% tax)
./scripts/test-token-transfer.sh 1000

# Whale transfer (2% tax)
./scripts/test-token-transfer.sh 15000000
```

### Check Balances
```bash
# Sender balance
spl-token balance 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet

# Recipient balance
spl-token balance 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --owner /tmp/pangi-recipient.json --url devnet
```

## 🔧 Troubleshooting

### Scripts Not Executable
```bash
chmod +x scripts/*.sh
```

### Solana CLI Not Found
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### SPL Token CLI Not Found
```bash
cargo install spl-token-cli
```

### Airdrop Rate Limit
```bash
# Wait a few minutes and try again
# Or use: https://faucet.solana.com/
```

## 📊 Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| CommonJS Tests | 144 | ✅ |
| ESM Tests | 36 | ✅ |
| Token Program | 41 | ✅ |
| NFT Program | 30 | ✅ |
| Vault Program | 10 | ✅ |
| Distribution Program | 11 | ✅ |
| Cross-Program | 12 | ✅ |
| SDK & Integration | 76 | ✅ |
| **Total** | **180** | ✅ |

## 🎓 Learning Path

1. **Start Here:** `QUICK_START.md`
2. **Run Tests:** `npm test`
3. **Setup Devnet:** `DEVNET_SETUP.md`
4. **Test Transfers:** `DEVNET_TESTING.md`
5. **Review Tests:** `TEST_SUMMARY.md`

## ✅ Pre-Deployment Checklist

- [ ] All 180 tests passing
- [ ] Devnet verified (`./scripts/verify-devnet.sh`)
- [ ] Token accounts setup (`./scripts/setup-token-accounts.sh`)
- [ ] Transfers tested (`./scripts/test-token-transfer.sh`)
- [ ] Programs deployed to devnet
- [ ] Frontend tested on devnet
- [ ] Documentation reviewed
- [ ] Security considerations addressed

---

**Ready to start?**
```bash
./scripts/verify-devnet.sh
cd pangi-dapp && npm test
```
