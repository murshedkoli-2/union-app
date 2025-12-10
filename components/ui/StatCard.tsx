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

const colorVariants = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    success: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    danger: 'text-red-500 bg-red-500/10 border-red-500/20',
};

const iconBgVariants = {
    primary: 'bg-primary/20 text-primary',
    success: 'bg-emerald-500/20 text-emerald-500',
    warning: 'bg-amber-500/20 text-amber-500',
    danger: 'bg-red-500/20 text-red-500',
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
            "relative overflow-hidden rounded-xl border bg-card p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 group",
        )}>
            <div className="flex items-start justify-between">
                <div className={cn("rounded-lg p-3 transition-colors", iconBgVariants[color])}>
                    <Icon size={24} />
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-sm font-medium rounded-full px-2 py-1",
                    trend === 'up' ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
                )}>
                    <span>{trend === 'up' ? '↑' : '↓'}</span>
                    {formatPercentage(Math.abs(change))}
                </div>
            </div>

            <div className="mt-4">
                <div className="text-2xl font-bold font-display tracking-tight text-foreground">{displayValue}</div>
                <div className="text-sm text-muted-foreground mt-1">{title}</div>
            </div>

            <div className={cn(
                "absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-110",
                color === 'primary' && "bg-primary",
                color === 'success' && "bg-emerald-500",
                color === 'warning' && "bg-amber-500",
                color === 'danger' && "bg-red-500",
            )} />
        </div>
    );
}
