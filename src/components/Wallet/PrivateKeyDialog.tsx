"use client";

import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import { useAsyncMemo } from "use-async-memo";
import useWeb3Auth from "@/hooks/useWeb3Auth";
import { Icons } from "../icons";
import { HTMLAttributes, forwardRef } from "react";

interface PrivateKeyDialogProps extends HTMLAttributes<HTMLButtonElement> {}

const PrivateKeyDialog = forwardRef<HTMLButtonElement, PrivateKeyDialogProps>(
  (props, ref) => {
    const { getPrivateKey } = useWeb3Auth();

    const privateKey = useAsyncMemo(async () => {
      const privateKey = await getPrivateKey();
      return privateKey;
    }, [getPrivateKey]);

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button ref={ref} {...props}>
            Show Private Key
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Private Key</DialogTitle>
            <DialogDescription>
              This is your google account wallet&apos;s private key. Keep this
              safe and don&apos;t share it with anyone as anyone with this key
              can steal your assets.
            </DialogDescription>
          </DialogHeader>

          {privateKey ? (
            <div className="flex flex-col gap-4">
              <textarea
                className="flex w-full h-20 max-w-3xl px-3 py-2 text-sm bg-transparent border rounded-md border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={privateKey}
                readOnly={true}
              />

              <Button
                onClick={() => {
                  navigator.clipboard.writeText(privateKey);
                  toast.success("Private key copied to clipboard");
                }}
              >
                <CopyIcon className="w-4 h-4 mr-2" />
                Copy Private Key
              </Button>
            </div>
          ) : (
            <Icons.spinner className="w-6 h-6 animate-spin" />
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

PrivateKeyDialog.displayName = "PrivateKeyDialog";

export default PrivateKeyDialog;
