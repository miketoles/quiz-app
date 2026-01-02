import { QRCodeSVG } from 'qrcode.react'

interface GameQRCodeProps {
  gamePin: string
  size?: number
}

export function GameQRCode({ gamePin, size = 256 }: GameQRCodeProps) {
  // Use current origin for the join URL
  const joinUrl = `${window.location.origin}/join?pin=${gamePin}`

  return (
    <div className="bg-white p-4 rounded-2xl inline-block">
      <QRCodeSVG
        value={joinUrl}
        size={size}
        level="M"
        includeMargin={false}
      />
    </div>
  )
}
