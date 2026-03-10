'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import CertificateDesign from '@/components/CertificateDesign';
import { SettingsData } from '@/types';

interface Certificate {
    _id: string;
    certificateNumber: string;
    type: string;
    issueDate: string;
    status: string;
    details?: Record<string, unknown>;
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

export default function CertificatePrintPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'bn';

    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const [certRes, settingsRes] = await Promise.all([
                    fetch(`/api/certificates/${id}`),
                    fetch('/api/settings'),
                ]);

                if (!certRes.ok) {
                    throw new Error(lang === 'en' ? 'Certificate not found' : 'সনদ পাওয়া যায়নি');
                }

                const certData = await certRes.json();
                const settingsData = settingsRes.ok ? await settingsRes.json() : null;

                if (certData.status !== 'Issued') {
                    throw new Error(lang === 'en' ? 'Only issued certificates can be printed' : 'শুধুমাত্র ইস্যুকৃত সনদ প্রিন্ট করা যাবে');
                }

                setCertificate(certData);
                setSettings(settingsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : (lang === 'en' ? 'Failed to load print view' : 'প্রিন্ট ভিউ লোড করা যায়নি'));
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id, lang]);

    useEffect(() => {
        if (!loading && certificate && settings) {
            const timer = setTimeout(() => {
                window.print();
            }, 350);

            return () => clearTimeout(timer);
        }
    }, [loading, certificate, settings]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/20">
                <Loader2 className="animate-spin text-primary" size={28} />
            </div>
        );
    }

    if (error || !certificate || !settings) {
        return (
            <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
                <p className="text-muted-foreground">{error || (lang === 'en' ? 'Unable to render certificate' : 'সনদ দেখানো যাচ্ছে না')}</p>
                <button
                    onClick={() => router.back()}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-muted/60"
                >
                    <ArrowLeft size={16} />
                    {lang === 'en' ? 'Back' : 'ফিরে যান'}
                </button>
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
                @page {
                    size: A4;
                    margin: 0;
                }

                /* Force all text inside the certificate to be dark regardless of theme */
                #certificate-print-root,
                #certificate-print-root *,
                #certificate-print-view,
                #certificate-print-view * {
                    color: #111827 !important;
                }

                /* Restore intentional colored elements */
                #certificate-print-view .cert-red-text,
                #certificate-print-view .cert-red-text * {
                    color: #dc2626 !important;
                }

                @media print {
                    html,
                    body {
                        width: 210mm;
                        height: 297mm;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    #certificate-print-root {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                    }

                    #certificate-print-root,
                    #certificate-print-root *,
                    #certificate-print-view,
                    #certificate-print-view * {
                        color: #111827 !important;
                    }

                    #certificate-print-view .cert-red-text,
                    #certificate-print-view .cert-red-text * {
                        color: #dc2626 !important;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-neutral-100 py-6 print:bg-white print:py-0">
                <div className="mx-auto mb-4 flex w-[210mm] items-center justify-between rounded-lg border border-border bg-card px-4 py-2 print:hidden">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted/60"
                    >
                        <ArrowLeft size={15} />
                        {lang === 'en' ? 'Back' : 'ফিরে যান'}
                    </button>
                    <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Printer size={15} />
                        {lang === 'en' ? 'Use Save as PDF in print dialog' : 'প্রিন্ট ডায়ালগ থেকে Save as PDF ব্যবহার করুন'}
                    </p>
                    <button
                        onClick={() => window.print()}
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Printer size={15} />
                        {lang === 'en' ? 'Print' : 'প্রিন্ট'}
                    </button>
                </div>

                <div id="certificate-print-root" className="mx-auto w-[210mm] bg-white shadow-xl print:shadow-none">
                    <CertificateDesign certificate={certificate} settings={settings} language={lang} />
                </div>
            </div>
        </>
    );
}
