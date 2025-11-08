import { Connection, Transaction, VersionedTransaction, SimulatedTransactionResponse } from '@solana/web3.js';

export interface SimulationResult {
  success: boolean;
  error?: string;
  logs?: string[];
  unitsConsumed?: number;
}

/**
 * Simulate a transaction before sending it
 * This is a critical security feature to prevent failed transactions
 */
export async function simulateTransaction(
  connection: Connection,
  transaction: Transaction | VersionedTransaction
): Promise<SimulationResult> {
  try {
    let simulation: SimulatedTransactionResponse;

    if (transaction instanceof Transaction) {
      simulation = await connection.simulateTransaction(transaction);
    } else {
      simulation = await connection.simulateTransaction(transaction);
    }

    if (simulation.value.err) {
      return {
        success: false,
        error: parseSimulationError(simulation.value.err),
        logs: simulation.value.logs || [],
      };
    }

    return {
      success: true,
      logs: simulation.value.logs || [],
      unitsConsumed: simulation.value.unitsConsumed,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Simulation failed',
      logs: [],
    };
  }
}

/**
 * Parse simulation error into user-friendly message
 */
function parseSimulationError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error.InstructionError) {
    const [index, instructionError] = error.InstructionError;
    
    if (typeof instructionError === 'string') {
      return `Instruction ${index}: ${instructionError}`;
    }

    if (instructionError.Custom !== undefined) {
      return `Instruction ${index}: Custom error ${instructionError.Custom}`;
    }

    return `Instruction ${index} failed`;
  }

  return 'Transaction simulation failed';
}

/**
 * Estimate transaction fee
 */
export async function estimateTransactionFee(
  connection: Connection,
  transaction: Transaction
): Promise<number> {
  try {
    const { value } = await connection.getFeeForMessage(
      transaction.compileMessage(),
      'confirmed'
    );
    return value || 5000; // Default to 5000 lamports if estimation fails
  } catch (error) {
    console.error('Error estimating fee:', error);
    return 5000; // Default fee
  }
}

/**
 * Calculate tax amount for token transfer
 */
export function calculateTax(amount: number, taxRate: number): {
  taxAmount: number;
  netAmount: number;
} {
  const taxAmount = Math.floor((amount * taxRate) / 10000);
  const netAmount = amount - taxAmount;
  
  return {
    taxAmount,
    netAmount,
  };
}

/**
 * Format transaction error for display
 */
export function formatTransactionError(error: any): string {
  if (!error) return 'Unknown error occurred';

  // Anchor program errors
  if (error.message?.includes('0x')) {
    const errorCode = error.message.match(/0x[0-9a-fA-F]+/)?.[0];
    return `Program error: ${errorCode}`;
  }

  // Common Solana errors
  if (error.message?.includes('insufficient funds')) {
    return 'Insufficient SOL for transaction fees';
  }

  if (error.message?.includes('Blockhash not found')) {
    return 'Transaction expired. Please try again.';
  }

  if (error.message?.includes('User rejected')) {
    return 'Transaction cancelled by user';
  }

  // Custom program errors
  if (error.message?.includes('InsufficientBalance')) {
    return 'Insufficient token balance';
  }

  if (error.message?.includes('SlippageExceeded')) {
    return 'Tax amount higher than expected. Try again.';
  }

  if (error.message?.includes('VaultInactive')) {
    return 'Vault is currently inactive';
  }

  if (error.message?.includes('InsufficientEvolutionPoints')) {
    return 'Not enough evolution points to evolve';
  }

  if (error.message?.includes('CooldownActive')) {
    return 'Cooldown period active. Please wait.';
  }

  // Default
  return error.message || 'Transaction failed';
}

/**
 * Retry transaction with exponential backoff
 */
export async function sendTransactionWithRetry(
  connection: Connection,
  transaction: Transaction,
  signers: any[],
  maxRetries: number = 3
): Promise<string> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const signature = await connection.sendTransaction(
        transaction,
        signers,
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(
        signature,
        'confirmed'
      );

      if (confirmation.value.err) {
        throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
      }

      return signature;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if user rejected
      if (error.message?.includes('User rejected')) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

/**
 * Check if transaction would succeed
 */
export async function wouldTransactionSucceed(
  connection: Connection,
  transaction: Transaction
): Promise<boolean> {
  const simulation = await simulateTransaction(connection, transaction);
  return simulation.success;
}

/**
 * Get recent prioritization fees for faster confirmation
 */
export async function getRecentPrioritizationFees(
  connection: Connection
): Promise<number> {
  try {
    const recentFees = await connection.getRecentPrioritizationFees();
    
    if (recentFees.length === 0) {
      return 0;
    }

    // Get median fee
    const fees = recentFees
      .map(fee => fee.prioritizationFee)
      .sort((a, b) => a - b);
    
    const medianIndex = Math.floor(fees.length / 2);
    return fees[medianIndex];
  } catch (error) {
    console.error('Error getting prioritization fees:', error);
    return 0;
  }
}

/**
 * Add compute budget instruction for complex transactions
 */
export function addComputeBudget(
  transaction: Transaction,
  units: number = 200000,
  microLamports: number = 1
): Transaction {
  // This would require importing @solana/web3.js ComputeBudgetProgram
  // For now, return transaction as-is
  // TODO: Implement when needed
  return transaction;
}

/**
 * Validate transaction before sending
 */
export interface TransactionValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export async function validateTransaction(
  connection: Connection,
  transaction: Transaction,
  payer: string
): Promise<TransactionValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check if payer has enough SOL
    const balance = await connection.getBalance(new (await import('@solana/web3.js')).PublicKey(payer));
    const estimatedFee = await estimateTransactionFee(connection, transaction);
    
    if (balance < estimatedFee) {
      errors.push(`Insufficient SOL for fees. Need ${estimatedFee / 1e9} SOL, have ${balance / 1e9} SOL`);
    }

    // Simulate transaction
    const simulation = await simulateTransaction(connection, transaction);
    
    if (!simulation.success) {
      errors.push(simulation.error || 'Transaction simulation failed');
    }

    // Check compute units
    if (simulation.unitsConsumed && simulation.unitsConsumed > 200000) {
      warnings.push('Transaction may require additional compute units');
    }

    // Check for suspicious patterns
    if (transaction.instructions.length > 10) {
      warnings.push('Transaction has many instructions. Verify carefully.');
    }

  } catch (error: any) {
    errors.push(error.message || 'Validation failed');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
