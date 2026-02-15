'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageContext';
import { useRouter } from 'next/navigation';

interface Citizen {
    _id: string;
    name: string;
    nid: string;
    phone: string;
    status: string;
    address: string | {
        village: string;
        postOffice: string;
        union: string;
    };
}

export default function Citizens() {
    const { t } = useLanguage();
    const router = useRouter();
    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDropdown, setShowDropdown] = useState(false);

    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const fetchCitizens = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (statusFilter !== 'all') queryParams.append('status', statusFilter);
            if (debouncedSearch) queryParams.append('search', debouncedSearch);

            const res = await fetch(`/api/citizens?${queryParams.toString()}`);
            const data = await res.json();
            setCitizens(data);
        } catch (error) {
            console.error('Failed to fetch citizens:', error);
            toast.error('Failed to load citizens');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, debouncedSearch]);

    useEffect(() => {
        fetchCitizens();
    }, [fetchCitizens]);

    const handleApprove = async (id: string) => {
        try {
            // We need an API to update status. 
            // Reuse generic update or create specific approve endpoint?
            // Assuming generic PUT /api/citizens/[id] works or we need to create it.
            // Currently I only verified POST /api/citizens/[id] exists? 
            // Wait, I saw /api/citizens/[id]/route.ts handles GET. 
            // I need to ADD PUT to /api/citizens/[id]/route.ts!

            const res = await fetch(`/api/citizens/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });

            if (res.ok) {
                toast.success('Citizen approved successfully');
                fetchCitizens();
            } else {
                throw new Error('Failed to approve');
            }
        } catch {
            toast.error('Error approving citizen');
        }
    };

    const handleReject = async (id: string) => {
        try {
            const res = await fetch(`/api/citizens/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected' })
            });

            if (res.ok) {
                toast.success('Citizen rejected');
                fetchCitizens();
            } else {
                throw new Error('Failed to reject');
            }
        } catch {
            toast.error('Error rejecting citizen');
        }
    };

    // Use citizens directly since filtering is now server-side
    const filteredCitizens = citizens;

    // Dropdown results - limit to first 5 for the dropdown to avoid clutter
    const dropdownResults = citizens.slice(0, 5);

    const formatAddress = (addr: Citizen['address']) => {
        if (typeof addr === 'string') return addr;
        if (!addr) return '';
        return `${addr.village}, ${addr.postOffice}, ${addr.union}`;
    };

    return (
        <div className="space-y-8 animate-fade-in" onClick={() => setShowDropdown(false)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{t.citizens.title}</h1>
                    <p className="text-muted-foreground mt-1">{t.citizens.subtitle}</p>
                </div>
                <Link
                    href="/admin/citizens/add" // This link needs to be updated relative or absolute? 
                    // Since we are in /admin/citizens, /citizens/add goes to /citizens/add.
                    // But we moved pages to (admin). So /citizens/add maps to app/(admin)/citizens/add/page.tsx
                    // URL structure remains same! (admin) is ignored.
                    // So /citizens/add is correct IF I move the add folder too.
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <Plus size={18} />
                    {t.citizens.add}
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
                {['all', 'pending', 'approved', 'rejected'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        // Note: backend API expects 'All' or TitleCase usually? 
                        // My previous code used TitleCase. I should double check logic. 
                        // Previous code used: ['All', 'Pending', 'Approved', 'Rejected'] text as statusFilter directly.
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                            statusFilter === status
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {t.citizens.tabs[status as keyof typeof t.citizens.tabs]}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="p-6 relative">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder={t.citizens.searchPlaceholder}
                            className="w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside input
                        />

                        {/* Autocomplete Dropdown */}
                        {showDropdown && search.length > 0 && dropdownResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-card text-card-foreground border border-border rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                                <ul className="py-1 max-h-[300px] overflow-auto">
                                    {dropdownResults.map((citizen) => (
                                        <li
                                            key={citizen._id}
                                            className="px-4 py-2 hover:bg-muted/50 cursor-pointer transition-colors flex flex-col gap-0.5"
                                            onClick={() => router.push(`/admin/citizens/${citizen._id}`)}
                                        >
                                            <span className="font-medium text-sm">{citizen.name}</span>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>NID: {citizen.nid}</span>
                                                {citizen.status && (
                                                    <span className={cn(
                                                        "px-1.5 py-0.5 rounded-full border text-[10px] capitalize",
                                                        citizen.status === 'approved' ? "tone-success" :
                                                            citizen.status === 'pending' ? "tone-warning" :
                                                                "tone-danger"
                                                    )}>
                                                        {citizen.status}
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {showDropdown && search.length > 0 && dropdownResults.length === 0 && !loading && (
                            <div className="absolute top-full left-0 right-0 mt-1 p-4 text-center text-muted-foreground text-sm bg-card border border-border rounded-lg shadow-lg z-50">
                                No citizens found
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b border-border">
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t.citizens.table.name}</th>
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t.citizens.table.nid}</th>
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t.citizens.table.status}</th>
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t.citizens.table.address}</th>
                                <th className="px-6 py-4 text-right font-semibold text-muted-foreground">{t.citizens.table.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">{t.citizens.table.loading}</td>
                                </tr>
                            ) : filteredCitizens.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">{t.citizens.table.noData}</td>
                                </tr>
                            ) : (
                                filteredCitizens.map((citizen) => (
                                    <tr key={citizen._id} className="transition-colors hover:bg-muted/30">
                                        <td className="px-6 py-4 font-medium text-foreground">{citizen.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{citizen.nid}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                                citizen.status === 'approved' ? "tone-success" :
                                                    citizen.status === 'pending' ? "tone-warning" :
                                                        "tone-danger"
                                            )}>
                                                {/* Translate Status? Maybe dynamic mapping or just Capitalize */}
                                                {citizen.status || 'approved'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]">{formatAddress(citizen.address)}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            {citizen.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(citizen._id)}
                                                        className="p-1 text-[var(--success)] hover:bg-[var(--success-soft)] rounded"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(citizen._id)}
                                                        className="p-1 text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <Link
                                                href={`/admin/citizens/${citizen._id}`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
