import { cn } from '@/lib/utils'
type RiskLevel = 'low' | 'medium' | 'high' | 'abstained'

interface RiskBadgeProps {
  level: RiskLevel | null
  className?: string
  size?: 'sm' | 'md'
}

const riskConfig: Record<string, { label: string; classes: string }> = {
  high: {
    label: 'High Risk',
    classes: 'bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20',
  },
  medium: {
    label: 'Moderate',
    classes: 'bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20',
  },
  low: {
    label: 'Low Risk',
    classes: 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20',
  },
  abstained: {
    label: 'Needs Review',
    classes: 'bg-[#F8FAFC] text-[#64748B] border border-[#64748B]/20',
  },
}

export function RiskBadge({ level, className, size = 'md' }: RiskBadgeProps) {
  if (!level) return null
  const config = riskConfig[level]
  if (!config) return null
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold uppercase tracking-wider',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  )
}
