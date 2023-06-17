import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  ALL_DEPTH_SIZE_PAIRS,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ValidDepthSizePair,
  createAllocTreeIx,
} from "@solana/spl-account-compression";
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  TokenProgramVersion,
  TokenStandard,
  createCreateTreeInstruction,
  createMintToCollectionV1Instruction,
  createSetTreeDelegateInstruction,
  errorFromCode,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  CreateMetadataAccountArgsV3,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
  createSetCollectionSizeInstruction,
  createApproveCollectionAuthorityInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { VAULT_PUBLICKEY } from "@/lib/constants";

export const getCreateTreeTx = async (
  connection: Connection,
  maxDepthSizePair: ValidDepthSizePair,
  canopyDepth: number,
  payerPublicKey: PublicKey
) => {
  const treeKeypair = Keypair.generate();

  const [treeAuthority, _bump] = PublicKey.findProgramAddressSync(
    [treeKeypair.publicKey.toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );

  console.log("maxDepthSizePair", maxDepthSizePair);

  const allocTreeIx = await createAllocTreeIx(
    connection,
    treeKeypair.publicKey,
    payerPublicKey,
    maxDepthSizePair,
    canopyDepth
  );

  const createTreeIx = createCreateTreeInstruction(
    {
      payer: payerPublicKey,
      treeCreator: payerPublicKey,
      treeAuthority,
      merkleTree: treeKeypair.publicKey,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      // NOTE: this is used for some on chain logging
      logWrapper: SPL_NOOP_PROGRAM_ID,
    },
    {
      maxBufferSize: maxDepthSizePair.maxBufferSize,
      maxDepth: maxDepthSizePair.maxDepth,
      public: false,
    },
    BUBBLEGUM_PROGRAM_ID
  );

  //   const changeTreeDelegateIx = createSetTreeDelegateInstruction({
  //     merkleTree: treeKeypair.publicKey,
  //     newTreeDelegate: VAULT_PUBLICKEY,
  //     treeAuthority,
  //     treeCreator: payerPublicKey,
  //   });

  const tx = new Transaction();

  tx.add(allocTreeIx);
  tx.add(createTreeIx);
  //   tx.add(changeTreeDelegateIx);
  tx.feePayer = payerPublicKey;

  return {
    treeAuthority,
    treeAddress: treeKeypair.publicKey,
    tx,
    treeKeypair,
  };
};

export const getCreateCollectionTx = async (
  connection: Connection,
  payerPublicKey: PublicKey,
  metadataV3: CreateMetadataAccountArgsV3,
  collectionSize: number,
  mintAuthority: PublicKey
) => {
  const tx = new Transaction();

  const mintKeypair = Keypair.generate();

  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  const createMintAccountIx = SystemProgram.createAccount({
    fromPubkey: payerPublicKey,
    newAccountPubkey: mintKeypair.publicKey,
    space: MINT_SIZE,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  });

  const initializeMintIx = createInitializeMint2Instruction(
    mintKeypair.publicKey,
    0,
    mintAuthority,
    mintAuthority,
    TOKEN_PROGRAM_ID
  );

  tx.add(createMintAccountIx);
  tx.add(initializeMintIx);

  const associatedToken = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    mintAuthority,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const createTokenAccountIx = createAssociatedTokenAccountInstruction(
    payerPublicKey,
    associatedToken,
    mintAuthority,
    mintKeypair.publicKey
  );

  tx.add(createTokenAccountIx);

  const mintToIx = createMintToInstruction(
    mintKeypair.publicKey,
    associatedToken,
    mintAuthority,
    1,
    [],
    TOKEN_PROGRAM_ID
  );

  tx.add(mintToIx);

  const [metadataAccount, _bump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf8"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const createMetadataIx = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataAccount,
      mint: mintKeypair.publicKey,
      mintAuthority: mintAuthority,
      payer: payerPublicKey,
      updateAuthority: mintAuthority,
    },
    {
      createMetadataAccountArgsV3: metadataV3,
    }
  );

  tx.add(createMetadataIx);

  const [masterEditionAccount, _bump2] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf8"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
      Buffer.from("edition", "utf8"),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const createMasterEditionIx = createCreateMasterEditionV3Instruction(
    {
      edition: masterEditionAccount,
      mint: mintKeypair.publicKey,
      mintAuthority: mintAuthority,
      payer: payerPublicKey,
      updateAuthority: mintAuthority,
      metadata: metadataAccount,
    },
    {
      createMasterEditionArgs: {
        maxSupply: 0,
      },
    }
  );

  tx.add(createMasterEditionIx);

  const collectionSizeIX = createSetCollectionSizeInstruction(
    {
      collectionMetadata: metadataAccount,
      collectionAuthority: payerPublicKey,
      collectionMint: mintKeypair.publicKey,
    },
    {
      setCollectionSizeArgs: { size: collectionSize },
    }
  );

  tx.add(collectionSizeIX);

  tx.feePayer = payerPublicKey;

  return {
    mint: mintKeypair.publicKey,
    tokenAccount: associatedToken,
    metadataAccount,
    masterEditionAccount,
    tx,
    mintKeypair,
  };
};

export const mintCompressedNFTServerMetaplex = async (
  connection: Connection,
  identity: Keypair,
  collectionMint: PublicKey,
  collectionMetadata: PublicKey,
  collectionMasterEditionAccount: PublicKey,
  tree: PublicKey,
  name: string,
  uri: string,
  receiverAddress: PublicKey
) => {
  const [treeAuthority, _bump] = PublicKey.findProgramAddressSync(
    [tree.toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );

  const [bubblegumSigner, _bump2] = PublicKey.findProgramAddressSync(
    [Buffer.from("collection_cpi", "utf8")],
    BUBBLEGUM_PROGRAM_ID
  );

  console.log("identityAddress", identity.publicKey.toBase58());
  console.log("treeAuthority", treeAuthority.toBase58());
  console.log("bubblegumSigner", bubblegumSigner.toBase58());
  console.log("collectionMint", collectionMint.toBase58());
  console.log("collectionMetadata", collectionMetadata.toBase58());
  console.log(
    "collectionMasterEditionAccount",
    collectionMasterEditionAccount.toBase58()
  );
  console.log("tree", tree.toBase58());
  console.log("name", name);
  console.log("uri", uri);
  console.log("receiverAddress", receiverAddress.toBase58());

  const mintIx = createMintToCollectionV1Instruction(
    {
      payer: identity.publicKey,
      merkleTree: tree,
      treeAuthority,
      treeDelegate: identity.publicKey,
      leafOwner: receiverAddress,
      leafDelegate: identity.publicKey,
      collectionAuthority: identity.publicKey,
      collectionAuthorityRecordPda: BUBBLEGUM_PROGRAM_ID,
      collectionMint,
      collectionMetadata,
      editionAccount: collectionMasterEditionAccount,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      bubblegumSigner: bubblegumSigner,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    },
    {
      metadataArgs: {
        name,
        uri,
        sellerFeeBasisPoints: 0,
        symbol: "",
        creators: [],
        isMutable: false,
        uses: null,
        tokenStandard: TokenStandard.NonFungible,
        collection: {
          key: collectionMint,
          verified: false,
        },
        primarySaleHappened: false,
        editionNonce: null,

        tokenProgramVersion: TokenProgramVersion.Original,
      },
    }
  );

  const tx = new Transaction();

  tx.add(mintIx);

  tx.feePayer = identity.publicKey;

  const txSignature = await sendAndConfirmTransaction(
    connection,
    tx,
    [identity],
    {
      commitment: "confirmed",
      skipPreflight: true,
    }
  );

  console.log("txSignature", txSignature);

  return txSignature;

  //   const metaplex = Metaplex.make(connection).use(keypairIdentity(identity));

  //   const { response, nft } = await metaplex.nfts().create({
  //     name,
  //     uri,
  //     sellerFeeBasisPoints: 0,
  //     collection: collectionMint,
  //     collectionAuthority: identity,
  //     tree,
  //     tokenOwner: receiverAddress,
  //   });

  //   return {
  //     nft,
  //     response,
  //   };
};

const allDepthSizes = ALL_DEPTH_SIZE_PAIRS.flatMap(
  (pair) => pair.maxDepth
).filter((item, pos, self) => self.indexOf(item) == pos);

const defaultDepthPair: ValidDepthSizePair = {
  maxDepth: 3,
  maxBufferSize: 8,
};

export const calculateClosestTreeDepth = (size: number) => {
  let maxDepth: number = defaultDepthPair.maxDepth;

  if (!size || size <= 0) {
    return {
      sizePair: defaultDepthPair,
      canopyDepth: maxDepth - 3 >= 0 ? maxDepth - 3 : 0,
    };
  }

  for (let i = 0; i <= allDepthSizes.length; i++) {
    if (Math.pow(2, allDepthSizes[i]) >= size) {
      maxDepth = allDepthSizes[i];
      break;
    }
  }

  const maxBufferSize =
    ALL_DEPTH_SIZE_PAIRS.filter((pair) => pair.maxDepth == maxDepth)?.[0]
      ?.maxBufferSize ?? defaultDepthPair.maxBufferSize;

  const maxCanopyDepth = maxDepth >= 20 ? 17 : maxDepth;

  return {
    sizePair: {
      maxDepth: maxDepth,
      maxBufferSize,
    } as ValidDepthSizePair,
    canopyDepth: maxCanopyDepth - 3 >= 0 ? maxCanopyDepth - 3 : 0,
  };
};
