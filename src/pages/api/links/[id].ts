import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import base58 from "bs58";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

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

      const link = await prisma.link.findUnique({
        where: {
          id: id as string,
        },
      });

      if (!link) {
        return res.status(404).json({
          success: false,
          message: "Invalid link",
        });
      }

      if (link.claimed) {
        return res.status(400).json({
          success: false,
          message: "Already claimed",
        });
      }

      const keypair = Keypair.fromSecretKey(
        base58.decode(process.env.PRIVATE_KEY as string)
      );

      const connection = new Connection(
        process.env.NEXT_PUBLIC_MAINNET_RPC as string,
        "confirmed"
      );

      let transferSig: string;

      if (link.token === "SOL") {
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: new PublicKey(claimerAddress),
            lamports: link.amount * 1000000000,
          })
        );

        transferSig = await sendAndConfirmTransaction(
          connection,
          tx,
          [keypair],
          {
            commitment: "processed",
          }
        );
      } else {
        const vaultATA = getAssociatedTokenAddressSync(
          new PublicKey(link.mint as string),
          keypair.publicKey
        );

        const userATA = await getOrCreateAssociatedTokenAccount(
          connection,
          keypair,
          new PublicKey(link.mint as string),
          new PublicKey(claimerAddress)
        );

        if (!userATA || !vaultATA) {
          return res.status(400).json({
            success: false,
            message: "Invalid token",
          });
        }

        const tx = new Transaction().add(
          createTransferCheckedInstruction(
            vaultATA,
            new PublicKey(link.mint as string),
            userATA.address,
            keypair.publicKey,
            link.amount * 10 ** (link.decimals as number),
            link.decimals as number
          )
        );

        transferSig = await sendAndConfirmTransaction(
          connection,
          tx,
          [keypair],
          {
            commitment: "processed",
          }
        );
      }

      await prisma.link.update({
        where: {
          id: id as string,
        },
        data: {
          claimed: true,
          claimedAt: new Date(),
          claimTx: transferSig,
          claimedBy: claimerAddress,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Claimed",
        transferSig,
      });
    }

    case "DELETE": {
      const session = await getServerSession(req, res, authOptions as any);

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { user } = session as any;

      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Missing id",
        });
      }

      const link = await prisma.link.findUnique({
        where: {
          id: id as string,
        },
        include: {
          createdBy: {
            select: {
              address: true,
            },
          },
        },
      });

      if (!link) {
        return res.status(404).json({
          success: false,
          message: "Invalid link",
        });
      }

      if (link.createdBy.address !== user.name) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const keypair = Keypair.fromSecretKey(
        base58.decode(process.env.PRIVATE_KEY as string)
      );

      const connection = new Connection(
        process.env.NEXT_PUBLIC_MAINNET_RPC as string,
        "confirmed"
      );

      let returnSig: string;

      if (link.token === "SOL") {
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: new PublicKey(link.createdBy.address),
            lamports: link.amount * 1000000000,
          })
        );

        returnSig = await sendAndConfirmTransaction(connection, tx, [keypair], {
          commitment: "processed",
        });
      } else {
        const userATA = getAssociatedTokenAddressSync(
          new PublicKey(link.mint as string),
          new PublicKey(link.createdBy.address)
        );

        const vaultATA = getAssociatedTokenAddressSync(
          new PublicKey(link.mint as string),
          keypair.publicKey
        );

        if (!userATA || !vaultATA) {
          return res.status(400).json({
            success: false,
            message: "Invalid token",
          });
        }

        const tx = new Transaction().add(
          createTransferCheckedInstruction(
            vaultATA,
            new PublicKey(link.mint as string),
            userATA,
            keypair.publicKey,
            link.amount * 10 ** (link.decimals as number),
            link.decimals as number
          )
        );

        returnSig = await sendAndConfirmTransaction(connection, tx, [keypair], {
          commitment: "processed",
        });
      }

      await prisma.link.delete({
        where: {
          id: id as string,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Link deleted",
        returnSig,
      });
    }

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
