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
            "group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        )}>
            <div className="relative z-10">
                <div className="flex items-start justify-between">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg transition-colors", iconBgVariants[color])}>
                        <Icon size={24} strokeWidth={2} />
                    </div>
                    {change !== 0 && (
                        <div className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                            trend === 'up' ? "text-[var(--success)] bg-[var(--success-soft)]" : "text-[var(--danger)] bg-[var(--danger-soft)]"
                        )}>
                            {trend === 'up' ? '↑' : '↓'}
                            {formatPercentage(Math.abs(change))}
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <div className="text-3xl font-bold tracking-tight text-foreground">{displayValue}</div>
                    <div className="mt-2 text-sm font-medium text-muted-foreground">{title}</div>
                </div>
            </div>

            <div className={cn(
                "absolute -right-6 -bottom-6 h-32 w-32 rounded-full opacity-5 blur-2xl transition-transform duration-500 group-hover:scale-150",
                glowVariants[color]
            )} />
        </div>
    );
}
