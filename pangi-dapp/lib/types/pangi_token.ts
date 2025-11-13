export type PangiToken = {
  "version": "0.1.0",
  "name": "pangi_token",
  "instructions": [
    {
      "name": "transferWithTax",
      "accounts": [
        {
          "name": "from",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "conservationFund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "taxConfig",
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
      "name": "initializeTaxConfig",
      "accounts": [
        {
          "name": "taxConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "conservationFund",
          "isMut": false,
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
          "name": "p2pTaxRate",
          "type": "u16"
        },
        {
          "name": "exchangeTaxRate",
          "type": "u16"
        },
        {
          "name": "whaleTaxRate",
          "type": "u16"
        },
        {
          "name": "whaleThreshold",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "taxConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "p2pTaxRate",
            "type": "u16"
          },
          {
            "name": "exchangeTaxRate",
            "type": "u16"
          },
          {
            "name": "whaleTaxRate",
            "type": "u16"
          },
          {
            "name": "whaleTransferThreshold",
            "type": "u64"
          },
          {
            "name": "maxTaxPerTransfer",
            "type": "u64"
          },
          {
            "name": "conservationFund",
            "type": "publicKey"
          },
          {
            "name": "lastUpdated",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TransferType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "PeerToPeer"
          },
          {
            "name": "ExchangeDeposit"
          },
          {
            "name": "ConservationReward"
          },
          {
            "name": "LargeWhale"
          }
        ]
      }
    }
  ]
};

export const IDL: PangiToken = {
  "version": "0.1.0",
  "name": "pangi_token",
  "instructions": [
    {
      "name": "transferWithTax",
      "accounts": [
        {
          "name": "from",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "conservationFund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "taxConfig",
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
      "name": "initializeTaxConfig",
      "accounts": [
        {
          "name": "taxConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "conservationFund",
          "isMut": false,
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
          "name": "p2pTaxRate",
          "type": "u16"
        },
        {
          "name": "exchangeTaxRate",
          "type": "u16"
        },
        {
          "name": "whaleTaxRate",
          "type": "u16"
        },
        {
          "name": "whaleThreshold",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "taxConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "p2pTaxRate",
            "type": "u16"
          },
          {
            "name": "exchangeTaxRate",
            "type": "u16"
          },
          {
            "name": "whaleTaxRate",
            "type": "u16"
          },
          {
            "name": "whaleTransferThreshold",
            "type": "u64"
          },
          {
            "name": "maxTaxPerTransfer",
            "type": "u64"
          },
          {
            "name": "conservationFund",
            "type": "publicKey"
          },
          {
            "name": "lastUpdated",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TransferType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "PeerToPeer"
          },
          {
            "name": "ExchangeDeposit"
          },
          {
            "name": "ConservationReward"
          },
          {
            "name": "LargeWhale"
          }
        ]
      }
    }
  ]
};
