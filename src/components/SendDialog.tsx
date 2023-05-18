"use client";

import { HTMLAttributes, forwardRef, useState, useTransition } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

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
      type: z.string(),
      recipient: z.string().length(44, "Recipient should be a public key"),
    })
    .required()
);

interface SendDialogProps extends HTMLAttributes<HTMLButtonElement> {
  sol: number;
  tokensAvailable: { symbol: string; mint: string; amountAvailable: number }[];
}

const SendDialog = forwardRef<HTMLButtonElement, SendDialogProps>(
  ({ children, sol, tokensAvailable, ...props }, ref) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      control,
      reset,
    } = useForm<SendFormSchema>({
      resolver: sendFormSchemaResolver,
      defaultValues: {
        token: sol > 0 ? "SOL" : tokensAvailable[0].symbol,
      },
    });

    const router = useRouter();

    const [_isPending, startTransition] = useTransition();

    const [isSending, setIsSending] = useState(false);

    const { address, sendTransaction } = useWeb3Auth();

    const onSubmit = handleSubmit(async (data) => {
      if (!address) {
        toast.error("Please connect your wallet");
        return;
      }

      const isSPL = data.token !== "SOL";

      try {
        // let transferSig: string | undefined = undefined;
        // if (isSPL) {
        //     const splToken = SUPPORTED_SPL_TOKENS[data.token as SPL_TOKEN_ENUM];
        //     const userATA = getAssociatedTokenAddressSync(
        //       new PublicKey(splToken.address),
        //       new PublicKey(address)
        //     );
        //     const recipientATA = getOrCreateAssociatedTokenAccount(
        //     )
        // }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      }
    });

    return (
      <Dialog>
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

          <form className="flex flex-col gap-6">
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
              <Label htmlFor="message">Address</Label>
              <Input
                {...register("recipient")}
                type="text"
                placeholder="Public Key of the recipient wallet you are sending to"
              />
              {errors.recipient && (
                <span className="text-red-500">{errors.recipient.message}</span>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

SendDialog.displayName = "SendDialog";

export default SendDialog;
