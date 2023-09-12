"use client";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";

export const SolanaProvider = ({ children }: { children: React.ReactNode }) => {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_MAINNET_RPC as string,
    []
  );
  // const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
