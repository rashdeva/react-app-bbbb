'use client';

import { createFileRoute } from '@tanstack/react-router';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useChatRuntime, AssistantChatTransport } from '@assistant-ui/react-ai-sdk';
import { useAccount as useWagmiAccount } from 'wagmi';
import { useEffect, useMemo } from 'react';
import { YieldFarmingHeader } from '@/components/yield-farming/header';
import { YieldFarmingThread } from '@/components/yield-farming/thread';
import { useAppStore } from '@/lib/store';

export const Route = createFileRoute('/')({ component: YieldFarmingApp });

function YieldFarmingApp() {
  const { address, isConnected } = useWagmiAccount();
  const { setConnectedAddress, mockBalances, positions } = useAppStore();

  // Update store when wallet connection changes
  useEffect(() => {
    if (isConnected && address) {
      setConnectedAddress(address);
    } else {
      setConnectedAddress(null);
    }
  }, [address, isConnected, setConnectedAddress]);

  // Create assistant runtime with wallet context
  const runtime = useChatRuntime({
    transport: useMemo(
      () =>
        new AssistantChatTransport({
          api: '/api/chat',
          body: {
            walletAddress: address || null,
            mockBalances: mockBalances || [],
            positions: positions || [],
          },
        }),
      [address, mockBalances, positions]
    ),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-dvh flex-col bg-background">
        <YieldFarmingHeader />

        <div className="flex-1 overflow-hidden">
          <YieldFarmingThread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
