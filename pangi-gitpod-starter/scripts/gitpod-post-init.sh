#!/usr/bin/env bash
set -euo pipefail

# Load Solana in PATH for the running shell
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Helpful env defaults for devnet in Gitpod
export ANCHOR_PROVIDER_URL=${ANCHOR_PROVIDER_URL:-https://api.devnet.solana.com}
export ANCHOR_WALLET=${ANCHOR_WALLET:-$HOME/.config/solana/id.json}

echo "ANCHOR_PROVIDER_URL=$ANCHOR_PROVIDER_URL"
echo "ANCHOR_WALLET=$ANCHOR_WALLET"

# Show balances as a quick check
solana config get || true
solana balance || true

# If .env.devnet.example exists, copy to .env (non-destructive)
if [ -f .env.devnet.example ] && [ ! -f .env ]; then
  cp .env.devnet.example .env
  echo "Copied .env.devnet.example -> .env"
fi
