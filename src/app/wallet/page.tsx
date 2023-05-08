"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const WalletPage = () => {
  const router = useRouter();

  return (
    <>
      <Button
        onClick={() => {
          router.push("/wallet/setup");
        }}
      >
        Setup Wallet
      </Button>
    </>
  );
};

export default WalletPage;
