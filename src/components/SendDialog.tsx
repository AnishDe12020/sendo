"use client";

import { HTMLAttributes, forwardRef, useMemo, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller, useForm, UseFormGetValues } from "react-hook-form";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  SPL_TOKEN_ENUM,
  SUPPORTED_SPL_TOKENS,
  SUPPORTED_TOKENS_LIST,
} from "@/lib/tokens";
import useWeb3Auth from "@/hooks/useWeb3Auth";
import { toast } from "sonner";
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { set } from "date-fns";

interface SendFormSchema {
  amount: number;
  token: string;
  recipient: string;
}

const sendFormSchemaResolver = zodResolver(
  z
    .object({
      amount: z
        .number({ description: "Amount should be a number" })
        .positive({ message: "Amount should be positive" })
        .min(0.0000001, { message: "Amount should be greater than 0.0000001" }),
      token: z.string(),
      recipient: z.string().refine(
        (val) => {
          try {
            new PublicKey(val);
            return true;
          } catch (err) {
            return false;
          }
        },
        {
          message:
            "Invalid recipient address. Make sure it is a Solana public key",
        }
      ),
    })
    .required()
);

interface SendDialogProps extends HTMLAttributes<HTMLButtonElement> {
  sol: number;
  tokensAvailable: { symbol: string; mint: string; amountAvailable: number }[];
}

const SendDialog = forwardRef<HTMLButtonElement, SendDialogProps>(
  ({ children, sol, tokensAvailable, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const queryClient = useQueryClient();

    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      control,
      reset,
      watch,
    } = useForm<SendFormSchema>({
      resolver: sendFormSchemaResolver,
      defaultValues: {
        token: sol > 0 ? "SOL" : tokensAvailable[0].symbol,
      },
    });

    const [isSending, setIsSending] = useState(false);

    const { address, sendTransaction } = useWeb3Auth();

    const { connection } = useConnection();

    const onSubmit = handleSubmit(async (data) => {
      if (!address) {
        toast.error("Please connect your wallet");
        return;
      }

      const isSPL = data.token !== "SOL";

      setIsSending(true);

      try {
        let transferSig: string | undefined = undefined;
        if (isSPL) {
          if (
            data.amount >
            tokensAvailable.find((t) => t.symbol === data.token)!
              .amountAvailable
          ) {
            toast.error("Not enough balance");
            setIsSending(false);
            return;
          }

          const splToken = SUPPORTED_SPL_TOKENS[data.token as SPL_TOKEN_ENUM];
          const userATA = getAssociatedTokenAddressSync(
            new PublicKey(splToken.address),
            new PublicKey(address)
          );

          const recipientATA = getAssociatedTokenAddressSync(
            new PublicKey(splToken.address),
            new PublicKey(data.recipient)
          );

          const tx: Transaction = new Transaction();

          try {
            const tokenAccount = await getAccount(connection, recipientATA);

            if (!tokenAccount.isInitialized) {
              const createATAIx = createAssociatedTokenAccountInstruction(
                new PublicKey(address),
                recipientATA,
                new PublicKey(data.recipient),
                new PublicKey(splToken.address)
              );

              tx.add(createATAIx);
            }
          } catch (err) {
            const createATAIx = createAssociatedTokenAccountInstruction(
              new PublicKey(address),
              recipientATA,
              new PublicKey(data.recipient),
              new PublicKey(splToken.address)
            );

            tx.add(createATAIx);
          }

          const transferIx = createTransferCheckedInstruction(
            userATA,
            new PublicKey(splToken.address),
            recipientATA,
            new PublicKey(address),
            data.amount * 10 ** splToken.decimals,
            splToken.decimals
          );

          tx.add(transferIx);

          const latestBlockhash = await connection.getLatestBlockhash();

          tx.recentBlockhash = latestBlockhash.blockhash;
          tx.feePayer = new PublicKey(address);

          const solRequiredForGas = await tx.getEstimatedFee(connection);

          if (
            !solRequiredForGas ||
            solRequiredForGas / LAMPORTS_PER_SOL > sol
          ) {
            toast.error("Not enough SOL for gas");
            setIsSending(false);
            return;
          }

          transferSig = await sendTransaction(tx, connection);

          if (!transferSig) {
            toast.error("Something went wrong");
            return;
          }

          await connection.confirmTransaction(
            {
              signature: transferSig,
              blockhash: latestBlockhash.blockhash,
              lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            },
            "processed"
          );
        } else {
          if (data.amount > sol - 0.001) {
            toast.error("Not enough balance");
            setIsSending(false);
            return;
          }

          const transferTx = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: new PublicKey(address),
              toPubkey: new PublicKey(data.recipient),
              lamports: data.amount * LAMPORTS_PER_SOL,
            })
          );

          const latestBlockhash = await connection.getLatestBlockhash();

          transferTx.recentBlockhash = latestBlockhash.blockhash;
          transferTx.feePayer = new PublicKey(address);

          const solRequiredForGas = await transferTx.getEstimatedFee(
            connection
          );

          if (
            !solRequiredForGas ||
            solRequiredForGas / LAMPORTS_PER_SOL > sol
          ) {
            toast.error("Not enough SOL for gas");
            setIsSending(false);
            return;
          }

          transferSig = await sendTransaction(transferTx, connection);

          if (!transferSig) {
            toast.error("Something went wrong");
            return;
          }

          await connection.confirmTransaction(
            {
              signature: transferSig,
              blockhash: latestBlockhash.blockhash,
              lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            },
            "processed"
          );
        }

        toast.success("Assets transferred", {
          action: {
            label: "View Transaction",
            onClick: () => {
              window.open(
                `https://explorer.solana.com/tx/${transferSig}`,
                "_blank"
              );
            },
          },
        });

        queryClient.refetchQueries({
          queryKey: ["web3auth-wallet-data"],
        });

        reset();

        setIsOpen(false);
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      }

      setIsSending(false);
    });

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button ref={ref} {...props}>
            {children ?? "Send"}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Assets</DialogTitle>
            <DialogDescription>
              Send SOL or any other token to any other wallet
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="type" required>
                  Token
                </Label>
                <Controller
                  control={control}
                  name="token"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a token" />
                      </SelectTrigger>

                      <SelectContent>
                        {SUPPORTED_TOKENS_LIST.filter((token) => {
                          const isAvailable = tokensAvailable.find(
                            (tokenAvailable) =>
                              tokenAvailable.symbol === token.symbol
                          );

                          return isAvailable;
                        }).map((token) => (
                          <SelectItem
                            key={token.name}
                            value={token.symbol}
                            className="flex"
                          >
                            <span>{token.symbol}</span>
                          </SelectItem>
                        ))}
                        {sol > 0 && (
                          <SelectItem value="SOL" className="flex">
                            <span>SOL</span>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.token && (
                  <span className="text-red-500">{errors.token.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="amount" required>
                    Amount
                  </Label>

                  <MaxValue
                    token={watch("token")}
                    sol={sol}
                    tokensAvailable={tokensAvailable}
                  />
                </div>
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
                <Label htmlFor="message" required>
                  Address
                </Label>
                <Input
                  {...register("recipient")}
                  type="text"
                  placeholder="Public Key of the recipient wallet you are sending to"
                />
                {errors.recipient && (
                  <span className="text-red-500">
                    {errors.recipient.message}
                  </span>
                )}
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit" isLoading={isSending}>
                {isSending ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

SendDialog.displayName = "SendDialog";

const MaxValue = ({
  token,
  sol,
  tokensAvailable,
}: {
  token: string;
  sol: number;
  tokensAvailable: {
    symbol: string;
    mint: string;
    amountAvailable: number;
  }[];
}) => (
  <p className="text-xs">
    Max:{" "}
    {token === "SOL"
      ? (sol - 0.001).toFixed(5)
      : tokensAvailable.find(
          (tokenAvailable) => tokenAvailable.symbol === token
        )?.amountAvailable}{" "}
    {token}
  </p>
);
export default SendDialog;
