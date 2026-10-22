import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCompactCurrency, formatCurrency } from '../../utils/format'

function BarTooltip({ active, payload }) {
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

export default function MonthlyBarChart({ data, periodLabel }) {
  return (
    <section className="card-surface rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Income vs expenses
          </h2>
          <p className="mt-1 text-xs text-slate-500">{periodLabel}</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Income
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Expenses
          </span>
        </div>
      </div>

      <div className="mt-6 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
            barGap={6}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="var(--chart-grid)"
              vertical={false}
            />
            <XAxis
              dataKey="short"
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
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
              content={<BarTooltip />}
              cursor={{ fill: 'var(--chart-hover)' }}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={26}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#fb7185"
              radius={[6, 6, 0, 0]}
              maxBarSize={26}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
