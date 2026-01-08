import type { DeployedPosition, TokenBalance } from './mock-data';
import { MOCK_STRATEGIES, MOCK_TOKENS } from './mock-data';
import {
  executeFindYieldStrategies,
  executeGetPositions,
  executeGetWalletBalances,
} from './ai-tools';

type FakeAiRequest = {
  prompt: string;
  walletAddress: string | null;
  balances: TokenBalance[];
  positions: DeployedPosition[];
};

type FakeAiResponse = {
  message: string;
};

const DEFAULT_LATENCY_RANGE: [number, number] = [500, 1100];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatUSD(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatTVL(value: number) {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return formatUSD(value);
}

function extractTokens(prompt: string) {
  const normalized = prompt.toUpperCase();
  return MOCK_TOKENS.map((token) => token.symbol).filter((symbol) =>
    normalized.includes(symbol)
  );
}

function extractRisk(prompt: string): 'Low' | 'Medium' | 'High' | undefined {
  const normalized = prompt.toLowerCase();
  if (normalized.includes('low')) return 'Low';
  if (normalized.includes('medium')) return 'Medium';
  if (normalized.includes('high')) return 'High';
  return undefined;
}

function extractMinApy(prompt: string): number | undefined {
  const match = prompt.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return undefined;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildBalancesMessage(balances: TokenBalance[], walletAddress: string | null) {
  if (!walletAddress) {
    return [
      'Wallet is not connected yet.',
      'Connect a wallet to see balances and get strategy ideas.',
    ].join('\n');
  }

  if (balances.length === 0) {
    return [
      'Wallet connected, but no balances are available yet.',
      'Try again in a moment or ask for strategies without balances.',
    ].join('\n');
  }

  const summary = executeGetWalletBalances(balances);
  const lines = summary.balances.map(
    (balance) =>
      `- ${balance.token.symbol}: ${balance.balance} (${formatUSD(balance.valueUSD)})`
  );

  return [
    'Wallet snapshot:',
    ...lines,
    `Total value: ${formatUSD(summary.totalValueUSD)}`,
    '',
    'Data is simulated for this demo.',
    'Ask for "strategies" to see where these tokens can earn yield.',
  ].join('\n');
}

function buildStrategiesMessage(prompt: string, balances: TokenBalance[]) {
  const tokensFromPrompt = extractTokens(prompt);
  const tokensFromBalances = balances.map((balance) => balance.token.symbol);
  const riskLevel = extractRisk(prompt);
  const minAPY = extractMinApy(prompt);

  const strategies = executeFindYieldStrategies({
    tokens: tokensFromPrompt.length > 0 ? tokensFromPrompt : tokensFromBalances,
    minAPY,
    riskLevel,
  });

  if (strategies.count === 0) {
    return [
      'No strategies matched those filters.',
      'Try another token (USDC, DAI, ETH) or remove the risk/APY filter.',
    ].join('\n');
  }

  const list = strategies.strategies.slice(0, 4).map((strategy) => {
    const tokens = strategy.tokens.map((token) => token.symbol).join('/');
    return `- ${strategy.name} (${tokens}) — ${strategy.apy}% APY, ${strategy.riskLevel} risk, TVL ${formatTVL(strategy.tvl)}`;
  });

  return [
    'Here are a few strategies from the demo backend:',
    ...list,
    '',
    'Data is simulated for this demo.',
    'Ask for details on any strategy name if you want the steps.',
  ].join('\n');
}

function buildPositionsMessage(positions: DeployedPosition[], walletAddress: string | null) {
  if (!walletAddress) {
    return [
      'Connect a wallet to track positions in the demo portfolio.',
      'Once connected, I can summarize deposits and projected returns.',
    ].join('\n');
  }

  const summary = executeGetPositions(positions);

  if (summary.count === 0) {
    return [
      'No active positions yet.',
      'Ask for strategies to decide where to deploy funds.',
    ].join('\n');
  }

  const lines = summary.positions.map((position) => {
    return `- ${position.strategyName}: ${position.amountDeposited} ${position.tokenSymbol} at ~${position.estimatedAPY}% APY`;
  });

  return [
    'Active positions:',
    ...lines,
    `Total value: ${formatUSD(summary.totalValue)}`,
    'Data is simulated for this demo.',
  ].join('\n');
}

function buildGeneralMessage() {
  const topStrategies = MOCK_STRATEGIES.slice(0, 3).map(
    (strategy) =>
      `- ${strategy.name} — ${strategy.apy}% APY, ${strategy.riskLevel} risk`
  );

  return [
    'I can pull yield ideas, balances, and positions from the demo backend.',
    'All data is simulated for this prototype.',
    '',
    'Popular strategies right now:',
    ...topStrategies,
    '',
    'Try asking about balances, strategies, or positions.',
  ].join('\n');
}

export async function simulateAiRequest(request: FakeAiRequest): Promise<FakeAiResponse> {
  const latency =
    DEFAULT_LATENCY_RANGE[0] +
    Math.floor(Math.random() * (DEFAULT_LATENCY_RANGE[1] - DEFAULT_LATENCY_RANGE[0]));

  await sleep(latency);

  const prompt = request.prompt.trim();
  const normalized = prompt.toLowerCase();

  if (normalized.includes('balance') || normalized.includes('wallet')) {
    return {
      message: buildBalancesMessage(request.balances, request.walletAddress),
    };
  }

  if (
    normalized.includes('strateg') ||
    normalized.includes('yield') ||
    normalized.includes('apy')
  ) {
    return {
      message: buildStrategiesMessage(prompt, request.balances),
    };
  }

  if (
    normalized.includes('position') ||
    normalized.includes('portfolio') ||
    normalized.includes('deposit') ||
    normalized.includes('withdraw')
  ) {
    return {
      message: buildPositionsMessage(request.positions, request.walletAddress),
    };
  }

  return { message: buildGeneralMessage() };
}
