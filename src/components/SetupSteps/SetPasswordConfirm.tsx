import { WalletSetupSteps } from "@/app/wallet/setup/page";
import { Input } from "../ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  encrypt,
  generateKey,
  getPrimaryPrivateKeyFromMnemonic,
} from "@/lib/key";
import base58 from "bs58";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useWebWallet from "@/hooks/useWebWallet";

interface SetPasswordConfirmProps {
  setStep: (step: WalletSetupSteps) => void;
  password: string;
  mnemonic: string;
}

const SetPasswordConfirm = ({
  setStep,
  password,
  mnemonic,
}: SetPasswordConfirmProps) => {
  const [confirmedPassword, setConfirmedPassword] = useState<string>("");

  const { setKeyData } = useWebWallet();

  const handleConfirmPassword = () => {
    if (password === confirmedPassword) {
      toast.success("Password matches!");

      const pbkdf2Key = generateKey(password);

      const encryptedMnemonic = encrypt(mnemonic, pbkdf2Key.key);

      const keyData = {
        encryptedMnemonic: encryptedMnemonic.encryptedData,
        iv: encryptedMnemonic.iv,
        salt: pbkdf2Key.salt,
      };

      setKeyData(keyData);

      setStep(WalletSetupSteps.Done);
    } else {
      toast.error("Passwords do not match");
    }
  };

  return (
    <div className="flex flex-col items-center w-full mt-8 space-y-6">
      <h2 className="text-3xl font-bold">Confirm your password</h2>

      <p className="text-md">Enter your password again to confirm it</p>

      <Input
        type="password"
        onChange={(e) => setConfirmedPassword(e.target.value)}
        value={confirmedPassword}
        className="w-72"
      />

      <Button onClick={handleConfirmPassword}>
        Continue
        <ArrowRight className="inline-block w-4 h-4 ml-2" />
      </Button>

      <Button
        variant="secondary"
        onClick={() => setStep(WalletSetupSteps.SetPassword)}
      >
        <ArrowLeft className="inline-block w-4 h-4 mr-2" />
        Back
      </Button>
    </div>
  );
};

export default SetPasswordConfirm;
