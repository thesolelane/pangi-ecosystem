# Dev Container Configuration

## What's Included

This dev container provides a complete development environment for the Pangi Ecosystem project.

### Installed Tools

- **Node.js 20.x LTS** - JavaScript runtime
- **npm** - Package manager
- **Rust & Cargo** - For Anchor/Solana development (installed via postCreateCommand)
- **Git** - Version control
- **jq** - JSON processor
- **Build tools** - gcc, make, pkg-config, libssl-dev

### VS Code Extensions

- ESLint - JavaScript/TypeScript linting
- Prettier - Code formatting
- Tailwind CSS IntelliSense - CSS utilities
- Rust Analyzer - Rust language support

### Ports

- **3000** - Next.js development server
- **8080** - Alternative web server

## Rebuilding the Container

If you need to rebuild the container after changes:

```bash
# In Gitpod/VS Code
# Press F1 or Ctrl+Shift+P
# Type: "Dev Containers: Rebuild Container"
# Or use the Gitpod CLI:
gitpod devcontainer rebuild
```

## Verifying Installation

After container starts:

```bash
# Check Node.js
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Check other tools
git --version
jq --version
rustc --version  # If Rust is installed
```

## Troubleshooting

### Node.js not found
If Node.js isn't available after rebuild:
```bash
# Check if it's in PATH
which node

# Manually install if needed
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
```

### Permissions issues
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

## Development Workflow

1. **Install dependencies:**
   ```bash
   cd pangi-dapp
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Run linting:**
   ```bash
   npm run lint
   ```

## Environment Variables

Set in `.env.local` (not committed):
```bash
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

## Notes

- Container rebuilds may take 2-5 minutes
- All changes to Dockerfile require container rebuild
- Node modules are installed in the container, not locally
- Git credentials are shared from host
