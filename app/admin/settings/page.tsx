'use client';

import SettingsForm from '@/components/settings/SettingsForm';
import { useLanguage } from '@/components/providers/LanguageContext';

export default function SettingsPage() {
    const { t } = useLanguage();
    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{t.settings.title}</h1>
                <p className="text-muted-foreground mt-1">{t.settings.subtitle}</p>
            </div>

            <SettingsForm />
        </div>
    );
}
