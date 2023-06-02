"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { DialogHeader } from "./ui/dialog";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

import { useSession } from "next-auth/react";
import { ConnectWallet } from "./shared/ConnectWallet";

import CreateTokenLink from "./CreateTokenLink";

const CreateLinkDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: user } = useSession();

  const { publicKey } = useWallet();

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

        <CreateTokenLink setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  ) : (
    <ConnectWallet />
  );
};

export default CreateLinkDialog;
