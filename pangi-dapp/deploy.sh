#!/bin/bash

echo "🦎 PANGI Frontend - Build for Netlify"
echo "======================================"
echo ""

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next out

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building static site..."
npm run build

# Verify build
if [ -f "out/index.html" ] && [ -f "out/_redirects" ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📊 Build output:"
    du -sh out/
    echo ""
    echo "📁 Files generated:"
    ls -1 out/ | wc -l
    echo ""
    echo "🚀 Ready to deploy!"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://app.netlify.com/drop"
    echo "2. Drag the 'out' folder to the page"
    echo "3. Wait for deployment to complete"
    echo ""
    echo "Or use Netlify CLI:"
    echo "  netlify deploy --prod --dir=out"
else
    echo ""
    echo "❌ Build failed!"
    echo "Check the output above for errors."
    exit 1
fi
