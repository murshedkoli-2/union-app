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
      <div className="space-y-8">
        <div className="h-32 animate-pulse rounded-2xl border border-border bg-card/50" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-card/50"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-[380px] animate-pulse rounded-xl border border-border bg-card/50 lg:col-span-2"></div>
          <div className="h-[380px] animate-pulse rounded-xl border border-border bg-card/50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-card to-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <LayoutDashboard size={14} />
              {language === 'en' ? 'Overview' : 'সংক্ষিপ্ত বিবরণ'}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t.dashboard.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.dashboard.welcomeBack}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link 
              href="/admin/citizens/add" 
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              <Users size={16} />
              {language === 'en' ? 'Add Citizen' : 'নাগরিক যোগ করুন'}
            </Link>
            <Link 
              href="/admin/certificates/issue" 
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-all hover:bg-muted/50"
            >
              <FileText size={16} />
              {language === 'en' ? 'Issue Certificate' : 'সনদ ইস্যু করুন'}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t.dashboard.weeklyTrend}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.dashboard.weeklyTrendDesc}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {language === 'en' ? '7 days' : '৭ দিন'}
            </span>
          </div>
          <div className="h-[280px] w-full">
            <LineChart data={stats.lineChartData} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {language === 'en' ? 'System Health' : 'সিস্টেম অবস্থা'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {language === 'en' ? 'Service efficiency metrics' : 'সেবা দক্ষতার পরিমাপ'}
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{language === 'en' ? 'Completion rate' : 'সম্পন্ন হার'}</span>
                <span className="font-semibold text-foreground">{completionRate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${completionRate}%` }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{language === 'en' ? 'Pending pressure' : 'অপেক্ষমান চাপ'}</span>
                <span className="font-semibold text-foreground">{pendingRate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-2 rounded-full bg-[var(--warning)] transition-all duration-500" style={{ width: `${pendingRate}%` }} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {language === 'en' ? 'Current queue' : 'বর্তমান কিউ'}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">{stats.totalPending}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {language === 'en' ? 'Awaiting processing' : 'প্রক্রিয়াধীন অপেক্ষমান'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              {language === 'en' ? 'Certificate Distribution' : 'সনদ  বিতরণ'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {language === 'en' ? 'Monthly certificate issuance' : 'মাসিক সনদ ইস্যু'}
            </p>
          </div>
          <div className="h-[280px] w-full">
            <BarChart data={stats.barChartData} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              {language === 'en' ? 'Quick Actions' : 'দ্রুত কার্যক্রম'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {language === 'en' ? 'Common administrative tasks' : 'সাধারণ প্রশাসনিক কাজ'}
            </p>
          </div>

          <div className="grid gap-3">
            <Link
              href="/admin/citizens"
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {language === 'en' ? 'Manage Citizens' : 'নাগরিক ব্যবস্থাপনা'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalCitizens} {language === 'en' ? 'registered' : 'নিবন্ধিত'}
                  </p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-muted-foreground" />
            </Link>

            <Link
              href="/admin/certificates"
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success-soft)] text-[var(--success)]">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {language === 'en' ? 'View Certificates' : 'সনদ দেখুন'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalCertificates} {language === 'en' ? 'issued' : 'ইস্যু করা'}
                  </p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-muted-foreground" />
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info-soft)] text-[var(--info)]">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {language === 'en' ? 'Generate Reports' : 'রিপোর্ট তৈরি করুন'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Analytics & insights' : 'বিশ্লেষণ ও অন্তর্দৃষ্টি'}
                  </p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
