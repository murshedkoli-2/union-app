import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
                <Icon size={32} className="text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
