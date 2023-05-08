import { WalletSetupSteps } from "@/app/wallet/setup/page";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, CopyIcon } from "lucide-react";

interface RecoveryPhraseProps {
  setStep: (step: WalletSetupSteps) => void;
  mnemonic: string;
  mnemonicWords: string[];
}

const RecoveryPhrase = ({
  setStep,
  mnemonic,
  mnemonicWords,
}: RecoveryPhraseProps) => {
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic);
    toast.success("Copied recovery phrase to clipboard");
  };

  return (
    <div className="flex flex-col items-center w-full mt-8 space-y-6">
      <h2 className="text-3xl font-bold">Your recovery phrase</h2>

      <p className="text-md">
        Here is your 12-word recovery phrase. Write it down somewhere safe and
        secure.
      </p>

      <div
        className="flex flex-row flex-wrap justify-center max-w-3xl gap-4 p-4 border bg-secondary rounded-xl cursor-copy"
        onClick={handleCopyToClipboard}
      >
        {mnemonicWords.map((word, index) => (
          <div
            key={index}
            className="px-4 py-2 text-sm font-bold text-white rounded-md bg-accent"
          >
            {word}
          </div>
        ))}
      </div>

      <Button onClick={handleCopyToClipboard} variant="secondary">
        <CopyIcon className="w-4 h-4 mr-2" />
        Copy to clipboard
      </Button>

      <Button onClick={() => setStep(WalletSetupSteps.RecoveryPhraseConfirm)}>
        Continue
        <ArrowRight className="inline-block w-4 h-4 ml-2" />
      </Button>

      <Button
        variant="secondary"
        onClick={() => setStep(WalletSetupSteps.WhatIsARecoveryPhrase)}
      >
        <ArrowLeft className="inline-block w-4 h-4 mr-2" />
        Back
      </Button>
    </div>
  );
};

export default RecoveryPhrase;
