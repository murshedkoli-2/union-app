'use client';

import { useEffect, useState, use } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface VerifiedCertificate {
    certificateNumber: string;
    type: string;
    issueDate: string;
    citizenId?: {
        name?: string;
        nid?: string;
    };
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    return 'Certificate not found or invalid';
}

export default function VerifyCertificate({ params }: { params: Promise<{ certificateNumber: string }> }) {
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
                    throw new Error('Certificate not found or invalid');
                }
                const data = await res.json();
                setCertificate(data);
            } catch (err: unknown) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        }
        verify();
    }, [certificateNumber]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-md w-full bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
                <div className="p-8 text-center">
                    {loading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="animate-spin text-primary mb-4" size={48} />
                            <p className="text-muted-foreground">Verifying certificate...</p>
                        </div>
                    ) : error ? (
                        <div className="space-y-4">
                            <div className="tone-danger mx-auto flex h-20 w-20 items-center justify-center rounded-full border">
                                <XCircle className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Verification Failed</h2>
                            <p className="text-muted-foreground">{error}</p>
                            <div className="pt-4 border-t border-border">
                                <p className="text-sm font-mono text-muted-foreground break-all">ID: {decodeURIComponent(certificateNumber)}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="tone-success mx-auto flex h-20 w-20 items-center justify-center rounded-full border animate-in zoom-in duration-300">
                                <CheckCircle className="h-10 w-10" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Verified Successfully</h2>
                                <p className="tone-success inline-block rounded-full border px-3 py-1 mt-2 text-sm font-medium">Valid Certificate</p>
                            </div>

                            <div className="text-left bg-muted/30 p-4 rounded-xl space-y-3 border border-border">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate No</p>
                                    <p className="font-mono font-medium text-foreground">{certificate?.certificateNumber}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Issued To</p>
                                        <p className="font-medium text-foreground">{certificate?.citizenId?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">NID</p>
                                        <p className="font-medium text-foreground">{certificate?.citizenId?.nid}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Type</p>
                                    <p className="font-medium text-foreground">{certificate?.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Issue Date</p>
                                    <p className="font-medium text-foreground">{certificate?.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-muted/50 px-8 py-4 text-center border-t border-border/50">
                    <p className="text-xs text-muted-foreground">Union Digital Center Verification System</p>
                </div>
            </div>
        </div>
    );
}
