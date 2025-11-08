# Custom Gitpod image with Solana + Anchor + Node
FROM gitpod/workspace-full:latest

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install Node 20, pnpm, and libs
USER gitpod
RUN bash -lc "nvm install 20 && nvm alias default 20 && corepack enable && corepack prepare pnpm@latest --activate"

# Install Rust toolchain
RUN bash -lc "rustup toolchain install stable --profile default && rustup default stable && rustup component add rustfmt clippy"

# Some build deps
USER root
RUN apt-get update && apt-get install -y     pkg-config libssl-dev libudev-dev jq   && rm -rf /var/lib/apt/lists/*
USER gitpod
