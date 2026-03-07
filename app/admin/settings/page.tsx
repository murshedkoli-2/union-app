'use client';

import SettingsForm from '@/components/settings/SettingsForm';
import { useLanguage } from '@/components/providers/LanguageContext';
import { Settings2 } from 'lucide-react';

export default function SettingsPage() {
    const { t, language } = useLanguage();
    return (
        <div className="animate-fade-in space-y-4">
            <div className="rounded-2xl border border-border bg-card px-5 py-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground">
                    <Settings2 size={14} />
                    {language === 'en' ? 'Configuration' : 'কনফিগারেশন'}
                </span>
                <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-foreground">{t.settings.title}</h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{t.settings.subtitle}</p>
            </div>

            <SettingsForm />
        </div>
    );
}
