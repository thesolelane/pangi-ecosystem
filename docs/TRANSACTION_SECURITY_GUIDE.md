# Transaction Security Implementation Guide

This guide shows how to implement secure transaction handling in the PANGI dApp, addressing **High Priority Issue #8** from the security analysis.

## Overview

Secure transaction handling includes:
1. **Transaction Simulation** - Test before sending
2. **User Preview** - Show all details before confirmation
3. **Error Handling** - Clear, actionable error messages
4. **Retry Logic** - Handle network issues gracefully
5. **Fee Estimation** - Prevent insufficient balance errors

## Components

### 1. TransactionPreview Component

Located at: `pangi-dapp/components/TransactionPreview.tsx`

**Features:**
- Modal dialog with transaction details
- Simulation result display
- PANGI-specific information (tax, evolution points, rewards)
- Address copying functionality
- Loading states
- Security warnings

**Usage:**
```tsx
import { TransactionPreview } from '@/components/TransactionPreview';

<TransactionPreview
  action="Token Transfer"
  details={{
    from: wallet.publicKey.toString(),
    to: recipientAddress,
    amount: 1000,
    token: 'PANGI',
    tax: 20,
    netAmount: 980,
    fees: 5000,
    total: 1000,
  }}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  loading={false}
  simulationResult={{
    success: true,
    logs: ['Program log: Transfer successful'],
    unitsConsumed: 45000,
  }}
/>
```

### 2. Transaction Utilities

Located at: `pangi-dapp/lib/utils/transactions.ts`

**Key Functions:**

#### simulateTransaction
```typescript
const simulation = await simulateTransaction(connection, transaction);
if (!simulation.success) {
  console.error('Simulation failed:', simulation.error);
  return;
}
```

#### estimateTransactionFee
```typescript
const fee = await estimateTransactionFee(connection, transaction);
console.log(`Estimated fee: ${fee / 1e9} SOL`);
```

#### calculateTax
```typescript
const { taxAmount, netAmount } = calculateTax(1000, 200); // 2% tax
console.log(`Tax: ${taxAmount}, Net: ${netAmount}`);
```

#### sendTransactionWithRetry
```typescript
try {
  const signature = await sendTransactionWithRetry(
    connection,
    signedTransaction,
    [],
    3 // max retries
  );
  console.log('Transaction sent:', signature);
} catch (error) {
  console.error('Failed after retries:', error);
}
```

#### formatTransactionError
```typescript
try {
  await sendTransaction();
} catch (error) {
  const userMessage = formatTransactionError(error);
  showError(userMessage); // User-friendly message
}
```

#### validateTransaction
```typescript
const validation = await validateTransaction(
  connection,
  transaction,
  wallet.publicKey.toString()
);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
}
```

## Implementation Pattern

### Standard Flow

```typescript
// 1. User initiates action
const handleTransfer = async () => {
  setLoading(true);
  
  try {
    // 2. Build transaction
    const tx = await buildTransferTransaction(
      connection,
      wallet.publicKey,
      recipient,
      amount
    );
    
    // 3. Validate transaction
    const validation = await validateTransaction(
      connection,
      tx,
      wallet.publicKey.toString()
    );
    
    if (!validation.valid) {
      throw new Error(validation.errors[0]);
    }
    
    // 4. Simulate transaction
    const simulation = await simulateTransaction(connection, tx);
    
    if (!simulation.success) {
      throw new Error(simulation.error);
    }
    
    // 5. Estimate fee
    const fee = await estimateTransactionFee(connection, tx);
    
    // 6. Show preview to user
    setTransactionDetails({
      from: wallet.publicKey.toString(),
      to: recipient.toString(),
      amount: amount,
      fees: fee,
      // ... other details
    });
    setSimulationResult(simulation);
    setShowPreview(true);
    
  } catch (error) {
    showError(formatTransactionError(error));
  } finally {
    setLoading(false);
  }
};

// 7. User confirms
const handleConfirm = async () => {
  setLoading(true);
  
  try {
    // 8. Sign transaction
    const signedTx = await wallet.signTransaction(transaction);
    
    // 9. Send with retry
    const signature = await sendTransactionWithRetry(
      connection,
      signedTx,
      [],
      3
    );
    
    // 10. Success
    showSuccess(`Transaction sent: ${signature}`);
    onSuccess?.(signature);
    
  } catch (error) {
    showError(formatTransactionError(error));
  } finally {
    setLoading(false);
    setShowPreview(false);
  }
};
```

## Integration Examples

### Token Transfer

```typescript
import { 
  simulateTransaction, 
  estimateTransactionFee,
  calculateTax,
  sendTransactionWithRetry 
} from '@/lib/utils/transactions';
import { TransactionPreview } from '@/components/TransactionPreview';

export function TokenTransfer() {
  const [showPreview, setShowPreview] = useState(false);
  const [details, setDetails] = useState(null);
  
  const handleTransfer = async (recipient: string, amount: number) => {
    // Build transaction using your token program
    const tx = await buildTokenTransferTx(recipient, amount);
    
    // Simulate
    const sim = await simulateTransaction(connection, tx);
    if (!sim.success) {
      alert(sim.error);
      return;
    }
    
    // Calculate tax
    const { taxAmount, netAmount } = calculateTax(amount, 200);
    
    // Estimate fee
    const fee = await estimateTransactionFee(connection, tx);
    
    // Show preview
    setDetails({
      from: wallet.publicKey.toString(),
      to: recipient,
      amount,
      tax: taxAmount,
      netAmount,
      fees: fee,
      total: amount,
    });
    setShowPreview(true);
  };
  
  return (
    <>
      <button onClick={() => handleTransfer(recipient, 1000)}>
        Transfer
      </button>
      
      {showPreview && (
        <TransactionPreview
          action="Token Transfer"
          details={details}
          onConfirm={handleConfirm}
          onCancel={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
```

### NFT Evolution

```typescript
export function NFTEvolution() {
  const handleEvolve = async (nftMint: string) => {
    // Build evolution transaction
    const tx = await buildEvolutionTx(nftMint);
    
    // Simulate
    const sim = await simulateTransaction(connection, tx);
    if (!sim.success) {
      alert(sim.error);
      return;
    }
    
    // Get evolution details from simulation logs
    const evolutionPoints = parseEvolutionPoints(sim.logs);
    
    // Show preview
    setDetails({
      nftMint,
      evolutionPoints,
      fees: await estimateTransactionFee(connection, tx),
    });
    setShowPreview(true);
  };
  
  return (
    <TransactionPreview
      action="NFT Evolution"
      details={details}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      simulationResult={simulationResult}
    />
  );
}
```

### Vault Staking

```typescript
export function VaultStaking() {
  const handleStake = async (amount: number) => {
    // Build staking transaction
    const tx = await buildStakeTx(amount);
    
    // Validate
    const validation = await validateTransaction(
      connection,
      tx,
      wallet.publicKey.toString()
    );
    
    if (!validation.valid) {
      alert(validation.errors.join('\n'));
      return;
    }
    
    // Show warnings
    if (validation.warnings.length > 0) {
      console.warn('Warnings:', validation.warnings);
    }
    
    // Simulate
    const sim = await simulateTransaction(connection, tx);
    
    // Show preview
    setDetails({
      vault: vaultAddress,
      amount,
      fees: await estimateTransactionFee(connection, tx),
    });
    setShowPreview(true);
  };
  
  return (
    <TransactionPreview
      action="Stake Tokens"
      details={details}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
```

## Security Benefits

### 1. Prevents Failed Transactions
- Simulation catches errors before sending
- Saves users transaction fees
- Improves user experience

### 2. Transparency
- Users see exactly what will happen
- All costs are shown upfront
- No hidden fees or surprises

### 3. Protection Against Attacks
- Users can verify recipient addresses
- Unusual amounts are highlighted
- Suspicious patterns are warned

### 4. Better Error Messages
- Technical errors are translated to user-friendly messages
- Actionable guidance is provided
- Users understand what went wrong

### 5. Network Resilience
- Automatic retry on network issues
- Exponential backoff prevents spam
- Graceful degradation

## Error Handling

### Common Errors and Solutions

| Error | User Message | Solution |
|-------|-------------|----------|
| `InsufficientBalance` | "Insufficient token balance" | Check balance before transaction |
| `SlippageExceeded` | "Tax amount higher than expected" | Refresh and try again |
| `VaultInactive` | "Vault is currently inactive" | Wait for vault to be active |
| `CooldownActive` | "Cooldown period active" | Show remaining time |
| `InsufficientEvolutionPoints` | "Not enough evolution points" | Show required points |
| `Blockhash not found` | "Transaction expired" | Rebuild transaction |
| `User rejected` | "Transaction cancelled" | No action needed |

### Error Handling Pattern

```typescript
try {
  await sendTransaction();
} catch (error) {
  const message = formatTransactionError(error);
  
  // Log for debugging
  console.error('Transaction error:', error);
  
  // Show user-friendly message
  toast.error(message);
  
  // Track for analytics
  trackError('transaction_failed', {
    error: message,
    action: 'token_transfer',
  });
}
```

## Testing

### Manual Testing Checklist

- [ ] Transaction simulates successfully
- [ ] Preview shows correct amounts
- [ ] Tax calculation is accurate
- [ ] Fee estimation is reasonable
- [ ] Confirm button sends transaction
- [ ] Cancel button closes preview
- [ ] Loading states work correctly
- [ ] Error messages are clear
- [ ] Retry logic works on network issues
- [ ] Success callback is triggered

### Automated Testing

```typescript
describe('Transaction Security', () => {
  it('should simulate before sending', async () => {
    const tx = await buildTransaction();
    const sim = await simulateTransaction(connection, tx);
    expect(sim.success).toBe(true);
  });
  
  it('should calculate tax correctly', () => {
    const { taxAmount, netAmount } = calculateTax(1000, 200);
    expect(taxAmount).toBe(20);
    expect(netAmount).toBe(980);
  });
  
  it('should format errors for users', () => {
    const error = new Error('InsufficientBalance');
    const message = formatTransactionError(error);
    expect(message).toBe('Insufficient token balance');
  });
});
```

## Performance Considerations

### Optimization Tips

1. **Cache Simulation Results**
   - Don't re-simulate if transaction hasn't changed
   - Cache for 30 seconds max

2. **Batch Fee Estimation**
   - Estimate fees for multiple transactions at once
   - Use recent prioritization fees

3. **Debounce User Input**
   - Wait for user to finish typing before simulating
   - Prevents excessive RPC calls

4. **Show Loading States**
   - Simulation can take 1-2 seconds
   - Show spinner during simulation
   - Disable buttons during processing

5. **Prefetch Data**
   - Load account data before building transaction
   - Cache frequently used data

## Next Steps

1. **Implement in All Transaction Flows**
   - Token transfers
   - NFT minting
   - NFT evolution
   - Vault staking/unstaking
   - Reward claiming

2. **Add Analytics**
   - Track simulation failures
   - Monitor transaction success rates
   - Identify common errors

3. **Enhance Preview**
   - Add transaction history
   - Show estimated confirmation time
   - Display network congestion

4. **User Education**
   - Add tooltips explaining fees
   - Show why simulation is important
   - Provide help links

## Resources

- [Solana Transaction Simulation](https://docs.solana.com/developing/clients/jsonrpc-api#simulatetransaction)
- [Wallet Adapter Best Practices](https://github.com/solana-labs/wallet-adapter)
- [PANGI Security Analysis](./SECURITY_ANALYSIS.md)

## Support

For questions or issues:
- Check simulation logs for details
- Review error messages carefully
- Test on devnet first
- Contact team if stuck

---

**Implementation Time:** 2-3 hours  
**Priority:** High  
**Impact:** Prevents failed transactions, improves UX, increases security
