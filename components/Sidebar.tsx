'use client';

import { useSidebar } from '@/components/providers/SidebarContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    FileText,
    LayoutDashboard,
    Settings,
    Shield,
    Users,
    UserPlus,
    Tag,
    Receipt,
    UserCog,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageContext';

import { useSettings } from '@/components/providers/SettingsContext';

export default function Sidebar() {
    const { collapsed, toggleSidebar, mobileOpen, setMobileOpen } = useSidebar();
    const { t } = useLanguage();
    const { settings } = useSettings();
    const pathname = usePathname();

    const navGroups = [
        {
            title: t.sidebar.sectionOverview,
            items: [
                { icon: LayoutDashboard, label: t.sidebar.overview, href: '/admin/dashboard' },
                { icon: BarChart3, label: t.sidebar.reports, href: '/admin/reports' },
            ],
        },
        {
            title: t.sidebar.sectionCitizenServices,
            items: [
                { icon: Users, label: t.sidebar.citizens, href: '/admin/citizens' },
                { icon: UserPlus, label: t.sidebar.addCitizen, href: '/admin/citizens/add' },
                { icon: Receipt, label: t.sidebar.holdingTax, href: '/admin/holding-tax' },
            ],
        },
        {
            title: t.sidebar.sectionCertificates,
            items: [
                { icon: FileText, label: t.sidebar.certificates, href: '/admin/certificates' },
                { icon: Shield, label: t.sidebar.issueCertificate, href: '/admin/certificates/issue' },
                { icon: Tag, label: t.sidebar.certificateTypes, href: '/admin/certificates/types' },
            ],
        },
        {
            title: t.sidebar.sectionAdministration,
            items: [
                { icon: UserCog, label: t.team.adminTitle, href: '/admin/team' },
                { icon: Settings, label: t.sidebar.settings, href: '/admin/settings' },
            ],
        },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={cn(
                    'fixed bottom-0 left-0 top-0 z-50 flex flex-col border-r border-border/70 bg-card/95 shadow-xl shadow-black/10 backdrop-blur transition-transform duration-300 ease-in-out md:translate-x-0',
                    collapsed ? 'md:w-[80px]' : 'md:w-[260px]',
                    'w-[260px]',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="relative overflow-hidden border-b border-border/70 px-4 py-4">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />
                    <div className="pointer-events-none absolute -left-10 -bottom-12 h-28 w-28 rounded-full bg-accent/15 blur-2xl" />

                    <div className={cn('relative z-10 flex items-start gap-3', collapsed && 'justify-center')}>
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/15 via-background to-accent/15 shadow-sm">
                            <div className="absolute inset-[1px] rounded-[10px] border border-border/70" />
                            {settings.unionLogo ? (
                                <Image src={settings.unionLogo} alt="Logo" width={44} height={44} className="h-full w-full object-contain p-1" unoptimized />
                            ) : (
                                <Shield size={21} className="text-primary stroke-[2.4px]" />
                            )}
                        </div>

                        {!collapsed && (
                            <div className="min-w-0 flex-1 space-y-2">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                        {t.sidebar.adminConsole}
                                    </p>
                                    <p className="truncate font-display text-[17px] font-bold leading-tight text-foreground">
                                        {settings.siteName || 'UnionAdmin'}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                        <Sparkles size={10} /> {t.sidebar.sectionAdministration}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--success)]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                                        {t.settings.operational}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!collapsed && (
                        <button
                            onClick={toggleSidebar}
                            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                        >
                            <ChevronLeft size={15} />
                        </button>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-5">
                    <div className="flex flex-col gap-4">
                        {navGroups.map((group) => (
                            <div key={group.title} className="space-y-1 rounded-xl border border-transparent px-1 py-1">
                                {!collapsed && (
                                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                                        {group.title}
                                    </p>
                                )}
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                                collapsed && 'justify-center px-2'
                                            )}
                                            title={collapsed ? item.label : undefined}
                                        >
                                            {isActive && !collapsed && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary-foreground/80" />}
                                            <item.icon
                                                size={20}
                                                className={cn(
                                                    'transition-colors',
                                                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                                                )}
                                            />
                                            {!collapsed && <span className="truncate">{item.label}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </nav>

                <div className="border-t border-border/70 p-4">
                    <button
                        onClick={toggleSidebar}
                        className="flex w-full items-center justify-center rounded-xl border border-border bg-muted/40 p-2 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                    >
                        <ChevronRight size={20} className={cn(!collapsed && 'rotate-180')} />
                    </button>
                </div>
            </aside>
        </>
    );
}
