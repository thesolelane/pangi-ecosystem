#!/bin/bash

echo "✅ PANGI Devnet Deployment Checklist"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARN++))
}

echo "1️⃣  Prerequisites"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Solana CLI
if command -v solana &> /dev/null; then
    VERSION=$(solana --version | head -1)
    check_pass "Solana CLI installed ($VERSION)"
else
    check_fail "Solana CLI not installed"
    echo "   Install: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
fi

# Check Anchor CLI
if command -v anchor &> /dev/null; then
    VERSION=$(anchor --version)
    check_pass "Anchor CLI installed ($VERSION)"
else
    check_fail "Anchor CLI not installed"
    echo "   Install: cargo install --git https://github.com/coral-xyz/anchor anchor-cli"
fi

# Check SPL Token CLI
if command -v spl-token &> /dev/null; then
    check_pass "SPL Token CLI installed"
else
    check_warn "SPL Token CLI not installed (optional)"
    echo "   Install: cargo install spl-token-cli"
fi

# Check Node.js
if command -v node &> /dev/null; then
    VERSION=$(node --version)
    check_pass "Node.js installed ($VERSION)"
else
    check_fail "Node.js not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    VERSION=$(npm --version)
    check_pass "npm installed ($VERSION)"
else
    check_fail "npm not installed"
fi

echo ""
echo "2️⃣  Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Solana config
if command -v solana &> /dev/null; then
    RPC_URL=$(solana config get | grep "RPC URL" | awk '{print $3}')
    if [[ "$RPC_URL" == *"devnet"* ]]; then
        check_pass "Solana configured for devnet"
    else
        check_warn "Solana not configured for devnet (current: $RPC_URL)"
        echo "   Run: solana config set --url https://api.devnet.solana.com"
    fi
    
    # Check wallet balance
    BALANCE=$(solana balance 2>&1 | grep -oP '[\d.]+' | head -1 || echo "0")
    if (( $(echo "$BALANCE > 1" | bc -l) )); then
        check_pass "Wallet has sufficient balance ($BALANCE SOL)"
    else
        check_warn "Low wallet balance ($BALANCE SOL)"
        echo "   Run: solana airdrop 2"
    fi
fi

echo ""
echo "3️⃣  Project Build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Anchor.toml exists
if [ -f "Anchor.toml" ]; then
    check_pass "Anchor.toml found"
else
    check_fail "Anchor.toml not found"
fi

# Check if programs are built
if [ -d "target/deploy" ]; then
    check_pass "target/deploy directory exists"
    
    # Check for program keypairs
    PROGRAMS=("pangi_token" "pangi_nft" "pangi_vault" "special_distribution")
    for program in "${PROGRAMS[@]}"; do
        if [ -f "target/deploy/${program}-keypair.json" ]; then
            check_pass "${program} keypair exists"
        else
            check_warn "${program} keypair not found (run: anchor build)"
        fi
    done
else
    check_fail "target/deploy not found"
    echo "   Run: anchor build"
fi

echo ""
echo "4️⃣  Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if tests exist
if [ -d "pangi-dapp/__tests__" ]; then
    check_pass "Test directory exists"
    
    # Count test files
    TEST_COUNT=$(find pangi-dapp/__tests__ -name "*.test.ts" | wc -l)
    check_pass "Found $TEST_COUNT test files"
else
    check_warn "Test directory not found"
fi

# Check if node_modules exists
if [ -d "pangi-dapp/node_modules" ]; then
    check_pass "Dependencies installed"
else
    check_warn "Dependencies not installed"
    echo "   Run: cd pangi-dapp && npm install"
fi

echo ""
echo "5️⃣  Program Deployment Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v solana &> /dev/null; then
    # Check token program
    TOKEN_PROGRAM="BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA"
    if solana program show $TOKEN_PROGRAM --url devnet &> /dev/null; then
        check_pass "Token program deployed"
    else
        check_warn "Token program not deployed"
    fi
    
    # Check NFT program
    NFT_PROGRAM="etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE"
    if solana program show $NFT_PROGRAM --url devnet &> /dev/null; then
        check_pass "NFT program deployed"
    else
        check_warn "NFT program not deployed"
    fi
fi

echo ""
echo "6️⃣  Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DOCS=("QUICK_START.md" "TEST_SUMMARY.md" "DEVNET_SETUP.md" "DEVNET_TESTING.md" "README_SCRIPTS.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "$doc exists"
    else
        check_warn "$doc not found"
    fi
done

echo ""
echo "7️⃣  Scripts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SCRIPTS=("verify-devnet.sh" "setup-token-accounts.sh" "test-token-transfer.sh" "check-program-status.sh" "get-program-ids.sh")
for script in "${SCRIPTS[@]}"; do
    if [ -f "scripts/$script" ]; then
        if [ -x "scripts/$script" ]; then
            check_pass "$script (executable)"
        else
            check_warn "$script (not executable)"
            echo "   Run: chmod +x scripts/$script"
        fi
    else
        check_warn "$script not found"
    fi
done

echo ""
echo "====================================="
echo "📊 Summary"
echo "====================================="
echo ""
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARN${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ] && [ $WARN -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready to deploy!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. anchor build"
    echo "  2. anchor deploy --provider.cluster devnet"
    echo "  3. ./scripts/get-program-ids.sh"
    echo "  4. Update lib/constants.ts with program IDs"
    echo "  5. ./scripts/check-program-status.sh"
elif [ $FAIL -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Some warnings found. Review and proceed.${NC}"
    echo ""
    echo "You can proceed with deployment, but address warnings first."
else
    echo -e "${RED}❌ Some checks failed. Fix issues before deploying.${NC}"
    echo ""
    echo "Address the failed checks above before proceeding."
fi

echo ""
