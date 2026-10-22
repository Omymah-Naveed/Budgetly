import { useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { buildMonthlySeries } from '../../utils/finance'
import { formatCompactCurrency, formatCurrency } from '../../utils/format'
import { getRecentMonths } from '../../utils/date'
import { cn } from '../../utils/cn'

function CashFlowTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const month = payload[0]?.payload

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-xl shadow-slate-950/10">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {month.long}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-6 py-0.5"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="text-xs font-bold tabular-nums text-slate-900">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CashFlowChart({ transactions }) {
  const [range, setRange] = useState(6)

  const data = useMemo(
    () => buildMonthlySeries(transactions, getRecentMonths(range)),
    [transactions, range],
  )

  return (
    <section className="card-surface rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-sm font-bold text-slate-900">Cash flow</h2>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Income and expenses over the last {range} months
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex rounded-xl bg-slate-100 p-1">
            {[6, 12].map((months) => (
              <button
                key={months}
                type="button"
                onClick={() => setRange(months)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all',
                  range === months
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {months}M
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Expenses
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="var(--chart-grid)"
              vertical={false}
            />
            <XAxis
              dataKey="short"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--chart-axis)', fontSize: 11, fontWeight: 600 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--chart-axis)', fontSize: 11, fontWeight: 600 }}
              tickFormatter={formatCompactCurrency}
              width={58}
            />
            <Tooltip
              content={<CashFlowTooltip />}
              cursor={{ stroke: 'var(--chart-cursor)', strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#incomeFill)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--chart-active-dot)' }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fill="url(#expenseFill)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--chart-active-dot)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
