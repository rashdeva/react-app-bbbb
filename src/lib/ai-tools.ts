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
