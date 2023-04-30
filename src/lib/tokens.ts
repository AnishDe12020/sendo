export const TOKEN_SOL = {
  decimals: 9,
  name: "Solana",
  symbol: "SOL",
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
};

export const TOKEN_USDC = {
  address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  chainId: 101,
  decimals: 6,
  name: "USD Coin",
  symbol: "USDC",
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  extensions: {
    coingeckoId: "usd-coin",
  },
};

export const TOKEN_USDT = {
  address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  chainId: 101,
  decimals: 6,
  name: "USDT",
  symbol: "USDT",
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
  extensions: {
    coingeckoId: "tether",
  },
};

export const TOKEN_SHDW = {
  address: "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y",
  chainId: 101,
  decimals: 9,
  name: "Shadow Token",
  symbol: "SHDW",
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y/logo.png",
  extensions: {
    coingeckoId: "genesysgo-shadow",
  },
};

export const TOKEN_BONK = {
  address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  chainId: 101,
  decimals: 5,
  name: "BonkCoin",
  symbol: "Bonk",
  logoURI:
    "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I?ext=png",
  extensions: {
    coingeckoId: "bonk",
  },
};

export enum SPL_TOKEN_ENUM {
  USDC = "USDC",
  USDT = "USDT",
  SHDW = "SHDW",
  BONK = "BONK",
}

export const SUPPORTED_SPL_TOKENS = {
  [SPL_TOKEN_ENUM.USDC]: TOKEN_USDC,
  [SPL_TOKEN_ENUM.USDT]: TOKEN_USDT,
  [SPL_TOKEN_ENUM.SHDW]: TOKEN_SHDW,
  [SPL_TOKEN_ENUM.BONK]: TOKEN_BONK,
};

export const SUPPORTED_TOKENS_LIST = [
  TOKEN_SOL,
  TOKEN_USDC,
  TOKEN_USDT,
  TOKEN_SHDW,
  TOKEN_BONK,
];
