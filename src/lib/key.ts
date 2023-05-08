import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import crypto from "crypto";

export const generateMnemonic = () => {
  const mnemonic = bip39.generateMnemonic();
  return mnemonic;
};

export const getPrimaryPrivateKeyFromMnemonic = (mnemonic: string) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic).subarray(0, 32);
  const keypair = Keypair.fromSeed(seed);
  return keypair.secretKey;
};

export const generateKey = (password: string) => {
  const salt = crypto.randomBytes(32).toString("hex");

  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, "sha512");

  return {
    salt,
    key,
  };
};

export const getKey = (password: string, salt: string) => {
  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, "sha512");

  return key;
};

export const encrypt = (text: string, key: Buffer) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted,
  };
};

export const decrypt = (encryptedData: string, key: Buffer, iv: string) => {
  const ivBuffer = Buffer.from(iv, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuffer);

  let decrypted = decipher.update(encryptedData, "hex", "utf8");

  decrypted += decipher.final("utf8");
};
