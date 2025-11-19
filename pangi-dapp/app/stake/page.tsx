"use client";

import { useState, useEffect } from "react";

export default function StakePage() {
  const [mounted, setMounted] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("10000");
  const [lockDuration, setLockDuration] = useState(90);
  const [earlyUnlockDay, setEarlyUnlockDay] = useState(45);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // APY rates (basis points)
  const apyRates: Record<number, number> = {
    30: 5,
    60: 8,
    90: 12,
    180: 18,
    365: 25,
  };

  const calculateRewards = () => {
    const amount = parseFloat(stakeAmount) || 0;
    const apy = apyRates[lockDuration] || 0;
    const totalPotentialRewards = (amount * apy) / 100;
    
    // Full duration rewards
    const fullRewards = totalPotentialRewards;
    
    // Early unlock calculations
    const timePercentage = earlyUnlockDay / lockDuration;
    const proportionalRewards = totalPotentialRewards * timePercentage;
    const penalty = proportionalRewards * 0.15;
    const userPayout = proportionalRewards * 0.85;
    
    return {
      fullRewards,
      proportionalRewards,
      penalty,
      userPayout,
      timePercentage: timePercentage * 100,
    };
  };

  // Mock staking statistics (would come from on-chain data)
  const stakingStats = {
    totalStaked: 5000000,
    totalStakers: 1234,
    totalRewardsPaid: 250000,
    totalPenaltiesCollected: 12500,
    stakesToday: 45,
    unlocksToday: 32,
    earlyUnlocksToday: 8,
  };

  // Mock user stakes (would come from wallet connection)
  const userStakes = [
    {
      id: 1,
      amount: 50000,
      lockDuration: 90,
      stakedAt: 1731542400000, // Fixed timestamp
      unlockAt: 1739318400000, // Fixed timestamp
      apy: 12,
      isActive: true,
    },
    {
      id: 2,
      amount: 25000,
      lockDuration: 180,
      stakedAt: 1723766400000, // Fixed timestamp
      unlockAt: 1739318400000, // Fixed timestamp
      apy: 18,
      isActive: true,
    },
  ];

  const rewards = calculateRewards();

  const calculateUserStakeRewards = (stake: typeof userStakes[0]) => {
    const now = Date.now();
    const timeStaked = now - stake.stakedAt;
    const lockDuration = stake.unlockAt - stake.stakedAt;
    const timePercentage = Math.min(timeStaked / lockDuration, 1);
    const daysStaked = Math.floor(timeStaked / (24 * 60 * 60 * 1000));
    const totalDays = Math.floor(lockDuration / (24 * 60 * 60 * 1000));
    const daysRemaining = Math.max(0, totalDays - daysStaked);
    
    const totalPotentialRewards = (stake.amount * stake.apy) / 100;
    const currentProportionalRewards = totalPotentialRewards * timePercentage;
    const earlyUnlockPenalty = currentProportionalRewards * 0.15;
    const earlyUnlockPayout = currentProportionalRewards * 0.85;
    
    return {
      timePercentage: timePercentage * 100,
      daysStaked,
      daysRemaining,
      totalPotentialRewards,
      currentProportionalRewards,
      earlyUnlockPenalty,
      earlyUnlockPayout,
      isUnlocked: now >= stake.unlockAt,
    };
  };

  if (!mounted) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ color: "#9AA3AE", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "40px", paddingTop: "40px", paddingBottom: "80px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <section>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 
            style={{
              fontSize: "48px",
              lineHeight: "1.1",
              fontWeight: 800,
              margin: "0 0 16px",
              background: "linear-gradient(135deg, #9945FF 0%, #F3F6F9 50%, #C9D1D9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            PANGI Staking
          </h1>
          <p style={{ color: "#9AA3AE", fontSize: "18px", margin: 0 }}>
            Stake PANGI tokens and earn proportional rewards with flexible early unlock
          </p>
        </div>
      </section>

      {/* Global Statistics */}
      <section>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div
            style={{
              background: "#13161B",
              border: "1px solid #2A313B",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px", fontWeight: 600 }}>Total Staked</p>
            <p style={{ color: "#14F195", fontSize: "24px", fontWeight: 700, margin: 0 }}>
              {stakingStats.totalStaked.toLocaleString()} PANGI
            </p>
          </div>

          <div
            style={{
              background: "#13161B",
              border: "1px solid #2A313B",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px", fontWeight: 600 }}>Active Stakers</p>
            <p style={{ color: "#9945FF", fontSize: "24px", fontWeight: 700, margin: 0 }}>
              {stakingStats.totalStakers.toLocaleString()}
            </p>
          </div>

          <div
            style={{
              background: "#13161B",
              border: "1px solid #2A313B",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px", fontWeight: 600 }}>Rewards Paid</p>
            <p style={{ color: "#FFA500", fontSize: "24px", fontWeight: 700, margin: 0 }}>
              {stakingStats.totalRewardsPaid.toLocaleString()} PANGI
            </p>
          </div>

          <div
            style={{
              background: "#13161B",
              border: "1px solid #2A313B",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px", fontWeight: 600 }}>Penalties to Pool</p>
            <p style={{ color: "#FF6B6B", fontSize: "24px", fontWeight: 700, margin: 0 }}>
              {stakingStats.totalPenaltiesCollected.toLocaleString()} PANGI
            </p>
          </div>
        </div>

        {/* Today's Activity */}
        <div 
          style={{
            marginTop: "16px",
            background: "#13161B",
            border: "1px solid #2A313B",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "#E6E8EB" }}>
            📊 Today's Activity
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
            <div>
              <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 4px" }}>New Stakes</p>
              <p style={{ color: "#14F195", fontSize: "20px", fontWeight: 700, margin: 0 }}>
                {stakingStats.stakesToday}
              </p>
            </div>
            <div>
              <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 4px" }}>Total Unlocks</p>
              <p style={{ color: "#9945FF", fontSize: "20px", fontWeight: 700, margin: 0 }}>
                {stakingStats.unlocksToday}
              </p>
            </div>
            <div>
              <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 4px" }}>Early Unlocks</p>
              <p style={{ color: "#FF6B6B", fontSize: "20px", fontWeight: 700, margin: 0 }}>
                {stakingStats.earlyUnlocksToday}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Active Stakes */}
      <section>
        <div 
          style={{
            background: "#13161B",
            border: "1px solid #2A313B",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px", color: "#E6E8EB" }}>
            Your Active Stakes
          </h2>

          {userStakes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#9AA3AE" }}>
              <p style={{ fontSize: "16px", margin: 0 }}>No active stakes. Connect your wallet to get started.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {userStakes.map((stake) => {
                const stakeRewards = calculateUserStakeRewards(stake);
                
                return (
                  <div
                    key={stake.id}
                    style={{
                      background: "#1A1F26",
                      border: "1px solid #2A313B",
                      borderRadius: "12px",
                      padding: "24px",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }}>
                      <div>
                        <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 4px" }}>Staked Amount</p>
                        <p style={{ color: "#E6E8EB", fontSize: "20px", fontWeight: 700, margin: 0 }}>
                          {stake.amount.toLocaleString()} PANGI
                        </p>
                      </div>
                      <div>
                        <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 4px" }}>Lock Duration</p>
                        <p style={{ color: "#9945FF", fontSize: "20px", fontWeight: 700, margin: 0 }}>
                          {stake.lockDuration} days @ {stake.apy}% APY
                        </p>
                      </div>
                      <div>
                        <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 4px" }}>Progress</p>
                        <p style={{ color: "#14F195", fontSize: "20px", fontWeight: 700, margin: 0 }}>
                          {stakeRewards.timePercentage.toFixed(1)}%
                        </p>
                        <p style={{ color: "#9AA3AE", fontSize: "12px", margin: "4px 0 0" }}>
                          {stakeRewards.daysStaked} / {stakeRewards.daysStaked + stakeRewards.daysRemaining} days
                        </p>
                      </div>
                      <div>
                        <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 4px" }}>
                          {stakeRewards.isUnlocked ? "Full Rewards" : "Days Remaining"}
                        </p>
                        <p style={{ color: stakeRewards.isUnlocked ? "#14F195" : "#FFA500", fontSize: "20px", fontWeight: 700, margin: 0 }}>
                          {stakeRewards.isUnlocked 
                            ? `${stakeRewards.totalPotentialRewards.toLocaleString(undefined, { maximumFractionDigits: 2 })} PANGI`
                            : stakeRewards.daysRemaining
                          }
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: "20px" }}>
                      <div 
                        style={{
                          width: "100%",
                          height: "8px",
                          background: "#2A313B",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div 
                          style={{
                            width: `${stakeRewards.timePercentage}%`,
                            height: "100%",
                            background: stakeRewards.isUnlocked 
                              ? "linear-gradient(90deg, #14F195 0%, #9945FF 100%)"
                              : "linear-gradient(90deg, #9945FF 0%, #FFA500 100%)",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>

                    {/* Early Unlock Info */}
                    {!stakeRewards.isUnlocked && (
                      <div 
                        style={{
                          background: "rgba(255, 107, 107, 0.1)",
                          border: "1px solid rgba(255, 107, 107, 0.3)",
                          borderRadius: "8px",
                          padding: "16px",
                        }}
                      >
                        <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "#FF6B6B" }}>
                          ⚠️ Early Unlock Available
                        </h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                          <div>
                            <p style={{ color: "#9AA3AE", margin: "0 0 4px" }}>Current Proportional</p>
                            <p style={{ color: "#E6E8EB", fontWeight: 600, margin: 0 }}>
                              {stakeRewards.currentProportionalRewards.toLocaleString(undefined, { maximumFractionDigits: 2 })} PANGI
                            </p>
                          </div>
                          <div>
                            <p style={{ color: "#9AA3AE", margin: "0 0 4px" }}>Penalty (15%)</p>
                            <p style={{ color: "#FF6B6B", fontWeight: 600, margin: 0 }}>
                              -{stakeRewards.earlyUnlockPenalty.toLocaleString(undefined, { maximumFractionDigits: 2 })} PANGI
                            </p>
                          </div>
                          <div>
                            <p style={{ color: "#9AA3AE", margin: "0 0 4px" }}>You Would Get</p>
                            <p style={{ color: "#FFA500", fontWeight: 700, fontSize: "16px", margin: 0 }}>
                              {stakeRewards.earlyUnlockPayout.toLocaleString(undefined, { maximumFractionDigits: 2 })} PANGI
                            </p>
                          </div>
                          <div>
                            <p style={{ color: "#9AA3AE", margin: "0 0 4px" }}>If You Wait</p>
                            <p style={{ color: "#14F195", fontWeight: 700, fontSize: "16px", margin: 0 }}>
                              {stakeRewards.totalPotentialRewards.toLocaleString(undefined, { maximumFractionDigits: 2 })} PANGI
                            </p>
                          </div>
                        </div>
                        <button
                          style={{
                            marginTop: "16px",
                            width: "100%",
                            padding: "12px",
                            background: "transparent",
                            border: "1px solid #FF6B6B",
                            borderRadius: "8px",
                            color: "#FF6B6B",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 107, 107, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          Unlock Early (Lose {stakeRewards.earlyUnlockPenalty.toLocaleString(undefined, { maximumFractionDigits: 0 })} PANGI)
                        </button>
                      </div>
                    )}

                    {/* Claim Button */}
                    {stakeRewards.isUnlocked && (
                      <button
                        style={{
                          width: "100%",
                          padding: "16px",
                          background: "linear-gradient(135deg, #14F195 0%, #9945FF 100%)",
                          border: "none",
                          borderRadius: "8px",
                          color: "#FFFFFF",
                          fontSize: "16px",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 4px 16px rgba(20, 241, 149, 0.4)",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 6px 20px rgba(20, 241, 149, 0.6)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 16px rgba(20, 241, 149, 0.4)";
                        }}
                      >
                        Claim {stakeRewards.totalPotentialRewards.toLocaleString(undefined, { maximumFractionDigits: 2 })} PANGI Rewards
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Staking Calculator */}
      <section>
        <div 
          style={{
            background: "#13161B",
            border: "1px solid #2A313B",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px", color: "#E6E8EB" }}>
            Staking Calculator
          </h2>

          {/* Stake Amount Input */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", color: "#9AA3AE", fontSize: "14px", marginBottom: "8px", fontWeight: 600 }}>
              Stake Amount (PANGI)
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
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
              placeholder="Enter amount"
            />
          </div>

          {/* Lock Duration Selector */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", color: "#9AA3AE", fontSize: "14px", marginBottom: "12px", fontWeight: 600 }}>
              Lock Duration
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px" }}>
              {[30, 60, 90, 180, 365].map((days) => (
                <button
                  key={days}
                  onClick={() => setLockDuration(days)}
                  style={{
                    padding: "12px",
                    background: lockDuration === days ? "#9945FF" : "#1A1F26",
                    border: `1px solid ${lockDuration === days ? "#9945FF" : "#2A313B"}`,
                    borderRadius: "8px",
                    color: lockDuration === days ? "#FFFFFF" : "#9AA3AE",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (lockDuration !== days) {
                      e.currentTarget.style.borderColor = "#9945FF";
                      e.currentTarget.style.color = "#E6E8EB";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (lockDuration !== days) {
                      e.currentTarget.style.borderColor = "#2A313B";
                      e.currentTarget.style.color = "#9AA3AE";
                    }
                  }}
                >
                  {days} days
                  <br />
                  <span style={{ fontSize: "12px", opacity: 0.8 }}>{apyRates[days]}% APY</span>
                </button>
              ))}
            </div>
          </div>

          {/* Full Duration Rewards */}
          <div 
            style={{
              background: "#1A1F26",
              border: "1px solid #2A313B",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "#E6E8EB" }}>
              Full Duration Rewards
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 4px" }}>Lock Duration</p>
                <p style={{ color: "#E6E8EB", fontSize: "20px", fontWeight: 700, margin: 0 }}>
                  {lockDuration} days
                </p>
              </div>
              <div>
                <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 4px" }}>APY</p>
                <p style={{ color: "#9945FF", fontSize: "20px", fontWeight: 700, margin: 0 }}>
                  {apyRates[lockDuration]}%
                </p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 4px" }}>Total Rewards</p>
                <p style={{ color: "#14F195", fontSize: "24px", fontWeight: 700, margin: 0 }}>
                  {rewards.fullRewards.toLocaleString(undefined, { maximumFractionDigits: 2 })} PANGI
                </p>
              </div>
            </div>
          </div>

          {/* Early Unlock Calculator */}
          <div 
            style={{
              background: "#1A1F26",
              border: "1px solid #FF6B6B",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "#E6E8EB" }}>
              ⚠️ Early Unlock Calculator
            </h3>
            
            {/* Early Unlock Day Slider */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#9AA3AE", fontSize: "13px", marginBottom: "8px" }}>
                Unlock at day: {earlyUnlockDay} ({rewards.timePercentage.toFixed(1)}% of duration)
              </label>
              <input
                type="range"
                min="1"
                max={lockDuration}
                value={earlyUnlockDay}
                onChange={(e) => setEarlyUnlockDay(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "#9945FF",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#9AA3AE", marginTop: "4px" }}>
                <span>Day 1</span>
                <span>Day {lockDuration}</span>
              </div>
            </div>

            {/* Early Unlock Results */}
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9AA3AE", fontSize: "14px" }}>Proportional Rewards</span>
                <span style={{ color: "#E6E8EB", fontSize: "16px", fontWeight: 600 }}>
                  {rewards.proportionalRewards.toLocaleString(undefined, { maximumFractionDigits: 2 })} PANGI
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#FF6B6B", fontSize: "14px" }}>Penalty (15%)</span>
                <span style={{ color: "#FF6B6B", fontSize: "16px", fontWeight: 600 }}>
                  -{rewards.penalty.toLocaleString(undefined, { maximumFractionDigits: 2 })} PANGI
                </span>
              </div>
              <div 
                style={{
                  borderTop: "1px solid #2A313B",
                  paddingTop: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#9AA3AE", fontSize: "14px", fontWeight: 600 }}>Your Payout</span>
                <span style={{ color: "#FFA500", fontSize: "20px", fontWeight: 700 }}>
                  {rewards.userPayout.toLocaleString(undefined, { maximumFractionDigits: 2 })} PANGI
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9AA3AE", fontSize: "13px" }}>Returns to Pool</span>
                <span style={{ color: "#9945FF", fontSize: "14px", fontWeight: 600 }}>
                  +{rewards.penalty.toLocaleString(undefined, { maximumFractionDigits: 2 })} PANGI
                </span>
              </div>
            </div>

            {/* Warning Message */}
            <div 
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "rgba(255, 107, 107, 0.1)",
                border: "1px solid rgba(255, 107, 107, 0.3)",
                borderRadius: "8px",
              }}
            >
              <p style={{ color: "#FF6B6B", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
                <strong>Early unlock penalty:</strong> You'll receive {rewards.timePercentage.toFixed(1)}% of rewards minus 15% penalty. 
                The penalty returns to the reward pool for future stakers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* APY Tiers Table */}
      <section>
        <div 
          style={{
            background: "#13161B",
            border: "1px solid #2A313B",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px", color: "#E6E8EB" }}>
            APY Tiers & Early Unlock Examples
          </h2>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2A313B" }}>
                  <th style={{ padding: "12px", textAlign: "left", color: "#9AA3AE", fontSize: "13px", fontWeight: 600 }}>Duration</th>
                  <th style={{ padding: "12px", textAlign: "left", color: "#9AA3AE", fontSize: "13px", fontWeight: 600 }}>APY</th>
                  <th style={{ padding: "12px", textAlign: "right", color: "#9AA3AE", fontSize: "13px", fontWeight: 600 }}>Full Rewards</th>
                  <th style={{ padding: "12px", textAlign: "right", color: "#9AA3AE", fontSize: "13px", fontWeight: 600 }}>Early (50%)</th>
                  <th style={{ padding: "12px", textAlign: "right", color: "#9AA3AE", fontSize: "13px", fontWeight: 600 }}>Penalty</th>
                </tr>
              </thead>
              <tbody>
                {[30, 60, 90, 180, 365].map((days) => {
                  const apy = apyRates[days];
                  const fullRewards = (10000 * apy) / 100;
                  const halfRewards = fullRewards * 0.5;
                  const penalty = halfRewards * 0.15;
                  const payout = halfRewards * 0.85;
                  
                  return (
                    <tr key={days} style={{ borderBottom: "1px solid #2A313B" }}>
                      <td style={{ padding: "12px", color: "#E6E8EB", fontSize: "14px" }}>{days} days</td>
                      <td style={{ padding: "12px", color: "#9945FF", fontSize: "14px", fontWeight: 600 }}>{apy}%</td>
                      <td style={{ padding: "12px", textAlign: "right", color: "#14F195", fontSize: "14px", fontWeight: 600 }}>
                        {fullRewards.toLocaleString()} PANGI
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", color: "#FFA500", fontSize: "14px", fontWeight: 600 }}>
                        {payout.toLocaleString(undefined, { maximumFractionDigits: 1 })} PANGI
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", color: "#FF6B6B", fontSize: "14px" }}>
                        {penalty.toLocaleString(undefined, { maximumFractionDigits: 1 })} PANGI
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p style={{ color: "#9AA3AE", fontSize: "13px", marginTop: "16px", fontStyle: "italic" }}>
            * Based on 10,000 PANGI stake. Early unlock at 50% of duration shown as example.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <div 
          style={{
            background: "#13161B",
            border: "1px solid #2A313B",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px", color: "#E6E8EB" }}>
            How Proportional Rewards Work
          </h2>
          
          <div style={{ display: "grid", gap: "20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: "#9945FF" }}>
                1. Stake Your PANGI
              </h3>
              <p style={{ color: "#9AA3AE", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                Choose your stake amount and lock duration (30, 60, 90, 180, or 365 days). Longer locks earn higher APY.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: "#9945FF" }}>
                2. Earn Rewards Over Time
              </h3>
              <p style={{ color: "#9AA3AE", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                Your rewards accumulate daily based on your APY rate. Complete the full duration to receive 100% of rewards.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: "#9945FF" }}>
                3. Early Unlock Option
              </h3>
              <p style={{ color: "#9AA3AE", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                Need liquidity? Unlock early and receive proportional rewards minus 15% penalty. The penalty returns to the reward pool, benefiting all stakers.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: "#9945FF" }}>
                4. Formula
              </h3>
              <div 
                style={{
                  background: "#1A1F26",
                  border: "1px solid #2A313B",
                  borderRadius: "8px",
                  padding: "16px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  color: "#E6E8EB",
                }}
              >
                <div>time_percentage = time_staked / lock_duration</div>
                <div>proportional_rewards = time_percentage × total_potential_rewards</div>
                <div>penalty = proportional_rewards × 0.15</div>
                <div style={{ color: "#14F195", fontWeight: 600 }}>user_payout = proportional_rewards × 0.85</div>
                <div style={{ color: "#9945FF" }}>reward_pool += penalty</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center" }}>
        <button
          style={{
            padding: "16px 48px",
            background: "linear-gradient(135deg, #9945FF 0%, #7B3FD1 100%)",
            border: "none",
            borderRadius: "12px",
            color: "#FFFFFF",
            fontSize: "18px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(153, 69, 255, 0.4)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(153, 69, 255, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(153, 69, 255, 0.4)";
          }}
        >
          Connect Wallet to Stake
        </button>
        <p style={{ color: "#9AA3AE", fontSize: "14px", marginTop: "16px" }}>
          Self-custody staking • Proportional rewards • Flexible early unlock
        </p>
      </section>
    </div>
  );
}
