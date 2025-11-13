# Contributing to PANGI Ecosystem

Thank you for your interest in contributing to the PANGI Token ecosystem! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

**In summary:**
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect differing viewpoints

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Rust 1.70+
- Solana CLI 1.16+
- Anchor 0.32.1+
- Git

### Setup Development Environment

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pangi-ecosystem.git
   cd pangi-ecosystem
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd pangi-dapp && npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Feature branch
git checkout -b feature/your-feature-name

# Bug fix branch
git checkout -b fix/bug-description

# Documentation branch
git checkout -b docs/what-you-are-documenting
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:token
npm run test:esm

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### 4. Commit Your Changes

Follow our [commit guidelines](#commit-guidelines) below.

### 5. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a pull request on GitHub.

---

## Coding Standards

### TypeScript/JavaScript

- **Style:** Follow existing code style (ESLint configuration)
- **Formatting:** Use Prettier (runs automatically)
- **Naming:**
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_SNAKE_CASE` for constants
  - Descriptive names (avoid abbreviations)

**Example:**
```typescript
// ✅ Good
const userAccountBalance = await getBalance(userPublicKey);
const MAX_RETRY_ATTEMPTS = 3;

// ❌ Bad
const bal = await getBal(pk);
const max = 3;
```

### Rust (Anchor Programs)

- **Style:** Follow Rust standard style (`rustfmt`)
- **Naming:**
  - `snake_case` for functions and variables
  - `PascalCase` for structs and enums
  - `SCREAMING_SNAKE_CASE` for constants

**Example:**
```rust
// ✅ Good
pub fn transfer_with_tax(ctx: Context<TransferWithTax>, amount: u64) -> Result<()> {
    const MAX_TAX_RATE: u16 = 1000;
    // ...
}

// ❌ Bad
pub fn TransferWithTax(ctx: Context<TransferWithTax>, amt: u64) -> Result<()> {
    const maxTaxRate: u16 = 1000;
    // ...
}
```

### Comments

- **API Documentation:** Required for all public functions
- **Inline Comments:** Only for non-obvious logic
- **TODO Comments:** Include issue number or name

```typescript
/**
 * Transfers tokens with automatic tax calculation.
 * 
 * @param from - Source token account
 * @param to - Destination token account
 * @param amount - Amount to transfer (before tax)
 * @returns Transaction signature
 * @throws {InsufficientFundsError} If balance is too low
 */
export async function transferWithTax(
  from: PublicKey,
  to: PublicKey,
  amount: number
): Promise<string> {
  // Calculate tax based on transfer type
  const tax = calculateTax(amount, transferType);
  
  // TODO(@username): Optimize tax calculation for large amounts (#123)
  return await executeTransfer(from, to, amount, tax);
}
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(token): add whale tax rate calculation"

# Bug fix
git commit -m "fix(sdk): correct balance calculation for decimals"

# Documentation
git commit -m "docs(idl): add troubleshooting guide for Anchor 0.32.1"

# With body and footer
git commit -m "feat(nft): implement metadata update functionality

Add ability to update NFT metadata after minting.
Includes validation and authority checks.

Closes #45"
```

### Co-authoring

When pair programming or collaborating:

```bash
git commit -m "feat(vault): add multi-sig support

Co-authored-by: Partner Name <partner@email.com>
Co-authored-by: Ona <no-reply@ona.com>"
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with main
- [ ] No merge conflicts

### PR Title

Follow the same format as commit messages:

```
feat(token): add whale tax rate calculation
fix(sdk): correct balance calculation
docs(idl): add troubleshooting guide
```

### PR Description

Use the provided template and include:

1. **Description:** What changes were made and why
2. **Type of Change:** Check appropriate boxes
3. **Testing:** How you tested the changes
4. **Screenshots:** If UI changes
5. **Related Issues:** Link to issues (Fixes #123)

### Review Process

1. **Automated Checks:** CI must pass
2. **Code Review:** At least one approval required
3. **Testing:** Reviewer tests changes locally
4. **Documentation:** Verify docs are updated
5. **Merge:** Squash and merge (maintainers only)

### After Merge

- Delete your branch
- Update your local repository
- Close related issues if not auto-closed

---

## Testing Requirements

### Unit Tests

Required for:
- All new functions
- Bug fixes
- Business logic changes

```typescript
describe('calculateTax', () => {
  it('should calculate 1% tax for P2P transfers', () => {
    const amount = 1000;
    const tax = calculateTax(amount, TransferType.PeerToPeer);
    expect(tax).toBe(10);
  });

  it('should apply whale tax for large transfers', () => {
    const amount = 15_000_000;
    const tax = calculateTax(amount, TransferType.LargeWhale);
    expect(tax).toBe(300_000); // 2%
  });
});
```

### Integration Tests

Required for:
- New program instructions
- SDK methods that interact with programs
- Cross-program interactions

### Test Coverage

- Aim for 80%+ coverage
- 100% coverage for critical paths
- Run coverage report: `npm run test:coverage`

---

## Documentation

### What to Document

1. **Code Changes:**
   - Update JSDoc/TSDoc comments
   - Update inline comments if logic changes

2. **New Features:**
   - Add to README.md
   - Create/update relevant guides
   - Add examples

3. **API Changes:**
   - Update API documentation
   - Add migration guide if breaking

4. **Bug Fixes:**
   - Document the issue
   - Explain the fix
   - Add to troubleshooting guide if relevant

### Documentation Style

- **Clear and Concise:** Get to the point
- **Examples:** Show, don't just tell
- **Up to Date:** Remove outdated information
- **Tested:** Verify all commands work

### Where to Document

```
docs/
├── README.md                    # Documentation index
├── IDL_TROUBLESHOOTING_GUIDE.md # Error reference
├── DEBUGGING_PROCESS.md         # Case studies
└── examples/                    # Code examples

Root:
├── README.md                    # Project overview
├── QUICK_START.md              # Getting started
├── DEPLOYMENT_GUIDE.md         # Deployment instructions
└── CONTRIBUTING.md             # This file
```

---

## Community

### Communication Channels

- **GitHub Issues:** Bug reports, feature requests
- **GitHub Discussions:** Questions, ideas, general discussion
- **Pull Requests:** Code contributions

### Getting Help

1. **Check Documentation:** Start with docs/
2. **Search Issues:** Someone may have asked already
3. **Ask Questions:** Open a discussion
4. **Be Specific:** Provide context and examples

### Reporting Bugs

Use the bug report template and include:

- **Description:** What happened vs. what should happen
- **Steps to Reproduce:** Detailed steps
- **Environment:** OS, Node version, Anchor version
- **Logs:** Error messages and stack traces
- **Screenshots:** If applicable

### Suggesting Features

Use the feature request template and include:

- **Problem:** What problem does this solve?
- **Solution:** Proposed implementation
- **Alternatives:** Other approaches considered
- **Examples:** Similar features in other projects

---

## Recognition

Contributors are recognized in:

- **README.md:** Contributors section
- **Release Notes:** Credited for contributions
- **Git History:** Preserved with proper attribution

---

## Questions?

- **Documentation:** Check docs/README.md
- **Issues:** Search existing issues
- **Discussions:** Ask in GitHub Discussions
- **Email:** For security issues only (see SECURITY.md)

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see [LICENSE](LICENSE)).

---

**Thank you for contributing to PANGI Ecosystem!** 🎉

Your contributions help make this project better for everyone.
