import { cn } from '../../utils/cn'

const TONES = {
  safe: 'bg-emerald-500',
  warning: 'bg-amber-400',
  danger: 'bg-rose-500',
  over: 'bg-red-600',
}

export default function ProgressBar({
  value = 0,
  tone = 'safe',
  className,
  trackClassName,
  barClassName,
}) {
  const clamped = Math.min(100, Math.max(0, Number(value) || 0))

  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-slate-100',
        trackClassName,
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-700 ease-out',
          TONES[tone] || TONES.safe,
          barClassName,
          className,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
