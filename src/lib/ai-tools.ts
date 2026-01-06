import Anthropic from '@anthropic-ai/sdk';
import type {
  TokenBalance,
  YieldStrategy,
  DeployedPosition,
  TransactionPreview,
} from './mock-data';
import {
  MOCK_STRATEGIES,
  MOCK_TOKENS,
  findStrategiesByTokens,
  findStrategyById,
  calculateAPYProjection,
  getTokenBySymbol,
} from './mock-data';

// Define AI tool schemas for Claude
export const AI_TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_wallet_balances',
    description:
      'Get the token balances for the connected wallet. Returns all tokens with their amounts, USD values, and classifications (Altcoin/Stable/LP/Receipt).',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'classify_tokens',
    description:
      'Get educational information about token classifications. Explains what Altcoins, Stablecoins, LP tokens, and Receipt tokens are.',
    input_schema: {
      type: 'object',
      properties: {
        tokens: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional array of token symbols to classify',
        },
      },
    },
  },
  {
    name: 'find_yield_strategies',
    description:
      'Find yield farming strategies based on available tokens, minimum APY, or risk level preferences. Returns matching strategies with APY, TVL, and risk information.',
    input_schema: {
      type: 'object',
      properties: {
        tokens: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by token symbols (e.g., ["USDC", "ETH"])',
        },
        minAPY: {
          type: 'number',
          description: 'Minimum APY percentage (e.g., 5 for 5%)',
        },
        riskLevel: {
          type: 'string',
          enum: ['Low', 'Medium', 'High'],
          description: 'Filter by risk level',
        },
      },
    },
  },
  {
    name: 'get_strategy_details',
    description:
      'Get detailed information about a specific yield farming strategy, including all steps, protocols involved, and projected returns.',
    input_schema: {
      type: 'object',
      properties: {
        strategyId: {
          type: 'string',
          description: 'The unique ID of the strategy',
        },
      },
      required: ['strategyId'],
    },
  },
  {
    name: 'preview_deposit',
    description:
      'Preview a deposit transaction before execution. Shows expected output tokens, APY projections, and estimated gas costs.',
    input_schema: {
      type: 'object',
      properties: {
        strategyId: {
          type: 'string',
          description: 'The strategy ID to deposit into',
        },
        amount: {
          type: 'string',
          description: 'Amount to deposit (e.g., "100.5")',
        },
        tokenSymbol: {
          type: 'string',
          description: 'Symbol of the token to deposit (e.g., "USDC")',
        },
      },
      required: ['strategyId', 'amount', 'tokenSymbol'],
    },
  },
  {
    name: 'execute_deposit',
    description:
      'Execute a deposit into a yield farming strategy. This is a simulated transaction for demo purposes. Returns a transaction hash and confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        strategyId: {
          type: 'string',
          description: 'The strategy ID to deposit into',
        },
        amount: {
          type: 'string',
          description: 'Amount to deposit',
        },
        tokenSymbol: {
          type: 'string',
          description: 'Symbol of the token to deposit',
        },
      },
      required: ['strategyId', 'amount', 'tokenSymbol'],
    },
  },
  {
    name: 'get_positions',
    description:
      'Get all active yield farming positions for the connected wallet. Shows deposited amounts, current values, and estimated returns.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'withdraw_from_position',
    description:
      'Withdraw funds from an active yield farming position. This is a simulated transaction for demo purposes.',
    input_schema: {
      type: 'object',
      properties: {
        positionId: {
          type: 'string',
          description: 'The unique ID of the position to withdraw from',
        },
      },
      required: ['positionId'],
    },
  },
];

// Tool execution functions

export function executeGetWalletBalances(
  balances: TokenBalance[]
): { balances: TokenBalance[]; totalValueUSD: number } {
  const totalValueUSD = balances.reduce((sum, b) => sum + b.valueUSD, 0);
  return {
    balances,
    totalValueUSD: Number(totalValueUSD.toFixed(2)),
  };
}

export function executeClassifyTokens(tokenSymbols?: string[]): {
  classifications: Record<string, string>;
  education: Record<string, string>;
} {
  const education = {
    Altcoin: 'Volatile cryptocurrencies like ETH, ARB. Higher risk, higher potential returns.',
    Stable: 'Stablecoins like USDC, USDT, DAI. Pegged to $1, low volatility, lower but stable yields.',
    LP: 'Liquidity Provider tokens from DEXs. Represent your share in a trading pool. Earn from fees but exposed to impermanent loss.',
    Receipt: 'Receipt tokens like aUSDC, stETH. Represent your deposits in lending protocols or staking. Accrue value over time.',
  };

  const classifications: Record<string, string> = {};

  if (tokenSymbols && tokenSymbols.length > 0) {
    tokenSymbols.forEach((symbol) => {
      const token = getTokenBySymbol(symbol);
      if (token) {
        classifications[symbol] = token.classification;
      }
    });
  } else {
    MOCK_TOKENS.forEach((token) => {
      classifications[token.symbol] = token.classification;
    });
  }

  return { classifications, education };
}

export function executeFindYieldStrategies(params: {
  tokens?: string[];
  minAPY?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
}): { strategies: YieldStrategy[]; count: number } {
  let strategies = MOCK_STRATEGIES;

  if (params.tokens && params.tokens.length > 0) {
    strategies = findStrategiesByTokens(params.tokens);
  }

  if (params.minAPY) {
    strategies = strategies.filter((s) => s.apy >= params.minAPY!);
  }

  if (params.riskLevel) {
    strategies = strategies.filter((s) => s.riskLevel === params.riskLevel);
  }

  return {
    strategies,
    count: strategies.length,
  };
}

export function executeGetStrategyDetails(
  strategyId: string
): YieldStrategy | { error: string } {
  const strategy = findStrategyById(strategyId);
  if (!strategy) {
    return { error: `Strategy with ID "${strategyId}" not found` };
  }
  return strategy;
}

export function executePreviewDeposit(
  strategyId: string,
  amount: string,
  tokenSymbol: string
): TransactionPreview | { error: string } {
  const strategy = findStrategyById(strategyId);
  if (!strategy) {
    return { error: `Strategy with ID "${strategyId}" not found` };
  }

  const token = getTokenBySymbol(tokenSymbol);
  if (!token) {
    return { error: `Token "${tokenSymbol}" not found` };
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return { error: 'Invalid amount' };
  }

  const apyProjection = calculateAPYProjection(amountNum, strategy.apy);

  // Determine output token (usually a receipt token or LP token)
  const outputToken = strategy.steps[0].tokenOut?.symbol || `y${tokenSymbol}`;

  return {
    strategyId,
    amount,
    tokenSymbol,
    expectedOutput: amount, // 1:1 for simplicity in demo
    outputToken,
    estimatedGas: '0.0012', // Mock gas in ETH
    gasUSD: 2.88, // Mock gas in USD
    apyProjection,
  };
}

export function executeDeposit(
  strategyId: string,
  amount: string,
  tokenSymbol: string,
  onDeposit: (strategy: YieldStrategy, amount: string, tokenSymbol: string) => DeployedPosition
): { success: boolean; position?: DeployedPosition; error?: string } {
  const strategy = findStrategyById(strategyId);
  if (!strategy) {
    return { success: false, error: `Strategy with ID "${strategyId}" not found` };
  }

  const token = getTokenBySymbol(tokenSymbol);
  if (!token) {
    return { success: false, error: `Token "${tokenSymbol}" not found` };
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return { success: false, error: 'Invalid amount' };
  }

  // Execute deposit via store
  const position = onDeposit(strategy, amount, tokenSymbol);

  return {
    success: true,
    position,
  };
}

export function executeGetPositions(
  positions: DeployedPosition[]
): { positions: DeployedPosition[]; count: number; totalValue: number } {
  const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);

  return {
    positions,
    count: positions.length,
    totalValue: Number(totalValue.toFixed(2)),
  };
}

export function executeWithdrawFromPosition(
  positionId: string,
  onWithdraw: (positionId: string) => void,
  positions: DeployedPosition[]
): { success: boolean; position?: DeployedPosition; error?: string } {
  const position = positions.find((p) => p.id === positionId);

  if (!position) {
    return { success: false, error: `Position with ID "${positionId}" not found` };
  }

  // Execute withdrawal via store
  onWithdraw(positionId);

  return {
    success: true,
    position,
  };
}
