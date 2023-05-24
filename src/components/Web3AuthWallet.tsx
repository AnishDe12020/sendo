import useWeb3Auth from "@/hooks/useWeb3Auth";
import { useConnection } from "@solana/wallet-adapter-react";

import { Icons } from "./icons";
import PublicKeyDialog from "./PublicKeyDialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import { truncatePubkey } from "@/utils/truncate";
import SendDialog from "./SendDialog";
import { useQuery } from "@tanstack/react-query";
import PrivateKeyDialog from "./Wallet/PrivateKeyDialog";
import { useRouter } from "next/navigation";
import { getNetWorth, getSOL, getTokens } from "@/utils/getWalletData";

const Web3AuthWallet = () => {
  const { address } = useWeb3Auth();
  const { connection } = useConnection();

  const router = useRouter();

  const { data: walletData } = useQuery({
    queryKey: ["web3auth-wallet-data"],
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const solData = await getSOL(address, connection);

      const tokens = await getTokens(address, connection);

      const netWorth = await getNetWorth(solData?.inUSD, tokens);

      return {
        solData,
        tokens,
        netWorth,
      };
    },
    enabled: !!address,
  });

  console.log(walletData);

  return (
    <div className="flex flex-col items-center w-full">
      {walletData && address ? (
        <>
          <div className="w-full p-4 bg-secondary rounded-xl">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold">${walletData?.netWorth}</p>
                <p className="ml-2">(net worth)</p>
              </div>

              <Button
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  toast.success("Copied to clipboard");
                }}
                variant="ghost"
              >
                <CopyIcon className="w-4 h-4 mr-2" />
                <span>{truncatePubkey(address)}</span>
              </Button>
            </div>

            <div className="flex items-center justify-between w-full gap-2 mt-4">
              {(walletData.solData?.inSOL && walletData.solData.inSOL > 0
                ? true
                : false) && (
                <SendDialog
                  sol={walletData.solData?.inSOL ?? 0}
                  tokensAvailable={
                    walletData.tokens
                      ? walletData.tokens.map((t) => {
                          return {
                            symbol: t.symbol,
                            mint: t.mintAddress,
                            amountAvailable: t.balance,
                          };
                        })
                      : []
                  }
                  className="w-full"
                />
              )}

              <PublicKeyDialog className="w-full" address={address}>
                Deposit
              </PublicKeyDialog>

              <PrivateKeyDialog className="w-full" />
            </div>
          </div>

          {(walletData.solData?.inSOL && walletData.solData.inSOL > 0.1
            ? true
            : false) ||
          (walletData.solData?.inSOL && walletData.solData?.inSOL > 0) ? (
            <div className="flex flex-col items-center justify-center w-full gap-2 p-4 mt-4 bg-secondary rounded-xl">
              {(walletData.solData?.inSOL && walletData.solData.inSOL > 0.1
                ? true
                : false) && (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <img
                      className="w-8 h-8 mr-2 rounded-xl"
                      src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                      alt="solana"
                    />
                    <p className="text-lg font-bold">
                      {walletData?.solData?.inSOL} SOL
                    </p>
                    <p>(${walletData?.solData?.inUSD.toFixed(2)} USD)</p>
                  </div>

                  <div className="flex items-center">
                    <p className="text-lg font-bold">
                      ${walletData?.solData?.price.toFixed(2)}
                    </p>

                    <p className="ml-2">(1 SOL)</p>
                  </div>
                </div>
              )}

              {walletData?.tokens &&
                walletData?.tokens.length > 0 &&
                walletData?.tokens.map((token) => (
                  <div
                    className="flex items-center justify-between w-full mt-4"
                    key={token.symbol}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className="w-8 h-8 mr-2 rounded-xl"
                        src={token.logoURI}
                        alt={token.name}
                      />

                      <p className="text-lg font-bold">
                        {token.balance} {token.symbol}
                      </p>

                      <p>(${token.valueInUSD.toFixed(2)} USD)</p>
                    </div>

                    <div className="flex items-center">
                      <p className="text-lg font-bold">
                        ${token.priceInUSD.toFixed(2)}
                      </p>

                      <p className="ml-2">(1 {token.symbol})</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="w-full p-4 mt-4 bg-secondary rounded-xl">
              No tokens yet.
            </p>
          )}

          <div className="flex flex-col items-center justify-center w-full gap-2 p-4 mt-4 bg-secondary rounded-xl">
            <Button
              className="w-full"
              onClick={() => router.push("/wallet/non-custodial-onboarding")}
            >
              Get a non-custodial wallet
            </Button>
          </div>
        </>
      ) : (
        <Icons.spinner className="w-6 h-6 animate-spin" />
      )}
    </div>
  );
};

export default Web3AuthWallet;
