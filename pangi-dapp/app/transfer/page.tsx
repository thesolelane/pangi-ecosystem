"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export default function TransferPage() {
  const { publicKey, connected } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState("1.0"); // 1% default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tax rates (these should come from the program)
  const TAX_RATE = 2; // 2% default
  const SLIPPAGE_BPS = parseFloat(slippageTolerance) * 100; // Convert % to basis points

  // Calculate tax and net amount
  const calculateTax = () => {
    if (!amount || isNaN(parseFloat(amount))) return { tax: 0, net: 0, maxTax: 0 };
    
    const amountNum = parseFloat(amount);
    const tax = (amountNum * TAX_RATE) / 100;
    const net = amountNum - tax;
    const maxTax = tax * (1 + parseFloat(slippageTolerance) / 100);
    
    return { tax, net, maxTax };
  };

  const { tax, net, maxTax } = calculateTax();

  const validateRecipient = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const handleTransfer = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!connected || !publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    if (!recipient) {
      setError("Please enter a recipient address");
      return;
    }

    if (!validateRecipient(recipient)) {
      setError("Invalid recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement actual transfer logic
      // This will integrate with the Anchor program
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(`Successfully transferred ${net.toFixed(4)} PANGI (${tax.toFixed(4)} tax)`);
      setRecipient("");
      setAmount("");
    } catch (err: any) {
      setError(err.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 
        style={{
          fontSize: "32px",
          fontWeight: 700,
          marginBottom: "8px",
          background: "linear-gradient(90deg, #9945FF 0%, #C9D1D9 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Transfer PANGI Tokens
      </h1>
      <p style={{ color: "#9AA3AE", marginBottom: "32px" }}>
        Send PANGI tokens with automatic tax calculation and slippage protection
      </p>

      {/* Transfer Form */}
      <div 
        style={{
          background: "#13161B",
          border: "1px solid #2A313B",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        {/* Recipient Address */}
        <div style={{ marginBottom: "20px" }}>
          <label 
            style={{
              display: "block",
              color: "#E6E8EB",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address"
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#1A1F26",
              border: "1px solid #2A313B",
              borderRadius: "8px",
              color: "#E6E8EB",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) => e.target.style.borderColor = "#9945FF"}
            onBlur={(e) => e.target.style.borderColor = "#2A313B"}
          />
        </div>

        {/* Amount */}
        <div style={{ marginBottom: "20px" }}>
          <label 
            style={{
              display: "block",
              color: "#E6E8EB",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Amount (PANGI)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#1A1F26",
              border: "1px solid #2A313B",
              borderRadius: "8px",
              color: "#E6E8EB",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) => e.target.style.borderColor = "#9945FF"}
            onBlur={(e) => e.target.style.borderColor = "#2A313B"}
          />
        </div>

        {/* Slippage Tolerance */}
        <div style={{ marginBottom: "24px" }}>
          <label 
            style={{
              display: "block",
              color: "#E6E8EB",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Slippage Tolerance (%)
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {["0.5", "1.0", "2.0"].map((value) => (
              <button
                key={value}
                onClick={() => setSlippageTolerance(value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: slippageTolerance === value ? "#9945FF" : "#1A1F26",
                  border: `1px solid ${slippageTolerance === value ? "#9945FF" : "#2A313B"}`,
                  borderRadius: "8px",
                  color: "#E6E8EB",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {value}%
              </button>
            ))}
            <input
              type="number"
              value={slippageTolerance}
              onChange={(e) => setSlippageTolerance(e.target.value)}
              placeholder="Custom"
              step="0.1"
              min="0"
              max="10"
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "#1A1F26",
                border: "1px solid #2A313B",
                borderRadius: "8px",
                color: "#E6E8EB",
                fontSize: "14px",
                outline: "none",
                textAlign: "center",
              }}
            />
          </div>
        </div>

        {/* Transaction Preview */}
        {amount && parseFloat(amount) > 0 && (
          <div 
            style={{
              background: "#1A1F26",
              border: "1px solid #2A313B",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#E6E8EB", marginBottom: "12px" }}>
              Transaction Preview
            </h3>
            <div style={{ display: "grid", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9AA3AE", fontSize: "14px" }}>Amount:</span>
                <span style={{ color: "#E6E8EB", fontSize: "14px", fontWeight: 600 }}>
                  {parseFloat(amount).toFixed(4)} PANGI
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9AA3AE", fontSize: "14px" }}>Tax ({TAX_RATE}%):</span>
                <span style={{ color: "#F59E0B", fontSize: "14px", fontWeight: 600 }}>
                  -{tax.toFixed(4)} PANGI
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9AA3AE", fontSize: "14px" }}>Max Tax (with slippage):</span>
                <span style={{ color: "#EF4444", fontSize: "14px", fontWeight: 600 }}>
                  -{maxTax.toFixed(4)} PANGI
                </span>
              </div>
              <div 
                style={{
                  borderTop: "1px solid #2A313B",
                  paddingTop: "8px",
                  marginTop: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: "#E6E8EB", fontSize: "14px", fontWeight: 600 }}>Recipient Receives:</span>
                <span style={{ color: "#10B981", fontSize: "14px", fontWeight: 700 }}>
                  {net.toFixed(4)} PANGI
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div 
            style={{
              background: "#EF444420",
              border: "1px solid #EF4444",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "#EF4444",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div 
            style={{
              background: "#10B98120",
              border: "1px solid #10B981",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "#10B981",
              fontSize: "14px",
            }}
          >
            {success}
          </div>
        )}

        {/* Transfer Button */}
        <button
          onClick={handleTransfer}
          disabled={loading || !connected}
          style={{
            width: "100%",
            padding: "14px",
            background: loading || !connected ? "#2A313B" : "#9945FF",
            border: "none",
            borderRadius: "8px",
            color: "#E6E8EB",
            fontSize: "16px",
            fontWeight: 600,
            cursor: loading || !connected ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: loading || !connected ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading && connected) {
              e.currentTarget.style.background = "#8A3FE6";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && connected) {
              e.currentTarget.style.background = "#9945FF";
            }
          }}
        >
          {loading ? "Processing..." : !connected ? "Connect Wallet" : "Transfer Tokens"}
        </button>
      </div>

      {/* Info Box */}
      <div 
        style={{
          marginTop: "24px",
          background: "#1A1F26",
          border: "1px solid #2A313B",
          borderRadius: "12px",
          padding: "16px",
        }}
      >
        <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#E6E8EB", marginBottom: "8px" }}>
          ℹ️ About PANGI Transfers
        </h4>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "#9AA3AE", fontSize: "13px", lineHeight: 1.6 }}>
          <li>A {TAX_RATE}% tax is applied to all transfers</li>
          <li>Tax goes to the Conservation Fund</li>
          <li>Slippage protection prevents unexpected tax increases</li>
          <li>Transactions are irreversible once confirmed</li>
        </ul>
      </div>
    </div>
  );
}
