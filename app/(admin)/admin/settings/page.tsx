'use client';

import AdminPageShell from '@/components/admin/layout/AdminPageShell';
import SettingsForm from '@/components/admin/settings/SettingsForm';
import { useLanguage } from '@/components/providers/LanguageContext';
import { Settings2 } from 'lucide-react';

export default function SettingsPage() {
    const { t, language } = useLanguage();
    return (
        <AdminPageShell
            badge={
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground">
                    <Settings2 size={14} />
                    {language === 'en' ? 'Configuration' : 'কনফিগারেশন'}
                </span>
            }
            subtitle={t.settings.subtitle}
            title={t.settings.title}
        >
            <SettingsForm />
        </AdminPageShell>
    );
}
