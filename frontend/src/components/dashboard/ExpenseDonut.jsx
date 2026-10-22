import { useMemo } from 'react'
import { ChartPie } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CATEGORIES } from '../../data/mockData'
import { formatCurrency } from '../../utils/format'
import { getMonthLabel } from '../../utils/date'

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const item = payload[0]
  const meta = CATEGORIES[item.name] || {}

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-xl shadow-slate-950/10">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: meta.chartColor }}
        />
        {item.name}
      </p>
      <p className="mt-1 text-sm font-bold tabular-nums text-slate-900">
        {formatCurrency(item.value)}
      </p>
    </div>
  )
}

export default function ExpenseDonut({ data, monthKey }) {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  )

  return (
    <section className="card-surface flex flex-col rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
              <ChartPie className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              Spending by category
            </h2>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {getMonthLabel(monthKey, 'long')}
          </p>
        </div>
      </div>

      <div className="relative mt-4 h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORIES[entry.category]?.chartColor || '#94a3b8'}
                />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Total spent
          </span>
          <span className="mt-0.5 text-lg font-extrabold tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div className="mt-2 space-y-2.5">
        {data.map((item) => {
          const meta = CATEGORIES[item.category]
          const share = total > 0 ? (item.value / total) * 100 : 0

          return (
            <div
              key={item.category}
              className="flex items-center justify-between gap-3"
            >
              <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-600">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: meta?.chartColor }}
                />
                <span className="truncate">{item.category}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-bold tabular-nums text-slate-900">
                  {formatCurrency(item.value)}
                </span>
                <span className="w-8 text-right text-[10px] font-semibold tabular-nums text-slate-400">
                  {share.toFixed(0)}%
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
