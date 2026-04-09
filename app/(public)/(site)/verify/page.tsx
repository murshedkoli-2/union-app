'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageContext';

export default function VerifyPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [certNo, setCertNo] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (certNo.trim()) {
            router.push(`/verify/${certNo.trim()}`);
        }
    };

    return (
        <div className="relative min-h-[82vh] overflow-hidden px-4 py-12 md:py-16">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-14 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
            </div>

            <div className="reveal-up relative mx-auto w-full max-w-3xl rounded-2xl border border-border/70 bg-card/90 p-5 shadow-[0_28px_90px_-40px_rgba(26,55,68,0.4)] backdrop-blur sm:p-6 md:p-10">
                <div className="text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <ShieldCheck size={38} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-display sm:text-4xl">
                        {t.verify.title}
                    </h1>
                    <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                        {t.verify.subtitle}
                    </p>

                    <form onSubmit={handleSearch} className="reveal-up reveal-delay-1 relative mx-auto mt-8 max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                            type="text"
                            value={certNo}
                            onChange={(e) => setCertNo(e.target.value)}
                            placeholder={t.verify.placeholder}
                            className="h-14 w-full rounded-xl border border-border bg-background pl-12 pr-28 text-base outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/40"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!certNo.trim()}
                            className="absolute bottom-2 right-2 top-2 rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t.verify.button}
                        </button>
                    </form>

                    <div className="reveal-up reveal-delay-2 mt-10 grid grid-cols-1 gap-4 text-center text-sm text-muted-foreground/90 sm:grid-cols-3">
                        <div className="rounded-lg border border-border/60 bg-background p-4">
                            <span className="mb-1 block font-semibold text-foreground">{t.verify.badges.fast.title}</span>
                            {t.verify.badges.fast.desc}
                        </div>
                        <div className="rounded-lg border border-border/60 bg-background p-4">
                            <span className="mb-1 block font-semibold text-foreground">{t.verify.badges.secure.title}</span>
                            {t.verify.badges.secure.desc}
                        </div>
                        <div className="rounded-lg border border-border/60 bg-background p-4">
                            <span className="mb-1 block font-semibold text-foreground">{t.verify.badges.trusted.title}</span>
                            {t.verify.badges.trusted.desc}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
