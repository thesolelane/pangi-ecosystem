#!/bin/bash

echo "📋 PANGI Program IDs"
echo "===================="
echo ""

# Check if target directory exists
if [ ! -d "target/deploy" ]; then
    echo "❌ target/deploy directory not found"
    echo "Run 'anchor build' first"
    exit 1
fi

echo "Reading program IDs from keypairs..."
echo ""

# Function to get program ID from keypair
get_program_id() {
    local keypair_file=$1
    local program_name=$2
    
    if [ -f "$keypair_file" ]; then
        PROGRAM_ID=$(solana-keygen pubkey "$keypair_file" 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo "✅ $program_name"
            echo "   Program ID: $PROGRAM_ID"
            echo ""
        else
            echo "❌ $program_name - Failed to read keypair"
            echo ""
        fi
    else
        echo "⚠️  $program_name - Keypair not found"
        echo "   Expected: $keypair_file"
        echo ""
    fi
}

# Get all program IDs
get_program_id "target/deploy/pangi_token-keypair.json" "PANGI Token Program"
get_program_id "target/deploy/pangi_nft-keypair.json" "PANGI NFT Program"
get_program_id "target/deploy/pangi_vault-keypair.json" "PANGI Vault Program"
get_program_id "target/deploy/special_distribution-keypair.json" "Special Distribution Program"

echo "===================="
echo ""
echo "📝 Update these IDs in:"
echo "   pangi-dapp/lib/constants.ts"
echo ""
echo "Example:"
echo "export const PANGI_TOKEN_PROGRAM_ID = new PublicKey('YOUR_TOKEN_PROGRAM_ID');"
echo "export const PANGI_NFT_PROGRAM_ID = new PublicKey('YOUR_NFT_PROGRAM_ID');"
echo "export const PANGI_VAULT_PROGRAM_ID = new PublicKey('YOUR_VAULT_PROGRAM_ID');"
echo "export const SPECIAL_DISTRIBUTION_PROGRAM_ID = new PublicKey('YOUR_DISTRIBUTION_PROGRAM_ID');"
echo ""
