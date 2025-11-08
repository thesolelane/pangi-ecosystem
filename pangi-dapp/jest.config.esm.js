export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.esm.json'
    }],
  },
  testMatch: [
    '**/__tests__/**/*.esm.test.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.esm.mjs'],
  transformIgnorePatterns: [],
};
