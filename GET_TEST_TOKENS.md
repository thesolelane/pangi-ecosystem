# Get Test Tokens for PANGI Testing

**Your Wallet:** Connected ✅  
**Current Balance:** 0.0000 SOL  
**Network:** Devnet

---

## 🪙 **Step 1: Get Devnet SOL (Free)**

### **Option A: Solana Faucet (Easiest)**

1. **Copy your wallet address** from the UI (use the Copy button)

2. **Visit Solana Faucet:**
   - Go to: https://faucet.solana.com/
   - Paste your wallet address
   - Click "Request Airdrop"
   - You'll get 1-2 SOL instantly

### **Option B: Command Line**

```bash
# Get your wallet address from the UI, then run:
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet

# Example:
# solana airdrop 2 ApeKj1SVofC3Ur2SD2BMZhmoxw8FuRMdXDcMZJSRgyD3 --url devnet
```

### **Option C: QuickNode Faucet**

1. Go to: https://faucet.quicknode.com/solana/devnet
2. Paste your wallet address
3. Complete CAPTCHA
4. Get 0.5 SOL

---

## 🦎 **Step 2: Get Test PANGI Tokens**

Once you have SOL, you need PANGI tokens to test:

### **Current Token Mint:**
```
6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be
```

### **Option A: Mint to Your Wallet (If You Have Mint Authority)**

```bash
# Check if you have mint authority
spl-token supply 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet

# If you have authority, mint tokens:
spl-token mint 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be 1000 YOUR_WALLET_ADDRESS --url devnet
```

### **Option B: Create Token Account First**

```bash
# Create your PANGI token account
spl-token create-account 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet

# Then mint tokens (if you have authority)
spl-token mint 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be 1000 --url devnet
```

### **Option C: Transfer from Existing Wallet**

If you have another wallet with PANGI tokens:

```bash
spl-token transfer 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be 100 YOUR_NEW_WALLET_ADDRESS --url devnet
```

---

## 🔍 **Verify Your Balances**

### **Check SOL Balance:**
```bash
solana balance YOUR_WALLET_ADDRESS --url devnet
```

### **Check PANGI Balance:**
```bash
spl-token balance 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet
```

### **Or Just Refresh the Frontend!**
The UI updates every 10 seconds automatically.

---

## 🎯 **What You'll See After Getting Tokens:**

**Wallet Info Card:**
```
SOL Balance
2.0000 SOL  ← Should show your SOL
```

**PANGI Balance Card:**
```
PANGI Balance
1,000 PANGI  ← Should show your PANGI tokens
```

---

## 🧪 **Testing Checklist**

Once you have tokens:

### **Basic Tests:**
- [ ] Connect wallet ✅ (Done!)
- [ ] Get devnet SOL
- [ ] Get PANGI tokens
- [ ] See balance update in UI
- [ ] Copy wallet address
- [ ] Disconnect wallet
- [ ] Reconnect wallet

### **Advanced Tests (Coming Soon):**
- [ ] Transfer PANGI tokens (with tax)
- [ ] Mint NFT
- [ ] Evolve NFT
- [ ] Stake in vault
- [ ] Claim rewards
- [ ] Check distribution

---

## 🚨 **Troubleshooting**

### **"Airdrop failed" or "Rate limit exceeded"**

**Solution:** Faucets have rate limits. Try:
1. Wait 1-2 hours
2. Try different faucet (QuickNode, Solana official)
3. Use a different wallet temporarily

### **"Token account not found"**

**Solution:** Create token account first:
```bash
spl-token create-account 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet
```

### **"Insufficient funds"**

**Solution:** You need SOL for transaction fees:
- Minimum: 0.01 SOL per transaction
- Recommended: 1-2 SOL for testing

### **Balance not updating in UI**

**Solution:**
1. Wait 10 seconds (auto-refresh)
2. Manually refresh browser
3. Disconnect and reconnect wallet
4. Check browser console for errors (F12)

---

## 💡 **Quick Start Commands**

```bash
# 1. Get your wallet address from UI (copy button)

# 2. Get SOL
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet

# 3. Create PANGI token account
spl-token create-account 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet

# 4. Mint PANGI tokens (if you have authority)
spl-token mint 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be 1000 --url devnet

# 5. Check balances
solana balance YOUR_WALLET_ADDRESS --url devnet
spl-token balance 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet
```

---

## 📞 **Need Help?**

If you're stuck:

1. **Check the browser console** (F12 → Console tab)
2. **Check Solana Explorer:**
   - Go to: https://explorer.solana.com/?cluster=devnet
   - Paste your wallet address
   - See all transactions and balances

3. **Common Issues:**
   - No SOL = Can't do anything (get SOL first!)
   - No token account = Create it first
   - Wrong network = Make sure Phantom is on Devnet

---

## 🎉 **You're Ready!**

Once you have:
- ✅ SOL balance (for fees)
- ✅ PANGI tokens (for testing)

You can start testing all the features! 🚀

**Next:** Try transferring PANGI tokens to test the tax system!
