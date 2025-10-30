#!/bin/bash
# Test script to validate README.md structure

set -e

echo "Testing README.md structure..."

# Check if README exists
if [ ! -f "readme.md" ]; then
    echo "❌ ERROR: readme.md not found"
    exit 1
fi

# Check for required sections
required_sections=("# 🦎 Pangi Pangolin Ecosystem" "## Mission" "## Quick Start" "## License")

for section in "${required_sections[@]}"; do
    if grep -q "$section" readme.md; then
        echo "✅ Found: $section"
    else
        echo "❌ Missing: $section"
        exit 1
    fi
done

# Check for properly closed code blocks
backtick_count=$(grep -o '```' readme.md | wc -l)
if [ $((backtick_count % 2)) -eq 0 ]; then
    echo "✅ Code blocks are properly closed (found $backtick_count backticks)"
else
    echo "❌ Code blocks are not properly closed (found $backtick_count backticks)"
    exit 1
fi

# Check for broken markdown patterns
if grep -q "echo.*README" readme.md; then
    echo "❌ Found echo commands in README (should be clean documentation)"
    exit 1
else
    echo "✅ No echo commands found"
fi

# Check for incomplete numbered lists
if grep -q "^[0-9]\+\.\s*\*\*.*\*\*$" readme.md; then
    echo "⚠️  Warning: Found potentially incomplete numbered list items"
fi

echo ""
echo "✅ All README.md structure tests passed!"
