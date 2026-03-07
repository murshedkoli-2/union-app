'use client';

import { useSidebar } from '@/components/providers/SidebarContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
    BarChart3,
    ChevronLeft,
    FileText,
    LayoutDashboard,
    Settings,
    Shield,
    Users,
    UserPlus,
    Tag,
    Receipt,
    UserCog,
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
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={cn(
                    'fixed bottom-0 left-0 top-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out md:translate-x-0',
                    collapsed ? 'md:w-20' : 'md:w-64',
                    'w-64',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo Header */}
                <div className={cn('flex h-16 items-center border-b border-border px-4', collapsed && 'justify-center px-3')}>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
                            {settings.unionLogo ? (
                                <Image src={settings.unionLogo} alt="Logo" width={36} height={36} className="h-full w-full object-contain p-1.5" unoptimized />
                            ) : (
                                <Shield size={18} className="text-primary-foreground" />
                            )}
                        </div>

                        {!collapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {settings.siteName || 'Union Admin'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {t.sidebar.adminConsole}
                                </p>
                            </div>
                        )}
                    </div>

                    {!collapsed && (
                        <button
                            onClick={toggleSidebar}
                            className="hidden md:flex ml-2 h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {navGroups.map((group, idx) => (
                        <div key={group.title} className={cn('space-y-0.5', idx > 0 && 'mt-6')}>
                            {!collapsed && (
                                <p className="px-3 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {group.title}
                                </p>
                            )}
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                                            isActive
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                            collapsed && 'justify-center px-2'
                                        )}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <item.icon
                                            size={20}
                                            className={cn(
                                                'shrink-0 transition-colors',
                                                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                                            )}
                                        />
                                        {!collapsed && <span className="truncate">{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-border p-3">
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            'hidden md:flex w-full items-center justify-center rounded-lg border border-border bg-muted/40 p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
                            collapsed && 'px-2'
                        )}
                    >
                        <ChevronLeft size={18} className={cn('transition-transform', collapsed && 'rotate-180')} />
                    </button>
                </div>
            </aside>
        </>
    );
}
