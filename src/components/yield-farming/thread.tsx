import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from '@assistant-ui/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconSend } from '@tabler/icons-react';
import type { FC } from 'react';

export function YieldFarmingThread() {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      {/* Welcome message */}
      <ThreadPrimitive.Empty>
        <div className="flex h-full items-center justify-center p-8">
          <div className="max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-semibold">
              Blockchain & AI Yield Brain
            </h2>
            <p className="mb-6 text-muted-foreground">
              I'm your AI-powered DeFi assistant. Ask me about yield farming strategies,
              connect your wallet for personalized recommendations, or manage your positions.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Try asking:</p>
              <ul className="list-inside list-disc text-left">
                <li>What is yield farming?</li>
                <li>What are the best strategies for stablecoins?</li>
                <li>Connect your wallet to see your balances</li>
              </ul>
            </div>
          </div>
        </div>
      </ThreadPrimitive.Empty>

      {/* Messages */}
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto bg-background px-4 pt-8">
        <ThreadPrimitive.Messages components={{ Message: ThreadMessage }} />
      </ThreadPrimitive.Viewport>

      {/* Composer */}
      <div className="border-t border-border p-4">
        <ComposerPrimitive.Root className="flex gap-2">
          <ComposerPrimitive.Input asChild>
            <Input
              placeholder="Ask about yield farming strategies..."
              className="flex-1"
            />
          </ComposerPrimitive.Input>
          <ComposerPrimitive.Send asChild>
            <Button size="icon">
              <IconSend className="h-4 w-4" />
            </Button>
          </ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
}

const ThreadMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mb-6 flex gap-3">
      {/* User message */}
      <MessagePrimitive.If user>
        <div className="ml-auto max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-primary-foreground">
          <MessagePrimitive.Content />
        </div>
      </MessagePrimitive.If>

      {/* Assistant message */}
      <MessagePrimitive.If assistant>
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <span className="text-sm font-semibold">AI</span>
          </div>
          <div className="prose prose-sm flex-1 space-y-2 max-w-none dark:prose-invert">
            <MessagePrimitive.Content />

            {/* Tool calls rendering */}
            <MessagePrimitive.Parts>
              {/* This will be enhanced later with custom tool UI */}
            </MessagePrimitive.Parts>
          </div>
        </div>
      </MessagePrimitive.If>
    </MessagePrimitive.Root>
  );
};
