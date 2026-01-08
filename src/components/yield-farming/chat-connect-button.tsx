import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'

type ChatConnectButtonProps = {
  label?: string
}

export function ChatConnectButton({
  label = 'Connect wallet',
}: ChatConnectButtonProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        if (!ready) return null
        if (!connected) return <Button onClick={openConnectModal}>{label}</Button>
        if (chain.unsupported) {
          return <Button onClick={openChainModal}>Wrong network</Button>
        }
        return (
          <Button onClick={openAccountModal}>{account.displayName}</Button>
        )
      }}
    </ConnectButton.Custom>
  )
}
