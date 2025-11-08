# Wallet Setup Guide

This guide will help you set up a Solana wallet to interact with the PANGI ecosystem.

## Choosing a Wallet

PANGI supports two popular Solana wallets:

### Phantom (Recommended)
- ✅ User-friendly interface
- ✅ Mobile + Browser extension
- ✅ Built-in token swap
- ✅ NFT gallery
- 📥 [Download Phantom](https://phantom.app/)

### Solflare
- ✅ Advanced features
- ✅ Hardware wallet support
- ✅ Staking interface
- ✅ Multi-chain support
- 📥 [Download Solflare](https://solflare.com/)

## Installing Phantom (Step-by-Step)

### Desktop (Browser Extension)

1. **Download the Extension**
   - Visit [phantom.app](https://phantom.app/)
   - Click "Download"
   - Select your browser (Chrome, Firefox, Brave, Edge)
   - Click "Add to [Browser]"

2. **Create a New Wallet**
   - Click the Phantom icon in your browser toolbar
   - Click "Create New Wallet"
   - Set a strong password
   - Click "Continue"

3. **Save Your Recovery Phrase**
   ⚠️ **CRITICAL**: Write down your 12-word recovery phrase
   - Store it in a safe place (NOT on your computer)
   - Never share it with anyone
   - You'll need it to recover your wallet
   - Click "I saved my recovery phrase"

4. **Verify Your Recovery Phrase**
   - Select the words in the correct order
   - Click "Continue"
   - Your wallet is now created! 🎉

### Mobile (iOS/Android)

1. **Download the App**
   - iOS: [App Store](https://apps.apple.com/app/phantom-solana-wallet/id1598432977)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=app.phantom)

2. **Follow the same steps** as desktop to create your wallet

## Switching to Devnet

PANGI is currently on Solana Devnet for testing. Here's how to switch:

### Phantom

1. Open Phantom wallet
2. Click the **Settings** icon (⚙️) in the bottom-right
3. Scroll down to **"Developer Settings"**
4. Toggle **"Testnet Mode"** ON
5. Select **"Devnet"** from the network dropdown
6. Your wallet is now on Devnet! ✅

### Solflare

1. Open Solflare wallet
2. Click the **network selector** at the top (usually says "Mainnet")
3. Select **"Devnet"**
4. Confirm the switch
5. Your wallet is now on Devnet! ✅

## Getting Devnet SOL

You need SOL to pay for transactions on Solana. On Devnet, SOL is free!

### Method 1: Solana Faucet (Recommended)

1. Copy your wallet address:
   - Open Phantom/Solflare
   - Click your address at the top
   - Click "Copy Address"

2. Visit the faucet:
   - Go to [faucet.solana.com](https://faucet.solana.com/)
   - Paste your wallet address
   - Click "Confirm Airdrop"
   - Wait 10-30 seconds

3. Check your balance:
   - Open your wallet
   - You should see 1-2 SOL

### Method 2: Solana CLI

If you have the Solana CLI installed:

```bash
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

### Method 3: QuickNode Faucet

Alternative faucet with higher limits:
- Visit [faucet.quicknode.com/solana/devnet](https://faucet.quicknode.com/solana/devnet)
- Enter your wallet address
- Complete CAPTCHA
- Receive up to 5 SOL

## Connecting to PANGI dApp

1. **Visit the PANGI dApp**
   - Open your browser
   - Navigate to the PANGI dApp URL
   - Ensure you're on Devnet in your wallet

2. **Connect Your Wallet**
   - Click "Connect Wallet" button (top-right)
   - Select your wallet (Phantom/Solflare)
   - A popup will appear

3. **Approve the Connection**
   - Review the permissions
   - Click "Connect" or "Approve"
   - Your wallet is now connected! ✅

4. **Verify Connection**
   - You should see your wallet address displayed
   - Your SOL balance should be visible
   - The "Connect Wallet" button changes to your address

## Security Best Practices

### 🔒 Protect Your Recovery Phrase

- ✅ Write it down on paper
- ✅ Store in a safe or secure location
- ✅ Consider a metal backup for fire/water protection
- ❌ Never store digitally (no photos, no cloud storage)
- ❌ Never share with anyone (PANGI team will NEVER ask for it)
- ❌ Never enter it on any website

### 🛡️ Wallet Security

- ✅ Use a strong, unique password
- ✅ Enable biometric authentication (mobile)
- ✅ Keep your browser/app updated
- ✅ Only download from official sources
- ❌ Don't use public WiFi for transactions
- ❌ Don't install unknown browser extensions

### 🚨 Avoiding Scams

- ✅ Always verify URLs (bookmark the official dApp)
- ✅ Double-check transaction details before approving
- ✅ Be suspicious of unsolicited DMs
- ❌ Never click links in DMs
- ❌ Never share your screen during support calls
- ❌ Never approve transactions you don't understand

## Troubleshooting

### "Insufficient SOL for transaction"

**Solution**: Get more devnet SOL from the faucet
- You need ~0.01 SOL per transaction
- Request more from [faucet.solana.com](https://faucet.solana.com/)

### "Transaction failed"

**Possible causes**:
1. **Network congestion**: Wait 30 seconds and retry
2. **Wrong network**: Ensure you're on Devnet
3. **Insufficient SOL**: Get more from faucet
4. **Wallet locked**: Unlock your wallet and retry

### "Can't connect wallet"

**Solutions**:
1. Refresh the page
2. Disconnect and reconnect wallet
3. Clear browser cache
4. Try a different browser
5. Restart your browser/app

### "Balance not showing"

**Solutions**:
1. Wait 30 seconds for blockchain sync
2. Refresh the page
3. Check you're on the correct network (Devnet)
4. Verify transaction on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

## Advanced: Hardware Wallet Setup

For maximum security, use a hardware wallet:

### Supported Hardware Wallets
- Ledger Nano S/X
- Ledger Nano S Plus

### Setup with Solflare

1. Connect your Ledger device
2. Install Solana app on Ledger
3. Open Solflare
4. Click "Connect Hardware Wallet"
5. Follow on-screen instructions
6. Approve connection on Ledger device

**Note**: Phantom doesn't support hardware wallets directly. Use Solflare for hardware wallet integration.

## Multiple Wallets

You can use multiple wallets for different purposes:

### Hot Wallet (Daily Use)
- Browser extension (Phantom/Solflare)
- Small amounts for testing/transactions
- Quick and convenient

### Cold Wallet (Storage)
- Hardware wallet or paper wallet
- Large amounts for long-term holding
- Maximum security

## Exporting/Importing Wallets

### Export Private Key (Advanced)

⚠️ **Warning**: Only do this if you know what you're doing!

**Phantom**:
1. Settings → Security & Privacy
2. Export Private Key
3. Enter password
4. Copy and store securely

**Solflare**:
1. Settings → Export Wallet
2. Select export format
3. Enter password
4. Save file securely

### Import Existing Wallet

**Using Recovery Phrase**:
1. Open wallet app
2. Click "Import Wallet"
3. Enter your 12-word phrase
4. Set new password
5. Wallet restored! ✅

## Next Steps

Now that your wallet is set up:
- 📖 [Getting Started Guide](./getting-started.md) - Learn PANGI basics
- 🎮 [Staking Guide](./staking-guide.md) - Start earning rewards
- ❓ [FAQ](./faq.md) - Common questions

## Need Help?

- 💬 Discord: [Join our community](#)
- 📧 Email: support@pangi.io
- 📚 [Troubleshooting Guide](../deployment/troubleshooting.md)

---

**Security Reminder**: Never share your recovery phrase or private key with anyone, including the PANGI team!
