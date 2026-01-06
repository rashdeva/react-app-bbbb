import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TokenBalance, DeployedPosition, YieldStrategy } from './mock-data';
import { generateMockBalances, generateMockTxHash } from './mock-data';

interface AppState {
  // Wallet state
  connectedAddress: string | null;
  mockBalances: TokenBalance[];

  // Deployed positions
  positions: DeployedPosition[];

  // UI state
  selectedStrategy: YieldStrategy | null;
  pendingTransaction: {
    type: 'deposit' | 'withdraw';
    data: unknown;
  } | null;

  // Actions
  setConnectedAddress: (address: string | null) => void;
  generateMockBalancesForAddress: (address: string) => void;
  setSelectedStrategy: (strategy: YieldStrategy | null) => void;
  deployStrategy: (strategy: YieldStrategy, amount: string, tokenSymbol: string) => DeployedPosition;
  withdrawPosition: (positionId: string) => void;
  getPositionById: (positionId: string) => DeployedPosition | undefined;
  clearWalletData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      connectedAddress: null,
      mockBalances: [],
      positions: [],
      selectedStrategy: null,
      pendingTransaction: null,

      // Set connected address
      setConnectedAddress: (address) => {
        set({ connectedAddress: address });
        if (address) {
          get().generateMockBalancesForAddress(address);
        } else {
          set({ mockBalances: [], positions: [] });
        }
      },

      // Generate mock balances for connected wallet
      generateMockBalancesForAddress: (address) => {
        const balances = generateMockBalances(address);
        set({ mockBalances: balances });
      },

      // Set selected strategy
      setSelectedStrategy: (strategy) => {
        set({ selectedStrategy: strategy });
      },

      // Deploy strategy (simulated)
      deployStrategy: (strategy, amount, tokenSymbol) => {
        const position: DeployedPosition = {
          id: crypto.randomUUID(),
          strategyId: strategy.id,
          strategyName: strategy.name,
          protocol: strategy.protocol,
          amountDeposited: amount,
          tokenSymbol,
          currentValue: parseFloat(amount),
          deployedAt: new Date(),
          estimatedAPY: strategy.apy,
          transactionHash: generateMockTxHash(),
        };

        set((state) => ({
          positions: [...state.positions, position],
        }));

        // Update balances (deduct deposited amount)
        set((state) => ({
          mockBalances: state.mockBalances.map((balance) => {
            if (balance.token.symbol === tokenSymbol) {
              const newBalance = parseFloat(balance.balance) - parseFloat(amount);
              return {
                ...balance,
                balance: newBalance.toFixed(balance.token.decimals),
                balanceWei: (BigInt(Math.floor(newBalance * 10 ** balance.token.decimals))).toString(),
                valueUSD: balance.token.classification === 'Stable'
                  ? newBalance
                  : newBalance * 2400,
              };
            }
            return balance;
          }),
        }));

        return position;
      },

      // Withdraw from position (simulated)
      withdrawPosition: (positionId) => {
        const position = get().getPositionById(positionId);
        if (!position) return;

        // Remove position
        set((state) => ({
          positions: state.positions.filter((p) => p.id !== positionId),
        }));

        // Return funds to balance
        set((state) => ({
          mockBalances: state.mockBalances.map((balance) => {
            if (balance.token.symbol === position.tokenSymbol) {
              const returnAmount = parseFloat(position.amountDeposited);
              const newBalance = parseFloat(balance.balance) + returnAmount;
              return {
                ...balance,
                balance: newBalance.toFixed(balance.token.decimals),
                balanceWei: (BigInt(Math.floor(newBalance * 10 ** balance.token.decimals))).toString(),
                valueUSD: balance.token.classification === 'Stable'
                  ? newBalance
                  : newBalance * 2400,
              };
            }
            return balance;
          }),
        }));
      },

      // Get position by ID
      getPositionById: (positionId) => {
        return get().positions.find((p) => p.id === positionId);
      },

      // Clear wallet data
      clearWalletData: () => {
        set({
          connectedAddress: null,
          mockBalances: [],
          selectedStrategy: null,
          pendingTransaction: null,
        });
      },
    }),
    {
      name: 'yield-farming-storage',
      partialize: (state) => ({
        positions: state.positions,
      }),
    }
  )
);
