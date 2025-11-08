// scripts/devnet_smoke.ts
//
// Template smoke test using Anchor IDLs.
// Fill env vars in .env. Run with ts-node:
//   npx ts-node --swc scripts/devnet_smoke.ts
//
// You may need to tweak method names to match your program (e.g., create_wallet vs createWallet).

import * as fs from 'fs';
import * as path from 'path';
import * as anchor from '@project-serum/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

require('dotenv').config();

const RPC = process.env.ANCHOR_PROVIDER_URL!;
const WALLET_PATH = process.env.ANCHOR_WALLET!;
const COLLECTION = new PublicKey(process.env.PANGI_COLLECTION_MINT!);

const DOMAINS_ID = new PublicKey(process.env.PANGI_DOMAINS_PROGRAM_ID!);
const WALLET_ID  = new PublicKey(process.env.PANGI_WALLET_PROGRAM_ID!);
const NFT_ID     = new PublicKey(process.env.PANGI_NFT_PROGRAM_ID!);

// Paths to IDLs (after running ./scripts/generate-idl.sh)
const DOMAINS_IDL = JSON.parse(fs.readFileSync(path.resolve('idl/pangi_domains.json'), 'utf8'));
const WALLET_IDL  = JSON.parse(fs.readFileSync(path.resolve('idl/pangi_encrypted_wallet.json'), 'utf8'));
const NFT_IDL     = JSON.parse(fs.readFileSync(path.resolve('idl/pangi_nft.json'), 'utf8'));

// Replace with a real NFT mint in your verified collection
const MASTER_NFT_MINT = new PublicKey(process.env.TEST_MASTER_NFT_MINT!);
// Optionally a guardian NFT (separate wallet)
const GUARDIAN_NFT_MINT = process.env.TEST_GUARDIAN_NFT_MINT ? new PublicKey(process.env.TEST_GUARDIAN_NFT_MINT) : null;

function loadKeypair(p: string): Keypair {
  const secret = JSON.parse(fs.readFileSync(p, 'utf8'));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

async function main() {
  const connection = new Connection(RPC, 'confirmed');
  const payer = loadKeypair(WALLET_PATH);
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  anchor.setProvider(provider);

  const domains = new anchor.Program(DOMAINS_IDL as anchor.Idl, DOMAINS_ID, provider);
  const ewallet = new anchor.Program(WALLET_IDL as anchor.Idl, WALLET_ID, provider);
  const nftprog = new anchor.Program(NFT_IDL as anchor.Idl, NFT_ID, provider);

  console.log('RPC:', RPC);
  console.log('Payer:', payer.publicKey.toBase58());

  // 1) Create/ensure wallet (root domain <edition>nft.pangi.sol)
  try {
    const tx1 = await domains.methods
      // .createWallet()  // adjust to your method name/signature
      .createWallet(MASTER_NFT_MINT)
      .accounts({ /* root, quota, wallet PDA, metadata PDAs, system program */ })
      .rpc();
    console.log('Create wallet tx:', tx1);
  } catch (e:any) {
    console.log('Create wallet skipped/failed:', e.message ?? e);
  }

  // 2) Create docs subdomain
  try {
    const tx2 = await domains.methods
      .createChildSubdomain('docs')   // may be create_subdomain with (name, subtype)
      .accounts({ /* wallet, subdomain PDA, payer, system program */ })
      .rpc();
    console.log('Create docs subdomain tx:', tx2);
  } catch (e:any) {
    console.log('Create docs skipped/failed:', e.message ?? e);
  }

  // 3) Set encrypted ToC pointer for docs
  try {
    const dummy = new Uint8Array(32).fill(7); // replace with real hash
    const tx3 = await ewallet.methods
      .updateDocVault(dummy as any)
      .accounts({ /* subdomain, wallet, signer, system program */ })
      .rpc();
    console.log('Update ToC tx:', tx3);
  } catch (e:any) {
    console.log('Update ToC failed:', e.message ?? e);
  }

  // 4) (Optional) grant guardian for 24h with READ|WRITE (0b0011 = 3)
  if (GUARDIAN_NFT_MINT) {
    const now = Math.floor(Date.now() / 1000);
    const day = 24 * 3600;
    try {
      const tx4 = await domains.methods
        .grantGuardian(now, now + day, 3 /* perms */)
        .accounts({ /* subdomain, guardianGrant PDA, guardianNftMint, signer */ })
        .rpc();
      console.log('Grant guardian tx:', tx4);
    } catch (e:any) {
      console.log('Grant guardian failed:', e.message ?? e);
    }
  }

  console.log('Smoke test complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
