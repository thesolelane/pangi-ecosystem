import { PublicKey } from "@solana/web3.js";

// Network
export const NETWORK = "devnet";
export const RPC_ENDPOINT = "https://api.devnet.solana.com";

// Program ID strings
export const PANGI_TOKEN_PROGRAM_ID_STR = "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA";
export const PANGI_VAULT_PROGRAM_ID_STR = "5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2";
export const PANGI_NFT_PROGRAM_ID_STR = "etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE";
export const SPECIAL_DISTRIBUTION_PROGRAM_ID_STR = "bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq";
export const PANGI_TOKEN_MINT_STR = "6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be";
export const TAX_CONFIG_PDA_STR = "3qygDfXDqAMcqzmqj6K3crtuSx1VbyjNrA6csEGqRZjS";
export const DISTRIBUTION_CONFIG_PDA_STR = "F99537D8BByU6ZhJjEe1r6Gdz1dxVtqQVbw7vn4K6to2";

// Lazy-loaded PublicKey instances (use these in client components)
let _PANGI_TOKEN_PROGRAM_ID: PublicKey | null = null;
let _PANGI_VAULT_PROGRAM_ID: PublicKey | null = null;
let _PANGI_NFT_PROGRAM_ID: PublicKey | null = null;
let _SPECIAL_DISTRIBUTION_PROGRAM_ID: PublicKey | null = null;
let _PANGI_TOKEN_MINT: PublicKey | null = null;
let _TAX_CONFIG_PDA: PublicKey | null = null;
let _DISTRIBUTION_CONFIG_PDA: PublicKey | null = null;

export const PANGI_TOKEN_PROGRAM_ID = () => _PANGI_TOKEN_PROGRAM_ID || (_PANGI_TOKEN_PROGRAM_ID = new PublicKey(PANGI_TOKEN_PROGRAM_ID_STR));
export const PANGI_VAULT_PROGRAM_ID = () => _PANGI_VAULT_PROGRAM_ID || (_PANGI_VAULT_PROGRAM_ID = new PublicKey(PANGI_VAULT_PROGRAM_ID_STR));
export const PANGI_NFT_PROGRAM_ID = () => _PANGI_NFT_PROGRAM_ID || (_PANGI_NFT_PROGRAM_ID = new PublicKey(PANGI_NFT_PROGRAM_ID_STR));
export const SPECIAL_DISTRIBUTION_PROGRAM_ID = () => _SPECIAL_DISTRIBUTION_PROGRAM_ID || (_SPECIAL_DISTRIBUTION_PROGRAM_ID = new PublicKey(SPECIAL_DISTRIBUTION_PROGRAM_ID_STR));
export const PANGI_TOKEN_MINT = () => _PANGI_TOKEN_MINT || (_PANGI_TOKEN_MINT = new PublicKey(PANGI_TOKEN_MINT_STR));
export const TAX_CONFIG_PDA = () => _TAX_CONFIG_PDA || (_TAX_CONFIG_PDA = new PublicKey(TAX_CONFIG_PDA_STR));
export const DISTRIBUTION_CONFIG_PDA = () => _DISTRIBUTION_CONFIG_PDA || (_DISTRIBUTION_CONFIG_PDA = new PublicKey(DISTRIBUTION_CONFIG_PDA_STR));
