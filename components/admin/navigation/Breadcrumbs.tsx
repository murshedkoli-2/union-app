'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

import { useBreadcrumbs } from '@/hooks/admin/use-breadcrumbs';

export default function Breadcrumbs() {
    const breadcrumbs = useBreadcrumbs();

    return (
        <nav aria-label="Breadcrumb" className="mb-5 rounded-2xl border border-border/70 bg-card/70 px-4 py-3">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <li className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground">
                    <Home size={14} />
                    <span>{breadcrumbs[0]?.label}</span>
                </li>

                {breadcrumbs.slice(1).map((item, index) => (
                    <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
                        <ChevronRight size={14} />
                        {item.href ? (
                            <Link href={item.href} className="rounded-md px-2 py-1 transition-colors hover:bg-muted hover:text-foreground">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="rounded-md bg-primary/10 px-2 py-1 font-medium text-primary">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
