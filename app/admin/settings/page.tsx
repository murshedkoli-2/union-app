'use client';

import SettingsForm from '@/components/settings/SettingsForm';
import { useLanguage } from '@/components/providers/LanguageContext';

export default function SettingsPage() {
    const { t, language } = useLanguage();
    return (
        <div className="animate-fade-in space-y-8">
            <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-secondary/55 via-card to-card p-6 md:p-7">
                <p className="text-sm font-medium text-primary">
                    {language === 'en' ? 'System Configuration Center' : 'সিস্টেম কনফিগারেশন সেন্টার'}
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground font-display md:text-3xl">{t.settings.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">{t.settings.subtitle}</p>
            </div>

            <SettingsForm />
        </div>
    );
}
