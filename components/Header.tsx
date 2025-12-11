'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
// Imports updated implicitly by context usage, ensuring we have Menu icon available
import { Menu, Bell, Moon, Search, Sun, Check, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { useSidebar } from '@/components/providers/SidebarContext';
import { useLanguage } from '@/components/providers/LanguageContext';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    link?: string;
    createdAt: string;
}

export default function Header() {
    const { toggleMobile, toggleSidebar, collapsed } = useSidebar();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            // Update local state
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark read');
        }
    };

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ readAll: true })
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all read');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'error': return <XCircle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <header className="sticky top-0 z-40 flex min-h-[72px] items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md transition-all duration-300">
            <div className="flex items-center gap-4 w-full max-w-md">
                {/* Mobile Toggle */}
                <button
                    onClick={toggleMobile}
                    className="md:hidden p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-lg"
                >
                    <Menu size={20} />
                </button>
                {/* Desktop Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="hidden md:flex p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                    title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <Menu size={20} />
                </button>

                <div className="relative flex w-full items-center text-muted-foreground">
                    <Search size={18} className="absolute left-3" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex h-10 items-center rounded-lg border border-border bg-muted/40 p-1">
                    <button
                        onClick={() => setLanguage('en')}
                        className={`flex h-full items-center px-3 rounded-md text-xs font-semibold transition-all ${language === 'en' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => setLanguage('bn')}
                        className={`flex h-full items-center px-3 rounded-md text-xs font-semibold transition-all ${language === 'bn' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        বাংলা
                    </button>
                </div>
                <button
                    onClick={toggleTheme}
                    title="Toggle theme"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:shadow-md"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:shadow-md ${isOpen ? 'bg-muted text-foreground' : ''}`}
                        title="Notifications"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h3 className="font-semibold">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No notifications
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            onClick={() => !n.read && markAsRead(n._id)}
                                            className={`flex gap-3 p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${!n.read ? 'bg-muted/20' : ''}`}
                                        >
                                            <div className="mt-0.5">{getIcon(n.type)}</div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${!n.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-2">
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!n.read && (
                                                <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
