'use client';

import { useSidebar } from '@/components/providers/SidebarContext';
import { cn } from '@/lib/utils';
import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    FileText,
    LayoutDashboard,
    LogOut,
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

    const navItems = [
        { icon: LayoutDashboard, label: t.sidebar.overview, href: '/admin/dashboard' },
        { icon: Users, label: t.sidebar.citizens, href: '/admin/citizens' },
        { icon: UserPlus, label: t.sidebar.addCitizen, href: '/admin/citizens/add' },
        { icon: FileText, label: t.sidebar.certificates, href: '/admin/certificates' },
        { icon: Shield, label: t.sidebar.issueCertificate, href: '/admin/certificates/issue' },
        { icon: Tag, label: t.sidebar.certificateTypes, href: '/admin/certificates/types' },
        { icon: Receipt, label: t.sidebar.holdingTax, href: '/admin/holding-tax' },
        { icon: UserCog, label: t.team.adminTitle, href: '/admin/team' },
        { icon: BarChart3, label: t.sidebar.reports, href: '/admin/reports' },
        { icon: Settings, label: t.sidebar.settings, href: '/admin/settings' },
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
                    'fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-card border-r border-border transition-transform duration-300 ease-in-out md:translate-x-0',
                    collapsed ? 'md:w-[80px]' : 'md:w-[260px]',
                    // Mobile styles
                    'w-[260px]',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Header */}
                <div className="flex h-[72px] items-center justify-between px-6 border-b border-border">
                    <div className={cn('flex items-center gap-3 overflow-hidden', collapsed && 'justify-center w-full')}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                            <Shield size={20} className="stroke-[2.5px]" />
                        </div>
                        {!collapsed && (
                            <span className="font-display text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                                {settings.siteName || 'UnionAdmin'}
                            </span>
                        )}
                    </div>
                    {!collapsed && (
                        <button
                            onClick={toggleSidebar}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-primary/10 text-primary shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    collapsed && 'justify-center px-2'
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon
                                    size={20}
                                    className={cn(
                                        'transition-colors',
                                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                    )}
                                />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                    {collapsed ? (
                        <button
                            onClick={toggleSidebar}
                            className="flex w-full items-center justify-center rounded-lg bg-muted p-2 text-muted-foreground hover:bg-muted/80 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-card">
                                    <Users size={20} className="text-primary" />
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col overflow-hidden">
                                <span className="truncate text-sm font-semibold text-foreground">Admin User</span>
                                <span className="truncate text-xs text-muted-foreground">admin@union.gov</span>
                            </div>
                            <button
                                onClick={async () => {
                                    try {
                                        await fetch('/api/auth/logout', { method: 'POST' });
                                        window.location.href = '/login';
                                    } catch (e) {
                                        console.error('Logout failed', e);
                                        window.location.href = '/login';
                                    }
                                }}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
