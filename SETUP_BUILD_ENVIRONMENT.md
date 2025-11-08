# Setup Build Environment for PANGI Programs

**Goal:** Install Rust and Anchor to build your Solana programs

---

## ✅ What You Already Have

- ✅ Node.js v20.19.5
- ✅ npm v11.6.2
- ✅ Solana CLI v1.18.22
- ✅ All source code backed up

---

## 🔧 What You Need to Install

### 1. Install Rust

```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Load Rust environment
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version
```

**Expected output:**
```
rustc 1.75.0 (or newer)
cargo 1.75.0 (or newer)
```

### 2. Install Anchor CLI

```bash
# Install Anchor Version Manager (AVM)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install Anchor 0.32.1 (matches your project)
avm install 0.32.1

# Use Anchor 0.32.1
avm use 0.32.1

# Verify installation
anchor --version
```

**Expected output:**
```
anchor-cli 0.32.1
```

### 3. Install Additional Dependencies

```bash
# Install build essentials (if not already installed)
sudo apt-get update
sudo apt-get install -y build-essential pkg-config libssl-dev libudev-dev

# Install Solana BPF toolchain
solana-install init
```

---

## 🚀 Build Your Programs

### Step 1: Verify Setup

```bash
cd /workspaces/pangi-ecosystem

# Check all tools are installed
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "Rust: $(rustc --version)"
echo "Cargo: $(cargo --version)"
echo "Anchor: $(anchor --version)"
echo "Solana: $(solana --version)"
```

### Step 2: Build Programs

```bash
# Build all 4 programs
anchor build
```

**What this does:**
- Compiles all Rust programs
- Generates program binaries (.so files)
- Creates IDL files
- Validates program structure

**Expected output:**
```
Compiling pangi-token v0.1.0
Compiling pangi-nft v0.1.0
Compiling pangi-vault v0.1.0
Compiling special-distribution v0.1.0
    Finished release [optimized] target(s) in X.XXs
```

### Step 3: Check Generated Files

```bash
# Check compiled programs
ls -lh target/deploy/

# Check generated IDLs
ls -lh target/idl/

# Check program sizes
du -h target/deploy/*.so
```

**Expected files:**
```
target/deploy/pangi_token.so
target/deploy/pangi_nft.so
target/deploy/pangi_vault.so
target/deploy/special_distribution.so

target/idl/pangi_token.json
target/idl/pangi_nft.json
target/idl/pangi_vault.json
target/idl/special_distribution.json
```

---

## 🧪 Test Programs Locally

### Step 1: Run Unit Tests

```bash
# Run all tests
anchor test

# Or test individual programs
anchor test --skip-local-validator -- --test-threads=1
```

### Step 2: Start Local Validator

```bash
# Start local Solana validator
solana-test-validator

# In another terminal, deploy locally
anchor deploy --provider.cluster localnet
```

---

## 🌐 Deploy to Devnet

### Step 1: Configure for Devnet

```bash
# Set cluster to devnet
solana config set --url https://api.devnet.solana.com

# Check your wallet
solana address

# Check balance
solana balance

# Request airdrop if needed
solana airdrop 2
```

### Step 2: Deploy Programs

```bash
# Deploy all programs to devnet
anchor deploy --provider.cluster devnet
```

**This will:**
- Deploy all 4 programs
- Generate NEW program IDs
- Output deployment results

**Save the new program IDs!**

### Step 3: Update Frontend

After deployment, update `pangi-dapp/lib/constants.ts`:

```typescript
// OLD IDs (current devnet deployment)
export const PANGI_TOKEN_PROGRAM_ID_STR = "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA";

// NEW IDs (after redeployment)
export const PANGI_TOKEN_PROGRAM_ID_STR = "YOUR_NEW_PROGRAM_ID_HERE";
```

---

## 🔍 Verify Deployment

### Check Programs on Devnet

```bash
# Check token program
solana program show <TOKEN_PROGRAM_ID> --url devnet

# Check all programs
for id in <TOKEN_ID> <VAULT_ID> <NFT_ID> <DISTRIBUTION_ID>; do
  echo "Checking $id"
  solana program show $id --url devnet
done
```

### Initialize Tax Configuration

```bash
# Create initialization script
node scripts/initialize-programs.js
```

---

## 📊 Build Troubleshooting

### Issue: "anchor: command not found"

**Solution:**
```bash
# Reload shell environment
source $HOME/.cargo/env

# Or restart terminal
```

### Issue: "cargo: command not found"

**Solution:**
```bash
# Install Rust first
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env
```

### Issue: Compilation errors

**Solution:**
```bash
# Clean build
anchor clean

# Update dependencies
cargo update

# Rebuild
anchor build
```

### Issue: "error: linker `cc` not found"

**Solution:**
```bash
# Install build tools
sudo apt-get update
sudo apt-get install -y build-essential
```

### Issue: Out of memory during build

**Solution:**
```bash
# Build with less parallelism
cargo build --release --jobs 1
```

---

## 📝 Build Checklist

Before deploying to devnet:

- [ ] Rust installed and working
- [ ] Anchor CLI installed (v0.32.1)
- [ ] All programs compile without errors
- [ ] Generated IDLs look correct
- [ ] Program sizes are reasonable (<200KB each)
- [ ] Local tests pass
- [ ] Wallet has sufficient SOL for deployment (~5 SOL)

Before deploying to mainnet:

- [ ] All devnet testing completed
- [ ] Security audit completed
- [ ] Community testing done
- [ ] Documentation updated
- [ ] Monitoring setup ready
- [ ] Support channels prepared

---

## 🎯 Quick Start Commands

```bash
# Complete setup in one go
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
source $HOME/.cargo/env && \
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force && \
avm install 0.32.1 && \
avm use 0.32.1 && \
anchor --version

# Build and deploy to devnet
cd /workspaces/pangi-ecosystem && \
anchor build && \
solana config set --url https://api.devnet.solana.com && \
anchor deploy --provider.cluster devnet
```

---

## 📚 Resources

- **Anchor Book:** https://book.anchor-lang.com/
- **Solana Cookbook:** https://solanacookbook.com/
- **Rust Book:** https://doc.rust-lang.org/book/
- **Anchor Examples:** https://github.com/coral-xyz/anchor/tree/master/tests

---

## 🎉 Next Steps After Build

Once your programs build successfully:

1. **Test locally** - Run `anchor test`
2. **Deploy to devnet** - Get new program IDs
3. **Update frontend** - Use new program IDs
4. **Initialize configs** - Set up tax rates, etc.
5. **Test with frontend** - End-to-end testing
6. **Document changes** - Update all docs with new IDs

---

**Ready to start?** Run the Rust installation command first!

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
```
