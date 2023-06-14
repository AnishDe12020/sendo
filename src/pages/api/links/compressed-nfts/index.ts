import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import base58 from "bs58";
import { mintCompressedNFTServerMetaplex } from "@/utils/compression";

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
    case "POST": {
      const { body } = req;

      if (!body) {
        return res.status(400).json({
          success: false,
          message: "No body provided",
        });
      }

      const { collectionMintAddress, treeAddress, name, uri, receiverAddress } =
        body;

      const collectionMint = new PublicKey(collectionMintAddress);
      const tree = new PublicKey(treeAddress);

      const keypair = Keypair.fromSecretKey(
        base58.decode(process.env.PRIVATE_KEY as string)
      );

      const connection = new Connection(clusterApiUrl("devnet"));

      const { nft, response } = await mintCompressedNFTServerMetaplex(
        connection,
        keypair,
        collectionMint,
        tree,
        name,
        uri,
        receiverAddress
      );

      return res.status(200).json({
        success: true,
        message: "NFT minted",
        data: {
          nft,
          response,
        },
      });
    }

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
