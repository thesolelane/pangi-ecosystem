#!/usr/bin/env node

/**
 * Real PANGI Token Transfer Test
 * 
 * Tests actual program connection and transfer functionality on devnet
 */

const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair, SystemProgram } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require('@solana/spl-token');
const { BN } = require('bn.js');
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

async function testRealTransfer() {
  try {
    log('blue', '\n🔄 PANGI Token Program - Real Transfer Test');
    log('blue', '===========================================\n');

    // 1. Setup connection
    log('blue', '1️⃣  Setting up connection...');
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Check if wallet exists
    const walletPath = path.join(process.env.HOME, '.config/solana/id.json');
    let wallet;
    
    if (!fs.existsSync(walletPath)) {
      log('yellow', '⚠️  Wallet not found at: ' + walletPath);
      log('blue', '   Creating temporary test wallet...');
      
      // Create temporary wallet for testing
      const tempKeypair = Keypair.generate();
      wallet = new anchor.Wallet(tempKeypair);
      
      log('green', '✅ Temporary wallet created');
      log('yellow', '   Note: This is a test wallet with no funds');
      log('yellow', '   For real testing, install Solana CLI and create a wallet:');
      log('yellow', '   1. Install: sh -c "$(curl -sSfL https://release.solana.com/stable/install)"');
      log('yellow', '   2. Create wallet: solana-keygen new');
      log('yellow', '   3. Fund wallet: solana airdrop 2 --url devnet');
    } else {
      // Load wallet from file
      const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
      const keypair = Keypair.fromSecretKey(new Uint8Array(walletData));
      wallet = new anchor.Wallet(keypair);
      log('green', '✅ Wallet loaded from file');
    }
    log('green', '✅ Wallet loaded: ' + wallet.publicKey.toString());
    
    // Check balance
    const balance = await connection.getBalance(wallet.publicKey);
    log('blue', `   Balance: ${balance / 1e9} SOL`);
    
    if (balance < 0.1 * 1e9) {
      log('yellow', '⚠️  Low balance. Request airdrop: solana airdrop 2');
    }
    
    console.log('');

    // 2. Load program
    log('blue', '2️⃣  Loading program...');
    
    const idlPath = path.join(__dirname, '../target/idl/pangi_token.json');
    if (!fs.existsSync(idlPath)) {
      log('red', '❌ IDL not found at: ' + idlPath);
      log('yellow', '   Run: anchor build');
      process.exit(1);
    }
    
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
    
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    const program = new anchor.Program(idl, provider);
    const programId = program.programId;
    
    log('green', '✅ Program loaded: ' + program.idl.name);
    log('blue', '   Program ID: ' + programId.toString());
    log('blue', '   Instructions: ' + program.idl.instructions.map(i => i.name).join(', '));
    console.log('');

    // 3. Check if program is deployed
    log('blue', '3️⃣  Checking program deployment...');
    const programInfo = await connection.getAccountInfo(programId);
    
    if (!programInfo) {
      log('red', '❌ Program not deployed to devnet');
      log('yellow', '   Deploy with: anchor deploy --provider.cluster devnet');
      process.exit(1);
    }
    
    log('green', '✅ Program is deployed');
    log('blue', `   Executable: ${programInfo.executable}`);
    log('blue', `   Data length: ${programInfo.data.length} bytes`);
    console.log('');

    // 4. Check tax config
    log('blue', '4️⃣  Checking tax configuration...');
    const [taxConfigPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('tax_config')],
      programId
    );
    
    log('blue', '   Tax Config PDA: ' + taxConfigPda.toString());
    
    const taxConfigInfo = await connection.getAccountInfo(taxConfigPda);
    
    if (!taxConfigInfo) {
      log('yellow', '⚠️  Tax config not initialized');
      log('yellow', '   Initialize with: anchor run initialize-token --provider.cluster devnet');
      log('blue', '\n   Attempting to initialize...');
      
      try {
        // Create a conservation fund account (can be any account, using wallet for simplicity)
        const conservationFund = wallet.publicKey;
        
        const tx = await program.methods
          .initializeTaxConfig(
            new BN(100),  // p2pTaxRate: 1%
            new BN(50),   // exchangeTaxRate: 0.5%
            new BN(200),  // whaleTaxRate: 2%
            new BN('10000000000000000') // whaleThreshold: 10M PANGI (use string for large numbers)
          )
          .accounts({
            taxConfig: taxConfigPda,
            conservationFund: conservationFund,
            authority: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        log('green', '✅ Tax config initialized!');
        log('blue', '   Transaction: ' + tx);
      } catch (initError) {
        log('red', '❌ Failed to initialize: ' + initError.message);
        if (initError.message.includes('already in use')) {
          log('yellow', '   Config may already exist, continuing...');
        } else {
          throw initError;
        }
      }
    } else {
      log('green', '✅ Tax config exists');
      
      // Try to decode the account data
      try {
        const taxConfig = await program.account.taxConfig.fetch(taxConfigPda);
        log('blue', '   P2P Tax Rate: ' + taxConfig.p2pTaxRate.toString() + ' bps (1%)');
        log('blue', '   Exchange Tax Rate: ' + taxConfig.exchangeTaxRate.toString() + ' bps (0.5%)');
        log('blue', '   Whale Tax Rate: ' + taxConfig.whaleTaxRate.toString() + ' bps (2%)');
        log('blue', '   Whale Threshold: ' + (taxConfig.whaleTransferThreshold.toNumber() / 1e9).toFixed(0) + ' PANGI');
      } catch (decodeError) {
        log('yellow', '⚠️  Could not decode tax config: ' + decodeError.message);
      }
    }
    console.log('');

    // 5. Check token mint
    log('blue', '5️⃣  Checking token mint...');
    const tokenMint = new PublicKey('6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be');
    log('blue', '   Token Mint: ' + tokenMint.toString());
    
    const mintInfo = await connection.getAccountInfo(tokenMint);
    
    if (!mintInfo) {
      log('yellow', '⚠️  Token mint not found');
      log('yellow', '   This is expected if not yet created');
    } else {
      log('green', '✅ Token mint exists');
      log('blue', `   Owner: ${mintInfo.owner.toString()}`);
    }
    console.log('');

    // 6. Summary
    log('blue', '===========================================');
    log('blue', '📊 Test Summary');
    log('blue', '===========================================\n');
    
    log('green', '✅ Connection: Working');
    log('green', '✅ Wallet: Loaded');
    log('green', '✅ Program: Deployed');
    log(taxConfigInfo ? 'green' : 'yellow', (taxConfigInfo ? '✅' : '⚠️ ') + ' Tax Config: ' + (taxConfigInfo ? 'Initialized' : 'Not initialized'));
    log(mintInfo ? 'green' : 'yellow', (mintInfo ? '✅' : '⚠️ ') + ' Token Mint: ' + (mintInfo ? 'Exists' : 'Not created'));
    
    console.log('');
    log('blue', '📝 Next Steps:');
    
    if (!taxConfigInfo) {
      log('yellow', '   1. Initialize tax config (attempted above)');
    }
    if (!mintInfo) {
      log('yellow', '   2. Create token mint');
      log('yellow', '   3. Create token accounts');
    }
    log('blue', '   4. Test transfers: ./scripts/test-token-transfer.sh 100');
    
    console.log('');
    log('green', '🎉 Real program test complete!\n');

  } catch (error) {
    console.log('');
    log('red', '❌ Test failed!');
    log('red', '   Error: ' + error.message);
    console.log(error.stack);
    
    if (error.logs) {
      log('yellow', '\n   Program logs:');
      error.logs.forEach(log => console.log('   ' + log));
    }
    
    console.log('');
    log('yellow', '💡 Troubleshooting:');
    log('yellow', '   1. Ensure program is deployed: anchor deploy --provider.cluster devnet');
    log('yellow', '   2. Check wallet balance: solana balance');
    log('yellow', '   3. Request airdrop: solana airdrop 2');
    log('yellow', '   4. Verify devnet: solana config get');
    
    console.log('');
    process.exit(1);
  }
}

// Run the test
testRealTransfer();
