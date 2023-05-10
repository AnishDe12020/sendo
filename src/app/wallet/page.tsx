"use client";

import MnemomnicDialog from "@/components/Wallet/PrivateKeyDialog";
import { Button } from "@/components/ui/button";
import { decrypt, encrypt, generateKey, getKey } from "@/lib/key";
import { useRouter } from "next/navigation";

const WalletPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={() => {
          router.push("/wallet/setup");
        }}
      >
        Setup Wallet
      </Button>

      <MnemomnicDialog />

      <Button
        onClick={() => {
          const text = "Hello world";
          const encPBKDF2 = generateKey("pass1234");

          const encrypted = encrypt(text, encPBKDF2.key);

          console.log(encrypted);

          const decPBKDF2 = getKey("pass1234", encPBKDF2.salt);

          const decrypted = decrypt(
            encrypted.encryptedData,
            decPBKDF2,
            encrypted.iv
          );

          console.log(decrypted);
        }}
      >
        Test encryption
      </Button>
    </div>
  );
};

export default WalletPage;
