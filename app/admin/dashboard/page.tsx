'use client';

import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import StatCard from '@/components/ui/StatCard';
import { BarChart3, FileText, LayoutDashboard, Users } from 'lucide-react';
import { useEffect, useState } from 'react';



import { useLanguage } from '@/components/providers/LanguageContext';

export default function Overview() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCitizens: 0,
    totalCertificates: 0,
    totalPending: 0,
    lineChartData: [],
    barChartData: []
  });

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/50"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-[400px] rounded-xl bg-muted/50"></div>
          <div className="h-[400px] rounded-xl bg-muted/50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{t.dashboard.title}</h1>
        <p className="text-muted-foreground">
          {t.dashboard.welcomeBack}
        </p>
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
          value="৳0"
          change={0}
          trend="up"
          icon={BarChart3}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">{t.dashboard.weeklyTrend}</h2>
            <p className="text-sm text-muted-foreground">{t.dashboard.weeklyTrendDesc}</p>
          </div>
          <div className="h-[300px] w-full">
            <LineChart data={stats.lineChartData} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">{t.dashboard.monthlyCerts}</h2>
            <p className="text-sm text-muted-foreground">{t.dashboard.monthlyCertsDesc}</p>
          </div>
          <div className="h-[300px] w-full">
            <BarChart data={stats.barChartData} />
          </div>
        </div>
      </div>
    </div>
  );
}
