import { web3AuthAtom, web3AuthProviderAtom } from "@/store/web3auth";
import { WALLET_ADAPTERS } from "@web3auth/base";
import { useAtom } from "jotai";
import RPC from "@/lib/web3authSolanaRPC";
import { useAsyncMemo } from "use-async-memo";

const useWeb3Auth = () => {
  const [web3auth, setWeb3Auth] = useAtom(web3AuthAtom);
  const [provider, setProvider] = useAtom(web3AuthProviderAtom);

  const address = useAsyncMemo(
    async () => {
      const accounts = await getAccounts();
      if (!accounts || accounts.length === 0) {
        return null;
      }

      return accounts[0];
    },
    [provider],
    null
  );

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        mfaLevel: "optional",
        loginProvider: "google",
      }
    );
    setProvider(web3authProvider);
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

  const sendTransaction = async () => {
    if (!provider) {
      console.error("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    return receipt;
  };

  const signMessage = async () => {
    if (!provider) {
      console.error("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
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
    signMessage,
    getPrivateKey,
    address,
  };
};

export default useWeb3Auth;
