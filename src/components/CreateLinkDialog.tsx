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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import { Token } from "@prisma/client";
import { toast } from "sonner";
import { useState } from "react";

interface CreateLinkFormSchema {
  amount: number;
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
    })
    .required()
);

const CreateLinkDialog = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateLinkFormSchema>({
    resolver: createLinkFormResolver,
  });

  const { publicKey } = useWallet();

  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);

    setIsCreatingLink(true);

    if (!publicKey) {
      console.error("public key is not defined");
      return;
    }

    const res = await axios.post("/api/links", {
      amount: data.amount,
      message: data.message,
      address: publicKey.toBase58(),
      depositTxSig: "qwlrjfilo;fikl;",
      token: Token.SOL,
    });

    console.log(res.data);

    if (res.status != 200) {
      toast.error("Failed to create link");
      setIsCreatingLink(false);
      return;
    }

    toast.success("Link created successfully");
    setIsCreatingLink(false);
  });

  return (
    <Dialog>
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
                type="number"
                placeholder="Amount in SOL"
              />
              {errors.amount && (
                <span className="text-red-500">{errors.amount.message}</span>
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
  );
};

export default CreateLinkDialog;
