"use client";

import Done from "@/components/SetupSteps/Done";
import RecoveryPhrase from "@/components/SetupSteps/RecoveryPhrase";
import RecoveryPhraseConfirm from "@/components/SetupSteps/RecoveryPhraseConfirm";
import SetPassword from "@/components/SetupSteps/SetPassword";
import SetPasswordConfirm from "@/components/SetupSteps/SetPasswordConfirm";
import WelcomeStep from "@/components/SetupSteps/Welcome";
import WhatIsAPublicKeyAndPrivateKey from "@/components/SetupSteps/WhatIsAPublicKeyAndPrivateKey";
import WhatIsARecoveryPhrase from "@/components/SetupSteps/WhatIsARecoveryPhrase";
import WhatIsAWallet from "@/components/SetupSteps/WhatIsAWallet";
import { generateMnemonic } from "bip39";
import { useEffect, useMemo, useState } from "react";

export enum WalletSetupSteps {
  Welcome,
  WhatIsAWallet,
  WhatIsAPublicKeyAndPrivateKey,
  WhatIsARecoveryPhrase,
  RecoveryPhrase,
  RecoveryPhraseConfirm,
  SetPassword,
  SetPasswordConfirm,
  Done,
}

const WalletSetupPage = () => {
  const [step, setStep] = useState(WalletSetupSteps.Welcome);

  const [mnemonic, setMnemonic] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const mnemonicWords = useMemo(() => mnemonic.split(" "), [mnemonic]);

  useEffect(() => setMnemonic(generateMnemonic()), []);

  return (
    <div className="max-w-4xl text-center">
      {step === WalletSetupSteps.Welcome && <WelcomeStep setStep={setStep} />}

      {step === WalletSetupSteps.WhatIsAWallet && (
        <WhatIsAWallet setStep={setStep} />
      )}

      {step === WalletSetupSteps.WhatIsAPublicKeyAndPrivateKey && (
        <WhatIsAPublicKeyAndPrivateKey setStep={setStep} />
      )}

      {step === WalletSetupSteps.WhatIsARecoveryPhrase && (
        <WhatIsARecoveryPhrase setStep={setStep} />
      )}

      {step === WalletSetupSteps.RecoveryPhrase && (
        <RecoveryPhrase
          setStep={setStep}
          mnemonic={mnemonic}
          mnemonicWords={mnemonicWords}
        />
      )}

      {step === WalletSetupSteps.RecoveryPhraseConfirm && (
        <RecoveryPhraseConfirm setStep={setStep} mnemonic={mnemonic} />
      )}

      {step === WalletSetupSteps.SetPassword && (
        <SetPassword
          setStep={setStep}
          setPassword={setPassword}
          password={password}
        />
      )}

      {step === WalletSetupSteps.SetPasswordConfirm && (
        <SetPasswordConfirm
          setStep={setStep}
          password={password}
          mnemonic={mnemonic}
        />
      )}

      {step === WalletSetupSteps.Done && <Done />}
    </div>
  );
};

export default WalletSetupPage;
