import { decrypt, getKey, getPrimaryPrivateKeyFromMnemonic } from "@/lib/key";
import keyAtom from "@/store/key";
import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { useAtom } from "jotai";

const useWebWallet = () => {
  const [keyData, setKeyData] = useAtom(keyAtom);

  const getMnemonic = (password: string) => {
    if (!keyData) return;

    const pbkdf2Key = getKey(password, keyData.salt);

    const mnemonic = decrypt(keyData.encryptedMnemonic, pbkdf2Key, keyData.iv);

    return mnemonic;
  };

  const getPrivateKey = (password: string) => {
    if (!keyData) return;

    const mnemonic = getMnemonic(password);

    if (!mnemonic) return;

    const privateKey = getPrimaryPrivateKeyFromMnemonic(mnemonic);

    return base58.encode(privateKey);
  };

  const getKeypair = (password: string) => {
    if (!keyData) return;

    const privateKey = getPrivateKey(password);

    if (!privateKey) return;

    const keypair = Keypair.fromSecretKey(base58.decode(privateKey));

    return keypair;
  };

  return {
    keyData,
    setKeyData,
    getPrivateKey,
    getKeypair,
    getMnemonic,
  };
};

export default useWebWallet;
