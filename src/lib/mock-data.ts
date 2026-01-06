// Types and interfaces for yield farming app

export type TokenClassification = 'Altcoin' | 'Stable' | 'LP' | 'Receipt';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type StrategyAction = 'Stake' | 'Wrap' | 'Lend' | 'Supply' | 'Farm';

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  classification: TokenClassification;
  logoUrl?: string;
}

export interface TokenBalance {
  token: Token;
  balance: string; // Human-readable format
  balanceWei: string; // Wei format
  valueUSD: number;
}

export interface StrategyStep {
  action: StrategyAction;
  protocol: string;
  tokenIn: Token;
  tokenOut?: Token;
  description: string;
}

export interface YieldStrategy {
  id: string;
  name: string;
  protocol: string;
  description: string;
  tokens: Token[];
  apy: number;
  tvl: number;
  riskLevel: RiskLevel;
  steps: StrategyStep[];
  classification: string;
}

export interface DeployedPosition {
  id: string;
  strategyId: string;
  strategyName: string;
  protocol: string;
  amountDeposited: string;
  tokenSymbol: string;
  currentValue: number;
  deployedAt: Date;
  estimatedAPY: number;
  transactionHash: string;
}

export interface TransactionPreview {
  strategyId: string;
  amount: string;
  tokenSymbol: string;
  expectedOutput: string;
  outputToken: string;
  estimatedGas: string;
  gasUSD: number;
  apyProjection: {
    oneMonth: number;
    oneYear: number;
  };
}

// Mock token data
export const MOCK_TOKENS: Token[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x...',
    decimals: 6,
    classification: 'Stable',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x...',
    decimals: 6,
    classification: 'Stable',
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x...',
    decimals: 18,
    classification: 'Stable',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x...',
    decimals: 18,
    classification: 'Altcoin',
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: '0x...',
    decimals: 18,
    classification: 'Altcoin',
  },
  {
    symbol: 'ARB',
    name: 'Arbitrum',
    address: '0x...',
    decimals: 18,
    classification: 'Altcoin',
  },
  {
    symbol: 'aUSDC',
    name: 'Aave USDC',
    address: '0x...',
    decimals: 6,
    classification: 'Receipt',
  },
  {
    symbol: 'USDC-ETH-LP',
    name: 'USDC-ETH Liquidity Pool',
    address: '0x...',
    decimals: 18,
    classification: 'LP',
  },
];

// Mock yield strategies
export const MOCK_STRATEGIES: YieldStrategy[] = [
  {
    id: 'aave-usdc-lending',
    name: 'Aave USDC Lending',
    protocol: 'Aave V3',
    description: 'Lend USDC on Aave to earn stable yield with low risk',
    tokens: [MOCK_TOKENS[0]], // USDC
    apy: 5.2,
    tvl: 450000000,
    riskLevel: 'Low',
    classification: 'Stable Lending',
    steps: [
      {
        action: 'Supply',
        protocol: 'Aave V3',
        tokenIn: MOCK_TOKENS[0],
        tokenOut: MOCK_TOKENS[6],
        description: 'Supply USDC to Aave V3 pool and receive aUSDC',
      },
    ],
  },
  {
    id: 'compound-dai-lending',
    name: 'Compound DAI Lending',
    protocol: 'Compound',
    description: 'Supply DAI to Compound for stable yield generation',
    tokens: [MOCK_TOKENS[2]], // DAI
    apy: 4.8,
    tvl: 320000000,
    riskLevel: 'Low',
    classification: 'Stable Lending',
    steps: [
      {
        action: 'Supply',
        protocol: 'Compound',
        tokenIn: MOCK_TOKENS[2],
        description: 'Supply DAI to Compound market',
      },
    ],
  },
  {
    id: 'curve-3pool',
    name: 'Curve 3Pool',
    protocol: 'Curve',
    description: 'Provide liquidity to Curve 3Pool (USDC/USDT/DAI) for stable yield',
    tokens: [MOCK_TOKENS[0], MOCK_TOKENS[1], MOCK_TOKENS[2]], // USDC, USDT, DAI
    apy: 3.5,
    tvl: 1200000000,
    riskLevel: 'Low',
    classification: 'Stable LP',
    steps: [
      {
        action: 'Supply',
        protocol: 'Curve',
        tokenIn: MOCK_TOKENS[0],
        description: 'Add liquidity to Curve 3Pool',
      },
      {
        action: 'Stake',
        protocol: 'Curve',
        tokenIn: MOCK_TOKENS[7],
        description: 'Stake LP tokens to earn CRV rewards',
      },
    ],
  },
  {
    id: 'uniswap-v3-eth-usdc',
    name: 'Uniswap V3 ETH-USDC',
    protocol: 'Uniswap V3',
    description: 'Provide liquidity to Uniswap V3 ETH-USDC pool for trading fees',
    tokens: [MOCK_TOKENS[3], MOCK_TOKENS[0]], // ETH, USDC
    apy: 12.5,
    tvl: 280000000,
    riskLevel: 'Medium',
    classification: 'Volatile LP',
    steps: [
      {
        action: 'Supply',
        protocol: 'Uniswap V3',
        tokenIn: MOCK_TOKENS[3],
        description: 'Provide ETH and USDC liquidity in concentrated range',
      },
    ],
  },
  {
    id: 'lido-eth-staking',
    name: 'Lido ETH Staking',
    protocol: 'Lido',
    description: 'Stake ETH through Lido to earn staking rewards',
    tokens: [MOCK_TOKENS[3]], // ETH
    apy: 3.8,
    tvl: 15000000000,
    riskLevel: 'Low',
    classification: 'ETH Staking',
    steps: [
      {
        action: 'Stake',
        protocol: 'Lido',
        tokenIn: MOCK_TOKENS[3],
        tokenOut: { ...MOCK_TOKENS[4], symbol: 'stETH', name: 'Staked ETH' },
        description: 'Stake ETH and receive stETH',
      },
    ],
  },
  {
    id: 'yearn-usdc-vault',
    name: 'Yearn USDC Vault',
    protocol: 'Yearn Finance',
    description: 'Automated yield farming strategy for USDC',
    tokens: [MOCK_TOKENS[0]], // USDC
    apy: 6.5,
    tvl: 95000000,
    riskLevel: 'Medium',
    classification: 'Automated Vault',
    steps: [
      {
        action: 'Supply',
        protocol: 'Yearn',
        tokenIn: MOCK_TOKENS[0],
        description: 'Deposit USDC into Yearn vault',
      },
      {
        action: 'Farm',
        protocol: 'Multiple',
        tokenIn: MOCK_TOKENS[0],
        description: 'Vault auto-compounds across multiple DeFi protocols',
      },
    ],
  },
  {
    id: 'stargate-usdc',
    name: 'Stargate USDC Pool',
    protocol: 'Stargate',
    description: 'Provide liquidity for cross-chain USDC transfers',
    tokens: [MOCK_TOKENS[0]], // USDC
    apy: 7.2,
    tvl: 180000000,
    riskLevel: 'Medium',
    classification: 'Bridge Liquidity',
    steps: [
      {
        action: 'Supply',
        protocol: 'Stargate',
        tokenIn: MOCK_TOKENS[0],
        description: 'Add USDC to Stargate liquidity pool',
      },
      {
        action: 'Stake',
        protocol: 'Stargate',
        tokenIn: { ...MOCK_TOKENS[0], symbol: 'S*USDC' },
        description: 'Stake pool tokens to earn STG rewards',
      },
    ],
  },
];

// Generate consistent mock balances based on wallet address
export function generateMockBalances(address: string): TokenBalance[] {
  // Use address hash to generate consistent but varied balances
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const selectedTokens = [
    MOCK_TOKENS[0], // USDC
    MOCK_TOKENS[1], // USDT
    MOCK_TOKENS[2], // DAI
    MOCK_TOKENS[3], // ETH
  ];

  return selectedTokens.map((token, index) => {
    const seed = (hash + index * 123) % 10000;
    let balance: number;
    let valueUSD: number;

    if (token.classification === 'Stable') {
      balance = 500 + (seed % 1500); // 500-2000 stablecoins
      valueUSD = balance;
    } else {
      balance = 0.1 + (seed % 200) / 100; // 0.1-2.1 ETH
      valueUSD = balance * 2400; // Assume ETH at $2400
    }

    return {
      token,
      balance: balance.toFixed(token.decimals),
      balanceWei: (BigInt(Math.floor(balance * 10 ** token.decimals))).toString(),
      valueUSD,
    };
  });
}

// Find strategies by token symbols
export function findStrategiesByTokens(tokenSymbols: string[]): YieldStrategy[] {
  return MOCK_STRATEGIES.filter((strategy) =>
    strategy.tokens.some((token) => tokenSymbols.includes(token.symbol))
  );
}

// Find strategy by ID
export function findStrategyById(id: string): YieldStrategy | undefined {
  return MOCK_STRATEGIES.find((s) => s.id === id);
}

// Generate mock transaction hash
export function generateMockTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Calculate APY projection
export function calculateAPYProjection(
  amount: number,
  apy: number
): { oneMonth: number; oneYear: number } {
  const oneMonth = amount * (apy / 100) * (30 / 365);
  const oneYear = amount * (apy / 100);

  return {
    oneMonth: Number(oneMonth.toFixed(2)),
    oneYear: Number(oneYear.toFixed(2)),
  };
}

// Get token by symbol
export function getTokenBySymbol(symbol: string): Token | undefined {
  return MOCK_TOKENS.find((t) => t.symbol === symbol);
}
