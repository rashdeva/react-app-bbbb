// BSC (Binance Smart Chain) Token Addresses
// Verified contract addresses from BSCScan

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

export const BSC_TOKENS: TokenInfo[] = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    decimals: 18,
  },
  {
    symbol: 'BUSD',
    name: 'Binance USD',
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    decimals: 18,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum Token',
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    decimals: 18,
  },
  {
    symbol: 'CAKE',
    name: 'PancakeSwap Token',
    address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    decimals: 18,
  },
];

// Static token prices in USD
// TODO: Replace with real-time price feed API
export const TOKEN_PRICES: Record<string, number> = {
  BNB: 600,
  USDT: 1,
  USDC: 1,
  BUSD: 1,
  ETH: 3400,
  CAKE: 2.5,
};
