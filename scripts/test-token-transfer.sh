#!/bin/bash
set -e

echo "🧪 PANGI Token Transfer Test (with Tax)"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
TOKEN_MINT="6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be"
RECIPIENT_KEYPAIR="/tmp/pangi-recipient.json"
AMOUNT=${1:-100}  # Default 100 PANGI

# Check if recipient exists
if [ ! -f "$RECIPIENT_KEYPAIR" ]; then
    echo "❌ Recipient wallet not found"
    echo "Run setup first: ./scripts/setup-token-accounts.sh"
    exit 1
fi

RECIPIENT=$(solana-keygen pubkey $RECIPIENT_KEYPAIR)

echo "📋 Transfer Details:"
echo "  Amount:     $AMOUNT PANGI"
echo "  Token Mint: $TOKEN_MINT"
echo "  Recipient:  $RECIPIENT"
echo ""

# Get token accounts
echo "🔍 Finding token accounts..."
SENDER_TOKEN_ACCOUNT=$(spl-token accounts $TOKEN_MINT --url devnet 2>/dev/null | grep -oP '(?<=Account: )[A-Za-z0-9]+' | head -1)
RECIPIENT_TOKEN_ACCOUNT=$(spl-token accounts $TOKEN_MINT --owner $RECIPIENT_KEYPAIR --url devnet 2>/dev/null | grep -oP '(?<=Account: )[A-Za-z0-9]+' | head -1)

if [ -z "$SENDER_TOKEN_ACCOUNT" ]; then
    echo "❌ Sender token account not found"
    echo "Run setup first: ./scripts/setup-token-accounts.sh"
    exit 1
fi

if [ -z "$RECIPIENT_TOKEN_ACCOUNT" ]; then
    echo "❌ Recipient token account not found"
    echo "Run setup first: ./scripts/setup-token-accounts.sh"
    exit 1
fi

echo "  From:       $SENDER_TOKEN_ACCOUNT"
echo "  To:         $RECIPIENT_TOKEN_ACCOUNT"
echo ""

# Check balances before
echo "💰 Balances Before Transfer:"
SENDER_BALANCE_BEFORE=$(spl-token balance $TOKEN_MINT --url devnet 2>/dev/null || echo "0")
RECIPIENT_BALANCE_BEFORE=$(spl-token balance $TOKEN_MINT --owner $RECIPIENT_KEYPAIR --url devnet 2>/dev/null || echo "0")
echo "  Sender:     $SENDER_BALANCE_BEFORE PANGI"
echo "  Recipient:  $RECIPIENT_BALANCE_BEFORE PANGI"
echo ""

# Calculate expected tax (1% for P2P)
TAX_RATE=1
EXPECTED_TAX=$(echo "scale=2; $AMOUNT * $TAX_RATE / 100" | bc)
EXPECTED_RECEIVED=$(echo "scale=2; $AMOUNT - $EXPECTED_TAX" | bc)

echo "📊 Expected Tax Calculation (P2P - 1%):"
echo "  Transfer Amount:    $AMOUNT PANGI"
echo "  Tax (1%):          $EXPECTED_TAX PANGI"
echo "  Recipient Receives: $EXPECTED_RECEIVED PANGI"
echo ""

# Perform transfer
echo "🚀 Executing transfer..."
echo ""
SIGNATURE=$(spl-token transfer $TOKEN_MINT $AMOUNT $RECIPIENT_TOKEN_ACCOUNT --url devnet 2>&1 | grep -oP '(?<=Signature: )[A-Za-z0-9]+' || echo "FAILED")

if [ "$SIGNATURE" == "FAILED" ]; then
    echo "❌ Transfer failed"
    echo ""
    echo "Possible reasons:"
    echo "  1. Insufficient balance"
    echo "  2. Token program not deployed"
    echo "  3. Network issues"
    echo ""
    echo "Check balance: spl-token balance $TOKEN_MINT --url devnet"
    exit 1
fi

echo -e "${GREEN}✅ Transfer successful!${NC}"
echo "📝 Signature: $SIGNATURE"
echo ""

# Wait for confirmation
echo "⏳ Waiting for confirmation..."
sleep 3
echo ""

# Check balances after
echo "💰 Balances After Transfer:"
SENDER_BALANCE_AFTER=$(spl-token balance $TOKEN_MINT --url devnet 2>/dev/null || echo "0")
RECIPIENT_BALANCE_AFTER=$(spl-token balance $TOKEN_MINT --owner $RECIPIENT_KEYPAIR --url devnet 2>/dev/null || echo "0")
echo "  Sender:     $SENDER_BALANCE_AFTER PANGI"
echo "  Recipient:  $RECIPIENT_BALANCE_AFTER PANGI"
echo ""

# Calculate actual changes
SENDER_CHANGE=$(echo "$SENDER_BALANCE_BEFORE - $SENDER_BALANCE_AFTER" | bc)
RECIPIENT_CHANGE=$(echo "$RECIPIENT_BALANCE_AFTER - $RECIPIENT_BALANCE_BEFORE" | bc)

echo "📈 Balance Changes:"
echo "  Sender Sent:        -$SENDER_CHANGE PANGI"
echo "  Recipient Received: +$RECIPIENT_CHANGE PANGI"
echo ""

# Verify tax was applied
if [ "$RECIPIENT_CHANGE" != "$AMOUNT" ]; then
    ACTUAL_TAX=$(echo "$AMOUNT - $RECIPIENT_CHANGE" | bc)
    echo -e "${GREEN}✅ Tax Applied!${NC}"
    echo "  Tax Collected:      $ACTUAL_TAX PANGI"
    echo "  Tax Rate:           ~$(echo "scale=2; $ACTUAL_TAX * 100 / $AMOUNT" | bc)%"
else
    echo -e "${YELLOW}⚠️  No tax detected${NC}"
    echo "  This might be a standard SPL transfer"
    echo "  Use the PANGI program's transfer_with_tax instruction for tax"
fi
echo ""

# Explorer link
echo "🔗 View on Solana Explorer:"
echo "  https://explorer.solana.com/tx/$SIGNATURE?cluster=devnet"
echo ""

# Summary
echo "=============================="
echo "✅ Test Complete!"
echo "=============================="
echo ""
echo "📝 To test different scenarios:"
echo ""
echo "1. P2P Transfer (1% tax):"
echo "   ./scripts/test-token-transfer.sh 1000"
echo ""
echo "2. Large Transfer (whale - 2% tax if >10M):"
echo "   ./scripts/test-token-transfer.sh 15000000"
echo ""
echo "3. Check conservation fund:"
echo "   spl-token accounts $TOKEN_MINT --url devnet"
echo ""
