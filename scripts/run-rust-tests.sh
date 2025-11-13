#!/bin/bash

# Script to run Rust unit tests for Pangi programs
# This requires cargo to be installed and in PATH

set -e

echo "🧪 Running Rust Unit Tests for Pangi Programs"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if cargo is available
if ! command -v cargo &> /dev/null; then
    echo -e "${RED}❌ Error: cargo not found${NC}"
    echo "Please install Rust and Cargo:"
    echo "  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

echo -e "${YELLOW}Testing pangi-token program...${NC}"
cd programs/pangi-token
cargo test --lib -- --nocapture
PANGI_TOKEN_RESULT=$?

echo ""
echo -e "${YELLOW}Testing pangi-vault program...${NC}"
cd ../pangi-vault
cargo test --lib -- --nocapture
PANGI_VAULT_RESULT=$?

echo ""
echo -e "${YELLOW}Testing pangi-nft program...${NC}"
cd ../pangi-nft
cargo test --lib -- --nocapture
PANGI_NFT_RESULT=$?

echo ""
echo -e "${YELLOW}Testing special-distribution program...${NC}"
cd ../special-distribution
cargo test --lib -- --nocapture
SPECIAL_DIST_RESULT=$?

# Return to root
cd ../..

# Summary
echo ""
echo "=============================================="
echo "📊 Test Results Summary"
echo "=============================================="

if [ $PANGI_TOKEN_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ pangi-token: PASSED${NC}"
else
    echo -e "${RED}❌ pangi-token: FAILED${NC}"
fi

if [ $PANGI_VAULT_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ pangi-vault: PASSED${NC}"
else
    echo -e "${RED}❌ pangi-vault: FAILED${NC}"
fi

if [ $PANGI_NFT_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ pangi-nft: PASSED${NC}"
else
    echo -e "${RED}❌ pangi-nft: FAILED${NC}"
fi

if [ $SPECIAL_DIST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ special-distribution: PASSED${NC}"
else
    echo -e "${RED}❌ special-distribution: FAILED${NC}"
fi

# Exit with error if any tests failed
if [ $PANGI_TOKEN_RESULT -ne 0 ] || [ $PANGI_VAULT_RESULT -ne 0 ] || [ $PANGI_NFT_RESULT -ne 0 ] || [ $SPECIAL_DIST_RESULT -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"
exit 0
