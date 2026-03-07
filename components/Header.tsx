'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Menu, Bell, Moon, Search, Sun, Info, AlertTriangle, XCircle, CheckCircle, ChevronDown, LogOut } from 'lucide-react';
import { useSidebar } from '@/components/providers/SidebarContext';
import { useLanguage } from '@/components/providers/LanguageContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    link?: string;
    createdAt: string;
}

interface CitizenSearchResult {
    _id: string;
    name: string;
    nid: string;
    phone?: string;
}

interface AdminProfile {
    name?: string;
    email?: string;
}

export default function Header() {
    const { toggleMobile, toggleSidebar, collapsed } = useSidebar();
    const router = useRouter();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Search State
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [searchResults, setSearchResults] = useState<CitizenSearchResult[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const ui = {
        expandSidebar: language === 'en' ? 'Expand sidebar' : 'সাইডবার বড় করুন',
        collapseSidebar: language === 'en' ? 'Collapse sidebar' : 'সাইডবার ছোট করুন',
        loading: language === 'en' ? 'Loading...' : 'লোড হচ্ছে...',
        noCitizens: language === 'en' ? 'No citizens found' : 'কোনো নাগরিক পাওয়া যায়নি',
        toggleLanguage: language === 'en' ? 'Switch language' : 'ভাষা পরিবর্তন',
        toggleTheme: language === 'en' ? 'Toggle theme' : 'থিম পরিবর্তন',
        profile: language === 'en' ? 'Profile' : 'প্রোফাইল',
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch search results
    useEffect(() => {
        async function performSearch() {
            if (!debouncedSearch) {
                setSearchResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/citizens?search=${encodeURIComponent(debouncedSearch)}`);
                if (res.ok) {
                    const data = await res.json();
                    // Limit to 5 results for header dropdown
                    setSearchResults(data.slice(0, 5));
                }
            } catch (error) {
                console.error('Search failed', error);
            } finally {
                setIsLoading(false);
            }
        }

        performSearch();
    }, [debouncedSearch]);

    // Close search dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigate = (id: string) => {
        router.push(`/admin/citizens/${id}`);
        setShowDropdown(false);
        setSearch(''); // Optional: clear search after navigation
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch('/api/auth/profile');
                if (!res.ok) return;
                const data = await res.json();
                setProfile({ name: data?.name, email: data?.email });
            } catch {
                // Keep fallback profile text if request fails
            }
        }

        fetchProfile();
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

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            window.location.href = '/login';
        }
    };

    const profileName = profile?.name || t.sidebar.adminUser;
    const profileEmail = profile?.email || 'admin@union.gov';
    const profileInitials = profileName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'AU';

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
        } catch {
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
        } catch {
            console.error('Failed to mark all read');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-[var(--success)]" />;
            case 'warning': return <AlertTriangle size={16} className="text-[var(--warning)]" />;
            case 'error': return <XCircle size={16} className="text-[var(--danger)]" />;
            default: return <Info size={16} className="text-[var(--info)]" />;
        }
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-xl md:px-6">
            <div className="flex w-full max-w-xl items-center gap-3">
                {/* Mobile & Desktop Toggle */}
                <button
                    onClick={toggleMobile}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
                >
                    <Menu size={20} />
                </button>
                <button
                    onClick={toggleSidebar}
                    className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
                    title={collapsed ? ui.expandSidebar : ui.collapseSidebar}
                >
                    <Menu size={20} />
                </button>

                {/* Search Input */}
                <div className="relative flex w-full items-center" ref={searchRef}>
                    <Search size={18} className="absolute left-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t?.common?.search || "Search citizens..."}
                        className="h-9 w-full rounded-lg border border-border bg-background/60 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary/20"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                    />

                    {/* Search Dropdown */}
                    {showDropdown && search.length > 0 && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                            {isLoading ? (
                                <div className="p-4 text-center text-xs text-muted-foreground">{ui.loading}</div>
                            ) : searchResults.length > 0 ? (
                                <ul className="max-h-[300px] overflow-y-auto py-1">
                                    {searchResults.map((citizen) => (
                                        <li
                                            key={citizen._id}
                                            className="cursor-pointer border-b border-border/50 px-4 py-2.5 transition-colors hover:bg-muted/50 last:border-0"
                                            onClick={() => handleNavigate(citizen._id)}
                                        >
                                            <span className="block text-sm font-medium text-foreground">{citizen.name}</span>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{citizen.nid}</span>
                                                {citizen.phone && <span>• {citizen.phone}</span>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center text-xs text-muted-foreground">{ui.noCitizens}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Language Toggle (Mobile) */}
                <button
                    onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
                    title={ui.toggleLanguage}
                >
                    {language === 'en' ? 'BN' : 'EN'}
                </button>

                {/* Language Toggle (Desktop) */}
                <div className="hidden h-9 items-center gap-1 rounded-lg border border-border bg-card p-1 sm:flex">
                    <button
                        onClick={() => setLanguage('en')}
                        className={cn(
                            'flex h-full items-center rounded-md px-2.5 text-xs font-semibold transition-all',
                            language === 'en' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => setLanguage('bn')}
                        className={cn(
                            'flex h-full items-center rounded-md px-2.5 text-xs font-semibold transition-all',
                            language === 'bn' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        বাংলা
                    </button>
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    title={ui.toggleTheme}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notifications */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            'relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                            isOpen && 'bg-muted text-foreground'
                        )}
                        title={t.common.notifications}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--danger)] text-[9px] font-bold text-white shadow-sm">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                            <div className="flex items-center justify-between border-b border-border p-4">
                                <h3 className="text-sm font-semibold text-foreground">{t.common.notifications}</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                                        {t.common.markAllRead}
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[320px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground">
                                        {t.common.noNotifications}
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            onClick={() => !n.read && markAsRead(n._id)}
                                            className={cn(
                                                'flex cursor-pointer gap-3 border-b border-border p-4 transition-colors hover:bg-muted/50 last:border-0',
                                                !n.read && 'bg-primary/5'
                                            )}
                                        >
                                            <div className="mt-0.5">{getIcon(n.type)}</div>
                                            <div className="min-w-0 flex-1">
                                                <p className={cn('text-sm', !n.read ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                                                    {n.title}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                                                <p className="mt-2 text-[10px] text-muted-foreground">
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!n.read && <div className="mt-2 h-2 w-2 rounded-full bg-primary"></div>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen((prev) => !prev)}
                        className={cn(
                            'group flex h-9 items-center gap-2 rounded-lg border border-border bg-card pl-1.5 pr-2.5 text-muted-foreground transition-all hover:border-primary/30 hover:bg-muted hover:text-foreground',
                            profileOpen && 'border-primary/30 bg-muted text-foreground'
                        )}
                        title={ui.profile}
                    >
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                            {profileInitials}
                        </span>
                        <ChevronDown size={14} className={cn('transition-transform', profileOpen && 'rotate-180')} />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                            <div className="border-b border-border px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                        {profileInitials}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">{profileName}</p>
                                        <p className="truncate text-xs text-muted-foreground">{profileEmail}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/80 hover:text-[var(--danger)]"
                            >
                                <LogOut size={16} /> {t.common.logout}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
