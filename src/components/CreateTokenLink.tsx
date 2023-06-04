import { onSubmitToken } from "@/utils/createLink";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SetStateAction } from "jotai";
import { useRouter } from "next/navigation";
import { Dispatch, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SUPPORTED_TOKENS_LIST } from "@/lib/tokens";
import { DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

export interface CreateLinkFormSchema {
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

interface CreateLinkDialogProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const CreateTokenLink = ({ setIsOpen }: CreateLinkDialogProps) => {
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

  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [_isPending, startTransition] = useTransition();

  const onSubmit = handleSubmit(async (data) => {
    setIsCreatingLink(true);

    if (!publicKey) {
      console.error("public key is not defined");
      return;
    }

    await onSubmitToken(data, publicKey, connection, sendTransaction, reset);

    startTransition(() => {
      router.refresh();
    });

    setIsCreatingLink(false);

    setIsOpen(false);
  });

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount" required>
            Amount
          </Label>
          <Input
            {...(register("amount"),
            {
              onChange: (e) => setValue("amount", parseFloat(e.target.value)),
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
  );
};

export default CreateTokenLink;
