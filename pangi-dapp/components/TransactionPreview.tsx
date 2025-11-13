"use client";

import React from 'react';
import { PublicKey } from '@solana/web3.js';

interface TransactionDetails {
  from?: string;
  to?: string;
  amount?: number;
  token?: string;
  fees?: number;
  tax?: number;
  netAmount?: number;
  total?: number;
  nftMint?: string;
  vault?: string;
  rewardAmount?: number;
  evolutionPoints?: number;
}

interface TransactionPreviewProps {
  action: string;
  details: TransactionDetails;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  simulationResult?: {
    success: boolean;
    error?: string;
    logs?: string[];
  };
}

export const TransactionPreview: React.FC<TransactionPreviewProps> = ({
  action,
  details,
  onConfirm,
  onCancel,
  loading = false,
  simulationResult,
}) => {
  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    try {
      const pubkey = new PublicKey(address);
      const str = pubkey.toString();
      return `${str.slice(0, 4)}...${str.slice(-4)}`;
    } catch {
      return address;
    }
  };

  const formatAmount = (amount?: number, decimals: number = 9) => {
    if (amount === undefined || amount === null) return '0';
    return (amount / Math.pow(10, decimals)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 9,
    });
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onCancel}
    >
      <div 
        style={{
          background: '#13161B',
          border: '1px solid #2A313B',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h3 
            style={{
              fontSize: '24px',
              fontWeight: 700,
              margin: 0,
              background: 'linear-gradient(90deg, #9945FF 0%, #C9D1D9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Confirm {action}
          </h3>
          <p style={{ color: '#9AA3AE', fontSize: '14px', margin: '8px 0 0' }}>
            Review transaction details before confirming
          </p>
        </div>

        {/* Simulation Result */}
        {simulationResult && (
          <div 
            style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: simulationResult.success 
                ? 'rgba(34, 197, 94, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${simulationResult.success ? '#22C55E' : '#EF4444'}`,
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: simulationResult.success ? '#22C55E' : '#EF4444',
              fontWeight: 600,
              fontSize: '14px',
            }}>
              {simulationResult.success ? '✓' : '✗'} 
              {simulationResult.success ? 'Simulation Successful' : 'Simulation Failed'}
            </div>
            {simulationResult.error && (
              <p style={{ 
                color: '#EF4444', 
                fontSize: '12px', 
                margin: '4px 0 0',
              }}>
                {simulationResult.error}
              </p>
            )}
          </div>
        )}

        {/* Transaction Details */}
        <div 
          style={{
            background: '#1A1F26',
            border: '1px solid #2A313B',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          {/* From/To for transfers */}
          {details.from && (
            <DetailRow 
              label="From" 
              value={formatAddress(details.from)}
              copyable={details.from}
            />
          )}
          {details.to && (
            <DetailRow 
              label="To" 
              value={formatAddress(details.to)}
              copyable={details.to}
            />
          )}

          {/* NFT Mint for NFT operations */}
          {details.nftMint && (
            <DetailRow 
              label="NFT" 
              value={formatAddress(details.nftMint)}
              copyable={details.nftMint}
            />
          )}

          {/* Vault for staking operations */}
          {details.vault && (
            <DetailRow 
              label="Vault" 
              value={formatAddress(details.vault)}
              copyable={details.vault}
            />
          )}

          {/* Amount */}
          {details.amount !== undefined && (
            <DetailRow 
              label="Amount" 
              value={`${formatAmount(details.amount)} ${details.token || 'PANGI'}`}
              highlight
            />
          )}

          {/* Tax (for token transfers) */}
          {details.tax !== undefined && details.tax > 0 && (
            <DetailRow 
              label="Tax (2%)" 
              value={`${formatAmount(details.tax)} ${details.token || 'PANGI'}`}
              warning
            />
          )}

          {/* Net Amount (after tax) */}
          {details.netAmount !== undefined && (
            <DetailRow 
              label="Recipient Gets" 
              value={`${formatAmount(details.netAmount)} ${details.token || 'PANGI'}`}
            />
          )}

          {/* Reward Amount (for claims) */}
          {details.rewardAmount !== undefined && (
            <DetailRow 
              label="Rewards" 
              value={`${formatAmount(details.rewardAmount)} ${details.token || 'PANGI'}`}
              highlight
            />
          )}

          {/* Evolution Points (for claims) */}
          {details.evolutionPoints !== undefined && (
            <DetailRow 
              label="Evolution Points" 
              value={details.evolutionPoints.toLocaleString()}
              highlight
            />
          )}

          {/* Network Fees */}
          {details.fees !== undefined && (
            <DetailRow 
              label="Network Fee" 
              value={`~${formatAmount(details.fees, 9)} SOL`}
            />
          )}

          {/* Total */}
          {details.total !== undefined && (
            <div style={{ 
              marginTop: '12px', 
              paddingTop: '12px', 
              borderTop: '1px solid #2A313B',
            }}>
              <DetailRow 
                label="Total" 
                value={`${formatAmount(details.total)} ${details.token || 'PANGI'}`}
                highlight
                bold
              />
            </div>
          )}
        </div>

        {/* Warning Message */}
        {!simulationResult?.success && simulationResult?.error && (
          <div 
            style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <p style={{ 
              color: '#FBBF24', 
              fontSize: '13px', 
              margin: 0,
              fontWeight: 600,
            }}>
              ⚠️ Transaction may fail. Review the error above.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: '#1A1F26',
              color: '#E6E8EB',
              border: '1px solid #2A313B',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.borderColor = '#9945FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2A313B';
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || (simulationResult && !simulationResult.success)}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: loading ? '#6B21A8' : '#9945FF',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading || (simulationResult && !simulationResult.success) ? 'not-allowed' : 'pointer',
              opacity: loading || (simulationResult && !simulationResult.success) ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading && (!simulationResult || simulationResult.success)) {
                e.currentTarget.style.background = '#7d2ae8';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#9945FF';
            }}
          >
            {loading ? 'Processing...' : 'Confirm Transaction'}
          </button>
        </div>

        {/* Security Notice */}
        <p style={{ 
          color: '#9AA3AE', 
          fontSize: '12px', 
          margin: '16px 0 0',
          textAlign: 'center',
        }}>
          🔒 Always verify transaction details before confirming
        </p>
      </div>
    </div>
  );
};

// Helper component for detail rows
interface DetailRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  warning?: boolean;
  bold?: boolean;
  copyable?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ 
  label, 
  value, 
  highlight, 
  warning,
  bold,
  copyable,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (copyable) {
      navigator.clipboard.writeText(copyable);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '8px',
    }}>
      <span style={{ 
        color: '#9AA3AE', 
        fontSize: '14px',
        fontWeight: bold ? 600 : 400,
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ 
          color: warning ? '#FBBF24' : highlight ? '#9945FF' : '#E6E8EB',
          fontSize: '14px',
          fontWeight: bold ? 700 : highlight ? 600 : 400,
          fontFamily: copyable ? 'monospace' : 'inherit',
        }}>
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            style={{
              background: 'transparent',
              border: 'none',
              color: copied ? '#22C55E' : '#9AA3AE',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px 4px',
            }}
            title="Copy address"
          >
            {copied ? '✓' : '📋'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionPreview;
