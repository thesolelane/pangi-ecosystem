# 🔒 Backup & Recovery Strategy

## Overview

This document outlines the backup strategy to prevent data loss and ensure quick recovery for the Pangi Ecosystem project.

## 🎯 Critical Files to Protect

### 1. **IDL Files** (Most Critical)
```
target/idl/
├── pangi_token.json
├── pangi_nft.json
├── pangi_vault.json
└── special_distribution.json
```
**Why:** These define your program interfaces. Without them, you can't interact with deployed programs.

### 2. **TypeScript SDK**
```
pangi-dapp/lib/
├── types/          # Generated from IDLs
├── sdk/            # Program interaction functions
├── programs.ts     # Program instances
└── constants.ts    # Program IDs and config
```
**Why:** Contains all the logic to interact with your programs.

### 3. **Frontend Application**
```
pangi-dapp/
├── app/            # Next.js pages
├── components/     # React components
└── public/         # Static assets
```
**Why:** Your user interface and application logic.

### 4. **Configuration Files**
```
.devcontainer/
netlify.toml
package.json
tsconfig.json
```
**Why:** Environment and deployment configuration.

---

## 📦 Backup Methods

### **Method 1: Git (Primary - ALWAYS USE THIS)**

#### Daily Workflow:
```bash
# 1. Check what changed
git status

# 2. Add files
git add .

# 3. Commit with descriptive message
git commit -m "Description of changes

- Detail 1
- Detail 2

Co-authored-by: Ona <no-reply@ona.com>"

# 4. Push to remote (CRITICAL - This backs up to GitHub)
git push origin <branch-name>
```

#### Best Practices:
- ✅ **Commit frequently** (every 30-60 minutes of work)
- ✅ **Push immediately after committing** (don't wait)
- ✅ **Use descriptive commit messages**
- ✅ **Work on feature branches**, not main
- ✅ **Never force push** unless you know what you're doing

### **Method 2: GitHub Branches (Secondary)**

Create backup branches for important milestones:
```bash
# Create a backup branch
git checkout -b backup/idl-integration-2024-10-31
git push origin backup/idl-integration-2024-10-31

# Return to working branch
git checkout fix/readme-corruption
```

### **Method 3: Local Backups (Tertiary)**

For extra safety, periodically download your repository:
```bash
# Create a timestamped backup
cd /workspaces
tar -czf pangi-backup-$(date +%Y%m%d-%H%M%S).tar.gz pangi-ecosystem/
```

### **Method 4: GitHub Releases (For Milestones)**

Create releases for major milestones:
1. Go to GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag version (e.g., `v0.1.0-idl-integration`)
4. Add release notes
5. Publish

---

## 🚨 Recovery Procedures

### **Scenario 1: Lost Work in Current Session**

```bash
# Check if changes are staged
git status

# Recover from last commit
git checkout -- <file>

# Or reset to last commit (CAREFUL - loses all changes)
git reset --hard HEAD
```

### **Scenario 2: Need Previous Version**

```bash
# View commit history
git log --oneline -20

# Checkout specific file from previous commit
git checkout <commit-hash> -- <file-path>

# Or create new branch from old commit
git checkout -b recovery/<commit-hash>
```

### **Scenario 3: Workspace Deleted**

```bash
# Clone repository again
git clone https://github.com/thesolelane/pangi-ecosystem.git
cd pangi-ecosystem

# Checkout your working branch
git checkout fix/readme-corruption

# All your pushed work is restored!
```

### **Scenario 4: IDL Files Lost**

If you lose IDL files but programs are deployed:

**Option A: Fetch from on-chain** (if uploaded)
```bash
anchor idl fetch <PROGRAM_ID> -o target/idl/<name>.json
```

**Option B: Rebuild from source** (if you have program code)
```bash
anchor build
# IDLs generated in target/idl/
```

**Option C: Restore from git**
```bash
git checkout HEAD -- target/idl/
```

---

## 📋 Backup Checklist

### Before Ending Work Session:
- [ ] `git status` - Check all changes
- [ ] `git add .` - Stage files
- [ ] `git commit -m "..."` - Commit with message
- [ ] `git push origin <branch>` - **PUSH TO GITHUB**
- [ ] Verify on GitHub web interface

### Weekly:
- [ ] Review all branches
- [ ] Merge completed features to main
- [ ] Create backup branch of main
- [ ] Clean up old branches

### Monthly:
- [ ] Create GitHub release
- [ ] Download local backup archive
- [ ] Review and update documentation
- [ ] Audit critical files

---

## 🔐 Critical Program Information

**Always keep this information safe:**

### Program IDs (Devnet):
```
Pangi Token:          BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
Pangi NFT:            etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE
Pangi Vault:          5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2
Special Distribution: bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq
```

### Important PDAs:
```
Tax Config:         3qygDfXDqAMcqzmqj6K3crtuSx1VbyjNrA6csEGqRZjS
Distribution Config: F99537D8BByU6ZhJjEe1r6Gdz1dxVtqQVbw7vn4K6to2
Token Mint:         6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be
```

**Store these in multiple places:**
- ✅ In code (`lib/constants.ts`)
- ✅ In this document
- ✅ In a secure note-taking app
- ✅ In project documentation

---

## 🛡️ Prevention Tips

### 1. **Never Work Without Git**
- Always initialize git in new projects
- Commit early, commit often
- Push immediately after committing

### 2. **Use Branches**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Work on branch, commit, push
git push origin feature/new-feature

# Merge when done
git checkout main
git merge feature/new-feature
```

### 3. **Verify Pushes**
After pushing, check GitHub:
- Go to: https://github.com/thesolelane/pangi-ecosystem
- Verify your commits appear
- Check files are updated

### 4. **Use .gitignore Properly**
Don't ignore critical files:
```gitignore
# ❌ DON'T ignore these
# target/idl/
# pangi-dapp/lib/

# ✅ DO ignore these
node_modules/
.env
.env.local
*.log
.DS_Store
```

### 5. **Document Everything**
- Keep README updated
- Document deployment steps
- Note program IDs and addresses
- Explain complex logic

---

## 🔄 Automated Backup (Advanced)

### GitHub Actions (Future Enhancement)

Create `.github/workflows/backup.yml`:
```yaml
name: Daily Backup
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Create backup branch
        run: |
          git checkout -b backup/auto-$(date +%Y%m%d)
          git push origin backup/auto-$(date +%Y%m%d)
```

---

## 📞 Emergency Contacts

If you lose access to everything:

1. **GitHub Account Recovery**
   - https://github.com/password_reset

2. **Repository URL**
   - https://github.com/thesolelane/pangi-ecosystem

3. **Solana Explorer** (to verify programs)
   - https://explorer.solana.com/

---

## ✅ Quick Reference

### Save Work NOW:
```bash
git add . && git commit -m "Save work" && git push
```

### Check Backup Status:
```bash
git log --oneline -5
git remote -v
git branch -a
```

### Verify on GitHub:
Visit: https://github.com/thesolelane/pangi-ecosystem/commits

---

## 🎓 Remember

> **The Golden Rule:** If it's not pushed to GitHub, it doesn't exist.

**Push early, push often, never lose work again!** 🚀
