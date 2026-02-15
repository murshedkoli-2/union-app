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
                    'fixed left-0 top-0 bottom-0 z-50 flex flex-col border-r border-border bg-card/95 shadow-xl shadow-black/10 backdrop-blur transition-transform duration-300 ease-in-out md:translate-x-0',
                    collapsed ? 'md:w-[80px]' : 'md:w-[260px]',
                    'w-[260px]',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="relative flex h-[88px] items-center justify-between px-5 border-b border-border overflow-hidden">
                    <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                    <div className="pointer-events-none absolute -left-10 -bottom-12 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />

                    <div className={cn('relative z-10 flex items-center gap-3 overflow-hidden', collapsed && 'justify-center w-full')}>
                        <div className="group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden shadow-md shadow-primary/10">
                            <div className="absolute inset-[1px] rounded-[14px] border border-border/70" />
                            {settings.unionLogo ? (
                                <Image src={settings.unionLogo} alt="Logo" width={40} height={40} className="w-full h-full object-contain p-0.5" unoptimized />
                            ) : (
                                <Shield size={20} className="text-primary stroke-[2.5px]" />
                            )}
                        </div>
                        {!collapsed && (
                            <div className="min-w-0 space-y-1">
                                <span className="block truncate font-display text-[18px] font-bold leading-none text-foreground">
                                    {settings.siteName || 'UnionAdmin'}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                                    <Sparkles size={10} className="opacity-90" /> {t.sidebar.adminConsole}
                                </span>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <button
                            onClick={toggleSidebar}
                            className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-5">
                    <div className="flex flex-col gap-4">
                        {navGroups.map((group) => (
                            <div key={group.title} className="space-y-1">
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
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
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

                <div className="p-4 border-t border-border">
                    <button
                        onClick={toggleSidebar}
                        className="flex w-full items-center justify-center rounded-xl bg-muted p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                    >
                        <ChevronRight size={20} className={cn(!collapsed && 'rotate-180')} />
                    </button>
                </div>
            </aside>
        </>
    );
}
