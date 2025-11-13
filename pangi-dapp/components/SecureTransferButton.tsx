"use client";

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { TransactionPreview } from './TransactionPreview';
import { 
  simulateTransaction, 
  estimateTransactionFee,
  calculateTax,
  sendTransactionWithRetry,
  formatTransactionError 
} from '@/lib/utils/transactions';

interface SecureTransferButtonProps {
  recipient: string;
  amount: number;
  token?: string;
  onSuccess?: (signature: string) => void;
  onError?: (error: string) => void;
}

/**
 * Example component showing how to use TransactionPreview with simulation
 * This implements the security best practice of simulating before sending
 */
export default function SecureTransferButton({
  recipient,
  amount,
  token = 'PANGI',
  onSuccess,
  onError,
}: SecureTransferButtonProps) {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<number>(0);

  // Step 1: User clicks transfer button
  const handleInitiateTransfer = async () => {
    if (!publicKey || !signTransaction) {
      onError?.('Wallet not connected');
      return;
    }

    setLoading(true);

    try {
      // Build transaction (this would use your actual program)
      const tx = await buildTransferTransaction(
        connection,
        publicKey,
        new PublicKey(recipient),
        amount
      );

      // Simulate transaction
      const simulation = await simulateTransaction(connection, tx);
      setSimulationResult(simulation);

      // Estimate fee
      const fee = await estimateTransactionFee(connection, tx);
      setEstimatedFee(fee);

      // Store transaction
      setTransaction(tx);

      // Show preview
      setShowPreview(true);
    } catch (error: any) {
      onError?.(formatTransactionError(error));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: User confirms in preview
  const handleConfirm = async () => {
    if (!transaction || !publicKey || !signTransaction) return;

    setLoading(true);

    try {
      // Sign transaction
      const signedTx = await signTransaction(transaction);

      // Send with retry
      const signature = await sendTransactionWithRetry(
        connection,
        signedTx,
        []
      );

      onSuccess?.(signature);
      setShowPreview(false);
    } catch (error: any) {
      onError?.(formatTransactionError(error));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: User cancels
  const handleCancel = () => {
    setShowPreview(false);
    setTransaction(null);
    setSimulationResult(null);
  };

  // Calculate tax (2% for PANGI transfers)
  const { taxAmount, netAmount } = calculateTax(amount, 200); // 200 basis points = 2%

  return (
    <>
      <button
        onClick={handleInitiateTransfer}
        disabled={loading || !publicKey}
        style={{
          padding: '12px 24px',
          background: '#9945FF',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: loading || !publicKey ? 'not-allowed' : 'pointer',
          opacity: loading || !publicKey ? 0.5 : 1,
        }}
      >
        {loading ? 'Preparing...' : 'Transfer Tokens'}
      </button>

      {showPreview && (
        <TransactionPreview
          action="Token Transfer"
          details={{
            from: publicKey?.toString() || '',
            to: recipient,
            amount: amount,
            token: token,
            tax: taxAmount,
            netAmount: netAmount,
            fees: estimatedFee,
            total: amount,
          }}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          loading={loading}
          simulationResult={simulationResult}
        />
      )}
    </>
  );
}

// Helper function to build transfer transaction
// This is a placeholder - you'd use your actual program here
async function buildTransferTransaction(
  connection: any,
  from: PublicKey,
  to: PublicKey,
  amount: number
): Promise<Transaction> {
  // TODO: Implement actual transaction building
  // This would call your token program's transfer_with_tax instruction
  
  const transaction = new Transaction();
  // Add your instructions here
  
  return transaction;
}
