import { prisma } from "@/lib/db";
import { Token } from "@prisma/client";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  const session = await getServerSession(req, res, authOptions as any);

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const { user } = session as any;

  switch (method) {
    case "POST": {
      const { body } = req;

      if (!body) {
        return res.status(400).json({
          success: false,
          message: "No body provided",
        });
      }

      const { amount, token, depositTxSig, address, message } = body;

      if (!user.name === address) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!amount || !token || !depositTxSig || !address) {
        return res.status(400).json({
          success: false,
          message: "Missing fields",
        });
      }

      const connection = new Connection(
        process.env.NEXT_PUBLIC_MAINNET_RPC as string,
        "confirmed"
      );

      const tx = await connection.getTransaction(depositTxSig);

      if (!tx) {
        return res.status(400).json({
          success: false,
          message: "Invalid transaction",
        });
      }

      if (!tx.meta) {
        return res.status(400).json({
          success: false,
          message: "Invalid transaction",
        });
      }

      try {
        if (token === Token.SOL) {
          const vaultAccountIndex =
            tx.transaction.message.accountKeys.findIndex(
              (account) =>
                account.toString() === process.env.NEXT_PUBLIC_VAULT_PUBLIC_KEY
            );

          if (vaultAccountIndex < 0) {
            return res.status(400).json({
              success: false,
              message: "Invalid transaction",
            });
          }

          const { preBalances, postBalances } = tx.meta;

          const vaultAccountBalanceChange =
            postBalances[vaultAccountIndex] - preBalances[vaultAccountIndex];

          if (!(vaultAccountBalanceChange >= amount * LAMPORTS_PER_SOL)) {
            return res.status(400).json({
              success: false,
              message: "Invalid transaction",
            });
          }

          const link = await prisma.link.create({
            data: {
              amount,
              token,
              depositTx: depositTxSig,
              message,
              createdBy: {
                connect: {
                  address,
                },
              },
            },
          });

          return res.status(200).json({
            success: true,
            message: "Link created",
            link,
          });
        } else {
          const { mint, decimals, symbol } = body;

          if (!mint || !decimals || !symbol) {
            return res.status(400).json({
              success: false,
              message: "Missing fields",
            });
          }

          const vaultTokenAccount = getAssociatedTokenAddressSync(
            new PublicKey(mint),
            new PublicKey(process.env.NEXT_PUBLIC_VAULT_PUBLIC_KEY as string)
          );

          const vaultAccountIndex =
            tx.transaction.message.accountKeys.findIndex(
              (account) => account.toString() === vaultTokenAccount.toString()
            );

          if (vaultAccountIndex < 0) {
            return res.status(400).json({
              success: false,
              message: "Invalid transaction",
            });
          }

          const { postTokenBalances, preTokenBalances } = tx.meta;

          const vaultPreTokenBalance = preTokenBalances?.find(
            (balance) =>
              balance.accountIndex === vaultAccountIndex &&
              balance.mint === mint
          );

          const vaultPostTokenBalance = postTokenBalances?.find(
            (balance) =>
              balance.accountIndex === vaultAccountIndex &&
              balance.mint === mint
          );

          if (
            !vaultPreTokenBalance?.uiTokenAmount?.uiAmount ||
            !vaultPostTokenBalance?.uiTokenAmount?.uiAmount ||
            vaultPostTokenBalance.uiTokenAmount.uiAmount -
              vaultPreTokenBalance.uiTokenAmount.uiAmount <
              amount
          ) {
            return res.status(400).json({
              success: false,
              message: "Invalid transaction",
            });
          }

          const link = await prisma.link.create({
            data: {
              amount,
              token,
              mint,
              decimals,
              symbol,
              depositTx: depositTxSig,
              message,
              createdBy: {
                connect: {
                  address,
                },
              },
            },
          });

          return res.status(200).json({
            success: true,
            message: "Link created",
            link,
          });
        }
      } catch (e) {
        console.error(e);
        return res.status(500).json({
          success: false,
          message: "Failed to create link",
        });
      }
    }

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
