'use client';

import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import StatCard from '@/components/ui/StatCard';
import Link from 'next/link';
import { ArrowUpRight, BarChart3, FileText, LayoutDashboard, Users } from 'lucide-react';
import { useEffect, useState } from 'react';



import { useLanguage } from '@/components/providers/LanguageContext';

interface DashboardStats {
  totalCitizens: number;
  totalCertificates: number;
  totalPending: number;
  totalRevenue: number;
  lineChartData: Array<{ name: string; value: number }>;
  barChartData: Array<{ name: string; value: number }>;
}

export default function Overview() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCitizens: 0,
    totalCertificates: 0,
    totalPending: 0,
    totalRevenue: 0,
    lineChartData: [],
    barChartData: []
  });

  const totalServiceRequests = stats.totalCitizens + stats.totalCertificates;
  const pendingRate = totalServiceRequests > 0 ? Math.round((stats.totalPending / totalServiceRequests) * 100) : 0;
  const completionRate = Math.max(0, 100 - pendingRate);
  const revenueDisplay = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(stats.totalRevenue || 0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-24 rounded-2xl border border-border/70 bg-card/70" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl border border-border/60 bg-card/70"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-[380px] rounded-xl border border-border/60 bg-card/70"></div>
          <div className="h-[380px] rounded-xl border border-border/60 bg-card/70"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-secondary/55 via-card to-card p-6 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              {language === 'en' ? 'Administrative Command Center' : 'প্রশাসনিক কমান্ড সেন্টার'}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground font-display md:text-3xl">
              {t.dashboard.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              {t.dashboard.welcomeBack}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href="/admin/citizens/add" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              {language === 'en' ? 'Add Citizen' : 'নাগরিক যোগ করুন'}
              <ArrowUpRight size={16} />
            </Link>
            <Link href="/admin/certificates/issue" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60">
              {language === 'en' ? 'Issue Certificate' : 'সনদ ইস্যু করুন'}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t.dashboard.totalCitizens}
          value={stats.totalCitizens}
          change={0}
          trend="up"
          icon={Users}
          color="primary"
        />
        <StatCard
          title={t.dashboard.certificatesIssued}
          value={stats.totalCertificates}
          change={0}
          trend="up"
          icon={FileText}
          color="success"
        />
        <StatCard
          title={t.dashboard.pendingRequests}
          value={stats.totalPending}
          change={0}
          trend="up"
          icon={LayoutDashboard}
          color="warning"
        />
        <StatCard
          title={t.dashboard.revenue}
          value={revenueDisplay}
          change={0}
          trend="up"
          icon={BarChart3}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-border/70 bg-card p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t.dashboard.weeklyTrend}</h2>
              <p className="text-sm text-muted-foreground">{t.dashboard.weeklyTrendDesc}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {language === 'en' ? '7 days' : '৭ দিন'}
            </span>
          </div>
          <div className="h-[280px] w-full md:h-[300px]">
            <LineChart data={stats.lineChartData} />
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 md:p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {language === 'en' ? 'Operational Health' : 'অপারেশনাল অবস্থা'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {language === 'en' ? 'Live service efficiency and pending pressure.' : 'চলমান সেবা দক্ষতা এবং অপেক্ষমান চাপ।'}
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{language === 'en' ? 'Completion rate' : 'সম্পন্ন হার'}</span>
                <span className="font-semibold text-foreground">{completionRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${completionRate}%` }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{language === 'en' ? 'Pending pressure' : 'অপেক্ষমান চাপ'}</span>
                <span className="font-semibold text-foreground">{pendingRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-[var(--warning)]" style={{ width: `${pendingRate}%` }} />
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {language === 'en' ? 'Current queue' : 'বর্তমান কিউ'}
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalPending}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {language === 'en' ? 'Pending citizen + certificate requests' : 'অপেক্ষমান নাগরিক ও সনদ অনুরোধ'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">{t.dashboard.monthlyCerts}</h2>
            <p className="text-sm text-muted-foreground">{t.dashboard.monthlyCertsDesc}</p>
          </div>
          <div className="h-[300px] w-full">
            <BarChart data={stats.barChartData} />
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {language === 'en' ? 'Quick Operations' : 'দ্রুত অপারেশন'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {language === 'en' ? 'Common administrative actions in one place.' : 'প্রয়োজনীয় প্রশাসনিক কাজ এক জায়গায়।'}
          </p>

          <div className="mt-5 grid gap-3">
            <Link href="/admin/citizens" className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60">
              {language === 'en' ? 'Review citizen requests' : 'নাগরিক আবেদন পর্যালোচনা'}
              <ArrowUpRight size={16} className="text-muted-foreground" />
            </Link>
            <Link href="/admin/certificates" className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60">
              {language === 'en' ? 'Manage certificate pipeline' : 'সনদ প্রক্রিয়া ব্যবস্থাপনা'}
              <ArrowUpRight size={16} className="text-muted-foreground" />
            </Link>
            <Link href="/admin/reports" className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60">
              {language === 'en' ? 'View reports and exports' : 'রিপোর্ট এবং এক্সপোর্ট দেখুন'}
              <ArrowUpRight size={16} className="text-muted-foreground" />
            </Link>
            <Link href="/admin/settings" className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60">
              {language === 'en' ? 'Update portal settings' : 'পোর্টালের সেটিংস আপডেট'}
              <ArrowUpRight size={16} className="text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
