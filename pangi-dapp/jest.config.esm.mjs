/**
 * ESM-Compatible Jest Configuration
 * 
 * Use this config for tests that need ESM support:
 * jest --config jest.config.esm.mjs
 */

export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // Transform TypeScript files with ESM support
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  
  // Test patterns
  testMatch: [
    '**/__tests__/**/*.esm.test.ts',
    '**/__tests__/**/*.esm.test.tsx',
  ],
  
  // Transform node_modules that use ESM
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|@solana|@coral-xyz|@noble|jayson|@metaplex-foundation)/)',
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.esm.js'],
  
  // Coverage
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    '!lib/**/*.d.ts',
    '!**/node_modules/**',
  ],
};
