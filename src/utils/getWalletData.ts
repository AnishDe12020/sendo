import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Connection,
  GetProgramAccountsFilter,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import axios from "axios";

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

export { getSOL, getTokens, getNetWorth };
