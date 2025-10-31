/**
 * ESM Jest Setup
 * 
 * Setup file for ESM-compatible tests
 */

import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder (required for Solana web3.js)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
