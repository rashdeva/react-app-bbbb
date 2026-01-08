import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useTokenBalances } from '@/hooks/use-token-balances';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { formatUSDCompact } from '@/lib/format';

export function WalletBalance() {
  const { address, isConnected } = useAccount();
  const { balances, totalUSD, isLoading } = useTokenBalances();
  const [open, setOpen] = useState(false);

  if (!isConnected || !address) {
    return null;
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-mono"
          disabled={isLoading}
          onClick={() => setOpen(true)}
        >
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            formatUSDCompact(totalUSD)
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        {/* Drawer handle */}
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted" />

        <DrawerHeader>
          <DrawerTitle>Token Balances</DrawerTitle>
        </DrawerHeader>

        <DrawerBody className="space-y-3">
          <div className="space-y-2">
            {balances.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">{token.symbol}</span>
                  {isLoading ? (
                    <div className="h-4 w-24 animate-pulse rounded bg-muted-foreground/20" />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {token.balance} {token.symbol}
                    </span>
                  )}
                </div>
                {isLoading ? (
                  <div className="h-5 w-20 animate-pulse rounded bg-muted-foreground/20" />
                ) : (
                  <span className="font-mono font-medium">
                    ${token.valueUSD.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-xl border-2 border-primary/20 bg-primary/5 px-4 py-3">
            <span className="font-semibold">Total Balance</span>
            {isLoading ? (
              <div className="h-7 w-28 animate-pulse rounded bg-primary/20" />
            ) : (
              <span className="font-mono text-lg font-bold">
                {formatUSDCompact(totalUSD)}
              </span>
            )}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
