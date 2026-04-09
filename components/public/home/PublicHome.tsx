'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    FileCheck2,
    FileText,
    Globe,
    Landmark,
    Mail,
    MapPin,
    Phone,
    SearchCheck,
    ShieldCheck,
    Sparkles,
    UserPlus,
    Users,
} from 'lucide-react';
import Link from 'next/link';

import { useLanguage } from '@/components/providers/LanguageContext';
import { useSettings } from '@/components/providers/SettingsContext';

type TeamMember = {
    _id: string;
    designation: string;
    email?: string;
    nameBn: string;
    nameEn: string;
    phone: string;
};

type DashboardStats = {
    totalCitizens: number;
    totalCertificates: number;
    totalPending: number;
    totalRevenue: number;
};

type FeatureCard = {
    description: string;
    href: string;
    icon: LucideIcon;
    title: string;
};

type InfoCard = {
    description: string;
    icon: LucideIcon;
    title: string;
};

function isDashboardStats(value: unknown): value is DashboardStats {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const stats = value as Record<string, unknown>;

    return (
        typeof stats.totalCitizens === 'number' &&
        typeof stats.totalCertificates === 'number' &&
        typeof stats.totalPending === 'number' &&
        typeof stats.totalRevenue === 'number'
    );
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`rounded-[32px] border border-border/70 bg-card/95 p-6 shadow-[0_28px_70px_-56px_rgba(15,23,42,0.55)] sm:p-7 ${className}`}>{children}</div>;
}

export default function PublicHome() {
    const { t, language } = useLanguage();
    const { settings } = useSettings();
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            const [teamResult, statsResult] = await Promise.allSettled([fetch('/api/team'), fetch('/api/dashboard/stats')]);

            if (teamResult.status === 'fulfilled' && teamResult.value.ok) {
                try {
                    const data = (await teamResult.value.json()) as TeamMember[];
                    if (!cancelled && Array.isArray(data)) {
                        setTeam(data);
                    }
                } catch {
                    // Keep public shell stable if team loading fails.
                }
            }

            if (statsResult.status === 'fulfilled' && statsResult.value.ok) {
                try {
                    const data: unknown = await statsResult.value.json();
                    if (!cancelled && isDashboardStats(data)) {
                        setStats(data);
                    }
                } catch {
                    // Keep public shell stable if stats loading fails.
                }
            }

            if (!cancelled) {
                setIsLoadingStats(false);
            }
        };

        void loadData();

        return () => {
            cancelled = true;
        };
    }, []);

    const unionDisplayName =
        language === 'en'
            ? settings.unionNameEn?.trim() || `${t.home.unionName} ${t.home.unionSuffix}`
            : settings.unionNameBn?.trim() || `${t.home.unionName} ${t.home.unionSuffix}`;
    const supportEmail = settings.unionEmail?.trim() || settings.adminEmail;
    const officeAddress =
        language === 'en'
            ? settings.unionAddressEn?.trim() || 'Citizen services are available online and through the union office.'
            : settings.unionAddressBn?.trim() || 'নাগরিক সেবা অনলাইনে এবং ইউনিয়ন অফিসের মাধ্যমে পাওয়া যায়।';
    const numberLocale = language === 'en' ? 'en-BD' : 'bn-BD';
    const formatNumber = (value: number) => new Intl.NumberFormat(numberLocale).format(value);
    const formatCurrency = (value: number) => `${language === 'en' ? 'BDT ' : '৳'}${formatNumber(value)}`;
    const fallbackValue = language === 'en' ? 'Loading...' : 'লোড হচ্ছে...';
    const leadPhone = team[0]?.phone;

    const features = useMemo<FeatureCard[]>(
        () => [
            {
                description: language === 'en' ? 'Register a resident and keep the profile ready for future applications.' : 'নাগরিক নিবন্ধন করুন এবং ভবিষ্যৎ আবেদনের জন্য প্রোফাইল প্রস্তুত রাখুন।',
                href: '/apply/citizen',
                icon: UserPlus,
                title: t.home.registerCitizen,
            },
            {
                description: language === 'en' ? 'Submit certificate requests through a guided public workflow.' : 'গাইডেড পাবলিক ওয়ার্কফ্লোতে সনদের আবেদন জমা দিন।',
                href: '/apply/certificate',
                icon: FileText,
                title: t.home.applyCertificate,
            },
            {
                description: language === 'en' ? 'Search certificate numbers and verify official records quickly.' : 'সনদ নম্বর অনুসন্ধান করে দ্রুত অফিসিয়াল রেকর্ড যাচাই করুন।',
                href: '/verify',
                icon: SearchCheck,
                title: t.home.checkStatus,
            },
        ],
        [language, t.home.applyCertificate, t.home.checkStatus, t.home.registerCitizen]
    );

    const journey = useMemo<InfoCard[]>(
        () => [
            {
                description: language === 'en' ? 'Start with citizen registration, certificates, or verification depending on your need.' : 'প্রয়োজন অনুযায়ী নাগরিক নিবন্ধন, সনদ, বা যাচাই সেবা দিয়ে শুরু করুন।',
                icon: UserPlus,
                title: language === 'en' ? 'Choose a service' : 'সেবা নির্বাচন করুন',
            },
            {
                description: language === 'en' ? 'Complete the relevant form with the required information and supporting context.' : 'প্রয়োজনীয় তথ্য ও সহায়ক বিবরণ দিয়ে সংশ্লিষ্ট ফর্ম পূরণ করুন।',
                icon: FileText,
                title: language === 'en' ? 'Submit details online' : 'অনলাইনে তথ্য জমা দিন',
            },
            {
                description: language === 'en' ? 'Follow progress and verify outcomes from the same portal experience.' : 'একই পোর্টাল অভিজ্ঞতা থেকেই অগ্রগতি দেখুন ও ফলাফল যাচাই করুন।',
                icon: CheckCircle2,
                title: language === 'en' ? 'Track and complete' : 'ট্র্যাক ও সম্পন্ন করুন',
            },
        ],
        [language]
    );

    const trustPoints = useMemo<InfoCard[]>(
        () => [
            {
                description: language === 'en' ? 'Public services are presented in a structured and trackable way.' : 'পাবলিক সেবাগুলোকে কাঠামোবদ্ধ ও ট্র্যাকযোগ্যভাবে উপস্থাপন করা হয়েছে।',
                icon: Landmark,
                title: language === 'en' ? 'Union-backed workflows' : 'ইউনিয়ন-সমর্থিত ওয়ার্কফ্লো',
            },
            {
                description: language === 'en' ? 'Issued records can be checked quickly against official data.' : 'ইস্যুকৃত রেকর্ড দ্রুত অফিসিয়াল ডেটার সাথে মিলিয়ে দেখা যায়।',
                icon: ShieldCheck,
                title: language === 'en' ? 'Verification built in' : 'অন্তর্নির্মিত যাচাই',
            },
            {
                description: language === 'en' ? 'The homepage prioritizes clarity, spacing, and obvious next steps.' : 'হোমপেইজে স্বচ্ছতা, ফাঁকা জায়গা এবং পরবর্তী ধাপকে অগ্রাধিকার দেওয়া হয়েছে।',
                icon: Building2,
                title: language === 'en' ? 'Cleaner public experience' : 'পরিষ্কার পাবলিক অভিজ্ঞতা',
            },
        ],
        [language]
    );

    const statsCards = [
        {
            icon: Users,
            label: t.dashboard.totalCitizens,
            value: stats ? formatNumber(stats.totalCitizens) : fallbackValue,
        },
        {
            icon: FileCheck2,
            label: t.dashboard.certificatesIssued,
            value: stats ? formatNumber(stats.totalCertificates) : fallbackValue,
        },
        {
            icon: BadgeCheck,
            label: t.dashboard.pendingRequests,
            value: stats ? formatNumber(stats.totalPending) : fallbackValue,
        },
        {
            icon: CircleDollarSign,
            label: t.dashboard.revenue,
            value: stats ? formatCurrency(stats.totalRevenue) : fallbackValue,
        },
    ];

    const contactCards = [
        {
            icon: MapPin,
            title: language === 'en' ? 'Union office' : 'ইউনিয়ন অফিস',
            value: officeAddress,
        },
        {
            icon: Mail,
            title: language === 'en' ? 'Support email' : 'সহায়তার ইমেইল',
            value: supportEmail,
        },
        ...(leadPhone
            ? [
                  {
                      icon: Phone,
                      title: language === 'en' ? 'Phone contact' : 'ফোন যোগাযোগ',
                      value: leadPhone,
                  },
              ]
            : []),
        ...(settings.unionWebsite?.trim()
            ? [
                  {
                      icon: Globe,
                      title: language === 'en' ? 'Website' : 'ওয়েবসাইট',
                      value: settings.unionWebsite.trim(),
                  },
              ]
            : []),
    ];

    return (
        <div className="bg-background">
            <section className="relative isolate overflow-hidden pt-6 sm:pt-8 lg:pt-12">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute left-[2%] top-8 h-56 w-56 rounded-full bg-primary/14 blur-3xl sm:h-80 sm:w-80" />
                    <div className="absolute right-[3%] top-0 h-56 w-56 rounded-full bg-accent/14 blur-3xl sm:h-[24rem] sm:w-[24rem]" />
                </div>

                <div className="container relative mx-auto grid gap-6 px-4 pb-10 lg:grid-cols-[1.08fr_0.92fr] xl:gap-8">
                    <SectionCard className="bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_94%,white)_0%,var(--card)_100%)] p-8 lg:p-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-semibold text-primary">
                            <ShieldCheck size={16} />
                            <span>{settings.siteName || t.common.officialPortal}</span>
                        </div>
                        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.02] text-foreground sm:text-5xl lg:text-[3.65rem]">
                            {language === 'en' ? 'Public services built around ' : 'ডিজিটাল নাগরিক সেবা '}
                            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">{unionDisplayName}</span>
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{t.home.subtitle}</p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            {features.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.href} href={item.href} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-transparent bg-primary px-6 font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/90 first:bg-primary last:bg-foreground last:text-background">
                                        <Icon size={18} />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            {[
                                { description: language === 'en' ? 'Official records and accountable workflows.' : 'অফিসিয়াল রেকর্ড ও জবাবদিহিমূলক কার্যক্রম।', icon: ShieldCheck, title: language === 'en' ? 'Trusted' : 'নির্ভরযোগ্য' },
                                { description: language === 'en' ? 'Less waiting, fewer repeated visits.' : 'কম অপেক্ষা, কমবার অফিসে যাওয়া।', icon: Clock3, title: language === 'en' ? 'Faster' : 'দ্রুত' },
                                { description: language === 'en' ? 'Clear actions and readable layouts.' : 'স্পষ্ট অ্যাকশন এবং সহজপাঠ্য লেআউট।', icon: Sparkles, title: language === 'en' ? 'Simple' : 'সহজ' },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className="rounded-3xl border border-border/70 bg-background/80 p-4 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.55)]">
                                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Icon size={18} />
                                        </span>
                                        <h2 className="mt-4 text-base font-semibold text-foreground">{item.title}</h2>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>

                    <SectionCard>
                        <div className="rounded-[28px] border border-border/60 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_9%,var(--card)),color-mix(in_oklab,var(--accent)_8%,var(--card)))] p-5 sm:p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/75">{language === 'en' ? 'Public menu' : 'পাবলিক মেনু'}</p>
                            <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-[1.8rem]">{language === 'en' ? 'Everything starts here' : 'সবকিছু শুরু হয় এখান থেকে'}</h2>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{language === 'en' ? 'A clean entry point for the most common resident tasks.' : 'নাগরিকদের সবচেয়ে সাধারণ কাজের জন্য একটি পরিষ্কার প্রবেশপথ।'}</p>
                        </div>
                        <nav aria-label="Public menu" className="mt-5 grid gap-3">
                            {features.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={`feature-${item.href}`} href={item.href} className="group rounded-[24px] border border-border/70 bg-background/85 p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/20">
                                        <div className="flex items-start justify-between gap-4">
                                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                <Icon size={20} />
                                            </span>
                                            <ArrowRight size={18} className="mt-1 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="mt-5 rounded-[26px] border border-border/70 bg-background/90 p-4 sm:p-5">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{language === 'en' ? 'Live portal snapshot' : 'লাইভ পোর্টাল সারাংশ'}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{language === 'en' ? 'Current service activity from the public dashboard.' : 'পাবলিক ড্যাশবোর্ডের বর্তমান সেবা কার্যক্রম।'}</p>
                                </div>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{language === 'en' ? 'Live data' : 'লাইভ ডেটা'}</span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {statsCards.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.label} className="rounded-2xl border border-border/70 bg-card px-4 py-4 shadow-sm">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <Icon size={18} />
                                                </span>
                                            </div>
                                            <p className="mt-4 text-2xl font-bold text-foreground">{isLoadingStats ? fallbackValue : item.value}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </section>

            <section className="border-t border-border/60 bg-background py-10 sm:py-14 lg:py-16">
                <div className="container mx-auto grid gap-6 px-4 lg:grid-cols-[0.92fr_1.08fr] xl:gap-8">
                    <SectionCard>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/75">{language === 'en' ? 'How it works' : 'কিভাবে কাজ করে'}</p>
                        <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">{language === 'en' ? 'A straightforward journey for residents' : 'নাগরিকদের জন্য সহজ ও সরল অভিজ্ঞতা'}</h2>
                        <p className="mt-4 text-base leading-7 text-muted-foreground">{language === 'en' ? 'The public experience follows a simple decision path instead of competing panels and crowded hero content.' : 'পাবলিক অভিজ্ঞতাটি এখন প্রতিদ্বন্দ্বী প্যানেল ও ভিড় করা হিরোর বদলে সহজ সিদ্ধান্তের পথে সাজানো হয়েছে।'}</p>
                        <div className="mt-7 space-y-4">
                            {journey.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className="flex gap-4 rounded-2xl border border-border/70 bg-background/80 p-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{index + 1}</span>
                                                <h3 className="font-semibold text-foreground">{item.title}</h3>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>

                    <div className="space-y-6">
                        <SectionCard>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/75">{language === 'en' ? 'Why residents trust it' : 'নাগরিকদের আস্থা কেন'}</p>
                                    <h2 className="mt-3 text-3xl font-bold text-foreground">{language === 'en' ? 'Designed for clarity, trust, and speed' : 'স্বচ্ছতা, আস্থা ও দ্রুততার জন্য ডিজাইন'}</h2>
                                </div>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{language === 'en' ? 'Built for public service' : 'পাবলিক সার্ভিসের জন্য'}</span>
                            </div>
                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                {trustPoints.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.title} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Icon size={18} />
                                            </span>
                                            <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </SectionCard>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {contactCards.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <SectionCard key={item.title} className="p-6">
                                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Icon size={18} />
                                        </span>
                                        <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                                        <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{item.value}</p>
                                    </SectionCard>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-border/60 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_10%,var(--card)),color-mix(in_oklab,var(--accent)_10%,var(--card)))] py-10 sm:py-14 lg:py-16">
                <div className="container mx-auto px-4">
                    <SectionCard className="bg-background/80 p-8 lg:p-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/75">{language === 'en' ? 'Union team' : 'ইউনিয়ন টিম'}</p>
                        <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">{language === 'en' ? 'Meet the people behind the service desk' : 'সেবার পেছনের দায়িত্বশীলদের সঙ্গে পরিচিত হোন'}</h2>
                        {team.length > 0 ? (
                            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {team.map((member) => (
                                    <article key={member._id} className="rounded-[28px] border border-border/70 bg-card/90 p-5 shadow-sm">
                                        <h3 className="text-xl font-bold text-foreground">{language === 'en' ? member.nameEn : member.nameBn}</h3>
                                        <p className="mt-1 text-sm font-medium text-primary">{member.designation}</p>
                                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone size={14} />
                                            <span>{member.phone}</span>
                                        </div>
                                        {member.email ? (
                                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail size={14} />
                                                <span className="truncate">{member.email}</span>
                                            </div>
                                        ) : null}
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-8 rounded-[28px] border border-dashed border-border/80 bg-secondary/35 px-6 py-12 text-center">
                                <h3 className="text-xl font-semibold text-foreground">{language === 'en' ? 'Team information will appear here soon' : 'টিমের তথ্য শীঘ্রই এখানে প্রদর্শিত হবে'}</h3>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">{language === 'en' ? 'Once members are added in the admin panel, residents will be able to see the people serving this union.' : 'অ্যাডমিন প্যানেলে সদস্য যোগ করার পর নাগরিকরা এই ইউনিয়নের দায়িত্বশীল ব্যক্তিদের দেখতে পারবেন।'}</p>
                            </div>
                        )}
                    </SectionCard>
                </div>
            </section>

            <section className="border-t border-border/60 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_12%,var(--background)),color-mix(in_oklab,var(--accent)_10%,var(--background)))] py-14 sm:py-16">
                <div className="container mx-auto px-4">
                    <div className="rounded-[30px] border border-primary/20 bg-card/88 p-8 text-center shadow-[0_24px_60px_-42px_rgba(37,99,235,0.45)] backdrop-blur sm:p-10">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/80">{language === 'en' ? 'Ready to begin' : 'শুরু করতে প্রস্তুত'}</p>
                        <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">{language === 'en' ? 'Use the portal with less friction and more clarity' : 'কম জটিলতা ও বেশি স্বচ্ছতার সাথে পোর্টাল ব্যবহার শুরু করুন'}</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{language === 'en' ? 'Register, apply, or verify in a few clear steps and keep your service journey visible from start to finish.' : 'কয়েকটি পরিষ্কার ধাপে নিবন্ধন, আবেদন বা যাচাই সম্পন্ন করুন এবং শুরু থেকে শেষ পর্যন্ত আপনার সেবার অগ্রগতি দেখুন।'}</p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link href="/apply/citizen" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                                <UserPlus size={18} />
                                {t.home.registerCitizen}
                            </Link>
                            <Link href="/verify" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 font-semibold text-foreground transition-colors hover:bg-muted/70">
                                <SearchCheck size={18} />
                                {t.home.checkStatus}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
