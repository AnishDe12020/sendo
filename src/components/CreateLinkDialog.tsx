"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { DialogFooter, DialogHeader } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import axios from "axios";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import {
  SUPPORTED_SPL_TOKENS,
  SUPPORTED_TOKENS_LIST,
  SPL_TOKEN_ENUM,
} from "@/lib/tokens";
import { Token } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { useSession } from "next-auth/react";
import { ConnectWallet } from "./shared/ConnectWallet";
import { useRouter } from "next/navigation";

interface CreateLinkFormSchema {
  amount: number;
  type: string;
  message?: string;
}

const createLinkFormResolver = zodResolver(
  z
    .object({
      amount: z
        .number({ description: "Amount should be a number" })
        .positive({ message: "Amount should be positive" })
        .min(0.0000001, { message: "Amount should be greater than 0.0000001" }),
      message: z.string().optional(),
      type: z.string(),
    })
    .required()
);

const CreateLinkDialog = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    reset,
  } = useForm<CreateLinkFormSchema>({
    resolver: createLinkFormResolver,
    defaultValues: {
      type: "SOL",
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  const { data: user } = useSession();

  const { publicKey, sendTransaction } = useWallet();

  const { connection } = useConnection();

  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const router = useRouter();

  const [_isPending, startTransition] = useTransition();

  const onSubmit = handleSubmit(async (data) => {
    setIsCreatingLink(true);

    if (!publicKey) {
      console.error("public key is not defined");
      return;
    }

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
          "processed"
        );

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
          throw new Error("Error creating link");
        }
      }

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

      startTransition(() => {
        router.refresh();
      });

      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Error creating link");
    }
  });

  return publicKey && user?.user?.name ? (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create new link</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new link</DialogTitle>
          <DialogDescription>
            Create a new link that can be redeemed for SOL or any other SPL
            token
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount" required>
                Amount
              </Label>
              <Input
                {...(register("amount"),
                {
                  onChange: (e) =>
                    setValue("amount", parseFloat(e.target.value)),
                })}
                step="any"
                type="number"
                placeholder="Amount"
              />
              {errors.amount && (
                <span className="text-red-500">{errors.amount.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="type" required>
                Token
              </Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>

                    <SelectContent>
                      {SUPPORTED_TOKENS_LIST.map((token) => (
                        <SelectItem
                          key={token.name}
                          value={token.symbol}
                          className="flex"
                        >
                          <span>{token.symbol}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <span className="text-red-500">{errors.type.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="message">Message</Label>
              <Input
                {...register("message")}
                type="text"
                placeholder="Optional Message"
              />
              {errors.message && (
                <span className="text-red-500">{errors.message.message}</span>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" isLoading={isCreatingLink}>
              Create link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  ) : (
    <ConnectWallet />
  );
};

export default CreateLinkDialog;
