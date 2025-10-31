# PANGI dApp - Frontend

Solana-based token ecosystem with dynamic NFT evolution and distribution system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
```

## 📦 Deployment to Netlify

### Option 1: Netlify UI (Recommended)

1. **Go to Netlify**
   - Visit [https://app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"

2. **Connect Repository**
   - Choose your Git provider (GitHub, GitLab, etc.)
   - Select the `pangi-ecosystem` repository
   - Set base directory to `pangi-dapp`

3. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `out`
   - Click "Deploy site"

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy from pangi-dapp directory
cd pangi-dapp
netlify deploy --prod
```

### Option 3: Drag & Drop

```bash
# Build locally
npm run build

# Drag the 'out' folder to Netlify's deploy page
# https://app.netlify.com/drop
```

## 🔧 Build Configuration

The app is configured for static export in `next.config.ts`:

```typescript
{
  output: "export",  // Static HTML export
  images: {
    unoptimized: true  // Required for static export
  }
}
```

Build settings in `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "20"
```

## 🌐 Features

- ✅ Wallet connection (Phantom, Solflare)
- ✅ Real-time PANGI token balance
- ✅ Program information dashboard
- ✅ Links to Solana Explorer
- ✅ Responsive design (mobile-friendly)
- ✅ Static export (no server required)

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Blockchain:** Solana Web3.js
- **Wallet:** Solana Wallet Adapter

## 📝 Configuration

All program IDs and network settings are in `lib/constants.ts`:

```typescript
// Network
export const NETWORK = "devnet";
export const RPC_ENDPOINT = "https://api.devnet.solana.com";

// Program IDs (Devnet)
PANGI_TOKEN_PROGRAM_ID: BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
PANGI_VAULT_PROGRAM_ID: 5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2
PANGI_NFT_PROGRAM_ID: etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE
SPECIAL_DISTRIBUTION_PROGRAM_ID: bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq

// Token Mint
PANGI_TOKEN_MINT: 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be
```

## 🐛 Troubleshooting

### "Not working" on Netlify

If the site deploys but doesn't work:

1. **Check Build Logs**
   - Go to Netlify dashboard → Deploys → Click on latest deploy
   - Look for errors in build logs

2. **Common Issues:**
   - **Blank page:** Check browser console for errors
   - **Wallet not connecting:** Ensure wallet extension is installed
   - **Balance not showing:** Verify you're on devnet and have PANGI tokens

3. **Browser Console**
   - Open DevTools (F12)
   - Check Console tab for JavaScript errors
   - Check Network tab for failed requests

### Build Errors

```bash
# Clear everything and rebuild
rm -rf .next out node_modules package-lock.json
npm install
npm run build
```

### Wallet Issues

- Install Phantom or Solflare wallet extension
- Switch wallet to Devnet network
- Refresh the page after connecting wallet

## 📊 What You Should See

After deployment, the site should show:

1. **Header** - PANGI logo and "Select Wallet" button
2. **Welcome Section** - Title and description
3. **Token Balance** - "Connect wallet to view balance" (until wallet connected)
4. **Program Info** - 4 deployed programs with Explorer links
5. **Features** - 4 feature cards describing the ecosystem

## 🔗 Links

- **Network:** Solana Devnet
- **Explorer:** [https://explorer.solana.com/?cluster=devnet](https://explorer.solana.com/?cluster=devnet)
- **Token Mint:** `6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be`

## 📞 Support

If deployment fails, check:
1. Build logs in Netlify dashboard
2. Browser console for client-side errors
3. Ensure Node version is 20 or higher
4. Verify all dependencies installed correctly

## 📄 License

See parent repository for license information.
