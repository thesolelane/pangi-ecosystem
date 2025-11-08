#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
export NODE_OPTIONS=${NODE_OPTIONS:---max-old-space-size=4096}

if [ ! -f scripts/devnet_smoke.ts ]; then
  echo "scripts/devnet_smoke.ts not found. Make sure you copied it into your repo."
  exit 1
fi

# Install runtime deps if needed
if ! node -e "require('ts-node');" >/dev/null 2>&1; then
  npm i -D ts-node @project-serum/anchor @solana/web3.js dotenv
fi

npx ts-node --swc scripts/devnet_smoke.ts
