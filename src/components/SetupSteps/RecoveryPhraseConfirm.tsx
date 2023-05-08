import { WalletSetupSteps } from "@/app/wallet/setup/page";
import { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface RecoveryPhraseConfirmProps {
  setStep: (step: WalletSetupSteps) => void;
  mnemonic: string;
}

const RecoveryPhraseConfirm = ({
  setStep,
  mnemonic,
}: RecoveryPhraseConfirmProps) => {
  const [confirmedMnemonic, setConfirmedMnemonic] = useState<string>("");

  const handleConfirm = () => {
    if (confirmedMnemonic === mnemonic) {
      toast.success("Recovery phrase confirmed");
      setStep(WalletSetupSteps.SetPassword);
    } else {
      toast.error(
        "Recovery phrase does not match. Make sure you typed it correctly."
      );
    }
  };

  return (
    <div className="flex flex-col items-center w-full mt-8 space-y-6">
      <h2 className="text-3xl font-bold">Confirm your recovery phrase</h2>

      <p className="text-md">Enter your recovery phrase below to confirm it</p>

      <textarea
        onChange={(e) => setConfirmedMnemonic(e.target.value)}
        value={confirmedMnemonic}
        className="flex w-full h-20 max-w-3xl px-3 py-2 text-sm bg-transparent border rounded-md border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />

      <Button onClick={handleConfirm}>
        Continue
        <ArrowRight className="inline-block w-4 h-4 ml-2" />
      </Button>

      <Button
        variant="secondary"
        onClick={() => setStep(WalletSetupSteps.RecoveryPhrase)}
      >
        <ArrowLeft className="inline-block w-4 h-4 mr-2" />
        Back
      </Button>
    </div>
  );
};

export default RecoveryPhraseConfirm;
