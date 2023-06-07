import { prisma } from "@/lib/db";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import base58 from "bs58";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST": {
      const { body } = req;

      if (!body) {
        return res.status(400).json({
          success: false,
          message: "No body provided",
        });
      }

      const { claimerAddress } = body;

      if (!claimerAddress) {
        return res.status(400).json({
          success: false,
          message: "Missing fields",
        });
      }

      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Missing id",
        });
      }

      const candyMachineLink = await prisma.candyMachineLink.findUnique({
        where: {
          id: id as string,
        },
        select: {
          alreadyMinted: true,
          size: true,
          candymachineAddress: true,
          network: true,
          claimers: {
            select: {
              claimerAddress: true,
            },
          },
        },
      });

      if (!candyMachineLink) {
        return res.status(404).json({
          success: false,
          message: "Invalid link",
        });
      }

      if (
        candyMachineLink.claimers.find(
          (c) => c.claimerAddress === claimerAddress
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "You have already claimed this NFT",
        });
      }

      if (candyMachineLink.size - candyMachineLink.alreadyMinted <= 0) {
        return res.status(400).json({
          success: false,
          message: "All NFTs have been claimed",
        });
      }

      const keypair = Keypair.fromSecretKey(
        base58.decode(process.env.PRIVATE_KEY as string)
      );

      const metaplex = new Metaplex(
        new Connection(
          candyMachineLink.network === "devnet"
            ? clusterApiUrl("devnet")
            : (process.env.NEXT_PUBLIC_MAINNET_RPC as string)
        )
      ).use(keypairIdentity(keypair));

      const candyMachine = await metaplex.candyMachines().findByAddress({
        address: new PublicKey(candyMachineLink.candymachineAddress),
      });

      const {
        response: { signature },
      } = await metaplex.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: candyMachine.authorityAddress,
        owner: new PublicKey(claimerAddress),
      });

      await prisma.candyMachineLink.update({
        where: {
          id: id as string,
        },
        data: {
          alreadyMinted: candyMachineLink.alreadyMinted + 1,
          claimers: {
            push: {
              claimedAt: new Date(),
              claimerAddress,
              claimSignature: signature,
            },
          },
        },
      });

      return res.status(200).json({
        successs: true,
        message: "Claimed",
        signature,
      });
    }
  }
};

export default handler;
