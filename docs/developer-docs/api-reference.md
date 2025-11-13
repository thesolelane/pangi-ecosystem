# API Reference

Complete TypeScript SDK reference for PANGI ecosystem.

## Installation

```bash
npm install @solana/web3.js @solana/wallet-adapter-react
npm install @coral-xyz/anchor @solana/spl-token
```

## Configuration

### RPC Endpoints

```typescript
export const RPC_ENDPOINTS = {
  MAINNET: 'https://api.mainnet-beta.solana.com',
  DEVNET: 'https://api.devnet.solana.com',
  TESTNET: 'https://api.testnet.solana.com',
  LOCALHOST: 'http://localhost:8899',
} as const;

// Recommended: Use dedicated RPC providers
export const PREMIUM_RPC = {
  HELIUS: 'https://rpc.helius.xyz/?api-key=YOUR_KEY',
  QUICKNODE: 'https://YOUR_ENDPOINT.solana-mainnet.quiknode.pro',
  GENESYSGO: 'https://ssc-dao.genesysgo.net',
} as const;
```

### Program IDs (Devnet)

```typescript
export const PROGRAM_IDS = {
  TOKEN: new PublicKey('BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA'),
  NFT: new PublicKey('etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE'),
  VAULT: new PublicKey('5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2'),
  DISTRIBUTION: new PublicKey('bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq'),
} as const;

export const TOKEN_MINT = new PublicKey('6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be');
```

---

## Core SDK

### Connection Setup

```typescript
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';

// Create connection
const connection = new Connection(
  RPC_ENDPOINTS.DEVNET,
  {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  }
);

// Create provider
const provider = new AnchorProvider(
  connection,
  wallet,
  { commitment: 'confirmed' }
);

// Load program
const program = new Program(IDL, PROGRAM_IDS.VAULT, provider);
```

### Wallet Integration

```typescript
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export function useWalletConnection() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  return {
    connection,
    publicKey,
    signTransaction,
    signAllTransactions,
    isConnected: !!publicKey,
  };
}
```

---

## Token Operations

### Get Token Balance

```typescript
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

export async function getTokenBalance(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey
): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(mint, owner);
    const account = await getAccount(connection, tokenAccount);
    return Number(account.amount) / 1e9; // Assuming 9 decimals
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

// Usage
const balance = await getTokenBalance(
  connection,
  wallet.publicKey,
  TOKEN_MINT
);
console.log(`Balance: ${balance} PANGI`);
```

### Transfer Tokens

```typescript
import { createTransferInstruction } from '@solana/spl-token';
import { Transaction } from '@solana/web3.js';

export async function transferTokens(
  connection: Connection,
  payer: Keypair,
  source: PublicKey,
  destination: PublicKey,
  amount: number
): Promise<string> {
  const transaction = new Transaction().add(
    createTransferInstruction(
      source,
      destination,
      payer.publicKey,
      amount * 1e9 // Convert to lamports
    )
  );

  const signature = await connection.sendTransaction(
    transaction,
    [payer],
    { skipPreflight: false }
  );

  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
}
```

### Transfer with Tax

```typescript
export async function transferWithTax(
  program: Program,
  amount: number,
  recipient: PublicKey
): Promise<string> {
  const [taxConfigPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('tax_config')],
    program.programId
  );

  const tx = await program.methods
    .transferWithTax({ amount: new BN(amount * 1e9) })
    .accounts({
      from: program.provider.wallet.publicKey,
      fromTokenAccount: await getAssociatedTokenAddress(
        TOKEN_MINT,
        program.provider.wallet.publicKey
      ),
      toTokenAccount: await getAssociatedTokenAddress(
        TOKEN_MINT,
        recipient
      ),
      conservationFundAccount: CONSERVATION_FUND_ACCOUNT,
      liquidityPoolAccount: LIQUIDITY_POOL_ACCOUNT,
      treasuryAccount: TREASURY_ACCOUNT,
      taxConfig: taxConfigPDA,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  return tx;
}
```

---

## NFT Operations

### Mint NFT

```typescript
export async function mintNFT(
  program: Program,
  name: string,
  symbol: string,
  uri: string
): Promise<{ signature: string; mint: PublicKey }> {
  const mint = Keypair.generate();

  const [nftAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('nft'), mint.publicKey.toBuffer()],
    program.programId
  );

  const tokenAccount = await getAssociatedTokenAddress(
    mint.publicKey,
    program.provider.wallet.publicKey
  );

  const tx = await program.methods
    .mintNft({ name, symbol, uri })
    .accounts({
      payer: program.provider.wallet.publicKey,
      mint: mint.publicKey,
      nftAccount: nftAccountPDA,
      tokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .signers([mint])
    .rpc();

  return { signature: tx, mint: mint.publicKey };
}

// Usage
const { signature, mint } = await mintNFT(
  program,
  'PANGI #1',
  'PANGI',
  'https://arweave.net/...'
);
console.log('Minted NFT:', mint.toString());
```

### Get NFT Details

```typescript
export interface NFTDetails {
  owner: PublicKey;
  mint: PublicKey;
  tier: number;
  evolutionPoints: number;
  createdAt: number;
  lastEvolved: number;
}

export async function getNFTDetails(
  program: Program,
  mint: PublicKey
): Promise<NFTDetails> {
  const [nftAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('nft'), mint.toBuffer()],
    program.programId
  );

  const nftAccount = await program.account.pangiNft.fetch(nftAccountPDA);

  return {
    owner: nftAccount.owner,
    mint: nftAccount.mint,
    tier: nftAccount.tier,
    evolutionPoints: nftAccount.evolutionPoints.toNumber(),
    createdAt: nftAccount.createdAt.toNumber(),
    lastEvolved: nftAccount.lastEvolved.toNumber(),
  };
}
```

### Evolve NFT

```typescript
export async function evolveNFT(
  program: Program,
  mint: PublicKey
): Promise<string> {
  const [nftAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('nft'), mint.toBuffer()],
    program.programId
  );

  const tx = await program.methods
    .evolve()
    .accounts({
      owner: program.provider.wallet.publicKey,
      nftAccount: nftAccountPDA,
    })
    .rpc();

  return tx;
}
```

---

## Staking Operations

### Stake NFT

```typescript
export async function stakeNFT(
  program: Program,
  vault: PublicKey,
  nftMint: PublicKey
): Promise<string> {
  const [stakeAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('stake'), vault.toBuffer(), nftMint.toBuffer()],
    program.programId
  );

  const ownerNftAccount = await getAssociatedTokenAddress(
    nftMint,
    program.provider.wallet.publicKey
  );

  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault_authority'), vault.toBuffer()],
    program.programId
  );

  const vaultNftAccount = await getAssociatedTokenAddress(
    nftMint,
    vaultAuthority,
    true
  );

  const tx = await program.methods
    .stakeNft()
    .accounts({
      owner: program.provider.wallet.publicKey,
      vault,
      stakeAccount: stakeAccountPDA,
      nftMint,
      nftTokenAccount: ownerNftAccount,
      vaultNftAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}
```

### Unstake NFT

```typescript
export async function unstakeNFT(
  program: Program,
  vault: PublicKey,
  nftMint: PublicKey
): Promise<string> {
  const [stakeAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('stake'), vault.toBuffer(), nftMint.toBuffer()],
    program.programId
  );

  const ownerNftAccount = await getAssociatedTokenAddress(
    nftMint,
    program.provider.wallet.publicKey
  );

  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault_authority'), vault.toBuffer()],
    program.programId
  );

  const vaultNftAccount = await getAssociatedTokenAddress(
    nftMint,
    vaultAuthority,
    true
  );

  const tx = await program.methods
    .unstakeNft()
    .accounts({
      owner: program.provider.wallet.publicKey,
      vault,
      stakeAccount: stakeAccountPDA,
      nftTokenAccount: ownerNftAccount,
      vaultNftAccount,
      vaultAuthority,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  return tx;
}
```

### Claim Rewards

```typescript
export async function claimRewards(
  program: Program,
  vault: PublicKey,
  nftMint: PublicKey
): Promise<string> {
  const [stakeAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('stake'), vault.toBuffer(), nftMint.toBuffer()],
    program.programId
  );

  const vaultData = await program.account.vault.fetch(vault);

  const userTokenAccount = await getAssociatedTokenAddress(
    TOKEN_MINT,
    program.provider.wallet.publicKey
  );

  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault_authority'), vault.toBuffer()],
    program.programId
  );

  const tx = await program.methods
    .claimRewards()
    .accounts({
      owner: program.provider.wallet.publicKey,
      vault,
      stakeAccount: stakeAccountPDA,
      rewardPool: vaultData.rewardPool,
      userTokenAccount,
      vaultAuthority,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  return tx;
}
```

### Get Stake Info

```typescript
export interface StakeInfo {
  owner: PublicKey;
  nftMint: PublicKey;
  vault: PublicKey;
  stakedAt: number;
  lastClaim: number;
  accumulatedRewards: number;
  accumulatedPoints: number;
}

export async function getStakeInfo(
  program: Program,
  vault: PublicKey,
  nftMint: PublicKey
): Promise<StakeInfo> {
  const [stakeAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('stake'), vault.toBuffer(), nftMint.toBuffer()],
    program.programId
  );

  const stakeAccount = await program.account.stakeAccount.fetch(stakeAccountPDA);

  return {
    owner: stakeAccount.owner,
    nftMint: stakeAccount.nftMint,
    vault: stakeAccount.vault,
    stakedAt: stakeAccount.stakedAt.toNumber(),
    lastClaim: stakeAccount.lastClaim.toNumber(),
    accumulatedRewards: stakeAccount.accumulatedRewards.toNumber(),
    accumulatedPoints: stakeAccount.accumulatedPoints.toNumber(),
  };
}
```

### Calculate Pending Rewards

```typescript
export async function calculatePendingRewards(
  program: Program,
  vault: PublicKey,
  nftMint: PublicKey
): Promise<{ rewards: number; points: number }> {
  const stakeInfo = await getStakeInfo(program, vault, nftMint);
  const vaultData = await program.account.vault.fetch(vault);

  const currentTime = Math.floor(Date.now() / 1000);
  const timeStaked = currentTime - stakeInfo.lastClaim;

  const rewards = timeStaked * vaultData.rewardRate.toNumber();
  const points = timeStaked * vaultData.evolutionRate.toNumber();

  return {
    rewards: rewards / 1e9, // Convert to tokens
    points,
  };
}
```

---

## Utility Functions

### PDA Derivation

```typescript
export class PDAHelper {
  static getTaxConfigPDA(programId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('tax_config')],
      programId
    );
  }

  static getNFTAccountPDA(
    programId: PublicKey,
    mint: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('nft'), mint.toBuffer()],
      programId
    );
  }

  static getStakeAccountPDA(
    programId: PublicKey,
    vault: PublicKey,
    nftMint: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('stake'), vault.toBuffer(), nftMint.toBuffer()],
      programId
    );
  }

  static getVaultAuthorityPDA(
    programId: PublicKey,
    vault: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('vault_authority'), vault.toBuffer()],
      programId
    );
  }

  static getDistributionConfigPDA(programId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('distribution_config')],
      programId
    );
  }

  static getNFTAllocationPDA(
    programId: PublicKey,
    nftMint: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('allocation'), nftMint.toBuffer()],
      programId
    );
  }
}
```

### Transaction Helpers

```typescript
export class TransactionHelper {
  static async sendAndConfirm(
    connection: Connection,
    transaction: Transaction,
    signers: Keypair[],
    options?: {
      skipPreflight?: boolean;
      commitment?: Commitment;
      maxRetries?: number;
    }
  ): Promise<string> {
    const {
      skipPreflight = false,
      commitment = 'confirmed',
      maxRetries = 3,
    } = options || {};

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const signature = await connection.sendTransaction(
          transaction,
          signers,
          { skipPreflight }
        );

        await connection.confirmTransaction(signature, commitment);
        return signature;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error('Transaction failed after max retries');
  }

  static async getRecentPrioritizationFees(
    connection: Connection
  ): Promise<number> {
    const recentFees = await connection.getRecentPrioritizationFees();
    if (recentFees.length === 0) return 0;

    const fees = recentFees.map(fee => fee.prioritizationFee);
    return Math.max(...fees);
  }
}
```

### Error Handling

```typescript
export class PANGIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PANGIError';
  }
}

export function handleProgramError(error: any): PANGIError {
  if (error.message?.includes('InsufficientEvolutionPoints')) {
    return new PANGIError(
      'Not enough evolution points to evolve',
      'INSUFFICIENT_POINTS',
      error
    );
  }

  if (error.message?.includes('NotNFTOwner')) {
    return new PANGIError(
      'You do not own this NFT',
      'NOT_OWNER',
      error
    );
  }

  if (error.message?.includes('InsufficientRewards')) {
    return new PANGIError(
      'Vault has insufficient rewards',
      'INSUFFICIENT_REWARDS',
      error
    );
  }

  return new PANGIError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    error
  );
}
```

---

## React Hooks

### useProgram

```typescript
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';

export function useProgram(programId: PublicKey, idl: any) {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    return new Program(idl, programId, provider);
  }, [connection, wallet, programId, idl]);

  return program;
}
```

### useTokenBalance

```typescript
export function useTokenBalance(mint: PublicKey) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const bal = await getTokenBalance(connection, publicKey, mint);
        setBalance(bal);
      } catch (error) {
        console.error('Error fetching balance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [connection, publicKey, mint]);

  return { balance, loading };
}
```

### useStakeInfo

```typescript
export function useStakeInfo(vault: PublicKey, nftMint: PublicKey) {
  const program = useProgram(PROGRAM_IDS.VAULT, VaultIDL);
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!program) return;

    const fetchStakeInfo = async () => {
      setLoading(true);
      try {
        const info = await getStakeInfo(program, vault, nftMint);
        setStakeInfo(info);
      } catch (error) {
        console.error('Error fetching stake info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStakeInfo();
    const interval = setInterval(fetchStakeInfo, 5000);
    return () => clearInterval(interval);
  }, [program, vault, nftMint]);

  return { stakeInfo, loading };
}
```

---

## Event Listeners

### Listen for NFT Events

```typescript
export function subscribeToNFTEvents(
  program: Program,
  callback: (event: any) => void
) {
  const listener = program.addEventListener('NFTEvolved', (event, slot) => {
    callback({
      type: 'NFTEvolved',
      mint: event.mint.toString(),
      oldTier: event.oldTier,
      newTier: event.newTier,
      slot,
    });
  });

  return () => {
    program.removeEventListener(listener);
  };
}
```

### Listen for Stake Events

```typescript
export function subscribeToStakeEvents(
  program: Program,
  callback: (event: any) => void
) {
  const stakeListener = program.addEventListener('NFTStaked', (event, slot) => {
    callback({
      type: 'NFTStaked',
      owner: event.owner.toString(),
      nftMint: event.nftMint.toString(),
      vault: event.vault.toString(),
      slot,
    });
  });

  const unstakeListener = program.addEventListener('NFTUnstaked', (event, slot) => {
    callback({
      type: 'NFTUnstaked',
      owner: event.owner.toString(),
      nftMint: event.nftMint.toString(),
      vault: event.vault.toString(),
      slot,
    });
  });

  return () => {
    program.removeEventListener(stakeListener);
    program.removeEventListener(unstakeListener);
  };
}
```

---

## Testing Utilities

### Mock Wallet

```typescript
export class MockWallet implements Wallet {
  constructor(readonly payer: Keypair) {}

  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs.map(tx => {
      tx.partialSign(this.payer);
      return tx;
    });
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }
}
```

### Test Helpers

```typescript
export async function airdropSOL(
  connection: Connection,
  publicKey: PublicKey,
  amount: number = 1
): Promise<void> {
  const signature = await connection.requestAirdrop(
    publicKey,
    amount * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature);
}

export async function createMintAndMintTo(
  connection: Connection,
  payer: Keypair,
  mintAuthority: PublicKey,
  decimals: number,
  amount: number
): Promise<PublicKey> {
  const mint = await createMint(
    connection,
    payer,
    mintAuthority,
    null,
    decimals
  );

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    mintAuthority,
    amount
  );

  return mint;
}
```

---

## Rate Limiting

```typescript
export class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequest = 0;

  constructor(private minInterval: number = 100) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequest;

      if (timeSinceLastRequest < this.minInterval) {
        await new Promise(resolve =>
          setTimeout(resolve, this.minInterval - timeSinceLastRequest)
        );
      }

      const fn = this.queue.shift();
      if (fn) {
        this.lastRequest = Date.now();
        await fn();
      }
    }

    this.processing = false;
  }
}

// Usage
const limiter = new RateLimiter(100); // 100ms between requests

await limiter.execute(() => getTokenBalance(connection, wallet, mint));
```

---

## Next Steps

- 📖 [Frontend Integration](./frontend-integration.md) - Build your UI
- 🧪 [Testing Guide](./testing.md) - Test your integration
- 🏗️ [Architecture](./architecture.md) - Understand the system

---

**Questions?** Join our [Discord](#) or email dev@pangi.io
