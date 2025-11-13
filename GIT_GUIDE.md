# 🎯 Git Quick Reference Guide

## Daily Workflow

### 1. **Save Your Work** (Do this OFTEN!)
```bash
# The magic three commands - memorize these!
git add .
git commit -m "Brief description of what you did"
git push
```

### 2. **Check Status**
```bash
# See what changed
git status

# See what you modified
git diff
```

### 3. **View History**
```bash
# Recent commits
git log --oneline -10

# Pretty graph
git log --oneline --graph --all -10
```

---

## Common Tasks

### Start New Feature
```bash
# Create and switch to new branch
git checkout -b feature/my-new-feature

# Work on your feature...
# Commit often!
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/my-new-feature
```

### Update from Remote
```bash
# Get latest changes
git pull origin <branch-name>
```

### Switch Branches
```bash
# List all branches
git branch -a

# Switch to existing branch
git checkout <branch-name>
```

### Undo Changes

```bash
# Undo changes to a file (before staging)
git checkout -- <file>

# Unstage a file (after git add)
git reset HEAD <file>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) - CAREFUL!
git reset --hard HEAD~1
```

---

## Git Aliases (Time Savers!)

Add these to your git config:

```bash
# Set up useful aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --oneline --graph --all'

# Now you can use shortcuts:
git st          # instead of git status
git co main     # instead of git checkout main
git visual      # pretty commit graph
```

---

## Emergency Commands

### "I committed to the wrong branch!"
```bash
# On wrong branch
git log --oneline -1  # Copy the commit hash

# Switch to correct branch
git checkout correct-branch

# Apply the commit
git cherry-pick <commit-hash>

# Go back and remove from wrong branch
git checkout wrong-branch
git reset --hard HEAD~1
```

### "I need to recover deleted files!"
```bash
# Find the commit where file existed
git log --all --full-history -- <file-path>

# Restore from specific commit
git checkout <commit-hash> -- <file-path>
```

### "I accidentally deleted everything!"
```bash
# If you haven't committed the deletion
git checkout -- .

# If you committed the deletion
git reset --hard HEAD~1

# If you pushed the deletion (CAREFUL!)
git revert HEAD
git push
```

---

## Best Practices

### ✅ DO:
- Commit frequently (every 30-60 minutes)
- Push after every commit
- Write clear commit messages
- Use branches for features
- Pull before starting work
- Review changes before committing

### ❌ DON'T:
- Work without committing
- Commit without pushing
- Force push (`git push -f`) unless you know why
- Commit sensitive data (passwords, keys)
- Work directly on main branch
- Commit broken code

---

## Commit Message Format

### Good Examples:
```
Add IDL files for all 4 programs

- Add pangi_token.json
- Add pangi_nft.json
- Add pangi_vault.json
- Add special_distribution.json
```

```
Fix: Token transfer tax calculation

- Correct basis points conversion
- Add validation for tax rates
- Update tests
```

```
Refactor: Simplify vault deposit logic

- Extract helper function
- Improve error handling
- Add comments
```

### Bad Examples:
```
update stuff
```

```
fix
```

```
changes
```

---

## Branch Naming

### Convention:
```
feature/description    # New features
fix/description        # Bug fixes
docs/description       # Documentation
refactor/description   # Code refactoring
test/description       # Test additions
backup/date           # Backup branches
```

### Examples:
```
feature/nft-evolution
fix/tax-calculation-error
docs/update-readme
refactor/vault-sdk
backup/2024-10-31
```

---

## Checking Your Backups

### Verify on GitHub:
1. Go to: https://github.com/thesolelane/pangi-ecosystem
2. Check "Commits" - see your recent commits
3. Check "Branches" - see all branches
4. Click on files - verify content

### Verify Locally:
```bash
# Check remote connection
git remote -v

# Check what's pushed
git log origin/<branch-name> --oneline -5

# Compare local vs remote
git diff origin/<branch-name>
```

---

## Quick Save Script

Create a file `quick-save.sh`:
```bash
#!/bin/bash
# Quick save script

echo "💾 Quick Save Starting..."

# Check if there are changes
if [[ -z $(git status -s) ]]; then
    echo "✅ No changes to save"
    exit 0
fi

# Show what will be saved
echo "📝 Changes to save:"
git status -s

# Add all changes
git add .

# Commit with timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Quick save: $TIMESTAMP"

# Push to current branch
BRANCH=$(git branch --show-current)
git push origin $BRANCH

echo "✅ Saved and pushed to $BRANCH"
echo "🔗 View at: https://github.com/thesolelane/pangi-ecosystem"
```

Make it executable:
```bash
chmod +x quick-save.sh
```

Use it:
```bash
./quick-save.sh
```

---

## Troubleshooting

### "Permission denied (publickey)"
```bash
# Check SSH key
ssh -T git@github.com

# Or use HTTPS instead
git remote set-url origin https://github.com/thesolelane/pangi-ecosystem.git
```

### "Your branch is behind"
```bash
# Pull changes first
git pull origin <branch-name>

# Then push
git push origin <branch-name>
```

### "Merge conflict"
```bash
# See conflicted files
git status

# Edit files to resolve conflicts
# Look for <<<<<<< and >>>>>>>

# After fixing
git add .
git commit -m "Resolve merge conflict"
git push
```

---

## Remember

> **If it's not pushed, it doesn't exist!**

**Save early, save often, never lose work!** 🚀

---

## Quick Reference Card

```
SAVE WORK:     git add . && git commit -m "message" && git push
CHECK STATUS:  git status
VIEW HISTORY:  git log --oneline -10
NEW BRANCH:    git checkout -b feature/name
SWITCH BRANCH: git checkout branch-name
UPDATE:        git pull
UNDO FILE:     git checkout -- file
UNDO COMMIT:   git reset --soft HEAD~1
```

**Print this and keep it handy!** 📋
