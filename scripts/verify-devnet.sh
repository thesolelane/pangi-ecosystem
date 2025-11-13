#!/bin/bash
set -e

echo "🔍 Verifying Solana Devnet Setup..."
echo ""

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found"
    echo "📦 Installing Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    echo "✅ Solana CLI installed"
    echo ""
fi

# Verify Solana CLI
echo "📍 Solana CLI Version:"
solana --version
echo ""

# Check current config
echo "⚙️  Current Solana Config:"
solana config get
echo ""

# Set to devnet if not already
echo "🌐 Setting RPC URL to devnet..."
solana config set --url https://api.devnet.solana.com
echo ""

# Check balance
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance 2>&1 || echo "0 SOL")
echo "Balance: $BALANCE"
echo ""

# If balance is 0, request airdrop
if [[ "$BALANCE" == "0 SOL" ]] || [[ "$BALANCE" == *"Error"* ]]; then
    echo "💸 Requesting devnet airdrop (2 SOL)..."
    solana airdrop 2 || echo "⚠️  Airdrop failed (rate limit or network issue)"
    echo ""
    echo "💰 New balance:"
    solana balance
    echo ""
fi

# Check if spl-token is available
if command -v spl-token &> /dev/null; then
    echo "🪙 Checking PANGI token mint..."
    echo "Token Mint: 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be"
    spl-token account-info 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url https://api.devnet.solana.com 2>&1 || echo "⚠️  Token mint not found or not yet deployed"
    echo ""
else
    echo "⚠️  spl-token CLI not found (install with: cargo install spl-token-cli)"
    echo ""
fi

echo "✅ Devnet verification complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Deploy programs: anchor deploy --provider.cluster devnet"
echo "   2. Initialize token: anchor run initialize-token --provider.cluster devnet"
echo "   3. Run tests: npm test"
