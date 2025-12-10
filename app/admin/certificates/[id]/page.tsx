'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CertificateDesign from '@/components/CertificateDesign';

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
    details?: any;
}

export default function CertificateDetails({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

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
                    toast.error('Certificate not found');
                }

                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load certificate details');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleDownload = async () => {
        if (!certificate || !settings || !printRef.current) return;

        setGenerating(true);
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
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

            const safeCertNum = (certificate.certificateNumber || 'download').replace(/[^a-zA-Z0-9-_]/g, '_');
            pdf.save(`Certificate_${safeCertNum}.pdf`);
            toast.success('Certificate downloaded successfully');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (!certificate) {
        return <div className="text-center py-20 text-muted-foreground">Certificate not found.</div>;
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
                        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Certificate Details</h1>
                        <p className="text-muted-foreground mt-1">Certificate No: <span className="font-mono text-primary">{certificate.certificateNumber}</span></p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        disabled={generating || certificate.status !== 'Issued'}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {generating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        Download PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-semibold text-lg border-b border-border pb-2">Information</h3>

                        <div>
                            <span className="text-sm text-muted-foreground block">Status</span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${certificate.status === 'Issued' ? "bg-emerald-500/10 text-emerald-500" :
                                    certificate.status === 'Pending' ? "bg-amber-500/10 text-amber-500" :
                                        "bg-red-500/10 text-red-500"
                                }`}>
                                {certificate.status}
                            </span>
                        </div>

                        <div>
                            <span className="text-sm text-muted-foreground block">Type</span>
                            <span className="font-medium">{certificate.type}</span>
                        </div>

                        <div>
                            <span className="text-sm text-muted-foreground block">Issue Date</span>
                            <span className="font-medium">{new Date(certificate.issueDate).toLocaleDateString()}</span>
                        </div>

                        <div>
                            <span className="text-sm text-muted-foreground block">Applicant</span>
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

            {/* Hidden Print Container */}
            <div style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}>
                <div ref={printRef}>
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
    );
}
