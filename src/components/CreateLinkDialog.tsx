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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import CreateNFTLink from "./CreateNFTLink";

const CreateLinkDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: user } = useSession();

  const { publicKey } = useWallet();

  return publicKey && user?.user?.name ? (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create new link</Button>
      </DialogTrigger>

      <DialogContent className="overflow-y-auto h-[32rem]">
        <DialogHeader>
          <DialogTitle>Create new link</DialogTitle>
          <DialogDescription>
            Create a new link that can be redeemed for SOL or any other SPL
            token
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="token" className="w-full">
          <TabsList className="w-full my-4">
            <TabsTrigger value="token">Token</TabsTrigger>
            <TabsTrigger value="nft">NFT</TabsTrigger>
          </TabsList>
          <TabsContent value="token">
            <CreateTokenLink setIsOpen={setIsOpen} />
          </TabsContent>
          <TabsContent value="nft">
            <CreateNFTLink setIsOpen={setIsOpen} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  ) : (
    <ConnectWallet />
  );
};

export default CreateLinkDialog;
