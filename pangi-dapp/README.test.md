# Testing Guide

## Overview

This project uses Jest for testing the frontend connection to Solana programs.

## Test Structure

```
__tests__/
├── frontend-connection.test.ts  # Tests program initialization and connection
├── sdk.test.ts                  # Tests SDK helper functions
└── idl-validation.test.ts       # Tests IDL file structure
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
# Test frontend connection
npm run test:connection

# Test SDK functions
npm run test:sdk

# Test IDL validation
npm run test:idl
```

### Watch Mode (Auto-rerun on changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Suites

### 1. Frontend Connection Tests
**File:** `__tests__/frontend-connection.test.ts`

Tests:
- ✅ Program initialization for all 4 programs
- ✅ Correct program IDs
- ✅ IDL structure validation
- ✅ Connection to Solana devnet
- ✅ Programs exist on-chain
- ✅ Program methods are available

### 2. SDK Tests
**File:** `__tests__/sdk.test.ts`

Tests:
- ✅ PDA derivation functions
- ✅ Consistent PDA generation
- ✅ Program ID constants
- ✅ Unique program IDs

### 3. IDL Validation Tests
**File:** `__tests__/idl-validation.test.ts`

Tests:
- ✅ IDL files exist
- ✅ Valid JSON syntax
- ✅ Required fields present
- ✅ Correct program addresses
- ✅ Instruction structure
- ✅ Program-specific validation

## Writing New Tests

### Example Test
```typescript
import { getPangiTokenProgram } from '@/lib/programs';

describe('My Test Suite', () => {
  test('should do something', () => {
    const program = getPangiTokenProgram();
    expect(program).toBeDefined();
  });
});
```

### Best Practices
- Use descriptive test names
- Group related tests with `describe`
- Mock external dependencies
- Test both success and failure cases
- Keep tests isolated and independent

## Continuous Integration

Tests run automatically on:
- Every push to GitHub
- Pull requests
- Via GitHub Actions workflow

## Troubleshooting

### Tests Failing?

**Check Node.js version:**
```bash
node --version  # Should be v20.x
```

**Install dependencies:**
```bash
npm install
```

**Clear Jest cache:**
```bash
npx jest --clearCache
```

**Run with verbose output:**
```bash
npm test -- --verbose
```

### Network Tests Timeout?

Network tests (checking on-chain programs) have a 30-second timeout. If they fail:
- Check internet connection
- Verify Solana devnet is accessible
- Try again (devnet can be slow)

## Test Configuration

### jest.config.js
- Configures Jest for Next.js
- Sets up module aliases (@/)
- Defines test patterns
- Configures coverage collection

### jest.setup.js
- Imports testing utilities
- Mocks browser APIs
- Suppresses console errors in tests

## Coverage Goals

Target coverage:
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Integration with CI/CD

Tests are part of the deployment pipeline:
1. Run tests
2. Check coverage
3. Build application
4. Deploy if all pass

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Anchor Testing](https://www.anchor-lang.com/docs/testing)
