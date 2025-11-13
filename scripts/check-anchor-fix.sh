#!/bin/bash
echo "🔍 Checking for Anchor dependency fix..."
cargo update
if cargo test --lib 2>/dev/null; then
    echo "🎉 DEPENDENCY FIXED! Running all tests..."
    cargo test --lib -- --nocapture
else
    echo "⏳ Still waiting for upstream fix..."
    echo "Current status: https://github.com/coral-xyz/anchor/issues"
fi
