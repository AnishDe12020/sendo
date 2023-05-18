"use client";

import useWeb3Auth from "@/hooks/useWeb3Auth";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  Connection,
  GetProgramAccountsFilter,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { useAsyncMemo } from "use-async-memo";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import axios from "axios";
import { Icons } from "./icons";
import PublicKeyDialog from "./PublicKeyDialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import { truncatePubkey } from "@/utils/truncate";
import SendDialog from "./SendDialog";

const getSOL = async (address: string, connection: Connection) => {
  if (!address) {
    return null;
  }
  const balance = await connection.getBalance(new PublicKey(address));

  const {
    data: { data },
  } = await axios.get("https://price.jup.ag/v3/price?ids=SOL");

  const solPrice = data["SOL"]["price"];

  return {
    inSOL: balance / LAMPORTS_PER_SOL,
    inUSD: (balance / LAMPORTS_PER_SOL) * solPrice,
    price: solPrice,
  };
};

const getTokens = async (address: string, connection: Connection) => {
  if (!address) {
    return null;
  }

  const filters: GetProgramAccountsFilter[] = [
    {
      dataSize: 165,
    },
    {
      memcmp: {
        offset: 32,
        bytes: address,
      },
    },
  ];

  const accounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: filters,
  });

  console.log("accounts", accounts);

  const { data: tokenList } = await axios.get("https://cache.jup.ag/tokens");

  const tokensParsedInfo = accounts.map((account) => {
    const parsedAccountInfo: any = account.account.data;
    const mintAddress: string = parsedAccountInfo["parsed"]["info"]["mint"];
    const tokenBalance: number =
      parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];

    return {
      mintAddress,
      tokenBalance,
      ata: account.pubkey.toBase58(),
    };
  });

  const {
    data: { data: splPrices },
  } = await axios.get(
    `https://price.jup.ag/v3/price?ids=${tokensParsedInfo
      .map((t) => t.mintAddress)
      .join(",")}`
  );

  console.log("splPrices", splPrices);

  const tokens = tokensParsedInfo.map(({ mintAddress, tokenBalance, ata }) => {
    const meta = tokenList.find((token: any) => token.address === mintAddress);

    const priceInUSD = Number(splPrices[mintAddress]["price"]);

    const valueInUSD = priceInUSD * tokenBalance;

    return {
      ata,
      balance: tokenBalance,
      priceInUSD,
      valueInUSD,
      ...meta,
    };
  });

  return tokens;
};

const getNetWorth = async (
  solUSD: number | null | undefined,
  tokens: any[] | null
) => {
  if (!solUSD && !tokens) {
    return null;
  }

  if (!tokens || (tokens.length === 0 && solUSD)) {
    return solUSD;
  }

  if (!solUSD && tokens && tokens.length > 0) {
    return tokens.reduce((acc: any, token: { valueInUSD: any }) => {
      return acc + token.valueInUSD;
    }, 0);
  }

  const netWorth: number = tokens.reduce(
    (acc: number, token: { valueInUSD: number }) => {
      return acc + token.valueInUSD;
    },
    solUSD
  );

  return netWorth.toFixed(2);
};

const Web3AuthWallet = () => {
  const { address } = useWeb3Auth();
  const { connection } = useConnection();

  const walletData = useAsyncMemo(
    async () => {
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
    [address],
    null
  );

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
              <PublicKeyDialog className="w-full" address={address}>
                Deposit
              </PublicKeyDialog>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-full gap-2 p-4 mt-4 bg-secondary rounded-xl">
            {walletData?.solData && (
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
        </>
      ) : (
        <Icons.spinner className="w-6 h-6 animate-spin" />
      )}
    </div>
  );
};

export default Web3AuthWallet;
