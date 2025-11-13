#!/bin/bash
set -e

echo "🔍 PANGI Program Status Check"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Program IDs from your constants
PANGI_TOKEN_PROGRAM="BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA"
PANGI_NFT_PROGRAM="etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE"
PANGI_VAULT_PROGRAM="YOUR_VAULT_PROGRAM_ID"  # Update after deployment
SPECIAL_DISTRIBUTION_PROGRAM="YOUR_DISTRIBUTION_PROGRAM_ID"  # Update after deployment

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found${NC}"
    echo "Install with: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
fi

echo "✅ Solana CLI found"
echo ""

# Set to devnet
echo "🌐 Connecting to devnet..."
solana config set --url https://api.devnet.solana.com > /dev/null 2>&1
echo ""

# Function to check program
check_program() {
    local program_id=$1
    local program_name=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📦 $program_name${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Program ID: $program_id"
    echo ""
    
    # Check if program exists
    PROGRAM_INFO=$(solana program show $program_id --url devnet 2>&1)
    
    if echo "$PROGRAM_INFO" | grep -q "Error"; then
        echo -e "${RED}❌ Program NOT deployed${NC}"
        echo ""
        echo "Error details:"
        echo "$PROGRAM_INFO" | grep -i error
        echo ""
        echo "To deploy:"
        echo "  anchor build"
        echo "  anchor deploy --provider.cluster devnet"
        echo ""
        return 1
    else
        echo -e "${GREEN}✅ Program IS deployed${NC}"
        echo ""
        echo "Program Details:"
        echo "$PROGRAM_INFO"
        echo ""
        
        # Extract program data length
        DATA_LEN=$(echo "$PROGRAM_INFO" | grep -oP '(?<=ProgramData Address: )[A-Za-z0-9]+' || echo "N/A")
        if [ "$DATA_LEN" != "N/A" ]; then
            echo "ProgramData: $DATA_LEN"
        fi
        
        # Check for recent activity
        echo ""
        echo "Checking recent activity..."
        RECENT_TX=$(solana transaction-history $program_id --url devnet --limit 5 2>&1 || echo "No recent transactions")
        
        if echo "$RECENT_TX" | grep -q "Signature"; then
            echo -e "${GREEN}✅ Recent transactions found${NC}"
            echo "$RECENT_TX" | head -10
        else
            echo -e "${YELLOW}⚠️  No recent transactions${NC}"
        fi
        echo ""
        
        return 0
    fi
}

# Check all programs
echo "Checking PANGI Programs on Devnet..."
echo ""

DEPLOYED_COUNT=0
TOTAL_COUNT=4

# Check Token Program
if check_program "$PANGI_TOKEN_PROGRAM" "PANGI Token Program"; then
    ((DEPLOYED_COUNT++))
fi

# Check NFT Program
if check_program "$PANGI_NFT_PROGRAM" "PANGI NFT Program"; then
    ((DEPLOYED_COUNT++))
fi

# Check Vault Program
if [ "$PANGI_VAULT_PROGRAM" != "YOUR_VAULT_PROGRAM_ID" ]; then
    if check_program "$PANGI_VAULT_PROGRAM" "PANGI Vault Program"; then
        ((DEPLOYED_COUNT++))
    fi
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📦 PANGI Vault Program${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${YELLOW}⚠️  Program ID not set${NC}"
    echo "Update PANGI_VAULT_PROGRAM in this script after deployment"
    echo ""
fi

# Check Distribution Program
if [ "$SPECIAL_DISTRIBUTION_PROGRAM" != "YOUR_DISTRIBUTION_PROGRAM_ID" ]; then
    if check_program "$SPECIAL_DISTRIBUTION_PROGRAM" "Special Distribution Program"; then
        ((DEPLOYED_COUNT++))
    fi
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📦 Special Distribution Program${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${YELLOW}⚠️  Program ID not set${NC}"
    echo "Update SPECIAL_DISTRIBUTION_PROGRAM in this script after deployment"
    echo ""
fi

# Summary
echo "=============================="
echo "📊 Deployment Summary"
echo "=============================="
echo ""
echo "Programs Deployed: $DEPLOYED_COUNT / $TOTAL_COUNT"
echo ""

if [ $DEPLOYED_COUNT -eq 0 ]; then
    echo -e "${RED}❌ No programs deployed${NC}"
    echo ""
    echo "To deploy all programs:"
    echo "  1. Build: anchor build"
    echo "  2. Deploy: anchor deploy --provider.cluster devnet"
    echo "  3. Update program IDs in lib/constants.ts"
    echo "  4. Re-run this script"
elif [ $DEPLOYED_COUNT -lt $TOTAL_COUNT ]; then
    echo -e "${YELLOW}⚠️  Partial deployment${NC}"
    echo ""
    echo "Some programs are missing. Deploy with:"
    echo "  anchor deploy --provider.cluster devnet"
else
    echo -e "${GREEN}✅ All programs deployed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Initialize programs: anchor run initialize-token --provider.cluster devnet"
    echo "  2. Setup token accounts: ./scripts/setup-token-accounts.sh"
    echo "  3. Test transfers: ./scripts/test-token-transfer.sh 100"
fi

echo ""

# Check for program accounts
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Checking Program Accounts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check token mint
TOKEN_MINT="6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be"
echo "Token Mint: $TOKEN_MINT"

if command -v spl-token &> /dev/null; then
    TOKEN_INFO=$(spl-token account-info $TOKEN_MINT --url devnet 2>&1 || echo "NOT_FOUND")
    
    if echo "$TOKEN_INFO" | grep -q "NOT_FOUND\|Error"; then
        echo -e "${RED}❌ Token mint not found${NC}"
        echo "Initialize with: anchor run initialize-token --provider.cluster devnet"
    else
        echo -e "${GREEN}✅ Token mint exists${NC}"
        echo "$TOKEN_INFO" | head -10
    fi
else
    echo -e "${YELLOW}⚠️  spl-token CLI not found (install: cargo install spl-token-cli)${NC}"
fi

echo ""
echo "=============================="
echo "✅ Status check complete!"
echo "=============================="
