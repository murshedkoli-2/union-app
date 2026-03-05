import { formatNumber, formatPercentage } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down';
    icon: LucideIcon;
    color?: 'primary' | 'success' | 'warning' | 'danger';
}

const iconBgVariants = {
    primary: 'bg-primary/14 text-primary',
    success: 'bg-[var(--success-soft)] text-[var(--success)]',
    warning: 'bg-[var(--warning-soft)] text-[var(--warning)]',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger)]',
};

const glowVariants = {
    primary: 'bg-primary',
    success: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    danger: 'bg-[var(--danger)]',
};

export default function StatCard({
    title,
    value,
    change,
    trend,
    icon: Icon,
    color = 'primary'
}: StatCardProps) {
    const displayValue = typeof value === 'number' ? formatNumber(value) : value;

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/25",
        )}>
            <div className="flex items-start justify-between">
                <div className={cn("rounded-lg p-2.5 transition-colors", iconBgVariants[color])}>
                    <Icon size={20} />
                </div>
                <div className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                    trend === 'up' ? "text-[var(--success)] bg-[var(--success-soft)]" : "text-[var(--danger)] bg-[var(--danger-soft)]"
                )}>
                    <span>{trend === 'up' ? '↑' : '↓'}</span>
                    {formatPercentage(Math.abs(change))}
                </div>
            </div>

            <div className="mt-4">
                <div className="text-2xl font-bold font-display tracking-tight text-foreground">{displayValue}</div>
                <div className="mt-1 text-sm text-muted-foreground">{title}</div>
            </div>

            <div className={cn(
                "absolute -right-8 -bottom-8 h-24 w-24 rounded-full opacity-10 blur-[1px] transition-transform duration-500 group-hover:scale-110",
                glowVariants[color]
            )} />
        </div>
    );
}
