import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { bsc } from 'wagmi/chains';
import { BSC_TOKENS, TOKEN_PRICES } from '@/lib/token-addresses';

// Standard ERC20/BEP20 ABI for balanceOf
const erc20Abi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
] as const;

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string; // Formatted balance
  balanceRaw: bigint; // Raw balance in wei
  valueUSD: number; // USD value
}

export function useTokenBalances() {
  const { address } = useAccount();

  // Fetch BNB balance (native token)
  const {
    data: bnbBalance,
    isLoading: bnbLoading,
    error: bnbError,
  } = useBalance({
    address,
    chainId: bsc.id,
  });

  // Fetch BEP20 token balances using multicall
  const {
    data: tokenBalances,
    isLoading: tokensLoading,
    error: tokensError,
  } = useReadContracts({
    contracts: BSC_TOKENS.map((token) => ({
      address: token.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
      chainId: bsc.id,
    })),
  });

  // Format balances and calculate USD values
  const balances: TokenBalance[] = [];
  let totalUSD = 0;

  // Add BNB balance (always show, even if 0)
  const bnbAmount = bnbBalance ? parseFloat(formatUnits(bnbBalance.value, 18)) : 0;
  const bnbValueUSD = bnbAmount * TOKEN_PRICES.BNB;

  balances.push({
    symbol: 'BNB',
    name: 'Binance Coin',
    balance: bnbAmount.toFixed(4),
    balanceRaw: bnbBalance?.value || 0n,
    valueUSD: bnbValueUSD,
  });

  totalUSD += bnbValueUSD;

  // Add BEP20 token balances (always show all tokens, even with 0 balance)
  BSC_TOKENS.forEach((token, index) => {
    const result = tokenBalances?.[index];
    let amount = 0;
    let balanceRaw = 0n;

    if (result?.status === 'success' && result.result) {
      amount = parseFloat(formatUnits(result.result, token.decimals));
      balanceRaw = result.result;
    }

    const valueUSD = amount * (TOKEN_PRICES[token.symbol] || 0);

    balances.push({
      symbol: token.symbol,
      name: token.name,
      balance: amount.toFixed(4),
      balanceRaw,
      valueUSD,
    });

    totalUSD += valueUSD;
  });

  return {
    balances,
    totalUSD,
    isLoading: bnbLoading || tokensLoading,
    error: bnbError || tokensError,
  };
}
