/**
 * ESM Jest Setup
 * 
 * Setup file for ESM-compatible tests
 */

import { TextEncoder, TextDecoder } from 'node:util';
import { webcrypto } from 'node:crypto';
import { Buffer } from 'buffer';
import BN from 'bn.js';

// Polyfills for Solana web3.js in ESM mode
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}
if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}
if (!globalThis.BN) {
  globalThis.BN = BN;
}

// Polyfill for structuredClone (Node.js 17+)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
