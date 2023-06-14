import { Connection } from "@solana/web3.js";

export const confirmTransaction = async (
  connection: Connection,
  signature: string
) => {
  const latestBlockhash = await connection.getLatestBlockhash();

  await connection.confirmTransaction(
    {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    "processed"
  );
};
