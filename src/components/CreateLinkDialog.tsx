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

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);

    // const res = await axios.post("/api/links", {
    //     amount: data.amount,
    //     message: data.message,
    //     userId: "1"
    // })
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
            <Button type="submit">Create link</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLinkDialog;
