'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Loader2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import CertificateDesign from '@/components/CertificateDesign';
import { SettingsData } from '@/types';
import { useLanguage } from '@/components/providers/LanguageContext';

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
    details?: Record<string, unknown>;
}

export default function CertificateDetails({ params }: { params: Promise<{ id: string }> }) {
    const { language } = useLanguage();
    const router = useRouter();
    const { id } = use(params);

    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [certRes, settingsRes] = await Promise.all([
                    fetch(`/api/certificates/${id}`),
                    fetch('/api/settings')
                ]);

                if (certRes.ok) {
                    const data = await certRes.json();
                    setCertificate(data);
                } else {
                    toast.error(language === 'en' ? 'Certificate not found' : 'সনদ পাওয়া যায়নি');
                }

                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error(language === 'en' ? 'Failed to load certificate details' : 'সনদের তথ্য লোড করা যায়নি');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, language]);

    const handleDownload = (lang: 'bn' | 'en') => {
        if (!certificate || certificate.status !== 'Issued') return;

        const printUrl = `/print/certificate/${certificate._id}?lang=${lang}`;
        window.open(printUrl, '_blank', 'noopener,noreferrer');
        toast.success(
            language === 'en'
                ? `${lang === 'en' ? 'English' : 'Bangla'} print window opened`
                : `${lang === 'en' ? 'ইংরেজি' : 'বাংলা'} প্রিন্ট উইন্ডো খোলা হয়েছে`
        );
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (!certificate) {
        return <div className="text-center py-20 text-muted-foreground">{language === 'en' ? 'Certificate not found.' : 'সনদ পাওয়া যায়নি।'}</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{language === 'en' ? 'Certificate Details' : 'সনদের বিবরণ'}</h1>
                        <p className="text-muted-foreground mt-1">{language === 'en' ? 'Certificate No' : 'সনদ নং'}: <span className="font-mono text-primary">{certificate.certificateNumber}</span></p>
                        <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1"><Printer size={13} />{language === 'en' ? 'Vector print PDF (not image export)' : 'ভেক্টর প্রিন্ট PDF (ইমেজ এক্সপোর্ট নয়)'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleDownload('bn')}
                        disabled={certificate.status !== 'Issued'}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        <Download size={18} />
                        {language === 'en' ? 'Bangla PDF' : 'বাংলা পিডিএফ'}
                    </button>
                    <button
                        onClick={() => handleDownload('en')}
                        disabled={certificate.status !== 'Issued'}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
                    >
                        <Download size={18} />
                        {language === 'en' ? 'English PDF' : 'ইংরেজি পিডিএফ'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-semibold text-lg border-b border-border pb-2">{language === 'en' ? 'Information' : 'তথ্য'}</h3>

                        <div>
                            <span className="text-sm text-muted-foreground block">{language === 'en' ? 'Status' : 'অবস্থা'}</span>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${certificate.status === 'Issued' ? "tone-success" :
                                certificate.status === 'Pending' ? "tone-warning" :
                                    "tone-danger"
                                }`}>
                                {certificate.status}
                            </span>
                        </div>

                        <div>
                            <span className="text-sm text-muted-foreground block">{language === 'en' ? 'Type' : 'ধরণ'}</span>
                            <span className="font-medium">{certificate.type}</span>
                        </div>

                        <div>
                            <span className="text-sm text-muted-foreground block">{language === 'en' ? 'Issue Date' : 'ইস্যুর তারিখ'}</span>
                            <span className="font-medium">{new Date(certificate.issueDate).toLocaleDateString()}</span>
                        </div>

                        <div>
                            <span className="text-sm text-muted-foreground block">{language === 'en' ? 'Applicant' : 'আবেদনকারী'}</span>
                            <span className="font-medium">{certificate.citizenId?.name}</span>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground block">NID</span>
                            <span className="font-medium">{certificate.citizenId?.nid}</span>
                        </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-2">
                    <div className="bg-muted/30 rounded-xl p-4 overflow-auto flex justify-center border border-border">
                        <div className="scale-[0.6] origin-top border shadow-lg bg-white">
                            {/* Live Preview */}
                            {settings && (
                                <CertificateDesign
                                    certificate={certificate}
                                    settings={settings}
                                    language="bn"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
