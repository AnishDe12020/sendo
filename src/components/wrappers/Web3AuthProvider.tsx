"use client";

import { ReactNode, useEffect } from "react";
import { Web3AuthCore } from "@web3auth/core";
import {
  CHAIN_NAMESPACES,
} from "@web3auth/base";
import { toast } from "sonner";
import useWeb3Auth from "@/hooks/useWeb3Auth";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

interface Web3AuthProviderProps {
  children: ReactNode;
}

const Web3AuthProvider = ({ children }: Web3AuthProviderProps) => {
  const { setWeb3Auth, setProvider } = useWeb3Auth();

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3AuthCore({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
          web3AuthNetwork: "mainnet",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.SOLANA,
            chainId: "0x1",
            rpcTarget: process.env.NEXT_PUBLIC_MAINNET_RPC,
          },
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            whiteLabel: {
              name: "Onsol",
              logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
              logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
              defaultLanguage: "en",
              dark: true,
            },
          },
        });
        web3auth.configureAdapter(openloginAdapter);

        await web3auth.init();
        setWeb3Auth(web3auth);
        setProvider(web3auth.provider);
      } catch (error) {
        console.log(error);
        toast.error("Error initializing Web3Auth");
      }
    };

    init();
  }, [setWeb3Auth, setProvider]);

  return <>{children}</>;
};

export default Web3AuthProvider;
