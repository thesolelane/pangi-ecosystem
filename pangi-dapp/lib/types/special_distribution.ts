export type SpecialDistribution = {
  "version": "0.1.0",
  "name": "special_distribution",
  "instructions": [
    {
      "name": "initializeDistribution",
      "accounts": [
        {
          "name": "distributionConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "totalSupply",
          "type": "u64"
        },
        {
          "name": "distributionStart",
          "type": "i64"
        },
        {
          "name": "distributionEnd",
          "type": "i64"
        }
      ]
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "distributionConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimant",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "recipientTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "distributeToVault",
      "accounts": [
        {
          "name": "distributionConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "distributionConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "distributedAmount",
            "type": "u64"
          },
          {
            "name": "distributionStart",
            "type": "i64"
          },
          {
            "name": "distributionEnd",
            "type": "i64"
          },
          {
            "name": "lastDistribution",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "DistributionNotStarted",
      "msg": "Distribution period has not started"
    },
    {
      "code": 6001,
      "name": "DistributionEnded",
      "msg": "Distribution period has ended"
    },
    {
      "code": 6002,
      "name": "InsufficientDistributionFunds",
      "msg": "Insufficient funds in distribution account"
    },
    {
      "code": 6003,
      "name": "ClaimAmountTooLarge",
      "msg": "Claim amount exceeds allowed limit"
    }
  ]
};

export const IDL: SpecialDistribution = {
  "version": "0.1.0",
  "name": "special_distribution",
  "instructions": [
    {
      "name": "initializeDistribution",
      "accounts": [
        {
          "name": "distributionConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "totalSupply",
          "type": "u64"
        },
        {
          "name": "distributionStart",
          "type": "i64"
        },
        {
          "name": "distributionEnd",
          "type": "i64"
        }
      ]
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "distributionConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimant",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "recipientTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "distributeToVault",
      "accounts": [
        {
          "name": "distributionConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "distributionConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "distributedAmount",
            "type": "u64"
          },
          {
            "name": "distributionStart",
            "type": "i64"
          },
          {
            "name": "distributionEnd",
            "type": "i64"
          },
          {
            "name": "lastDistribution",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "DistributionNotStarted",
      "msg": "Distribution period has not started"
    },
    {
      "code": 6001,
      "name": "DistributionEnded",
      "msg": "Distribution period has ended"
    },
    {
      "code": 6002,
      "name": "InsufficientDistributionFunds",
      "msg": "Insufficient funds in distribution account"
    },
    {
      "code": 6003,
      "name": "ClaimAmountTooLarge",
      "msg": "Claim amount exceeds allowed limit"
    }
  ]
};
