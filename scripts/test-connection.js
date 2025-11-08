#!/usr/bin/env node

/**
 * Simple Connection Test
 * 
 * Tests basic Solana connection without complex IDL parsing
 */

const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConnection() {
  try {
    log('blue', '\n🔄 PANGI Token - Connection Test');
    log('blue', '==================================\n');

    // 1. Setup connection
    log('blue', '1️⃣  Connecting to Solana devnet...');
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    const version = await connection.getVersion();
    log('green', '✅ Connected to Solana devnet');
    log('blue', `   Version: ${JSON.stringify(version)}`);
    console.log('');

    // 2. Check wallet
    log('blue', '2️⃣  Checking wallet...');
    const walletPath = path.join(process.env.HOME, '.config/solana/id.json');
    let publicKey;
    
    if (!fs.existsSync(walletPath)) {
      log('yellow', '⚠️  Wallet not found at: ' + walletPath);
      log('blue', '   Creating temporary test wallet...');
      const tempKeypair = Keypair.generate();
      publicKey = tempKeypair.publicKey;
      log('green', '✅ Temporary wallet created');
      log('yellow', '   Note: This is a test wallet with no funds');
    } else {
      const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
      const keypair = Keypair.fromSecretKey(new Uint8Array(walletData));
      publicKey = keypair.publicKey;
      log('green', '✅ Wallet loaded from file');
    }
    
    log('blue', `   Address: ${publicKey.toString()}`);
    
    const balance = await connection.getBalance(publicKey);
    log('blue', `   Balance: ${balance / 1e9} SOL`);
    
    if (balance < 0.1 * 1e9) {
      log('yellow', '⚠️  Low balance. Request airdrop:');
      log('yellow', `   solana airdrop 2 ${publicKey.toString()} --url devnet`);
    }
    console.log('');

    // 3. Check program
    log('blue', '3️⃣  Checking program deployment...');
    const programId = new PublicKey('BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA');
    log('blue', `   Program ID: ${programId.toString()}`);
    
    const programInfo = await connection.getAccountInfo(programId);
    
    if (programInfo) {
      log('green', '✅ Program is deployed');
      log('blue', `   Owner: ${programInfo.owner.toString()}`);
      log('blue', `   Executable: ${programInfo.executable}`);
      log('blue', `   Data length: ${programInfo.data.length} bytes`);
    } else {
      log('red', '❌ Program not found on devnet');
      log('yellow', '   Deploy the program first:');
      log('yellow', '   anchor deploy --provider.cluster devnet');
    }
    
    console.log('');
    log('green', '🎉 Connection test complete!\n');

  } catch (error) {
    console.log('');
    log('red', '❌ Test failed!');
    log('red', '   Error: ' + error.message);
    console.log(error.stack);
    console.log('');
    process.exit(1);
  }
}

// Run the test
testConnection();
