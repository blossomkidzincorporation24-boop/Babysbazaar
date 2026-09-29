import Image from 'next/image'

export default function BabyBazaarLogo({
  className = 'h-10',
  width = 140,
  height = 60,
  priority = false,
}: {
  className?: string
  width?: number
  height?: number
  priority?: boolean
}) {
  return (
    <div className={`relative flex items-center shrink-0 ${className}`}>
      <Image
        src="/logo.png"
        alt="Baby's Bazaar"
        width={width}
        height={height}
        className="w-auto h-full max-h-12 object-contain select-none"
        priority={priority}
      />
    </div>
  )
}
