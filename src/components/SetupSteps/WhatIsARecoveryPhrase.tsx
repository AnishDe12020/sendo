import { WalletSetupSteps } from "@/app/wallet/setup/page";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface WhatIsARecoveryPhraseProps {
  setStep: (step: WalletSetupSteps) => void;
}

const WhatIsARecoveryPhrase = ({ setStep }: WhatIsARecoveryPhraseProps) => (
  <div className="flex flex-col items-center w-full mt-8 space-y-6">
    <h2 className="text-3xl font-bold">What is a recovery phrase?</h2>

    <p className="text-md">
      A recovery phrase is a 12 or 24 word phrase of random words which is used
      to private keys. It can also be used to generate multiple private keys
      across multiple blockchains.
    </p>
    <p className="text-md">
      This is in the form of english words so that you can memorise it (although
      that might be a bit counterintuitive for new users so just keep it
      somewhere secure)
    </p>
    <p>
      Make sure you don&apos;t loose access to this as this is the only way to
      recover your wallet if you loose access to your private key or login on a
      new device. If a bad party gets access to this, they can also get access
      to your assets. So make sure you keep this safe and secure. In the next
      step, we will generate a recovery phrase for you (don&apos;t worry, this
      happens on your browser and we will never have access to it) and you must
      store it somewhere safe and secure. Click on the button below to continue.
    </p>

    <Button onClick={() => setStep(WalletSetupSteps.RecoveryPhrase)}>
      Continue
      <ArrowRight className="inline-block w-4 h-4 ml-2" />
    </Button>

    <Button
      variant="secondary"
      onClick={() => setStep(WalletSetupSteps.WhatIsAPublicKeyAndPrivateKey)}
    >
      <ArrowLeft className="inline-block w-4 h-4 mr-2" />
      Back
    </Button>
  </div>
);

export default WhatIsARecoveryPhrase;
