import { SPL_TOKEN_ENUM, SUPPORTED_SPL_TOKENS } from "@/lib/tokens";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { WalletAdapterProps } from "@solana/wallet-adapter-base";
import { sleep } from "@/lib/utils";
import { Token } from "@prisma/client";
import axios from "axios";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";
import { UseFormReset } from "react-hook-form";
import { CreateLinkFormSchema } from "@/components/CreateTokenLink";

export const onSubmitToken = async (
  data: CreateLinkFormSchema,
  publicKey: PublicKey,
  connection: Connection,
  sendTransaction: WalletAdapterProps["sendTransaction"],
  reset: UseFormReset<CreateLinkFormSchema>
) => {
  const isSPL = data.type !== "SOL";

  const vaultPublicKey = process.env.NEXT_PUBLIC_VAULT_PUBLIC_KEY;

  if (!vaultPublicKey) {
    console.error("vault public key is not defined");
    return;
  }

  try {
    let depositTxSig: string | undefined = undefined;

    if (isSPL) {
      const splToken = SUPPORTED_SPL_TOKENS[data.type as SPL_TOKEN_ENUM];

      const userATA = getAssociatedTokenAddressSync(
        new PublicKey(splToken.address),
        publicKey
      );
      const valutATA = getAssociatedTokenAddressSync(
        new PublicKey(splToken.address),
        new PublicKey(vaultPublicKey)
      );

      const depositTx = new Transaction().add(
        createTransferCheckedInstruction(
          userATA,
          new PublicKey(splToken.address),
          valutATA,
          publicKey,
          data.amount * 10 ** splToken.decimals,
          splToken.decimals
        )
      );

      const latestBlockhash = await connection.getLatestBlockhash();

      depositTxSig = await sendTransaction(depositTx, connection);

      await connection.confirmTransaction(
        {
          signature: depositTxSig,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      await sleep(5000);

      const res = await axios.post("/api/links", {
        amount: data.amount,
        message: data.message,
        address: publicKey.toBase58(),
        depositTxSig,
        token: Token.SPL,
        mint: splToken.address,
        decimals: splToken.decimals,
        symbol: splToken.symbol,
      });

      if (res.status != 200) {
        throw new Error("Error creating link");
      }
    } else {
      const depositTx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(vaultPublicKey),
          lamports: data.amount * LAMPORTS_PER_SOL,
        })
      );

      const latestBlockhash = await connection.getLatestBlockhash();

      depositTxSig = await sendTransaction(depositTx, connection);

      await connection.confirmTransaction(
        {
          signature: depositTxSig,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "processed"
      );

      const res = await axios.post("/api/links", {
        amount: data.amount,
        message: data.message,
        address: publicKey.toBase58(),
        depositTxSig,
        token: Token.SOL,
      });

      if (res.status != 200) {
        Sentry.captureException(res.data);
        throw new Error("Error creating link");
      }
    }

    reset();

    toast.success("Link created successfully", {
      action: {
        label: "View Transaction",
        onClick: () => {
          window.open(
            `https://explorer.solana.com/tx/${depositTxSig}`,
            "_blank"
          );
        },
      },
    });
  } catch (err) {
    console.error(err);
    toast.error("Error creating link");
  }
};

export const onSubmitNFT = async () => {};
