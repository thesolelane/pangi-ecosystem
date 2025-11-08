# Frontend Integration Guide

Complete guide to integrating PANGI into your frontend application.

## Quick Start

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/thesolelane/pangi-ecosystem.git
cd pangi-ecosystem/pangi-dapp

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your settings
```

### Local Development

```bash
# Terminal 1: Start local validator
solana-test-validator --reset

# Terminal 2: Build and deploy programs
cd ..
anchor build
anchor deploy

# Terminal 3: Start frontend
cd pangi-dapp
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Devnet Deployment

```bash
# Deploy programs to devnet
anchor deploy --provider.cluster devnet

# Build frontend for devnet
NEXT_PUBLIC_CLUSTER=devnet npm run build

# Start production server
npm start
```

---

## Project Structure

```
pangi-dapp/
├── app/                      # Next.js app router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── Header.tsx           # Navigation & wallet button
│   ├── WalletProvider.tsx   # Wallet adapter setup
│   ├── WalletInfo.tsx       # Wallet connection display
│   ├── TokenBalance.tsx     # Token balance display
│   ├── ProgramInfo.tsx      # Program information
│   ├── NFTCard.tsx          # NFT display card
│   ├── StakeInterface.tsx   # Staking UI
│   └── GovernancePanel.tsx  # Governance UI
├── lib/                     # Utilities and helpers
│   ├── constants.ts         # Program IDs, addresses
│   ├── theme.ts             # Design tokens
│   ├── hooks/               # Custom React hooks
│   │   ├── useProgram.ts
│   │   ├── useTokenBalance.ts
│   │   ├── useStaking.ts
│   │   └── useNFT.ts
│   └── utils/               # Helper functions
│       ├── pda.ts
│       ├── transactions.ts
│       └── formatting.ts
├── public/                  # Static assets
│   ├── pangi-token-logo.png
│   └── pangi-vault-logo.png
├── .env.local              # Environment variables
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript configuration
```

---

## Installation

### Dependencies

```bash
# Core dependencies
npm install @solana/web3.js @solana/wallet-adapter-react
npm install @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
npm install @coral-xyz/anchor @solana/spl-token

# UI dependencies
npm install next react react-dom
npm install tailwindcss postcss autoprefixer

# Development dependencies
npm install -D typescript @types/react @types/node
npm install -D eslint eslint-config-next
```

### Package.json

```json
{
  "name": "pangi-dapp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@coral-xyz/anchor": "^0.32.1",
    "@solana/spl-token": "^0.4.14",
    "@solana/wallet-adapter-base": "^0.9.27",
    "@solana/wallet-adapter-react": "^0.15.39",
    "@solana/wallet-adapter-react-ui": "^0.9.39",
    "@solana/wallet-adapter-wallets": "^0.19.37",
    "@solana/web3.js": "^1.98.4",
    "next": "16.0.1",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.0.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## Configuration

### Environment Variables

Create `.env.local`:

```bash
# Network Configuration
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com

# Program IDs (Devnet)
NEXT_PUBLIC_TOKEN_PROGRAM_ID=BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
NEXT_PUBLIC_NFT_PROGRAM_ID=etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE
NEXT_PUBLIC_VAULT_PROGRAM_ID=5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2
NEXT_PUBLIC_DISTRIBUTION_PROGRAM_ID=bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq

# Token Mint
NEXT_PUBLIC_TOKEN_MINT=6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Constants File

`lib/constants.ts`:

```typescript
import { PublicKey } from "@solana/web3.js";

// Network
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "devnet";
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com";

// Program IDs
export const PANGI_TOKEN_PROGRAM_ID_STR = process.env.NEXT_PUBLIC_TOKEN_PROGRAM_ID!;
export const PANGI_VAULT_PROGRAM_ID_STR = process.env.NEXT_PUBLIC_VAULT_PROGRAM_ID!;
export const PANGI_NFT_PROGRAM_ID_STR = process.env.NEXT_PUBLIC_NFT_PROGRAM_ID!;
export const SPECIAL_DISTRIBUTION_PROGRAM_ID_STR = process.env.NEXT_PUBLIC_DISTRIBUTION_PROGRAM_ID!;
export const PANGI_TOKEN_MINT_STR = process.env.NEXT_PUBLIC_TOKEN_MINT!;

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

### Next.js Configuration

`next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Webpack configuration for Solana
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      os: false,
      path: false,
      crypto: false,
    };
    return config;
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NEXT_PUBLIC_RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT,
  },

  // Image optimization
  images: {
    domains: ['arweave.net', 'ipfs.io'],
  },
};

export default nextConfig;
```

---

## Wallet Integration

### Wallet Provider Setup

`components/WalletProvider.tsx`:

```typescript
"use client";

import { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { RPC_ENDPOINT } from "@/lib/constants";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
```

### Root Layout

`app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { WalletContextProvider } from "@/components/WalletProvider";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "PANGI - Solana Token Ecosystem",
  description: "Dynamic NFT evolution and token distribution on Solana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <WalletContextProvider>
          <Header />
          <main className="container mx-auto px-6">
            {children}
          </main>
        </WalletContextProvider>
      </body>
    </html>
  );
}
```

### Header Component

`components/Header.tsx`:

```typescript
"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/pangi-token-logo.png" 
              alt="PANGI Logo" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-bold">PANGI</h1>
          </div>
          {mounted && <WalletMultiButton />}
        </div>
      </div>
    </header>
  );
}
```

---

## Custom Hooks

### useProgram Hook

`lib/hooks/useProgram.ts`:

```typescript
import { useMemo } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export function useProgram(programId: PublicKey, idl: any) {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: "confirmed" }
    );

    return new Program(idl, programId, provider);
  }, [connection, wallet, programId, idl]);

  return program;
}
```

### useTokenBalance Hook

`lib/hooks/useTokenBalance.ts`:

```typescript
import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

export function useTokenBalance(mint: PublicKey) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      return;
    }

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const tokenAccount = await getAssociatedTokenAddress(mint, publicKey);
        const account = await getAccount(connection, tokenAccount);
        setBalance(Number(account.amount) / 1e9);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [connection, publicKey, mint]);

  return { balance, loading };
}
```

### useStaking Hook

`lib/hooks/useStaking.ts`:

```typescript
import { useState, useCallback } from "react";
import { useProgram } from "./useProgram";
import { PublicKey } from "@solana/web3.js";
import { PANGI_VAULT_PROGRAM_ID } from "@/lib/constants";
import VaultIDL from "@/lib/idl/pangi_vault.json";

export function useStaking() {
  const program = useProgram(PANGI_VAULT_PROGRAM_ID(), VaultIDL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stakeNFT = useCallback(
    async (vault: PublicKey, nftMint: PublicKey) => {
      if (!program) throw new Error("Program not initialized");

      setLoading(true);
      setError(null);

      try {
        // Implementation from API reference
        const tx = await program.methods
          .stakeNft()
          .accounts({
            // ... accounts
          })
          .rpc();

        return tx;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [program]
  );

  const unstakeNFT = useCallback(
    async (vault: PublicKey, nftMint: PublicKey) => {
      if (!program) throw new Error("Program not initialized");

      setLoading(true);
      setError(null);

      try {
        const tx = await program.methods
          .unstakeNft()
          .accounts({
            // ... accounts
          })
          .rpc();

        return tx;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [program]
  );

  const claimRewards = useCallback(
    async (vault: PublicKey, nftMint: PublicKey) => {
      if (!program) throw new Error("Program not initialized");

      setLoading(true);
      setError(null);

      try {
        const tx = await program.methods
          .claimRewards()
          .accounts({
            // ... accounts
          })
          .rpc();

        return tx;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [program]
  );

  return {
    stakeNFT,
    unstakeNFT,
    claimRewards,
    loading,
    error,
  };
}
```

---

## Component Examples

### Token Balance Component

`components/TokenBalance.tsx`:

```typescript
"use client";

import { useTokenBalance } from "@/lib/hooks/useTokenBalance";
import { PANGI_TOKEN_MINT } from "@/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";

export default function TokenBalance() {
  const { publicKey } = useWallet();
  const { balance, loading } = useTokenBalance(PANGI_TOKEN_MINT());

  if (!publicKey) {
    return (
      <div className="card">
        <p>Connect wallet to view balance</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">PANGI Balance</h3>
      {loading ? (
        <p className="text-2xl animate-pulse">Loading...</p>
      ) : (
        <p className="text-3xl font-bold">{balance.toLocaleString()} PANGI</p>
      )}
    </div>
  );
}
```

### Staking Interface Component

`components/StakeInterface.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useStaking } from "@/lib/hooks/useStaking";
import { PublicKey } from "@solana/web3.js";

export default function StakeInterface({ 
  vault, 
  nftMint 
}: { 
  vault: PublicKey; 
  nftMint: PublicKey;
}) {
  const { stakeNFT, unstakeNFT, claimRewards, loading, error } = useStaking();
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const handleStake = async () => {
    try {
      const signature = await stakeNFT(vault, nftMint);
      setTxSignature(signature);
      alert("NFT staked successfully!");
    } catch (err) {
      console.error("Stake failed:", err);
    }
  };

  const handleUnstake = async () => {
    try {
      const signature = await unstakeNFT(vault, nftMint);
      setTxSignature(signature);
      alert("NFT unstaked successfully!");
    } catch (err) {
      console.error("Unstake failed:", err);
    }
  };

  const handleClaim = async () => {
    try {
      const signature = await claimRewards(vault, nftMint);
      setTxSignature(signature);
      alert("Rewards claimed successfully!");
    } catch (err) {
      console.error("Claim failed:", err);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Staking Actions</h3>
      
      <div className="flex gap-2">
        <button 
          onClick={handleStake} 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Processing..." : "Stake NFT"}
        </button>
        
        <button 
          onClick={handleUnstake} 
          disabled={loading}
          className="btn btn-secondary"
        >
          Unstake NFT
        </button>
        
        <button 
          onClick={handleClaim} 
          disabled={loading}
          className="btn btn-accent"
        >
          Claim Rewards
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {txSignature && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          <a 
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View transaction
          </a>
        </div>
      )}
    </div>
  );
}
```

---

## Styling

### Global Styles

`app/globals.css`:

```css
@import "@solana/wallet-adapter-react-ui/styles.css";
@import "tailwindcss";

:root {
  --bg: #0B0D10;
  --surface: #13161B;
  --border: #2A313B;
  --text: #E6E8EB;
  --purple: #9945FF;
}

body {
  background: var(--bg);
  color: var(--text);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.35);
}

.btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--purple);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## Testing

### Jest Configuration

`jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
};
```

### Example Test

`__tests__/TokenBalance.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import TokenBalance from '@/components/TokenBalance';

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: null,
  }),
}));

describe('TokenBalance', () => {
  it('shows connect message when wallet not connected', () => {
    render(<TokenBalance />);
    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
  });
});
```

---

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Environment Variables on Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all `NEXT_PUBLIC_*` variables

### Build Command

```bash
npm run build
```

### Output Directory

```
.next
```

---

## Best Practices

### Performance

- Use `useMemo` for expensive calculations
- Implement pagination for large lists
- Lazy load components
- Optimize images with Next.js Image
- Use React.memo for pure components

### Security

- Never expose private keys
- Validate all user inputs
- Use environment variables
- Implement rate limiting
- Add CSRF protection

### UX

- Show loading states
- Display error messages
- Confirm transactions
- Provide transaction links
- Implement retry logic

---

## Troubleshooting

### Wallet Not Connecting

```typescript
// Add error handling
try {
  await wallet.connect();
} catch (error) {
  console.error('Connection failed:', error);
  // Show user-friendly message
}
```

### Transaction Failures

```typescript
// Retry logic
async function sendWithRetry(tx, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await connection.sendTransaction(tx);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## Next Steps

- 📖 [API Reference](./api-reference.md) - Complete SDK documentation
- 🧪 [Testing Guide](./testing.md) - Write comprehensive tests
- 🏗️ [Architecture](./architecture.md) - Understand the system

---

**Questions?** Join our [Discord](#) or email dev@pangi.io
