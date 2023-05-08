import { WalletSetupSteps } from "@/app/wallet/setup/page";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface WhatIsAPublicKeyAndPrivateKey {
  setStep: (step: WalletSetupSteps) => void;
}

const WhatIsAPublicKeyAndPrivateKey = ({
  setStep,
}: WhatIsAPublicKeyAndPrivateKey) => (
  <div className="flex flex-col items-center w-full mt-8 space-y-6">
    <h2 className="text-3xl font-bold">
      What is a public key and private key?
    </h2>
    <p className="text-md">
      A public key is a string of characters determined from the private key
      which is used to identify accounts on a blockchain. It is also known as a
      wallet address or a blockchain address. It is absolutely safe to share
      this with anyone and wont risk your assets.
    </p>
    <p className="text-md">
      A private key on the other hand is used to generate verifiable
      cryptographic signatures which can be verified against the public key. We
      wont go much into the technical part but in simple words this key is what
      helps determine ownership of assets on a blockchain. If you loose this key
      and the recovery phrase (which we will cover in the next step) you will
      loose access to your assets forever. If a bad party gets access to this
      key, they also get control of your assets. So make sure you keep this safe
      and secure. We will cover more about this in the next step so click on the
      button below to continue.
    </p>

    <Button onClick={() => setStep(WalletSetupSteps.WhatIsARecoveryPhrase)}>
      Continue
      <ArrowRight className="inline-block w-4 h-4 ml-2" />
    </Button>

    <Button
      variant="secondary"
      onClick={() => setStep(WalletSetupSteps.WhatIsAWallet)}
    >
      <ArrowLeft className="inline-block w-4 h-4 mr-2" />
      Back
    </Button>
  </div>
);

export default WhatIsAPublicKeyAndPrivateKey;
