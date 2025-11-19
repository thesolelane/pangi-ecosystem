/**
 * Metaplex NFT utilities for loading and interacting with NFT collections
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export interface NFTMetadata {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  image?: string;
  description?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  collection?: {
    name: string;
    family: string;
  };
}

export interface NFT {
  mint: string;
  tokenAccount: string;
  owner: string;
  amount: number;
  metadata?: NFTMetadata;
}

/**
 * Get all NFTs owned by a wallet
 */
export async function getNFTsByOwner(
  connection: Connection,
  ownerPublicKey: PublicKey
): Promise<NFT[]> {
  try {
    // Get all token accounts owned by the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      ownerPublicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    // Filter for NFTs (amount = 1, decimals = 0)
    const nftAccounts = tokenAccounts.value.filter((account) => {
      const parsedInfo = account.account.data.parsed.info;
      return (
        parsedInfo.tokenAmount.decimals === 0 &&
        parsedInfo.tokenAmount.uiAmount === 1
      );
    });

    // Map to NFT objects
    const nfts: NFT[] = nftAccounts.map((account) => {
      const parsedInfo = account.account.data.parsed.info;
      return {
        mint: parsedInfo.mint,
        tokenAccount: account.pubkey.toBase58(),
        owner: parsedInfo.owner,
        amount: parsedInfo.tokenAmount.uiAmount,
      };
    });

    // Fetch metadata for each NFT
    const nftsWithMetadata = await Promise.all(
      nfts.map(async (nft) => {
        const metadata = await getNFTMetadata(connection, new PublicKey(nft.mint));
        return { ...nft, metadata };
      })
    );

    return nftsWithMetadata;
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
}

/**
 * Get NFT metadata from on-chain data
 */
export async function getNFTMetadata(
  connection: Connection,
  mintPublicKey: PublicKey
): Promise<NFTMetadata | undefined> {
  try {
    // Get metadata PDA
    const metadataPDA = await getMetadataPDA(mintPublicKey);
    
    // Fetch metadata account
    const metadataAccount = await connection.getAccountInfo(metadataPDA);
    
    if (!metadataAccount) {
      console.log(`No metadata found for mint ${mintPublicKey.toBase58()}`);
      return undefined;
    }

    // Parse metadata (simplified - full implementation would use Metaplex SDK)
    const metadata = parseMetadataAccount(metadataAccount.data);
    
    // Fetch off-chain metadata from URI
    if (metadata.uri) {
      try {
        const response = await fetch(metadata.uri);
        const offChainMetadata = await response.json();
        
        return {
          ...metadata,
          image: offChainMetadata.image,
          description: offChainMetadata.description,
          attributes: offChainMetadata.attributes,
          collection: offChainMetadata.collection,
        };
      } catch (error) {
        console.error("Error fetching off-chain metadata:", error);
      }
    }

    return metadata;
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return undefined;
  }
}

/**
 * Get metadata PDA for a mint
 */
async function getMetadataPDA(mintPublicKey: PublicKey): Promise<PublicKey> {
  const METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const [metadataPDA] = await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintPublicKey.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  return metadataPDA;
}

/**
 * Parse metadata account data (simplified)
 */
function parseMetadataAccount(data: Buffer): NFTMetadata {
  // This is a simplified parser
  // Full implementation would use Metaplex SDK's deserialize functions
  
  try {
    // Skip first byte (key)
    let offset = 1;
    
    // Skip update authority (32 bytes)
    offset += 32;
    
    // Skip mint (32 bytes)
    const mint = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read name (4 bytes length + string)
    const nameLength = data.readUInt32LE(offset);
    offset += 4;
    const name = data.slice(offset, offset + nameLength).toString('utf8').replace(/\0/g, '');
    offset += nameLength;
    
    // Read symbol (4 bytes length + string)
    const symbolLength = data.readUInt32LE(offset);
    offset += 4;
    const symbol = data.slice(offset, offset + symbolLength).toString('utf8').replace(/\0/g, '');
    offset += symbolLength;
    
    // Read URI (4 bytes length + string)
    const uriLength = data.readUInt32LE(offset);
    offset += 4;
    const uri = data.slice(offset, offset + uriLength).toString('utf8').replace(/\0/g, '');
    
    return {
      mint: mint.toBase58(),
      name: name.trim(),
      symbol: symbol.trim(),
      uri: uri.trim(),
    };
  } catch (error) {
    console.error("Error parsing metadata:", error);
    return {
      mint: "",
      name: "Unknown",
      symbol: "???",
      uri: "",
    };
  }
}

/**
 * Filter NFTs by collection
 */
export function filterNFTsByCollection(
  nfts: NFT[],
  collectionName: string
): NFT[] {
  return nfts.filter((nft) => {
    return (
      nft.metadata?.collection?.name === collectionName ||
      nft.metadata?.collection?.family === collectionName
    );
  });
}

/**
 * Get PANGI NFTs (Pangopups and Adults)
 */
export async function getPangiNFTs(
  connection: Connection,
  ownerPublicKey: PublicKey
): Promise<{
  pangopups: NFT[];
  adults: NFT[];
  specialEditions: NFT[];
}> {
  const allNFTs = await getNFTsByOwner(connection, ownerPublicKey);
  
  // Filter by collection (adjust collection name as needed)
  const pangiNFTs = filterNFTsByCollection(allNFTs, "Obsidian Claw");
  
  // Separate by type based on ID or attributes
  const pangopups = pangiNFTs.filter((nft) => {
    // Pangopups are IDs 1-1500
    const id = extractNFTId(nft);
    return id >= 1 && id <= 1500;
  });
  
  const adults = pangiNFTs.filter((nft) => {
    // Adults are IDs 1501-3000
    const id = extractNFTId(nft);
    return id >= 1501 && id <= 3000;
  });
  
  const specialEditions = pangiNFTs.filter((nft) => {
    // Special editions are IDs 3001+
    const id = extractNFTId(nft);
    return id >= 3001;
  });
  
  return { pangopups, adults, specialEditions };
}

/**
 * Extract NFT ID from name or attributes
 */
function extractNFTId(nft: NFT): number {
  // Try to extract from name (e.g., "Pangopup #42")
  const nameMatch = nft.metadata?.name.match(/#(\d+)/);
  if (nameMatch) {
    return parseInt(nameMatch[1]);
  }
  
  // Try to extract from attributes
  const idAttribute = nft.metadata?.attributes?.find(
    (attr) => attr.trait_type === "ID" || attr.trait_type === "Number"
  );
  if (idAttribute && typeof idAttribute.value === 'number') {
    return idAttribute.value;
  }
  
  return 0;
}

/**
 * Get matching adult ID for a pangopup
 */
export function getMatchingAdultId(pangopupId: number): number {
  return pangopupId + 1500;
}

/**
 * Get matching pangopup ID for an adult
 */
export function getMatchingPangopupId(adultId: number): number {
  return adultId - 1500;
}

/**
 * Check if user has matching pair
 */
export function hasMatchingPair(
  pangopups: NFT[],
  adults: NFT[]
): Array<{ pangopup: NFT; adult: NFT }> {
  const pairs: Array<{ pangopup: NFT; adult: NFT }> = [];
  
  for (const pangopup of pangopups) {
    const pangopupId = extractNFTId(pangopup);
    const matchingAdultId = getMatchingAdultId(pangopupId);
    
    const matchingAdult = adults.find((adult) => {
      return extractNFTId(adult) === matchingAdultId;
    });
    
    if (matchingAdult) {
      pairs.push({ pangopup, adult: matchingAdult });
    }
  }
  
  return pairs;
}
