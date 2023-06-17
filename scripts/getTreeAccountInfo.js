import { Connection, clusterApiUrl } from "@solana/web3.js";
import { TreeConfig } from "@metaplex-foundation/mpl-bubblegum";
import { PublicKey } from "@metaplex-foundation/js";

const main = async () => {
  const connection = new Connection(clusterApiUrl("devnet"));

  const x = await TreeConfig.fromAccountAddress(
    connection,
    // new PublicKey("5PkceD41jqFGaYh3oBgWzChvUKpTsxboujkjVgeF5sNq")
    new PublicKey("CQJ5XiMsEUjAx7NCLiANDqsJGznnMrtkDi76Hrp6tz8M")
  );

  console.log(x);
  console.log(x.totalMintCapacity.toNumber());
  console.log(x.numMinted.toNumber());
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
