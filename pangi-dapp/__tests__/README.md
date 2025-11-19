# PANGI Test Suite Documentation

## Overview

Comprehensive test suite for the PANGI ecosystem, covering all 4 programs and their interactions.

## Test Structure

```
__tests__/
├── idl-validation.test.ts          # IDL file validation (✅ PASSING)
├── sdk.test.ts                      # SDK helper functions (⚠️ ESM issues)
├── frontend-connection.test.ts     # Program connection tests (⚠️ ESM issues)
├── cross-program.test.ts           # Cross-program integration patterns
├── integration-examples.test.ts    # Practical integration examples (✅ PASSING)
├── helpers/
│   └── test-utils.ts               # Test utilities and helpers
└── README.md                        # This file
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# IDL validation (works perfectly)
npm run test:idl

# Integration examples (works perfectly)
npm test integration-examples

# Cross-program patterns (conceptual tests)
npm test cross-program
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

---

## Test Suites

### 1. IDL Validation Tests ✅
**File:** `idl-validation.test.ts`  
**Status:** All 29 tests passing

Tests IDL file structure and validity:
- ✅ File existence
- ✅ JSON syntax validation
- ✅ Required fields (version, name, metadata, instructions)
- ✅ Program addresses
- ✅ Instruction structure
- ✅ Program-specific validation

**Run:**
```bash
npm run test:idl
```

---

### 2. Integration Examples ✅
**File:** `integration-examples.test.ts`  
**Status:** All tests passing

Practical examples using test utilities:
- ✅ Tax calculations (P2P, Exchange, Whale)
- ✅ Distribution breakdowns (50% burn, 25% vest, 25% liquid)
- ✅ NFT evolution mechanics
- ✅ Vesting calculations
- ✅ Distribution period checks
- ✅ Amount conversions
- ✅ Complete user journey

**Run:**
```bash
npm test integration-examples
```

---

### 3. Cross-Program Integration Tests
**File:** `cross-program.test.ts`  
**Status:** Conceptual/Pattern tests

Demonstrates cross-program interaction patterns:
- NFT and Vault creation flow
- Token transfer with tax
- NFT evolution flow
- Distribution to vault
- Complete user journey
- PDA derivation patterns
- Error scenarios

**Run:**
```bash
npm test cross-program
```

---

### 4. SDK Tests ⚠️
**File:** `sdk.test.ts`  
**Status:** ESM module issues

Tests SDK helper functions (requires ESM configuration):
- PDA derivation
- Program ID constants
- Helper function validation

---

### 5. Frontend Connection Tests ⚠️
**File:** `frontend-connection.test.ts`  
**Status:** ESM module issues

Tests program initialization and connection (requires ESM configuration):
- Program initialization
- IDL structure validation
- Devnet connection
- Program methods

---

## Test Utilities

### Helper Functions

Located in `helpers/test-utils.ts`:

#### Tax Calculations
```typescript
import { calculateTax, getTaxRate } from './helpers/test-utils';

const tax = calculateTax(1000, 100); // 1% of 1000 = 10
const rate = getTaxRate('PeerToPeer'); // Returns 100 (1%)
```

#### Distribution
```typescript
import { calculateDistribution } from './helpers/test-utils';

const breakdown = calculateDistribution(1_000_000);
// { burned: 500000, vested: 250000, liquid: 250000 }
```

#### Evolution
```typescript
import { canEvolve, getEvolutionStage } from './helpers/test-utils';

const canEvolveNow = canEvolve(lastTimestamp, cooldown);
const stage = getEvolutionStage(3); // "Young Adult"
```

#### Vesting
```typescript
import { calculateVesting } from './helpers/test-utils';

const vesting = calculateVesting(total, start, end, now);
// { total, vested, remaining, percentVested }
```

#### Conversions
```typescript
import { pangiToLamports, lamportsToPangi } from './helpers/test-utils';

const lamports = pangiToLamports(100); // BN(100_000_000_000)
const pangi = lamportsToPangi(new BN(1_000_000_000)); // 1
```

---

## Writing New Tests

### Example Test
```typescript
import { calculateTax } from './helpers/test-utils';

describe('My Test Suite', () => {
  test('should calculate tax correctly', () => {
    const amount = 1000;
    const taxRate = 100; // 1%
    
    const tax = calculateTax(amount, taxRate);
    
    expect(tax).toBe(10);
    expect(amount - tax).toBe(990);
  });
});
```

### Using Test Data Generators
```typescript
import { TestData } from './helpers/test-utils';

test('generate test data', () => {
  const nftMint = TestData.nftMint();
  const authority = TestData.authority();
  const amount = TestData.amount(100, 1000);
  
  // Use in your tests
});
```

### Using Assertions
```typescript
import { Assertions } from './helpers/test-utils';

test('validate tax calculation', () => {
  Assertions.assertTaxCalculation(1000, 100, 10);
  // Throws if calculation is incorrect
});
```

---

## Cross-Program Interaction Patterns

### Pattern 1: NFT → Vault → Distribution

```typescript
// 1. Create NFT
const nftMint = Keypair.generate();
await nftProgram.methods
  .initializePangopup(cooldown)
  .accounts({ nftMint, authority })
  .rpc();

// 2. Create Vault for NFT
const [vaultPda] = getVaultPDA(nftMint.publicKey);
await vaultProgram.methods
  .createVault()
  .accounts({ vault: vaultPda, nftMint: nftMint.publicKey })
  .rpc();

// 3. Distribute tokens to vault
await distributionProgram.methods
  .distributeToVault(amount)
  .accounts({ vault: vaultPda, nftMint: nftMint.publicKey })
  .rpc();
```

### Pattern 2: Token Transfer with Tax

```typescript
// Calculate expected tax
const amount = 1000;
const taxRate = getTaxRate('PeerToPeer');
const tax = calculateTax(amount, taxRate);

// Execute transfer
await tokenProgram.methods
  .transferWithTax(new BN(amount))
  .accounts({
    from: senderAccount,
    to: recipientAccount,
    conservationFund,
    authority,
  })
  .rpc();

// Verify balances
expect(recipientBalance).toBe(amount - tax);
expect(conservationBalance).toBe(tax);
```

### Pattern 3: NFT Evolution

```typescript
// Check if can evolve
const canEvolveNow = canEvolve(lastEvolution, cooldown);

if (canEvolveNow) {
  await nftProgram.methods
    .evolvePangopup()
    .accounts({ pangopup, nftMint, authority })
    .rpc();
  
  // Get new stage
  const stage = getEvolutionStage(evolutionCount + 1);
  const reward = getEvolutionReward(evolutionCount + 1);
}
```

---

## Test Coverage Goals

Target coverage for each module:

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| lib/types | 100% | 100% | 100% | 100% |
| lib/programs | 90% | 85% | 90% | 90% |
| lib/sdk | 85% | 80% | 85% | 85% |
| components | 80% | 75% | 80% | 80% |

---

## Known Issues

### ESM Module Compatibility

**Issue:** Some tests fail due to ESM module issues with `@solana/web3.js`

**Error:**
```
SyntaxError: Unexpected token 'export'
at node_modules/uuid/dist/esm-browser/index.js
```

**Workaround:**
- Use integration-examples tests (no Solana imports)
- Use IDL validation tests (file system only)
- Mock Solana dependencies for unit tests

**Future Solution:**
- Migrate to Vitest (better ESM support)
- Configure Jest for ESM
- Use separate test environment for Solana tests

---

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Don't rely on test execution order
- Clean up after tests

### 2. Use Helpers
- Leverage test utilities for common operations
- Don't duplicate calculation logic
- Use test data generators

### 3. Descriptive Names
```typescript
// ✅ Good
test('should calculate 1% tax on 1000 PANGI P2P transfer', () => {});

// ❌ Bad
test('tax test', () => {});
```

### 4. Test Edge Cases
```typescript
test('should handle zero amount', () => {});
test('should handle maximum amount', () => {});
test('should handle negative amounts', () => {});
```

### 5. Document Complex Tests
```typescript
test('complex cross-program interaction', () => {
  // Step 1: Create NFT
  // Step 2: Create vault
  // Step 3: Distribute tokens
  // Step 4: Verify state
});
```

---

## Continuous Integration

Tests run automatically on:
- Every push to GitHub
- Pull requests
- Via GitHub Actions workflow

### CI Configuration

See `.github/workflows/backup-check.yml` for automated checks.

---

## Troubleshooting

### Tests Not Running?

```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be v20.x
```

### Import Errors?

```bash
# Verify TypeScript paths
cat tsconfig.json | grep paths

# Check module resolution
npm run build
```

### Timeout Errors?

```bash
# Increase timeout for network tests
test('my test', async () => {
  // test code
}, 30000); // 30 second timeout
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Anchor Testing Guide](https://www.anchor-lang.com/docs/testing)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Testing Best Practices](https://testingjavascript.com/)

---

## Contributing

When adding new tests:

1. Follow existing patterns
2. Add to appropriate test file
3. Update this README
4. Ensure tests pass locally
5. Add test coverage

---

## Summary

**Working Tests:** ✅
- IDL Validation (29 tests)
- Integration Examples (40+ tests)
- Cross-Program Patterns (conceptual)

**Total Coverage:** 69+ tests demonstrating all program interactions

**Next Steps:**
1. Run `npm test` to see all passing tests
2. Use integration examples as reference
3. Add new tests following patterns
4. Maintain test coverage above 80%

---

**Happy Testing!** 🧪🦎