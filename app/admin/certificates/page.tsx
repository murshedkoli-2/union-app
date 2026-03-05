'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Download, Eye, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Certificate {
    _id: string;
    certificateNumber: string;
    type: string;
    issueDate: string;
    status: string;
    citizenId: {
        name: string;
        nameBn: string;
        nid: string;
        fatherName: string;
        fatherNameBn: string;
        motherName: string;
        motherNameBn: string;
        address: {
            village: string;
            postOffice: string;
            union: string;
            upazila: string;
            district: string;
        } | string;
        dateOfBirth?: string;
    };
}

import { useLanguage } from '@/components/providers/LanguageContext';

// ...

export default function Certificates() {
    const { t, language } = useLanguage();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const [generatingId, setGeneratingId] = useState<string | null>(null);

    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const certRes = await fetch(`/api/certificates?status=${statusFilter}`);

            const certData = await certRes.json();
            setCertificates(certData);

        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error(language === 'en' ? 'Failed to load certificates' : 'সনদের তালিকা লোড করা যায়নি');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, language]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(`/api/certificates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Approved' })
            });

            if (res.ok) {
                toast.success(language === 'en' ? 'Certificate approved' : 'সনদ অনুমোদিত হয়েছে');
                fetchData();
            } else {
                throw new Error('Failed to approve');
            }
        } catch {
            toast.error(language === 'en' ? 'Error approving certificate' : 'সনদ অনুমোদনে ত্রুটি হয়েছে');
        }
    };

    const handleReject = async (id: string) => {
        try {
            const res = await fetch(`/api/certificates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Rejected' })
            });

            if (res.ok) {
                toast.success(language === 'en' ? 'Certificate rejected' : 'সনদ বাতিল করা হয়েছে');
                fetchData();
            } else {
                throw new Error('Failed to reject');
            }
        } catch {
            toast.error(language === 'en' ? 'Error rejecting certificate' : 'সনদ বাতিলে ত্রুটি হয়েছে');
        }
    };

    const handleDownload = async (cert: Certificate, lang: 'bn' | 'en' = 'bn') => {
        setGeneratingId(cert._id);

        const printUrl = `/print/certificate/${cert._id}?lang=${lang}`;
        window.open(printUrl, '_blank', 'noopener,noreferrer');
        setTimeout(() => setGeneratingId(null), 600);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;

        try {
            const res = await fetch(`/api/certificates/${deleteConfirmId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setCertificates(certificates.filter(c => c._id !== deleteConfirmId));
                toast.success(language === 'en' ? 'Certificate deleted successfully' : 'সনদ সফলভাবে মুছে ফেলা হয়েছে');
            } else {
                toast.error(language === 'en' ? 'Failed to delete certificate' : 'সনদ মুছে ফেলা যায়নি');
            }
        } catch (error) {
            console.error('Error deleting certificate:', error);
            toast.error(language === 'en' ? 'Error deleting certificate' : 'সনদ মুছে ফেলতে ত্রুটি হয়েছে');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const filteredCertificates = certificates.filter(cert =>
        cert.certificateNumber?.toLowerCase().includes(search.toLowerCase()) ||
        cert.citizenId?.name.toLowerCase().includes(search.toLowerCase()) ||
        cert.citizenId?.nid.includes(search)
    );

    const pendingCount = filteredCertificates.filter((cert) => cert.status === 'Pending').length;
    const issuedCount = filteredCertificates.filter((cert) => cert.status === 'Issued').length;
    const rejectedCount = filteredCertificates.filter((cert) => cert.status === 'Rejected').length;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-secondary/55 via-card to-card p-6 md:p-7">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            {language === 'en' ? 'Certificate Operations' : 'সনদ অপারেশন'}
                        </p>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground font-display md:text-3xl">{t.certificates.title}</h1>
                        <p className="mt-2 text-sm text-muted-foreground md:text-base">{t.certificates.subtitle}</p>
                    </div>
                    <Link
                        href="/admin/certificates/issue"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        <Plus size={18} />
                        {t.certificates.issue}
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{language === 'en' ? 'Showing records' : 'দেখানো রেকর্ড'}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{filteredCertificates.length}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{language === 'en' ? 'Pending' : 'অপেক্ষমান'}</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{pendingCount}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{language === 'en' ? 'Issued' : 'ইস্যুকৃত'}</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--success)]">{issuedCount}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{language === 'en' ? 'Rejected' : 'বাতিল'}</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--danger)]">{rejectedCount}</p>
                </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-card shadow-sm">
                <div className="p-6">
                    <div className="mb-5 flex border-b border-border pb-2 overflow-x-auto">
                        {['All', 'Pending', 'Approved', 'Rejected', 'Issued'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                    statusFilter === status
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {t.certificates.tabs[status.toLowerCase() as keyof typeof t.certificates.tabs]}
                            </button>
                        ))}
                    </div>

                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder={t.certificates.searchPlaceholder}
                            className="h-11 w-full rounded-lg border border-border bg-muted/40 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/25"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b border-border">
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t.certificates.table.certNo}</th>
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t.certificates.table.name}</th>
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t.certificates.table.type}</th>
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t.certificates.table.date}</th>
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t.certificates.table.status}</th>
                                <th className="px-6 py-4 text-right font-semibold text-muted-foreground">{t.certificates.table.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        {t.certificates.table.loading}
                                    </td>
                                </tr>
                            ) : filteredCertificates.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        {t.certificates.table.noData}
                                    </td>
                                </tr>
                            ) : (
                                filteredCertificates.map((cert) => (
                                    <tr key={cert._id} className="transition-colors hover:bg-muted/30">
                                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{cert.certificateNumber || (language === 'en' ? 'Pending' : 'অপেক্ষমান')}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{cert.citizenId?.name}</div>
                                            <div className="text-xs text-muted-foreground">{cert.citizenId?.nid}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                {cert.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(cert.issueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                                cert.status === 'Issued' ? "tone-success" :
                                                    cert.status === 'Pending' ? "tone-warning" :
                                                        "tone-info"
                                            )}>
                                                {cert.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {cert.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(cert._id)}
                                                            className="p-1 text-[var(--success)] hover:bg-[var(--success-soft)] rounded"
                                                            title={language === 'en' ? 'Approve' : 'অনুমোদন'}
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(cert._id)}
                                                            className="p-1 text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded"
                                                            title={language === 'en' ? 'Reject' : 'বাতিল'}
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <Link
                                                    href={`/admin/certificates/${cert._id}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                                    title={language === 'en' ? 'View details' : 'বিস্তারিত দেখুন'}
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDownload(cert)}
                                                    disabled={generatingId === cert._id || cert.status !== 'Issued'}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={language === 'en' ? 'Download Bangla certificate' : 'বাংলা সনদ ডাউনলোড'}
                                                >
                                                    {generatingId === cert._id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                                </button>
                                                <button
                                                    disabled
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/30 cursor-not-allowed"
                                                    title={language === 'en' ? 'Delete (disabled)' : 'ডিলিট (বন্ধ)'}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Alert Dialog */}
            <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{language === 'en' ? 'Are you absolutely sure?' : 'আপনি কি নিশ্চিত?'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {language === 'en'
                                ? 'This action cannot be undone. This will permanently delete the certificate and remove it from the database.'
                                : 'এই কাজটি ফিরিয়ে আনা যাবে না। এতে সনদটি স্থায়ীভাবে মুছে যাবে এবং ডাটাবেস থেকে সরিয়ে ফেলা হবে।'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{language === 'en' ? 'Cancel' : 'বাতিল'}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {language === 'en' ? 'Delete Certificate' : 'সনদ মুছুন'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
