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
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-lg text-center space-y-8">
                <div className="flex justify-center">
                    <div className="h-20 w-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <ShieldCheck size={40} />
                    </div>
                </div>

                <h1 className="text-4xl font-bold font-display tracking-tight text-foreground">
                    {t.verify.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                    {t.verify.subtitle}
                </p>

                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        value={certNo}
                        onChange={(e) => setCertNo(e.target.value)}
                        placeholder={t.verify.placeholder}
                        className="w-full h-14 pl-12 pr-4 rounded-xl border border-border bg-card shadow-sm text-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!certNo.trim()}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t.verify.button}
                    </button>
                </form>

                <div className="pt-8 grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground/80">
                    <div className="p-4 rounded-lg bg-muted/30">
                        <span className="block font-semibold text-foreground mb-1"> {t.verify.badges.fast.title}</span>
                        {t.verify.badges.fast.desc}
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                        <span className="block font-semibold text-foreground mb-1"> {t.verify.badges.secure.title}</span>
                        {t.verify.badges.secure.desc}
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                        <span className="block font-semibold text-foreground mb-1"> {t.verify.badges.trusted.title}</span>
                        {t.verify.badges.trusted.desc}
                    </div>
                </div>
            </div>
        </div>
    );
}
