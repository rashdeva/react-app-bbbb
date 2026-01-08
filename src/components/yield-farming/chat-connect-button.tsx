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
      {({ openConnectModal, mounted }) => {
        if (!mounted) return null
        return <Button onClick={openConnectModal}>{label}</Button>
      }}
    </ConnectButton.Custom>
  )
}
