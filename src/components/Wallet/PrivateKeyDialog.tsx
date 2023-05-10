import useWebWallet from "@/hooks/useWebWallet";
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";

const MnemomnicDialog = () => {
  const { getMnemonic } = useWebWallet();

  const [password, setPassword] = useState<string>();
  const [mmemonic, setMnemonic] = useState<string>();

  const handleGetMnemonic = () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }

    const mnemonic = getMnemonic(password);

    if (!mnemonic) {
      toast.error("Invalid password");
      return;
    }

    setMnemonic(mnemonic);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Show Recovery Phrase</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Show Recovery Phrase</DialogTitle>
          <DialogDescription>
            Enter your wallet password to get your recovery phrase. Make sure to
            keep this safe
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <Button onClick={handleGetMnemonic}>Decrypt Recovery Phrase</Button>

          {mmemonic && (
            <>
              <textarea
                className="flex w-full h-20 max-w-3xl px-3 py-2 text-sm bg-transparent border rounded-md border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={mmemonic}
                readOnly={true}
              />

              <Button
                onClick={() => {
                  navigator.clipboard.writeText(mmemonic);
                  toast.success("Recovery Phrase copied to clipboard");
                }}
              >
                <CopyIcon className="w-4 h-4 mr-2" />
                Copy Recovery Phrase
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MnemomnicDialog;
