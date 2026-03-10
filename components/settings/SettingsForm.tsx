'use client';

import { useState, useEffect, useMemo } from 'react';
import { Save, Loader2, LayoutDashboard, Building2, CreditCard, Settings, Upload, User, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { SettingsData } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageContext';
import { useSettings } from '@/components/providers/SettingsContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Tab = 'general' | 'organization' | 'finance' | 'preferences' | 'account';

const TAB_FIELD_MAP: Record<Exclude<Tab, 'account'>, Array<keyof SettingsData>> = {
    general: ['siteName', 'unionLogo'],
    organization: ['unionNameEn', 'unionNameBn', 'unionAddressEn', 'unionAddressBn', 'chairmanNameEn', 'chairmanNameBn', 'unionEmail', 'unionWebsite'],
    finance: ['holdingTaxAmount', 'isHoldingTaxMandatory'],
    preferences: ['theme', 'language', 'enableNotifications', 'otpEnabled', 'timezone'],
};

export default function SettingsForm() {
    const { t, language } = useLanguage();
    const { updateSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
    const [initialFormData, setInitialFormData] = useState<SettingsData | null>(null);

    // Move tabs definition inside component to access translation
    const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
        { id: 'general', label: t.settings.tabs.general, icon: LayoutDashboard },
        { id: 'organization', label: t.settings.tabs.organization, icon: Building2 },
        { id: 'finance', label: t.settings.tabs.finance, icon: CreditCard },
        { id: 'account', label: t.settings.tabs.account, icon: User },
        { id: 'preferences', label: t.settings.tabs.preferences, icon: Settings },
    ];

    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [formData, setFormData] = useState<SettingsData>({
        siteName: '',
        adminEmail: '',
        otpEnabled: true,
        enableNotifications: true,
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        unionNameEn: '',
        unionNameBn: '',
        unionAddressEn: '',
        unionAddressBn: '',
        chairmanNameEn: '',
        chairmanNameBn: '',
        unionEmail: '',
        unionWebsite: '',
        unionLogo: '',
        holdingTaxAmount: 500,
        isHoldingTaxMandatory: false,
    });

    const hasUnsavedChanges = useMemo(() => {
        if (!initialFormData) return false;
        return JSON.stringify(formData) !== JSON.stringify(initialFormData);
    }, [formData, initialFormData]);

    const hasCurrentTabChanges = useMemo(() => {
        if (!initialFormData || activeTab === 'account') return false;

        const keys = TAB_FIELD_MAP[activeTab];
        return keys.some((key) => JSON.stringify(formData[key]) !== JSON.stringify(initialFormData[key]));
    }, [activeTab, formData, initialFormData]);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                setFormData(data);
                setInitialFormData(data);
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast.error(language === 'en' ? 'Failed to load settings' : 'সেটিংস লোড করা যায়নি');
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, [language]);

    useEffect(() => {
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!hasUnsavedChanges) return;
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(t.settings.messages.saved);
                updateSettings(formData);
                setInitialFormData(formData);
            } else {
                throw new Error('Failed to save');
            }
        } catch {
            toast.error(t.settings.messages.failed);
        } finally {
            setSaving(false);
        }
    };

    const handleDiscardChanges = () => {
        if (!initialFormData || activeTab === 'account') return;

        const keys = TAB_FIELD_MAP[activeTab];
        setFormData((prev) => {
            const restored = Object.fromEntries(keys.map((key) => [key, initialFormData[key]])) as Partial<SettingsData>;
            return { ...prev, ...restored };
        });

        toast.success(language === 'en' ? 'Changes discarded for this section' : 'এই সেকশনের পরিবর্তন বাতিল করা হয়েছে');
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-border bg-card p-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="mb-1 rounded-lg p-2 last:mb-0">
                                    <div className="flex items-center gap-2.5">
                                        <Skeleton className="h-7 w-7 rounded-md" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-4">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="mt-3 h-4 w-20" />
                        </div>
                    </aside>

                    <main className="space-y-5">
                        <div className="rounded-2xl border border-border bg-card p-4">
                            <Skeleton className="h-6 w-44" />
                            <Skeleton className="mt-2 h-4 w-80" />
                            <Skeleton className="mt-3 h-9 w-28" />
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <Skeleton className="h-4 w-40" />
                            <div className="mt-4 grid gap-3.5">
                                <Skeleton className="h-9 w-full" />
                                <Skeleton className="h-9 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }



    return (
        <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
                {/* Sidebar Navigation */}
                <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                    <nav className="rounded-2xl border border-border bg-card p-2">
                        <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            'group flex min-w-max items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all lg:w-full',
                                            activeTab === tab.id
                                                ? 'bg-foreground text-background'
                                                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                                        )}
                                    >
                                        <span className={cn(
                                            'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                                            activeTab === tab.id ? 'bg-background/15 text-background' : 'bg-muted/70 text-muted-foreground group-hover:text-foreground'
                                        )}>
                                            <Icon size={15} />
                                        </span>
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.settings.systemStatus}</p>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--success)]">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--success)]" />
                            {t.settings.operational}
                        </p>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="min-w-0">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Header Action */}
                        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base font-semibold tracking-tight text-foreground">{tabs.find(t => t.id === activeTab)?.label}</h2>
                                    {hasUnsavedChanges && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--warning)]/25 bg-[var(--warning-soft)] px-2 py-0.5 text-xs font-medium text-[var(--warning)]">
                                            <AlertTriangle size={12} />
                                            {language === 'en' ? 'Unsaved changes' : 'সংরক্ষণ বাকি'}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                                    {language === 'en' ? 'Manage and update this section settings.' : 'এই সেকশনের সেটিংস আপডেট করুন।'}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {activeTab !== 'account' && (
                                    <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                type="button"
                                                disabled={!hasCurrentTabChanges || saving}
                                                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                                            >
                                                {language === 'en' ? 'Discard changes' : 'পরিবর্তন বাতিল'}
                                            </button>
                                        </AlertDialogTrigger>

                                        <AlertDialogContent className="rounded-xl border border-border bg-card">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    {language === 'en' ? 'Discard unsaved changes?' : 'সংরক্ষণ না করা পরিবর্তন বাতিল করবেন?'}
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {language === 'en'
                                                        ? 'This will reset only the current settings section to the last saved values.'
                                                        : 'এটি শুধু বর্তমান সেটিংস সেকশনকে সর্বশেষ সংরক্ষিত মানে ফিরিয়ে দেবে।'}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    {language === 'en' ? 'Keep editing' : 'এডিট চালিয়ে যান'}
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDiscardChanges}
                                                    className="bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90"
                                                >
                                                    {language === 'en' ? 'Discard' : 'বাতিল করুন'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}

                                <button
                                    type="submit"
                                    disabled={saving || !hasUnsavedChanges}
                                    className={cn(
                                        'inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50',
                                        saving && 'cursor-not-allowed'
                                    )}
                                >
                                    {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                                    {saving ? t.settings.saving : t.settings.save}
                                </button>
                            </div>
                        </div>

                        <div key={activeTab} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                            {/* General Tab */}
                            {activeTab === 'general' && (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-border bg-card p-5">
                                        <div className="grid gap-5">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">{t.settings.general.siteName}</label>
                                                <input
                                                    type="text"
                                                    name="siteName"
                                                    value={formData.siteName}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    required
                                                />
                                                <p className="text-xs text-muted-foreground">{t.settings.general.siteNameDesc}</p>
                                            </div>


                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-border bg-card p-5">
                                        <h3 className="text-base font-semibold mb-4">{t.settings.general.branding}</h3>
                                        <div className="grid gap-5">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">{t.settings.general.unionLogo}</label>
                                                <div className="flex items-start gap-6">
                                                    {formData.unionLogo ? (
                                                        <div className="relative group">
                                                            <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-border bg-muted/20 p-2">
                                                                <Image src={formData.unionLogo} alt="Logo" width={96} height={96} className="max-h-full max-w-full object-contain" unoptimized />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData(p => ({ ...p, unionLogo: '' }))}
                                                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <div className="w-4 h-4 flex items-center justify-center text-[10px]">✕</div>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 text-muted-foreground">
                                                            <Upload size={24} />
                                                        </div>
                                                    )}

                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    if (file.size > 500 * 1024) return toast.error(language === 'en' ? 'Max size 500KB' : 'সর্বোচ্চ সাইজ ৫০০KB');
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => setFormData(p => ({ ...p, unionLogo: reader.result as string }));
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                        />
                                                        <p className="text-xs text-muted-foreground whitespace-pre-line">
                                                            {t.settings.general.uploadDesc}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Organization Tab */}
                            {activeTab === 'organization' && (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-border bg-card p-5">
                                        <div className="grid gap-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">{t.settings.organization.unionNameEn}</label>
                                                    <input
                                                        name="unionNameEn"
                                                        value={formData.unionNameEn || ''}
                                                        onChange={handleChange}
                                                        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                        placeholder="e.g. 7No. Baghutia Union Parishad"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">{t.settings.organization.unionNameBn}</label>
                                                    <input
                                                        name="unionNameBn"
                                                        value={formData.unionNameBn || ''}
                                                        onChange={handleChange}
                                                        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                        placeholder="e.g. ৭নং বাঘুটিয়া ইউনিয়ন পরিষদ"
                                                    />
                                                </div>
                                            </div>

                                            <div className="my-0.5 border-t border-border"></div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">{t.settings.organization.addressEn}</label>
                                                    <input
                                                        name="unionAddressEn"
                                                        value={formData.unionAddressEn || ''}
                                                        onChange={handleChange}
                                                        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">{t.settings.organization.addressBn}</label>
                                                    <input
                                                        name="unionAddressBn"
                                                        value={formData.unionAddressBn || ''}
                                                        onChange={handleChange}
                                                        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="my-0.5 border-t border-border"></div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">{t.settings.organization.chairmanEn}</label>
                                                    <input
                                                        name="chairmanNameEn"
                                                        value={formData.chairmanNameEn || ''}
                                                        onChange={handleChange}
                                                        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">{t.settings.organization.chairmanBn}</label>
                                                    <input
                                                        name="chairmanNameBn"
                                                        value={formData.chairmanNameBn || ''}
                                                        onChange={handleChange}
                                                        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="my-0.5 border-t border-border"></div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">{t.settings.organization.email}</label>
                                                    <input
                                                        type="email"
                                                        name="unionEmail"
                                                        value={formData.unionEmail || ''}
                                                        onChange={handleChange}
                                                        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                        placeholder="e.g. info@union.gov.bd"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">{t.settings.organization.website}</label>
                                                    <input
                                                        type="text"
                                                        name="unionWebsite"
                                                        value={formData.unionWebsite || ''}
                                                        onChange={handleChange}
                                                        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                        placeholder="e.g. www.union.gov.bd"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Finance Tab */}
                            {activeTab === 'finance' && (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-border bg-card p-5">
                                        <h3 className="text-lg font-semibold mb-4">{t.holdingTax.title}</h3>
                                        <div className="grid gap-5">
                                            <div className="grid gap-2 max-w-sm">
                                                <label className="text-sm font-medium">{t.settings.finance.taxAmount}</label>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-2.5 text-muted-foreground font-semibold">৳</div>
                                                    <input
                                                        type="number"
                                                        name="holdingTaxAmount"
                                                        value={formData.holdingTaxAmount || 0}
                                                        onChange={handleChange}
                                                        className="flex h-10 w-full pl-8 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none font-mono"
                                                        placeholder="500"
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">{t.settings.finance.taxAmountDesc}</p>
                                            </div>

                                            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
                                                <input
                                                    type="checkbox"
                                                    id="isHoldingTaxMandatory"
                                                    name="isHoldingTaxMandatory"
                                                    checked={formData.isHoldingTaxMandatory || false}
                                                    onChange={handleChange}
                                                    className="mt-1 h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                                                />
                                                <div className="grid gap-1">
                                                    <label htmlFor="isHoldingTaxMandatory" className="text-sm font-medium leading-none">
                                                        {t.settings.finance.enforceTax}
                                                    </label>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t.settings.finance.enforceTaxDesc}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-border bg-card p-5">
                                        <div className="grid gap-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">{t.settings.preferences.appearance}</label>
                                                    <select
                                                        name="theme"
                                                        value={formData.theme}
                                                        onChange={handleChange}
                                                        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    >
                                                        <option value="dark">{t.settings.preferences.dark}</option>
                                                        <option value="light">{t.settings.preferences.light}</option>
                                                        <option value="system">{t.settings.preferences.system}</option>
                                                    </select>
                                                </div>

                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">{t.settings.preferences.language}</label>
                                                    <select
                                                        name="language"
                                                        value={formData.language}
                                                        onChange={handleChange}
                                                        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    >
                                                        <option value="en">{t.common.english}</option>
                                                        <option value="bn">{t.common.bangla}</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-2">
                                                <input
                                                    type="checkbox"
                                                    id="enableNotifications"
                                                    name="enableNotifications"
                                                    checked={formData.enableNotifications}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                                                />
                                                <label htmlFor="enableNotifications" className="text-sm font-medium leading-none">
                                                    {t.settings.preferences.notifications}
                                                </label>
                                            </div>

                                            <div className="flex items-center gap-3 pt-2">
                                                <input
                                                    type="checkbox"
                                                    id="otpEnabled"
                                                    name="otpEnabled"
                                                    checked={formData.otpEnabled ?? true}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                                                />
                                                <label htmlFor="otpEnabled" className="text-sm font-medium leading-none">
                                                    Enable Login OTP (2FA)
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Account Tab */}
                            {activeTab === 'account' && (
                                <AccountSettings />
                            )}
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}

function AccountSettings() {
    const { t, language } = useLanguage();
    const [profile, setProfile] = useState({ name: '', username: '', email: '' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(true);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Email Verify State
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [originalEmail, setOriginalEmail] = useState('');

    useEffect(() => {
        fetch('/api/auth/profile')
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    const email = data.email || '';
                    setProfile({ name: data.name || '', username: data.username || '', email });
                    setOriginalEmail(email);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleProfileUpdate = async () => {
        setUpdatingProfile(true);
        try {
            // Update Name/Username only
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: profile.name, username: profile.username })
            });
            const data = await res.json();
            if (res.ok) toast.success(t.settings.messages.profileUpdated);
            else toast.error(data.error || (language === 'en' ? 'Failed to update profile' : 'প্রোফাইল আপডেট করা যায়নি'));
        } catch {
            toast.error(t.settings.messages.failed);
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleSendOtp = async () => {
        if (!profile.email) return toast.error(language === 'en' ? 'Please enter an email address' : 'অনুগ্রহ করে ইমেইল ঠিকানা দিন');
        if (profile.email === originalEmail) return toast.info(language === 'en' ? 'Email is unchanged' : 'ইমেইল অপরিবর্তিত আছে');

        setSendingOtp(true);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profile.email })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(t.settings.messages.otpSent);
                setShowOtpInput(true);
            } else {
                toast.error(data.error || (language === 'en' ? 'Failed to send OTP' : 'ওটিপি পাঠানো যায়নি'));
            }
        } catch {
            toast.error(t.settings.messages.failed);
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return toast.error(language === 'en' ? 'Please enter OTP' : 'অনুগ্রহ করে ওটিপি দিন');

        setVerifyingOtp(true);
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profile.email, otp })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(t.settings.messages.emailVerified);
                setOriginalEmail(profile.email);
                setShowOtpInput(false);
                setOtp('');
            } else {
                toast.error(data.error || t.settings.messages.invalidOtp);
            }
        } catch {
            toast.error(t.settings.messages.failed);
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) {
            return toast.error(t.settings.messages.mismatch);
        }
        setChangingPassword(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(t.settings.messages.passwordChanged);
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                toast.error(data.error || (language === 'en' ? 'Failed to change password' : 'পাসওয়ার্ড পরিবর্তন করা যায়নি'));
            }
        } catch {
            toast.error(t.settings.messages.failed);
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="mx-auto animate-spin text-primary" /></div>;

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Profile Settings */}
            <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-base font-semibold tracking-tight mb-4">{t.settings.account.profileInfo}</h3>

                <div className="grid gap-5">
                    {/* Name & Username Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t.settings.account.fullName}</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t.settings.account.username}</label>
                            <input
                                type="text"
                                value={profile.username}
                                onChange={e => setProfile({ ...profile, username: e.target.value })}
                                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="button"
                                onClick={handleProfileUpdate}
                                disabled={updatingProfile}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                {updatingProfile ? t.settings.saving : t.settings.account.updateInfo}
                            </button>
                        </div>
                    </div>

                    <div className="border-t"></div>

                    {/* Email Verification Form */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">{t.settings.account.email}</label>
                        <div className="flex gap-3">
                            <input
                                type="email"
                                value={profile.email}
                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder={language === 'en' ? 'Enter admin email' : 'অ্যাডমিন ইমেইল লিখুন'}
                            />
                            {profile.email !== originalEmail && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); handleSendOtp(); }}
                                    disabled={sendingOtp || profile.email === originalEmail}
                                    className="whitespace-nowrap rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
                                >
                                    {sendingOtp ? t.holdingTax.processing : t.settings.account.verifySave}
                                </button>
                            )}
                            {profile.email === originalEmail && originalEmail && (
                                <div className="flex items-center rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                    {t.settings.account.verified}
                                </div>
                            )}
                        </div>
                        {profile.email !== originalEmail && (
                            <p className="text-xs text-[var(--warning)]">
                                {t.settings.account.emailChanged}
                            </p>
                        )}
                    </div>

                    {/* OTP Input UI */}
                    {showOtpInput && (
                        <div className="tone-warning mt-2 rounded-xl border border-dashed p-4 animate-in slide-in-from-top-2">
                            <h4 className="text-sm font-semibold mb-2">{t.settings.account.enterCode}</h4>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="flex h-10 w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none tracking-widest text-center"
                                    placeholder="000000"
                                />
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={verifyingOtp}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {verifyingOtp ? t.holdingTax.processing : t.settings.account.confirmCode}
                                </button>
                                <button
                                    onClick={() => setShowOtpInput(false)}
                                    className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm"
                                >
                                    {t.settings.account.cancel}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {t.settings.account.checkConsole}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Password Change - (Reused Logic) */}
            <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-base font-semibold tracking-tight mb-4">{t.settings.account.changePassword}</h3>
                <div className="grid gap-5 max-w-md">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">{t.settings.account.currentPassword}</label>
                        <input
                            type="password"
                            value={passwords.current}
                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                            required
                            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">{t.settings.account.newPassword}</label>
                        <input
                            type="password"
                            value={passwords.new}
                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                            required
                            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">{t.settings.account.confirmPassword}</label>
                        <input
                            type="password"
                            value={passwords.confirm}
                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                            required
                            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handlePasswordChange}
                            disabled={changingPassword}
                            className="rounded-lg bg-[var(--danger)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--danger)]/90 disabled:opacity-50"
                        >
                            {changingPassword ? t.settings.account.updating : t.settings.account.changePassword}
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}

