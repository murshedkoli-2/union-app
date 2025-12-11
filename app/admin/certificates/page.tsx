'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText, Download, Eye, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CertificateDesign from '@/components/CertificateDesign';
import { cn } from '@/lib/utils';

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
    const { t } = useLanguage();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Download Logic State
    const [settings, setSettings] = useState<any>(null);
    const [printingCert, setPrintingCert] = useState<Certificate | null>(null);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    async function fetchData() {
        setLoading(true);
        try {
            const [certRes, settingsRes] = await Promise.all([
                fetch(`/api/certificates?status=${statusFilter}`),
                fetch('/api/settings')
            ]);

            const certData = await certRes.json();
            setCertificates(certData);

            if (settingsRes.ok) {
                const settingsData = await settingsRes.json();
                setSettings(settingsData);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load certificates');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(`/api/certificates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Approved' })
            });

            if (res.ok) {
                toast.success('Certificate approved');
                fetchData();
            } else {
                throw new Error('Failed to approve');
            }
        } catch (err) {
            toast.error('Error approving certificate');
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
                toast.success('Certificate rejected');
                fetchData();
            } else {
                throw new Error('Failed to reject');
            }
        } catch (err) {
            toast.error('Error rejecting certificate');
        }
    };

    const handleDownload = async (cert: Certificate) => {
        if (!settings) {
            toast.error('Settings not loaded. Cannot generate PDF.');
            return;
        }

        setGeneratingId(cert._id);
        setPrintingCert(cert);

        // Allow render cycle to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            if (!printRef.current) throw new Error('Print element not found');

            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 210 * 3.7795275591, // A4 width in px
                onclone: (clonedDoc) => {
                    const styles = Array.from(clonedDoc.getElementsByTagName('style'));
                    styles.forEach(style => {
                        if (style.innerHTML.includes('lab(') || style.innerHTML.includes('oklch(')) {
                            style.remove();
                        }
                    });
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            const safeCertNum = (cert.certificateNumber || 'download').replace(/[^a-zA-Z0-9-_]/g, '_');
            const filename = `Certificate_BN_${safeCertNum}.pdf`;

            pdf.save(filename);
            toast.success('Certificate downloaded');

        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setGeneratingId(null);
            setPrintingCert(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this certificate?')) return;

        try {
            const res = await fetch(`/api/certificates/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setCertificates(certificates.filter(c => c._id !== id));
                toast.success('Certificate deleted successfully');
            } else {
                toast.error('Failed to delete certificate');
            }
        } catch (error) {
            console.error('Error deleting certificate:', error);
            toast.error('Error deleting certificate');
        }
    };

    const filteredCertificates = certificates.filter(cert =>
        cert.certificateNumber?.toLowerCase().includes(search.toLowerCase()) ||
        cert.citizenId?.name.toLowerCase().includes(search.toLowerCase()) ||
        cert.citizenId?.nid.includes(search)
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{t.certificates.title}</h1>
                    <p className="text-muted-foreground mt-1">{t.certificates.subtitle}</p>
                </div>
                <Link
                    href="/admin/certificates/issue"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                    <Plus size={18} />
                    {t.certificates.issue}
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                {['All', 'Pending', 'Approved', 'Rejected', 'Issued'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                            statusFilter === status
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {t.certificates.tabs[status.toLowerCase() as keyof typeof t.certificates.tabs]}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="p-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder={t.certificates.searchPlaceholder}
                            className="w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
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
                                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{cert.certificateNumber || 'Pending'}</td>
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
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                cert.status === 'Issued' ? "bg-emerald-500/10 text-emerald-500" :
                                                    cert.status === 'Pending' ? "bg-amber-500/10 text-amber-500" :
                                                        "bg-blue-500/10 text-blue-500"
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
                                                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(cert._id)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <Link
                                                    href={`/admin/certificates/${cert._id}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDownload(cert)}
                                                    disabled={generatingId === cert._id || cert.status !== 'Issued'}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Download Bangla Certificate"
                                                >
                                                    {generatingId === cert._id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cert._id)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                    title="Delete"
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

            {/* Hidden Print Container */}
            <div style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}>
                <div ref={printRef}>
                    {printingCert && settings && (
                        <CertificateDesign
                            certificate={printingCert}
                            settings={settings}
                            language="bn"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
