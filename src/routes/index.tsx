'use client';

import { createFileRoute } from '@tanstack/react-router';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useAccount as useWagmiAccount } from 'wagmi';
import { useEffect } from 'react';
import { YieldFarmingHeader } from '@/components/yield-farming/header';
import { YieldFarmingThread } from '@/components/yield-farming/thread';
import { useAppStore } from '@/lib/store';
import { useAIClient } from '@/lib/use-ai-client';

export const Route = createFileRoute('/')({ component: YieldFarmingApp });

function YieldFarmingApp() {
  const { address, isConnected } = useWagmiAccount();
  const { setConnectedAddress } = useAppStore();

  // Update store when wallet connection changes
  useEffect(() => {
    if (isConnected && address) {
      setConnectedAddress(address);
    } else {
      setConnectedAddress(null);
    }
  }, [address, isConnected, setConnectedAddress]);

  // Create client-side AI runtime
  const runtime = useAIClient(address || null);

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
