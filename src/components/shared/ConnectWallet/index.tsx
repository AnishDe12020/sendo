"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { LinkIcon, UnlinkIcon, WalletIcon } from "lucide-react";
import { HTMLProps, forwardRef, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { truncatePubkey } from "@/utils/truncate";

export const ConnectWallet = forwardRef<HTMLButtonElement>((props, ref) => {
  const { wallets, select, publicKey, disconnect, connect } = useWallet();

  const [isOpen, setIsOpen] = useState(false);

  const availableWallets = useMemo(
    () =>
      wallets.filter(
        (wallet: { readyState: string }) =>
          wallet.readyState === "Installed" || wallet.readyState === "Loadable"
      ),
    [wallets]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {publicKey ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button ref={ref} variant="secondary" {...props}>
                <WalletIcon className="w-4 h-4 mr-2" />
                <span>{truncatePubkey(publicKey.toBase58())}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={disconnect}
                className="text-destructive"
              >
                <UnlinkIcon className="w-4 h-4 mr-2" />
                <span>Disconenct Wallet</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button ref={ref} {...props}>
            <LinkIcon className="w-4 h-4 mr-2" />
            <span>Connect Wallet</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {availableWallets.map((wallet) => (
            <Button
              key={wallet.adapter.name}
              onClick={(e) => {
                console.log(wallet.adapter.name);
                select(wallet.adapter.name);

                if (!e.defaultPrevented) {
                  connect()
                    .then(() => {
                      console.log("Connected!");
                    })
                    .catch((e) => {
                      console.error(e);
                    });

                  setIsOpen(false);
                }
              }}
              variant="secondary"
              className="justify-start"
              size="lg"
            >
              <img
                className="w-5 h-5 mr-4"
                src={wallet.adapter.icon}
                alt={wallet.adapter.name}
              />
              <span>{wallet.adapter.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
});

ConnectWallet.displayName = "ConnectWallet";
