'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, FileText, Clock, AlertCircle, Loader2 } from 'lucide-react';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';

interface ReportData {
    counts: {
        citizens: number;
        certificates: number;
        pending: number;
    };
    byType: Array<{ name: string; value: number }>;
    monthlyGrowth: Array<{ name: string; value: number }>;
}

import { useLanguage } from '@/components/providers/LanguageContext';

export default function Reports() {
    const { t, language } = useLanguage();
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/reports');
                if (!res.ok) throw new Error(language === 'en' ? 'Failed to fetch data' : 'ডেটা আনা যায়নি');
                const jsonData = await res.json();
                setData(jsonData);
            } catch (err) {
                console.error(err);
                setError(language === 'en' ? 'Failed to load report data' : 'রিপোর্ট ডেটা লোড করা যায়নি');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [language]);

    if (loading) {
        return (
            <div className="min-h-[400px] rounded-2xl border border-border/70 bg-card/70 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-[400px] rounded-2xl border border-border/70 bg-card/70 flex flex-col items-center justify-center text-[var(--danger)] gap-2">
                <AlertCircle size={32} />
                <p>{error || t.reports.noData}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-secondary/55 via-card to-card p-6 md:p-7">
                <p className="text-sm font-medium text-primary">
                    {language === 'en' ? 'Insights & Reporting' : 'ইনসাইটস ও রিপোর্টিং'}
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground font-display md:text-3xl">{t.reports.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">{t.reports.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{t.reports.totalCitizens}</p>
                        <h3 className="text-2xl font-bold mt-1 text-foreground">{data.counts.citizens}</h3>
                    </div>
                    <div className="tone-info h-12 w-12 rounded-full border flex items-center justify-center">
                        <Users size={24} />
                    </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{t.reports.totalCertificates}</p>
                        <h3 className="text-2xl font-bold mt-1 text-foreground">{data.counts.certificates}</h3>
                    </div>
                    <div className="tone-success h-12 w-12 rounded-full border flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{t.reports.pendingRequests}</p>
                        <h3 className="text-2xl font-bold mt-1 text-foreground">{data.counts.pending}</h3>
                    </div>
                    <div className="tone-warning h-12 w-12 rounded-full border flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                        <BarChart3 size={18} className="text-primary" />
                        {t.reports.issuedTrend}
                    </h3>
                    <div className="h-[300px] w-full">
                        {data.monthlyGrowth.length > 0 ? (
                            <LineChart data={data.monthlyGrowth} />
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                {t.reports.noTrendData}
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                        <FileText size={18} className="text-primary" />
                        {t.reports.typeDistribution}
                    </h3>
                    <div className="h-[300px] w-full">
                        {data.byType.length > 0 ? (
                            <BarChart data={data.byType} />
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                {t.reports.noTypeData}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">
                    {language === 'en' ? 'Reporting Notes' : 'রিপোর্টিং নোট'}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    {language === 'en'
                        ? 'Use these insights to prioritize pending requests and monitor monthly service throughput.'
                        : 'এই ইনসাইট ব্যবহার করে অপেক্ষমান অনুরোধ অগ্রাধিকার দিন এবং মাসিক সেবা প্রবাহ পর্যবেক্ষণ করুন।'}
                </p>
            </div>
        </div>
    );
}
