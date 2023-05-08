import { WalletSetupSteps } from "@/app/wallet/setup/page";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

interface WelcomeStepProps {
  setStep: (step: WalletSetupSteps) => void;
}

const WelcomeStep = ({ setStep }: WelcomeStepProps) => (
  <div className="flex flex-col items-center w-full mt-8 space-y-6">
    <h2 className="text-3xl font-bold">Welcome to your new crypto wallet!</h2>
    <p className="text-md">
      We are going to walk you through what a crypto wallet is and then you are
      going to set up your first wallet! Click on the button below to continue
    </p>

    <Button onClick={() => setStep(WalletSetupSteps.WhatIsAWallet)}>
      Continue
      <ArrowRight className="inline-block w-4 h-4 ml-2" />
    </Button>
  </div>
);

export default WelcomeStep;
