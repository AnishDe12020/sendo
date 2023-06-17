import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import base58 from "bs58";
import {
  calculateClosestTreeDepth,
  getCreateCollectionTx,
  getCreateTreeTx,
  mintCompressedNFTServerMetaplex,
} from "@/utils/compression";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  //   const session = await getServerSession(req, res, authOptions as any);

  //   if (!session) {
  //     return res.status(401).json({
  //       success: false,
  //       message: "Unauthorized",
  //     });
  //   }

  //   const { user } = session as any;

  switch (method) {
    // case "POST": {
    //   const { body } = req;

    //   if (!body) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "No body provided",
    //     });
    //   }

    //   const {
    //     collectionMintAddress,
    //     collectionMetadataAddress,
    //     collectionMasterEditionAccountAddress,
    //     treeAddress,
    //     name,
    //     uri,
    //     receiverAddress,
    //   } = body;

    //   const collectionMint = new PublicKey(collectionMintAddress);
    //   const collectionMetadata = new PublicKey(collectionMetadataAddress);
    //   const collectionMasterEditionAccount = new PublicKey(
    //     collectionMasterEditionAccountAddress
    //   );
    //   const tree = new PublicKey(treeAddress);
    //   const receiver = new PublicKey(receiverAddress);

    //   const keypair = Keypair.fromSecretKey(
    //     base58.decode(process.env.PRIVATE_KEY as string)
    //   );

    //   const connection = new Connection(clusterApiUrl("devnet"));

    //   const sig = await mintCompressedNFTServerMetaplex(
    //     connection,
    //     keypair,
    //     collectionMint,
    //     collectionMetadata,
    //     collectionMasterEditionAccount,
    //     tree,
    //     name,
    //     uri,
    //     receiver
    //   );

    //   return res.status(200).json({
    //     success: true,
    //     message: "NFT minted",
    //     data: {
    //       sig,
    //     },
    //   });
    // }

    case "POST": {
      console.time("start");
      const { body } = req;

      if (!body) {
        return res.status(400).json({
          success: false,
          message: "No body provided",
        });
      }

      const {
        collectionSize,
        metadataUrl,
        collectionMetadata,
        receiverAddress,
      } = body;

      console.log("collectionSize", collectionSize);
      console.log("metadataUrl", metadataUrl);
      console.log("collectionMetadata", collectionMetadata);

      const depth = calculateClosestTreeDepth(collectionSize);

      console.log("depth", depth);

      const keypair = Keypair.fromSecretKey(
        base58.decode(process.env.PRIVATE_KEY as string)
      );

      const connection = new Connection(clusterApiUrl("devnet"));

      const {
        treeAddress,
        treeAuthority,
        treeKeypair,
        tx: createTreeTx,
      } = await getCreateTreeTx(
        connection,
        depth.sizePair,
        depth.canopyDepth,
        keypair.publicKey
      );

      console.log("treeAddress", treeAddress.toBase58());
      console.log("treeAuthority", treeAuthority.toBase58());
      console.log("treeKeypair", treeKeypair.secretKey);

      const createTreeSig = await sendAndConfirmTransaction(
        connection,
        createTreeTx,
        [keypair, treeKeypair]
      );

      console.log("createTreeSig", createTreeSig);

      const {
        masterEditionAccount,
        metadataAccount,
        mint,
        mintKeypair,
        tokenAccount,
        tx: createCollectionTx,
      } = await getCreateCollectionTx(
        connection,
        keypair.publicKey,
        collectionMetadata,
        collectionSize,
        keypair.publicKey
      );

      console.log("masterEditionAccount", masterEditionAccount.toBase58());
      console.log("metadataAccount", metadataAccount.toBase58());
      console.log("mint", mint.toBase58());
      console.log("mintKeypair", mintKeypair.secretKey);
      console.log("tokenAccount", tokenAccount.toBase58());

      const createCollectionSig = await sendAndConfirmTransaction(
        connection,
        createCollectionTx,
        [keypair, mintKeypair]
      );

      console.log("createCollectionSig", createCollectionSig);

      const mintNFTSig = await mintCompressedNFTServerMetaplex(
        connection,
        keypair,
        mint,
        metadataAccount,
        masterEditionAccount,
        treeKeypair.publicKey,
        collectionMetadata.data.name,
        collectionMetadata.data.uri,
        new PublicKey(receiverAddress)
      );

      console.log("mintNFTSig", mintNFTSig);

      console.timeEnd("start");

      return res.status(200).json({
        success: true,
        message: "NFT minted",
        data: {
          createTreeSig,
          createCollectionSig,
          mintNFTSig,
          treeAddress: treeAddress.toBase58(),
          treeAuthority: treeAuthority.toBase58(),
          masterEditionAccount: masterEditionAccount.toBase58(),
          metadataAccount: metadataAccount.toBase58(),
          mint: mint.toBase58(),
          tokenAccount: tokenAccount.toBase58(),
        },
      });
    }

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
