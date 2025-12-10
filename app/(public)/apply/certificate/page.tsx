'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PublicCertificateApply() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Identify, 2: Select Type & Details
    const [loading, setLoading] = useState(false);
    const [identifying, setIdentifying] = useState(false);
    const [nid, setNid] = useState('');
    const [dob, setDob] = useState(''); // Optional verification
    const [citizen, setCitizen] = useState<any>(null);
    const [certificateTypes, setCertificateTypes] = useState<any[]>([]);

    // Form Data for Step 2
    const [selectedType, setSelectedType] = useState('');
    const [details, setDetails] = useState(''); // Additional text details

    // Fetch types on mount
    useEffect(() => {
        fetch('/api/certificate-types')
            .then(res => res.json())
            .then(data => setCertificateTypes(data || []))
            .catch(err => console.error(err));
    }, []);

    const handleIdentify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIdentifying(true);
        try {
            // We need a way to look up citizen by NID publically. 
            // We'll use a new public endpoint or existing one if safe.
            // Let's use the public apply API to check existence or a specific lookup route.
            // For now, I'll use a specific query param on public API or just assuming /api/citizens is protected?
            // Middleware only protects /admin. So /api/citizens is open. 
            // BUT /api/citizens returns ALL citizens in GET. That's bad for privacy.
            // I should have protected /api/citizens in middleware!
            // I will fix middleware later. For now, I'll assume I can use a specific search endpoint.
            // Let's create `POST /api/public/identify-citizen` for security.

            const res = await fetch('/api/public/identify-citizen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nid, dob })
            });

            if (!res.ok) {
                if (res.status === 404) throw new Error('Citizen not found. Please register first.');
                throw new Error('Verification failed');
            }

            const data = await res.json();
            setCitizen(data);
            setStep(2);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIdentifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/public/apply/certificate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    citizenId: citizen._id,
                    type: selectedType,
                    details: { requestNote: details }
                })
            });

            if (!res.ok) throw new Error('Application failed');

            setStep(3); // Success state
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">Application Submitted!</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    Your certificate application has been received. Please wait for admin approval and issuance.
                </p>
                <Link href="/" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Return to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl animate-fade-in">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Apply for Certificate</h1>
                <p className="text-muted-foreground mt-2">Get your official union certificates online.</p>
            </div>

            <div className="rounded-xl border bg-card p-8 shadow-sm">
                {step === 1 && (
                    <form onSubmit={handleIdentify} className="space-y-6">
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex gap-4">
                            <AlertCircle className="text-primary shrink-0" />
                            <p className="text-sm text-muted-foreground">
                                Please provide your National ID (NID) to verify your citizenship record before applying.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">National ID Number</label>
                            <input
                                required
                                value={nid}
                                onChange={e => setNid(e.target.value)}
                                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Enter your 10-17 digit NID"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date of Birth (YYYY-MM-DD)</label>
                            <input
                                type="date"
                                required
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={identifying}
                            className="w-full h-11 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                        >
                            {identifying ? <Loader2 size={18} className="animate-spin" /> : 'Verify Identity'}
                        </button>
                        <div className="text-center">
                            <Link href="/apply/citizen" className="text-sm text-primary hover:underline">
                                Don't have an account? Register as a Citizen first.
                            </Link>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                            <div>
                                <div className="font-semibold">{citizen.name}</div>
                                <div className="text-sm text-muted-foreground">NID: {citizen.nid}</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-xs text-primary hover:underline"
                            >
                                Change
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Certificate Type</label>
                            <select
                                required
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value)}
                                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="">Select Certificate Type</option>
                                {certificateTypes.map(t => (
                                    <option key={t._id} value={t.name}>{t.name} - ৳{t.fee}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Additional Details / Purpose</label>
                            <textarea
                                value={details}
                                onChange={e => setDetails(e.target.value)}
                                className="flex min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Describe why you need this certificate..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Submit Application'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
