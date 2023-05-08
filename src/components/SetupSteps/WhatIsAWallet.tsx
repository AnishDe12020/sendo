import { WalletSetupSteps } from "@/app/wallet/setup/page";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface WhatIsAWalletProps {
  setStep: (step: WalletSetupSteps) => void;
}

const WhatIsAWallet = ({ setStep }: WhatIsAWalletProps) => (
  <div className="flex flex-col items-center w-full mt-8 space-y-6">
    <h2 className="text-3xl font-bold">What is a crypto wallet?</h2>
    <p className="text-md">
      A crypto wallet is your gateway to a blockchain. This is where you can
      view your assets, send and receive assets, and do a lot more.
    </p>
    <p className="text-md">
      Assets here can be fungible tokens like Bitcoin, Ethereum, Solana, etc. as
      well as NFTs (Non-Fungible Tokens) like CryptoKitties, CryptoPunks,
      Madlads, etc.
    </p>
    <p className="text-md">
      Contrary to popular belief, these assets are not &quot;stored&quot; in
      your wallet. They are stored on the blockchain. Your wallet is just a way
      you prove ownership of these assets and hence own them. We will cover more
      about this in the next step so click on the button below to continue.
    </p>

    <Button
      onClick={() => setStep(WalletSetupSteps.WhatIsAPublicKeyAndPrivateKey)}
    >
      Continue
      <ArrowRight className="inline-block w-4 h-4 ml-2" />
    </Button>

    <Button
      variant="secondary"
      onClick={() => setStep(WalletSetupSteps.Welcome)}
    >
      <ArrowLeft className="inline-block w-4 h-4 mr-2" />
      Back
    </Button>
  </div>
);

export default WhatIsAWallet;
