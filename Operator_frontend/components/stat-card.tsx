import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    positive: boolean
  }
  color?: 'blue' | 'green' | 'amber' | 'red'
}

const colorClasses = {
  blue: {
    bg: 'bg-sky-50 ring-1 ring-sky-100',
    icon: 'text-sky-500 bg-sky-100',
    text: 'text-sky-700',
  },
  green: {
    bg: 'bg-emerald-50 ring-1 ring-emerald-100',
    icon: 'text-emerald-500 bg-emerald-100',
    text: 'text-emerald-700',
  },
  amber: {
    bg: 'bg-amber-50 ring-1 ring-amber-100',
    icon: 'text-amber-500 bg-amber-100',
    text: 'text-amber-700',
  },
  red: {
    bg: 'bg-red-50 ring-1 ring-red-100',
    icon: 'text-red-500 bg-red-100',
    text: 'text-red-700',
  },
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'blue',
}: StatCardProps) {
  const colors = colorClasses[color]

  return (
    <div className={`group flex h-full flex-col justify-between rounded-xl p-5 ${colors.bg} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01]`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-condensed">{label}</p>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.icon} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-auto pt-3">
        <p className="text-3xl font-extrabold text-foreground tracking-tight">{value}</p>
        <div className="mt-2 min-h-[20px]">
          {trend ? (
            <p className={`text-xs font-medium font-condensed ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 ${trend.positive ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}%
              </span>
              <span className="ml-1 text-muted-foreground">{trend.label}</span>
            </p>
          ) : (
            <span className="text-xs text-transparent select-none">&nbsp;</span>
          )}
        </div>
      </div>
    </div>
  )
}
