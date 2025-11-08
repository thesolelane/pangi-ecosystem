#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing Solana CLI (stable)…"
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="/home/gitpod/.local/share/solana/install/active_release/bin:$PATH"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc

echo "==> Installing Anchor via avm…"
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest

echo "==> Solana & Anchor versions:"
solana --version || true
anchor --version || true

# Set default to devnet in Gitpod
solana config set --url https://api.devnet.solana.com
mkdir -p ~/.config/solana
if [ ! -f ~/.config/solana/id.json ]; then
  echo "==> Generating a new keypair at ~/.config/solana/id.json"
  solana-keygen new --no-bip39-passphrase --force -o ~/.config/solana/id.json
fi

echo "==> Toolchain install finished."
