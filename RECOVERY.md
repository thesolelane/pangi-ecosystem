# 🚨 Emergency Recovery Guide

## Quick Recovery Commands

### Lost Everything? Start Here:
```bash
# 1. Clone repository
git clone https://github.com/thesolelane/pangi-ecosystem.git
cd pangi-ecosystem

# 2. Checkout your working branch
git checkout fix/readme-corruption

# 3. Verify files
ls -la target/idl/
ls -la pangi-dapp/lib/

# ✅ You're back!
```

---

## Recovery Scenarios

### 🔴 Scenario 1: Workspace Deleted

**What happened:** Gitpod workspace was deleted or you lost access

**Solution:**
```bash
# Clone fresh copy
git clone https://github.com/thesolelane/pangi-ecosystem.git
cd pangi-ecosystem

# List all branches
git branch -a

# Checkout your branch
git checkout <your-branch-name>

# Verify everything is there
git log --oneline -5
```

**Time to recover:** 2-3 minutes

---

### 🟠 Scenario 2: Accidentally Deleted Files

**What happened:** Deleted important files but haven't committed

**Solution:**
```bash
# Restore all deleted files
git checkout -- .

# Or restore specific file
git checkout -- target/idl/pangi_token.json

# Verify restoration
git status
```

**Time to recover:** 30 seconds

---

### 🟡 Scenario 3: Committed Bad Changes

**What happened:** Committed changes that broke everything

**Solution:**
```bash
# View recent commits
git log --oneline -5

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Or undo last commit (discard changes)
git reset --hard HEAD~1

# If already pushed, revert instead
git revert HEAD
git push
```

**Time to recover:** 1-2 minutes

---

### 🟢 Scenario 4: Need Old Version of File

**What happened:** Need to recover a file from previous commit

**Solution:**
```bash
# Find commit with the file
git log --oneline --all -- target/idl/pangi_token.json

# Restore from specific commit
git checkout <commit-hash> -- target/idl/pangi_token.json

# Or view file without restoring
git show <commit-hash>:target/idl/pangi_token.json
```

**Time to recover:** 1 minute

---

### 🔵 Scenario 5: Lost IDL Files

**What happened:** IDL files are missing or corrupted

**Solution A - Restore from Git:**
```bash
# Restore all IDL files
git checkout HEAD -- target/idl/

# Verify
ls -la target/idl/
```

**Solution B - Fetch from On-Chain:**
```bash
# If Anchor CLI is installed
anchor idl fetch BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA -o target/idl/pangi_token.json
anchor idl fetch etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE -o target/idl/pangi_nft.json
anchor idl fetch 5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2 -o target/idl/pangi_vault.json
anchor idl fetch bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq -o target/idl/special_distribution.json
```

**Solution C - Rebuild from Source:**
```bash
# If you have program source code
anchor build
# IDLs generated in target/idl/
```

**Time to recover:** 2-5 minutes

---

### 🟣 Scenario 6: Wrong Branch

**What happened:** Made changes on wrong branch

**Solution:**
```bash
# Save changes without committing
git stash

# Switch to correct branch
git checkout correct-branch

# Apply saved changes
git stash pop

# Now commit on correct branch
git add .
git commit -m "Your message"
git push
```

**Time to recover:** 1 minute

---

### ⚫ Scenario 7: Merge Conflict

**What happened:** Git merge conflict when pulling/merging

**Solution:**
```bash
# See conflicted files
git status

# Open conflicted file and look for:
# <<<<<<< HEAD
# your changes
# =======
# their changes
# >>>>>>> branch-name

# Edit file to keep what you want
# Remove conflict markers

# After fixing all conflicts
git add .
git commit -m "Resolve merge conflict"
git push
```

**Time to recover:** 5-10 minutes

---

## Critical Information Backup

### Program IDs (SAVE THESE!)
```
Pangi Token:          BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
Pangi NFT:            etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE
Pangi Vault:          5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2
Special Distribution: bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq
```

### Repository URL
```
https://github.com/thesolelane/pangi-ecosystem.git
```

### Important Branches
```
main                    - Production code
fix/readme-corruption   - Current working branch
```

### Network
```
Devnet: https://api.devnet.solana.com
Explorer: https://explorer.solana.com/?cluster=devnet
```

---

## Prevention Checklist

Before ending any work session:

- [ ] `git status` - Check changes
- [ ] `git add .` - Stage files
- [ ] `git commit -m "..."` - Commit with message
- [ ] `git push` - **PUSH TO GITHUB**
- [ ] Visit GitHub to verify push
- [ ] Take screenshot of commit hash

---

## Recovery Tools

### Check What's Backed Up
```bash
# View all commits
git log --oneline --all --graph

# Check remote status
git remote -v
git fetch --all
git branch -a

# See what's on GitHub
git log origin/<branch> --oneline -10
```

### Find Lost Commits
```bash
# Git keeps everything for ~30 days
git reflog

# Recover from reflog
git checkout <reflog-hash>
git checkout -b recovery-branch
```

### Verify File Integrity
```bash
# Check if IDLs are valid JSON
for file in target/idl/*.json; do
    echo "Checking $file..."
    jq empty "$file" && echo "✅ Valid" || echo "❌ Invalid"
done
```

---

## Emergency Contacts

### GitHub Support
- https://support.github.com

### Solana Explorer
- https://explorer.solana.com/

### Anchor Documentation
- https://www.anchor-lang.com/

---

## Recovery Success Checklist

After recovery, verify:

- [ ] All IDL files present in `target/idl/`
- [ ] TypeScript types in `pangi-dapp/lib/types/`
- [ ] SDK files in `pangi-dapp/lib/sdk/`
- [ ] Program IDs in `pangi-dapp/lib/constants.ts`
- [ ] Git history intact (`git log`)
- [ ] Remote connection working (`git remote -v`)
- [ ] Latest changes pushed (`git status`)

---

## Test Your Recovery

Practice recovery now while everything is safe:

```bash
# 1. Create test branch
git checkout -b test-recovery

# 2. Delete a file
rm target/idl/pangi_token.json

# 3. Recover it
git checkout -- target/idl/pangi_token.json

# 4. Verify
ls target/idl/pangi_token.json

# 5. Clean up
git checkout fix/readme-corruption
git branch -D test-recovery

# ✅ You now know how to recover!
```

---

## When All Else Fails

If you can't recover locally:

1. **Go to GitHub:** https://github.com/thesolelane/pangi-ecosystem
2. **Browse files** - All your code is there
3. **Download ZIP** - Click "Code" → "Download ZIP"
4. **Clone fresh** - `git clone <url>`

**Your work is safe on GitHub as long as you pushed!**

---

## Remember

> **The only unrecoverable data is data that was never pushed.**

**Push early, push often, sleep peacefully!** 😴

---

## Quick Recovery Card

```
LOST WORKSPACE:    git clone <url> && git checkout <branch>
DELETED FILES:     git checkout -- .
BAD COMMIT:        git reset --hard HEAD~1
OLD VERSION:       git checkout <hash> -- <file>
LOST IDLS:         git checkout HEAD -- target/idl/
WRONG BRANCH:      git stash && git checkout <branch> && git stash pop
FIND LOST:         git reflog
```

**Keep this handy!** 🆘
