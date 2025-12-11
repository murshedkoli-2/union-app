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
    const { t } = useLanguage();
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/reports');
                if (!res.ok) throw new Error('Failed to fetch data');
                const jsonData = await res.json();
                setData(jsonData);
            } catch (err) {
                console.error(err);
                setError('Failed to load report data');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500 gap-2">
                <AlertCircle size={32} />
                <p>{error || t.reports.noData}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{t.reports.title}</h1>
                <p className="text-muted-foreground">{t.reports.subtitle}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{t.reports.totalCitizens}</p>
                        <h3 className="text-2xl font-bold mt-1 text-foreground">{data.counts.citizens}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Users size={24} />
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{t.reports.totalCertificates}</p>
                        <h3 className="text-2xl font-bold mt-1 text-foreground">{data.counts.certificates}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <FileText size={24} />
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{t.reports.pendingRequests}</p>
                        <h3 className="text-2xl font-bold mt-1 text-foreground">{data.counts.pending}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Clock size={24} />
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certificates Issue Trend */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
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

                {/* Certificates by Type */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
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
        </div>
    );
}
