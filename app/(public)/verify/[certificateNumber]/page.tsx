'use client';

import { useEffect, useState, use } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageContext';

interface VerifiedCertificate {
    certificateNumber: string;
    type: string;
    issueDate: string;
    citizenId?: {
        name?: string;
        nid?: string;
    };
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

export default function VerifyCertificate({ params }: { params: Promise<{ certificateNumber: string }> }) {
    const { language } = useLanguage();
    const { certificateNumber } = use(params);
    const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function verify() {
            try {
                // Decode the certificate number just in case it's URL encoded
                const decodedCertNo = decodeURIComponent(certificateNumber);
                const res = await fetch(`/api/verify?certNo=${decodedCertNo}`);
                if (!res.ok) {
                    throw new Error(language === 'en' ? 'Certificate not found or invalid' : 'সনদ পাওয়া যায়নি বা সনদটি অবৈধ');
                }
                const data = await res.json();
                setCertificate(data);
            } catch (err: unknown) {
                setError(getErrorMessage(err, language === 'en' ? 'Certificate not found or invalid' : 'সনদ পাওয়া যায়নি বা সনদটি অবৈধ'));
            } finally {
                setLoading(false);
            }
        }
        verify();
    }, [certificateNumber, language]);

    return (
        <div className="relative min-h-[70vh] overflow-hidden p-4 py-10 md:py-12">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-10 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute right-0 top-20 h-60 w-60 rounded-full bg-accent/15 blur-3xl" />
            </div>

            <div className="reveal-up relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_28px_90px_-45px_rgba(26,55,68,0.42)]">
                <div className="p-8 text-center">
                    {loading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="animate-spin text-primary mb-4" size={48} />
                            <p className="text-muted-foreground">{language === 'en' ? 'Verifying certificate...' : 'সনদ যাচাই করা হচ্ছে...'}</p>
                        </div>
                    ) : error ? (
                        <div className="space-y-4">
                            <div className="tone-danger mx-auto flex h-20 w-20 items-center justify-center rounded-full border">
                                <XCircle className="h-10 w-10" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground sm:text-2xl">{language === 'en' ? 'Verification Failed' : 'যাচাই ব্যর্থ'}</h2>
                            <p className="text-muted-foreground">{error}</p>
                            <div className="border-t border-border pt-4">
                                <p className="text-sm font-mono text-muted-foreground break-all">ID: {decodeURIComponent(certificateNumber)}</p>
                            </div>
                            <Link href="/verify" className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-muted/70">
                                {language === 'en' ? 'Verify another certificate' : 'আরেকটি সনদ যাচাই করুন'}
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="tone-success mx-auto flex h-20 w-20 items-center justify-center rounded-full border animate-in zoom-in duration-300">
                                <CheckCircle className="h-10 w-10" />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-foreground sm:text-2xl">{language === 'en' ? 'Verified Successfully' : 'সফলভাবে যাচাই হয়েছে'}</h2>
                                <p className="tone-success inline-block rounded-full border px-3 py-1 mt-2 text-sm font-medium">{language === 'en' ? 'Valid Certificate' : 'বৈধ সনদ'}</p>
                            </div>

                            <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4 text-left">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{language === 'en' ? 'Certificate No' : 'সনদ নং'}</p>
                                    <p className="font-mono font-medium text-foreground">{certificate?.certificateNumber}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{language === 'en' ? 'Issued To' : 'প্রাপকের নাম'}</p>
                                        <p className="font-medium text-foreground">{certificate?.citizenId?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">NID</p>
                                        <p className="font-medium text-foreground">{certificate?.citizenId?.nid}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{language === 'en' ? 'Type' : 'ধরণ'}</p>
                                    <p className="font-medium text-foreground">{certificate?.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{language === 'en' ? 'Issue Date' : 'ইস্যুর তারিখ'}</p>
                                    <p className="font-medium text-foreground">{certificate?.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : '-'}</p>
                                </div>
                            </div>
                            <Link href="/verify" className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-muted/70">
                                {language === 'en' ? 'Verify another certificate' : 'আরেকটি সনদ যাচাই করুন'}
                            </Link>
                        </div>
                    )}
                </div>
                <div className="bg-muted/50 px-8 py-4 text-center border-t border-border/50">
                    <p className="text-xs text-muted-foreground">{language === 'en' ? 'Union Digital Center Verification System' : 'ইউনিয়ন ডিজিটাল সেন্টার যাচাই ব্যবস্থা'}</p>
                </div>
            </div>
        </div>
    );
}
