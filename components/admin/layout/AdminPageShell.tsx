import type { ReactNode } from 'react';

type AdminPageShellProps = {
    actions?: ReactNode;
    badge?: ReactNode;
    children?: ReactNode;
    subtitle?: string;
    title: string;
};

export default function AdminPageShell({
    actions,
    badge,
    children,
    subtitle,
    title,
}: AdminPageShellProps) {
    return (
        <section className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-card/80 px-5 py-4 shadow-sm">
                {badge ? <div className="mb-3">{badge}</div> : null}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                        {subtitle ? <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
                    </div>
                    {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
                </div>
            </div>
            {children}
        </section>
    );
}
