#!/bin/bash
set -e

echo "🪙 PANGI Token Account Setup"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Token mint address
TOKEN_MINT="6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be"

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found${NC}"
    echo "Install with: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
fi

# Check if spl-token is installed
if ! command -v spl-token &> /dev/null; then
    echo -e "${RED}❌ spl-token CLI not found${NC}"
    echo "Install with: cargo install spl-token-cli"
    exit 1
fi

echo "✅ CLI tools found"
echo ""

# Set to devnet
echo "🌐 Setting RPC to devnet..."
solana config set --url https://api.devnet.solana.com
echo ""

# Check balance
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance 2>&1 || echo "0 SOL")
echo "Current balance: $BALANCE"

if [[ "$BALANCE" == "0 SOL" ]] || [[ "$BALANCE" == *"Error"* ]]; then
    echo -e "${YELLOW}⚠️  Low balance, requesting airdrop...${NC}"
    solana airdrop 2 || echo -e "${YELLOW}⚠️  Airdrop failed (rate limit)${NC}"
    sleep 2
    BALANCE=$(solana balance)
    echo "New balance: $BALANCE"
fi
echo ""

# Get sender wallet address
SENDER=$(solana address)
echo "📍 Sender wallet: $SENDER"
echo ""

# Create recipient wallet
echo "👤 Creating recipient wallet..."
RECIPIENT_KEYPAIR="/tmp/pangi-recipient.json"
if [ -f "$RECIPIENT_KEYPAIR" ]; then
    echo -e "${YELLOW}⚠️  Recipient wallet already exists${NC}"
    RECIPIENT=$(solana-keygen pubkey $RECIPIENT_KEYPAIR)
else
    solana-keygen new --outfile $RECIPIENT_KEYPAIR --no-passphrase --force
    RECIPIENT=$(solana-keygen pubkey $RECIPIENT_KEYPAIR)
    echo -e "${GREEN}✅ Recipient wallet created${NC}"
fi
echo "📍 Recipient address: $RECIPIENT"
echo ""

# Airdrop to recipient for rent
echo "💸 Airdropping SOL to recipient for rent..."
solana transfer $RECIPIENT 0.1 --allow-unfunded-recipient || echo -e "${YELLOW}⚠️  Transfer failed${NC}"
sleep 2
echo ""

# Check if token mint exists
echo "🔍 Checking token mint..."
TOKEN_INFO=$(spl-token account-info $TOKEN_MINT --url devnet 2>&1 || echo "NOT_FOUND")

if [[ "$TOKEN_INFO" == *"NOT_FOUND"* ]] || [[ "$TOKEN_INFO" == *"Error"* ]]; then
    echo -e "${RED}❌ Token mint not found on devnet${NC}"
    echo "Token mint: $TOKEN_MINT"
    echo ""
    echo "Deploy the token program first:"
    echo "  anchor deploy --provider.cluster devnet"
    echo "  anchor run initialize-token --provider.cluster devnet"
    exit 1
fi

echo -e "${GREEN}✅ Token mint found${NC}"
echo ""

# Create sender token account
echo "🏦 Creating sender token account..."
SENDER_TOKEN_ACCOUNT=$(spl-token create-account $TOKEN_MINT --url devnet 2>&1 || echo "EXISTS")

if [[ "$SENDER_TOKEN_ACCOUNT" == *"EXISTS"* ]] || [[ "$SENDER_TOKEN_ACCOUNT" == *"Error"* ]]; then
    echo -e "${YELLOW}⚠️  Sender token account already exists${NC}"
    SENDER_TOKEN_ACCOUNT=$(spl-token accounts $TOKEN_MINT --url devnet | grep -oP '(?<=Account: )[A-Za-z0-9]+' | head -1)
else
    echo -e "${GREEN}✅ Sender token account created${NC}"
fi
echo "📍 Sender token account: $SENDER_TOKEN_ACCOUNT"
echo ""

# Create recipient token account
echo "🏦 Creating recipient token account..."
RECIPIENT_TOKEN_ACCOUNT=$(spl-token create-account $TOKEN_MINT --owner $RECIPIENT_KEYPAIR --url devnet 2>&1 || echo "EXISTS")

if [[ "$RECIPIENT_TOKEN_ACCOUNT" == *"EXISTS"* ]] || [[ "$RECIPIENT_TOKEN_ACCOUNT" == *"Error"* ]]; then
    echo -e "${YELLOW}⚠️  Recipient token account already exists${NC}"
    RECIPIENT_TOKEN_ACCOUNT=$(spl-token accounts $TOKEN_MINT --owner $RECIPIENT_KEYPAIR --url devnet | grep -oP '(?<=Account: )[A-Za-z0-9]+' | head -1)
else
    echo -e "${GREEN}✅ Recipient token account created${NC}"
fi
echo "📍 Recipient token account: $RECIPIENT_TOKEN_ACCOUNT"
echo ""

# Check token balances
echo "💰 Checking token balances..."
echo "Sender balance:"
spl-token balance $TOKEN_MINT --url devnet || echo "  0 PANGI"
echo ""
echo "Recipient balance:"
spl-token balance $TOKEN_MINT --owner $RECIPIENT_KEYPAIR --url devnet || echo "  0 PANGI"
echo ""

# Summary
echo "=============================="
echo "✅ Setup Complete!"
echo "=============================="
echo ""
echo "📋 Account Information:"
echo "  Token Mint:              $TOKEN_MINT"
echo "  Sender Wallet:           $SENDER"
echo "  Sender Token Account:    $SENDER_TOKEN_ACCOUNT"
echo "  Recipient Wallet:        $RECIPIENT"
echo "  Recipient Token Account: $RECIPIENT_TOKEN_ACCOUNT"
echo "  Recipient Keypair:       $RECIPIENT_KEYPAIR"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Mint tokens to sender (if needed):"
echo "   spl-token mint $TOKEN_MINT 1000 --url devnet"
echo ""
echo "2. Transfer tokens with tax:"
echo "   spl-token transfer $TOKEN_MINT 100 $RECIPIENT_TOKEN_ACCOUNT --url devnet"
echo ""
echo "3. Check balances:"
echo "   spl-token balance $TOKEN_MINT --url devnet"
echo "   spl-token balance $TOKEN_MINT --owner $RECIPIENT_KEYPAIR --url devnet"
echo ""
echo "4. View transaction on explorer:"
echo "   https://explorer.solana.com/?cluster=devnet"
echo ""
