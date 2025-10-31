export type PangiNft = {
  "version": "0.1.0",
  "name": "pangi_nft",
  "instructions": [
    {
      "name": "initializeHatchling",
      "accounts": [
        {
          "name": "hatchling",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
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
          "name": "evolutionCooldown",
          "type": "i64"
        }
      ]
    },
    {
      "name": "evolveHatchling",
      "accounts": [
        {
          "name": "hatchling",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "hatchling",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "stage",
            "type": "string"
          },
          {
            "name": "rarity",
            "type": "string"
          },
          {
            "name": "traits",
            "type": "string"
          },
          {
            "name": "evolutionCount",
            "type": "u8"
          },
          {
            "name": "lastEvolutionTimestamp",
            "type": "i64"
          },
          {
            "name": "evolutionCooldown",
            "type": "i64"
          },
          {
            "name": "generation",
            "type": "u8"
          }
        ]
      }
    }
  ]
};

export const IDL: PangiNft = {
  "version": "0.1.0",
  "name": "pangi_nft",
  "instructions": [
    {
      "name": "initializeHatchling",
      "accounts": [
        {
          "name": "hatchling",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
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
          "name": "evolutionCooldown",
          "type": "i64"
        }
      ]
    },
    {
      "name": "evolveHatchling",
      "accounts": [
        {
          "name": "hatchling",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "hatchling",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "stage",
            "type": "string"
          },
          {
            "name": "rarity",
            "type": "string"
          },
          {
            "name": "traits",
            "type": "string"
          },
          {
            "name": "evolutionCount",
            "type": "u8"
          },
          {
            "name": "lastEvolutionTimestamp",
            "type": "i64"
          },
          {
            "name": "evolutionCooldown",
            "type": "i64"
          },
          {
            "name": "generation",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
