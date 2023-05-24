import { web3AuthAtom, web3AuthProviderAtom } from "@/store/web3auth";
import { WALLET_ADAPTERS } from "@web3auth/base";
import { useAtom } from "jotai";
import RPC from "@/lib/web3authSolanaRPC";
import { useAsyncMemo } from "use-async-memo";
import { useEffect, useState } from "react";
import { Connection, Transaction } from "@solana/web3.js";

const useWeb3Auth = () => {
  const [web3auth, setWeb3Auth] = useAtom(web3AuthAtom);
  const [provider, setProvider] = useAtom(web3AuthProviderAtom);
  const [address, setAddress] = useState<string | null>(null);

  const [isLoadingAddress, setLoading] = useState<boolean>(false);

  // const address = useAsyncMemo(
  //   async () => {
  //     setLoading(true);

  //     const accounts = await getAccounts();
  //     if (!accounts || accounts.length === 0) {
  //       setLoading(false);
  //       return null;
  //     }

  //     setLoading(false);

  //     return accounts[0];
  //   },
  //   [provider],
  //   null
  // );

  useEffect(() => {
    if (!web3auth) {
      return;
    }
    const func = async () => {
      const accounts = await getAccounts();
      setLoading(true);
      if (!accounts || accounts.length === 0) {
        setLoading(false);
        return;
      }
      setAddress(accounts[0]);
      setLoading(false);
    };
    func();
  }, [provider]);

  const login = async () => {
    if (!web3auth) {
      console.error("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        mfaLevel: "none",
        loginProvider: "google",
      }
    );

    const acounts = await getAccounts();

    if (!acounts || acounts.length === 0) {
      console.error("No accounts found");
      return;
    }

    setAddress(acounts[0]);

    setProvider(web3authProvider);

    return acounts[0];
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      console.error("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    return idToken;
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.error("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    return user;
  };

  const logout = async () => {
    if (!web3auth) {
      console.error("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getAccounts = async () => {
    if (!provider) {
      console.error("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    return address;
  };

  const getBalance = async () => {
    if (!provider) {
      console.error("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    return balance;
  };

  const sendTransaction = async (
    transaction: Transaction,
    connection: Connection
  ) => {
    if (!provider) {
      console.error("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction(transaction, connection);
    return receipt;
  };

  const signTransaction = async (transaction: Transaction) => {
    if (!provider) {
      console.error("provider not initialized yet");
      return;
    }

    const rpc = new RPC(provider);
    const signedTransaction = await rpc.signTransaction(transaction);
    return signedTransaction;
  };

  const signMessage = async (message: Uint8Array) => {
    if (!provider) {
      console.error("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage(message);
    return signedMessage;
  };

  const getPrivateKey = async () => {
    if (!provider) {
      console.error("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    return privateKey;
  };

  return {
    web3auth,
    setWeb3Auth,
    provider,
    setProvider,
    login,
    logout,
    authenticateUser,
    getUserInfo,
    getAccounts,
    getBalance,
    sendTransaction,
    signTransaction,
    signMessage,
    getPrivateKey,
    address,
    isLoadingAddress,
  };
};

export default useWeb3Auth;
