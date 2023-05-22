"use client";

import Web3AuthWallet from "@/components/Web3AuthWallet";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import useWeb3Auth from "@/hooks/useWeb3Auth";
import { useConnection } from "@solana/wallet-adapter-react";

const WalletPage = () => {
  const { address, login, web3auth, isLoadingAddress } = useWeb3Auth();

  return (
    <div className="flex flex-col items-center gap-4 w-[24rem] md:w-[32rem]">
      {web3auth && !isLoadingAddress ? (
        address ? (
          <Web3AuthWallet />
        ) : (
          <Button onClick={login}>Login</Button>
        )
      ) : (
        <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
      )}
    </div>
  );
};

export default WalletPage;
