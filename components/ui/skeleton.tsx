import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted/50", className)}
            {...props}
        />
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-3 w-[200px]" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="mt-6 h-8 w-32" />
            <Skeleton className="mt-2 h-4 w-24" />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-32 rounded-2xl" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Skeleton className="h-96 rounded-xl lg:col-span-2" />
                <Skeleton className="h-96 rounded-xl" />
            </div>
        </div>
    );
}
