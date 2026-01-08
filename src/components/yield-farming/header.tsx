import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WalletBalance } from './wallet-balance';

export function YieldFarmingHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">BEYB Yield</h1>
      </div>

      <div className="flex items-center gap-2">
        <WalletBalance />
        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'full',
          }}
        />
      </div>
    </header>
  );
}
