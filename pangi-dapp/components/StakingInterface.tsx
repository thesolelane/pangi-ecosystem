"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { PANGI_TOKEN_MINT, CATH_TOKEN_MINT, PANGI_TOKEN_PROGRAM_ID } from "@/lib/constants";
import { 
  stakePangi, 
  unstakePangi, 
  claimRewards,
  calculateStakingRewards,
  calculateEarlyUnlockPenalty,
  getApyForLockDuration,
  getUserStakeAccounts,
  StakeAccount,
} from "@/lib/solana/staking";
import { getTokenBalance } from "@/lib/solana/tokens";

export default function StakingInterface() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("10000");
  const [lockDuration, setLockDuration] = useState(90);
  const [pangiBalance, setPangiBalance] = useState(0);
  const [cathBalance, setCathBalance] = useState(0);
  const [userStakes, setUserStakes] = useState<StakeAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!publicKey) {
      setPangiBalance(0);
      setCathBalance(0);
      setUserStakes([]);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch token balances
        const pangi = await getTokenBalance(connection, publicKey, PANGI_TOKEN_MINT());
        const cath = await getTokenBalance(connection, publicKey, CATH_TOKEN_MINT());
        
        setPangiBalance(pangi?.uiAmount || 0);
        setCathBalance(cath?.uiAmount || 0);

        // Fetch user's stake accounts
        const stakes = await getUserStakeAccounts(
          connection,
          publicKey,
          PANGI_TOKEN_PROGRAM_ID()
        );
        setUserStakes(stakes);
      } catch (error) {
        console.error("Error fetching staking data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  const handleStake = async () => {
    if (!publicKey || !sendTransaction) {
      setTxStatus("Please connect your wallet");
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      setTxStatus("Invalid stake amount");
      return;
    }

    if (amount > pangiBalance) {
      setTxStatus("Insufficient PANGI balance");
      return;
    }

    setLoading(true);
    setTxStatus("Preparing transaction...");

    try {
      const signature = await stakePangi(
        connection,
        { publicKey, sendTransaction } as any,
        amount,
        lockDuration,
        PANGI_TOKEN_PROGRAM_ID(),
        PANGI_TOKEN_MINT()
      );

      setTxStatus(`Success! Transaction: ${signature.slice(0, 8)}...`);
      setStakeAmount("");
      
      // Refresh data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Staking error:", error);
      setTxStatus(`Error: ${error.message || "Transaction failed"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async (stakeAccountPubkey: string) => {
    if (!publicKey || !sendTransaction) {
      return;
    }

    setLoading(true);
    setTxStatus("Unstaking...");

    try {
      const signature = await unstakePangi(
        connection,
        { publicKey, sendTransaction } as any,
        new (await import("@solana/web3.js")).PublicKey(stakeAccountPubkey),
        PANGI_TOKEN_PROGRAM_ID()
      );

      setTxStatus(`Unstaked! Transaction: ${signature.slice(0, 8)}...`);
      
      // Refresh data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Unstaking error:", error);
      setTxStatus(`Error: ${error.message || "Transaction failed"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async (stakeAccountPubkey: string) => {
    if (!publicKey || !sendTransaction) {
      return;
    }

    setLoading(true);
    setTxStatus("Claiming rewards...");

    try {
      const signature = await claimRewards(
        connection,
        { publicKey, sendTransaction } as any,
        new (await import("@solana/web3.js")).PublicKey(stakeAccountPubkey),
        PANGI_TOKEN_PROGRAM_ID(),
        CATH_TOKEN_MINT()
      );

      setTxStatus(`Claimed! Transaction: ${signature.slice(0, 8)}...`);
      
      // Refresh data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Claim error:", error);
      setTxStatus(`Error: ${error.message || "Transaction failed"}`);
    } finally {
      setLoading(false);
    }
  };

  const apy = getApyForLockDuration(lockDuration);
  const amount = parseFloat(stakeAmount) || 0;
  const rewards = calculateStakingRewards(amount, apy, lockDuration);

  const cardStyle = {
    background: "#13161B",
    border: "1px solid #2A313B",
    borderRadius: "16px",
    padding: "24px",
    backdropFilter: "blur(6px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
  };

  if (!mounted) {
    return (
      <div style={cardStyle}>
        <p style={{ color: "#9AA3AE", textAlign: "center" }}>Loading...</p>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ fontSize: "48px", margin: "0 0 16px" }}>🔒</p>
          <p style={{ color: "#9AA3AE", fontSize: "16px", margin: "0 0 24px" }}>
            Connect wallet to start staking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Staking Form */}
      <div style={cardStyle}>
        <h2 
          style={{
            fontSize: "24px",
            fontWeight: 700,
            margin: "0 0 24px",
            background: "linear-gradient(90deg, #9945FF 0%, #14F195 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Stake PANGI, Earn CATH
        </h2>

        {/* Balance Display */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          <div style={{ padding: "12px", background: "#1A1F26", borderRadius: "8px" }}>
            <p style={{ color: "#9AA3AE", fontSize: "12px", margin: "0 0 4px" }}>PANGI Balance</p>
            <p style={{ color: "#9945FF", fontSize: "20px", fontWeight: 700, margin: 0 }}>
              {pangiBalance.toLocaleString()}
            </p>
          </div>
          <div style={{ padding: "12px", background: "#1A1F26", borderRadius: "8px" }}>
            <p style={{ color: "#9AA3AE", fontSize: "12px", margin: "0 0 4px" }}>CATH Balance</p>
            <p style={{ color: "#FFA500", fontSize: "20px", fontWeight: 700, margin: 0 }}>
              {cathBalance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Stake Amount Input */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", color: "#E6E8EB", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
            Stake Amount (PANGI)
          </label>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="10000"
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#1A1F26",
              border: "1px solid #2A313B",
              borderRadius: "8px",
              color: "#E6E8EB",
              fontSize: "16px",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            {[1000, 10000, 100000].map((preset) => (
              <button
                key={preset}
                onClick={() => setStakeAmount(preset.toString())}
                style={{
                  padding: "6px 12px",
                  background: "#2A313B",
                  border: "none",
                  borderRadius: "6px",
                  color: "#9AA3AE",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {preset.toLocaleString()}
              </button>
            ))}
            <button
              onClick={() => setStakeAmount(pangiBalance.toString())}
              style={{
                padding: "6px 12px",
                background: "#2A313B",
                border: "none",
                borderRadius: "6px",
                color: "#9945FF",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              MAX
            </button>
          </div>
        </div>

        {/* Lock Duration Selector */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", color: "#E6E8EB", fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>
            Lock Duration
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {[
              { days: 30, apy: 30 },
              { days: 60, apy: 50 },
              { days: 90, apy: 75 },
              { days: 180, apy: 100 },
            ].map((option) => (
              <button
                key={option.days}
                onClick={() => setLockDuration(option.days)}
                style={{
                  padding: "12px",
                  background: lockDuration === option.days 
                    ? "linear-gradient(135deg, #9945FF 0%, #7B3FD1 100%)"
                    : "#2A313B",
                  border: "none",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div>{option.days} days</div>
                <div style={{ fontSize: "11px", opacity: 0.8 }}>{option.apy}% APY</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rewards Preview */}
        <div 
          style={{
            padding: "16px",
            background: "rgba(153, 69, 255, 0.1)",
            border: "1px solid #9945FF",
            borderRadius: "12px",
            marginBottom: "24px",
          }}
        >
          <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px" }}>
            Estimated Rewards (in CATH)
          </p>
          <p style={{ color: "#14F195", fontSize: "32px", fontWeight: 700, margin: 0 }}>
            {rewards.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p style={{ color: "#9AA3AE", fontSize: "12px", margin: "8px 0 0" }}>
            {apy}% APY over {lockDuration} days
          </p>
        </div>

        {/* Stake Button */}
        <button
          onClick={handleStake}
          disabled={loading || !amount || amount > pangiBalance}
          style={{
            width: "100%",
            padding: "16px",
            background: loading || !amount || amount > pangiBalance
              ? "#2A313B"
              : "linear-gradient(135deg, #9945FF 0%, #7B3FD1 100%)",
            border: "none",
            borderRadius: "12px",
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: 700,
            cursor: loading || !amount || amount > pangiBalance ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {loading ? "Processing..." : "Stake PANGI"}
        </button>

        {/* Transaction Status */}
        {txStatus && (
          <div 
            style={{
              marginTop: "16px",
              padding: "12px",
              background: txStatus.includes("Error") ? "rgba(255, 0, 0, 0.1)" : "rgba(20, 241, 149, 0.1)",
              border: `1px solid ${txStatus.includes("Error") ? "#FF0000" : "#14F195"}`,
              borderRadius: "8px",
              color: txStatus.includes("Error") ? "#FF0000" : "#14F195",
              fontSize: "13px",
            }}
          >
            {txStatus}
          </div>
        )}
      </div>

      {/* Active Stakes */}
      {userStakes.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#E6E8EB", margin: "0 0 20px" }}>
            Your Active Stakes
          </h3>

          <div style={{ display: "grid", gap: "16px" }}>
            {userStakes.map((stake, index) => (
              <StakeCard
                key={index}
                stake={stake}
                onUnstake={handleUnstake}
                onClaim={handleClaimRewards}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StakeCard({ 
  stake, 
  onUnstake, 
  onClaim, 
  loading 
}: { 
  stake: StakeAccount; 
  onUnstake: (pubkey: string) => void;
  onClaim: (pubkey: string) => void;
  loading: boolean;
}) {
  const now = Date.now();
  const timeStaked = now - stake.stakedAt;
  const lockDuration = stake.unlockAt - stake.stakedAt;
  const timePercentage = Math.min(timeStaked / lockDuration, 1);
  const daysStaked = Math.floor(timeStaked / (24 * 60 * 60 * 1000));
  const daysRemaining = Math.max(0, Math.ceil((stake.unlockAt - now) / (24 * 60 * 60 * 1000)));
  const isUnlocked = now >= stake.unlockAt;

  const currentRewards = calculateStakingRewards(stake.amount, stake.apy, daysStaked);
  const earlyUnlock = calculateEarlyUnlockPenalty(stake.amount, stake.apy, daysStaked, stake.lockDuration);

  return (
    <div 
      style={{
        padding: "20px",
        background: "#1A1F26",
        border: "1px solid #2A313B",
        borderRadius: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
        <div>
          <p style={{ color: "#E6E8EB", fontSize: "20px", fontWeight: 700, margin: "0 0 4px" }}>
            {stake.amount.toLocaleString()} PANGI
          </p>
          <p style={{ color: "#9AA3AE", fontSize: "13px", margin: 0 }}>
            {stake.apy}% APY • {stake.lockDuration} days
          </p>
        </div>
        {isUnlocked ? (
          <span 
            style={{
              padding: "4px 12px",
              background: "rgba(20, 241, 149, 0.2)",
              borderRadius: "6px",
              color: "#14F195",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            UNLOCKED
          </span>
        ) : (
          <span 
            style={{
              padding: "4px 12px",
              background: "rgba(153, 69, 255, 0.2)",
              borderRadius: "6px",
              color: "#9945FF",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {daysRemaining}d left
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div 
        style={{
          width: "100%",
          height: "8px",
          background: "#2A313B",
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        <div 
          style={{
            width: `${timePercentage * 100}%`,
            height: "100%",
            background: isUnlocked 
              ? "linear-gradient(90deg, #14F195 0%, #9945FF 100%)"
              : "linear-gradient(90deg, #9945FF 0%, #FFA500 100%)",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Rewards */}
      <div style={{ marginBottom: "16px" }}>
        <p style={{ color: "#9AA3AE", fontSize: "12px", margin: "0 0 4px" }}>Current Rewards</p>
        <p style={{ color: "#14F195", fontSize: "24px", fontWeight: 700, margin: 0 }}>
          {currentRewards.toLocaleString(undefined, { maximumFractionDigits: 2 })} CATH
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <button
          onClick={() => onClaim(stake.owner)}
          disabled={loading || currentRewards === 0}
          style={{
            padding: "10px",
            background: loading || currentRewards === 0 ? "#2A313B" : "linear-gradient(135deg, #14F195 0%, #00D9A3 100%)",
            border: "none",
            borderRadius: "8px",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 600,
            cursor: loading || currentRewards === 0 ? "not-allowed" : "pointer",
          }}
        >
          Claim Rewards
        </button>
        <button
          onClick={() => onUnstake(stake.owner)}
          disabled={loading}
          style={{
            padding: "10px",
            background: loading ? "#2A313B" : isUnlocked ? "linear-gradient(135deg, #9945FF 0%, #7B3FD1 100%)" : "#2A313B",
            border: isUnlocked ? "none" : "1px solid #9945FF",
            borderRadius: "8px",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {isUnlocked ? "Unstake" : `Early (-15%)`}
        </button>
      </div>

      {!isUnlocked && (
        <p style={{ color: "#9AA3AE", fontSize: "11px", margin: "8px 0 0", textAlign: "center" }}>
          Early unlock: {earlyUnlock.userPayout.toFixed(2)} CATH (15% penalty)
        </p>
      )}
    </div>
  );
}
