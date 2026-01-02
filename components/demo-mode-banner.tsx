"use client"

interface DemoModeBannerProps {
  message: string
}

export function DemoModeBanner({ message }: DemoModeBannerProps) {
  return (
    <div className="mb-6 rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-500/10 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
          !
        </span>
        <div>
          <p className="font-semibold text-amber-700 dark:text-amber-400">Demo Mode</p>
          <p className="text-sm text-amber-600 dark:text-amber-500">{message}</p>
        </div>
      </div>
    </div>
  )
}
