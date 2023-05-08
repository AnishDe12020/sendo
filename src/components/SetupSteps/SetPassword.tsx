import { WalletSetupSteps } from "@/app/wallet/setup/page";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface SetPasswordProps {
  setStep: (step: WalletSetupSteps) => void;
  password: string;
  setPassword: (password: string) => void;
}

const SetPassword = ({ setStep, password, setPassword }: SetPasswordProps) => (
  <div className="flex flex-col items-center w-full mt-8 space-y-6">
    <h2 className="text-3xl font-bold">Set your password</h2>

    <p className="text-md">
      This will be used to unlock your wallet in the browser. If you forget it,
      you cannot reset it but you can reset your wallet but importing the
      recovery phrase again and setting a new password.
    </p>

    <p className="text-md">
      Make sure this is something safe as if anyone gets hold of this password
      and your device, they will be able to access your wallet and assets.
    </p>

    <Input
      type="password"
      onChange={(e) => setPassword(e.target.value)}
      value={password}
      className="w-72"
    />

    <Button
      onClick={() => {
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters long");
        } else {
          setStep(WalletSetupSteps.SetPasswordConfirm);
        }
      }}
    >
      Continue
      <ArrowRight className="inline-block w-4 h-4 ml-2" />
    </Button>

    <Button
      variant="secondary"
      onClick={() => setStep(WalletSetupSteps.RecoveryPhraseConfirm)}
    >
      <ArrowLeft className="inline-block w-4 h-4 mr-2" />
      Back
    </Button>
  </div>
);

export default SetPassword;
