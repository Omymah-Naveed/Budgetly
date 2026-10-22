import { CATEGORIES } from '../../data/mockData'
import { cn } from '../../utils/cn'

const FALLBACK = {
  badgeClass: 'bg-slate-50 text-slate-600 ring-slate-200',
  dotClass: 'bg-slate-400',
}

export default function CategoryBadge({ category, className }) {
  const meta = CATEGORIES[category] || FALLBACK

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        meta.badgeClass,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dotClass)} />
      {category}
    </span>
  )
}
