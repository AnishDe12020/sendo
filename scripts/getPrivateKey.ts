// run with `node --loader ts-node/esm ./scripts/getPrivateKey.ts`

import * as dotenv from "dotenv";
import { Keypair } from "@solana/web3.js";
dotenv.config();
import bs58 from "bs58";

const privateKey = process.env.KEYPAIR;
const keypair: Keypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(privateKey as string))
);

console.log("publicKey", keypair.publicKey);
const key = bs58.encode(keypair.secretKey);
console.log("privateKey", key);
