'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Loader2, Phone, MapPin, Calendar, CreditCard, FileText, CheckCircle, AlertCircle, Banknote, User } from 'lucide-react';
import { toast } from 'sonner';

interface TaxRecord {
    _id: string;
    financialYear: string;
    amount: number;
    paidAt: string;
    receiptNumber: string;
}

interface Certificate {
    _id: string;
    type: string;
    certificateNumber: string;
    issueDate: string;
    status: string;
}

export default function CitizenDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // Data States
    const [citizen, setCitizen] = useState<any>(null);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [taxHistory, setTaxHistory] = useState<TaxRecord[]>([]);
    const [settings, setSettings] = useState<any>(null);

    // UI States
    const [loading, setLoading] = useState(true);
    const [payingTax, setPayingTax] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const [citizenRes, certRes, taxRes, settingsRes] = await Promise.all([
                    fetch(`/api/citizens/${id}`),
                    fetch(`/api/certificates?citizenId=${id}`),
                    fetch(`/api/holding-tax?citizenId=${id}`),
                    fetch('/api/settings')
                ]);

                if (!citizenRes.ok) throw new Error('Citizen not found');

                const citizenData = await citizenRes.json();
                const certData = await certRes.json();
                const taxData = await taxRes.json();
                const settingsData = await settingsRes.json();

                setCitizen(citizenData);
                setCertificates(Array.isArray(certData) ? certData : []);
                setTaxHistory(taxData.data || []);
                setSettings(settingsData);
            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    // Tax Logic
    const getCurrentFinancialYear = () => {
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 1-12
        const startMonth = settings?.holdingTaxYearStartMonth || 7; // July default

        let startYear = today.getFullYear();
        if (currentMonth < startMonth) {
            startYear -= 1;
        }
        return `${startYear}-${startYear + 1}`;
    };

    const currentFY = getCurrentFinancialYear();
    const isTaxPaid = taxHistory.some(t => t.financialYear === currentFY);
    const taxAmount = settings?.holdingTaxAmount || 0;

    const handlePayTax = async () => {
        if (!confirm(`Are you sure you want to collect Tax for FY ${currentFY}? Amount: ৳${taxAmount}`)) return;

        setPayingTax(true);
        try {
            const res = await fetch('/api/holding-tax', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    citizenId: id,
                    financialYear: currentFY,
                    amount: taxAmount,
                    collectedBy: 'Admin'
                })
            });

            if (res.ok) {
                const newRecord = await res.json();
                setTaxHistory([newRecord, ...taxHistory]);
                toast.success('Tax payment recorded successfully');
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to record payment');
            }
        } catch (error) {
            toast.error('Error processing payment');
        } finally {
            setPayingTax(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
    }

    if (!citizen) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{citizen.name}</h1>
                        <p className="text-muted-foreground mt-1 font-mono">NID: {citizen.nid}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button disabled className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 opacity-60 cursor-not-allowed" title="Delete Disabled">
                        <Trash2 size={18} /> Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Personal Info & Family */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Details */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <h3 className="text-lg font-semibold border-b border-border pb-4 flex items-center gap-2">
                            <User size={20} className="text-primary" />
                            Personal Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Date of Birth</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar size={16} className="text-muted-foreground" />
                                    <span className="font-medium">{new Date(citizen.dob).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Gender</p>
                                <p className="font-medium mt-1 capitalize">{citizen.gender}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Religion</p>
                                <p className="font-medium mt-1">{citizen.religion || 'Islam'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Mobile</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Phone size={16} className="text-muted-foreground" />
                                    <span className="font-medium">{citizen.phone}</span>
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <p className="text-sm text-muted-foreground">Address</p>
                                <div className="flex items-start gap-2 mt-1">
                                    <MapPin size={16} className="text-muted-foreground mt-0.5" />
                                    <span className="font-medium">
                                        {citizen.address?.village}, {citizen.address?.postOffice}, <br />
                                        Ward: {citizen.address?.ward}, Union: {citizen.address?.union}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Family Members (From Schema) */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <h3 className="text-lg font-semibold border-b border-border pb-4 flex items-center gap-2">
                            <User size={20} className="text-primary" />
                            Family Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <p className="text-sm text-muted-foreground">Father's Name</p>
                                <p className="font-medium text-lg">{citizen.fatherName}</p>
                                <p className="text-xs text-muted-foreground mt-1">{citizen.fatherNameBn}</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <p className="text-sm text-muted-foreground">Mother's Name</p>
                                <p className="font-medium text-lg">{citizen.motherName}</p>
                                <p className="text-xs text-muted-foreground mt-1">{citizen.motherNameBn}</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg md:col-span-2">
                                <p className="text-sm text-muted-foreground">Spouse Name</p>
                                <p className="font-medium text-lg">{citizen.spouseName || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Certificates History */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-primary" />
                            Issued Certificates ({certificates.length})
                        </h3>

                        {certificates.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                No certificates issued yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {certificates.map(cert => (
                                    <div key={cert._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                                        <div>
                                            <p className="font-semibold text-foreground">{cert.type}</p>
                                            <p className="text-xs text-muted-foreground font-mono mt-1">{cert.certificateNumber || 'Pending'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">{new Date(cert.issueDate).toLocaleDateString()}</p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${cert.status === 'Issued' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {cert.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => router.push('/admin/certificates/issue')}
                            className="mt-4 w-full py-2 bg-primary/5 text-primary rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
                        >
                            Issue New Certificate
                        </button>
                    </div>
                </div>

                {/* Right Column: Status & Tax */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Holding Tax Status */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <h3 className="text-lg font-semibold border-b border-border pb-4 flex items-center gap-2">
                            <Banknote size={20} className="text-primary" />
                            Holding Tax
                        </h3>

                        <div className={`p-4 rounded-xl border ${isTaxPaid ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className={`font-semibold ${isTaxPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                                        FY {currentFY}
                                    </p>
                                    <p className={`text-sm mt-1 ${isTaxPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {isTaxPaid ? 'Paid' : 'Unpaid'}
                                    </p>
                                </div>
                                {isTaxPaid ? <CheckCircle className="text-emerald-500" /> : <AlertCircle className="text-amber-500" />}
                            </div>

                            {!isTaxPaid && (
                                <div className="mt-4">
                                    <div className="flex justify-between items-center text-sm mb-3">
                                        <span className="text-amber-700">Amount Due:</span>
                                        <span className="font-bold text-amber-900">৳{taxAmount}</span>
                                    </div>
                                    <button
                                        onClick={handlePayTax}
                                        disabled={payingTax || taxAmount === 0}
                                        className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {payingTax ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Pay Now'}
                                    </button>
                                    {taxAmount === 0 && <p className="text-xs text-center mt-2 text-amber-700 opacity-70">Tax amount not configured in settings.</p>}
                                </div>
                            )}
                        </div>

                        {/* Payment History */}
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Payment History</h4>
                            {taxHistory.length === 0 ? (
                                <p className="text-sm text-center text-muted-foreground py-4">No payment history.</p>
                            ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {taxHistory.map(record => (
                                        <div key={record._id} className="flex justify-between items-center p-3 bg-muted/40 rounded-lg text-sm">
                                            <div>
                                                <p className="font-medium">FY {record.financialYear}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(record.paidAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">৳{record.amount}</p>
                                                <p className="text-[10px] text-muted-foreground font-mono">{record.receiptNumber}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Overall Status */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Account Status</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Registration Status</p>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${citizen.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {citizen.status || 'Active'}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-1">NID Status</p>
                                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                    <CheckCircle size={16} /> Verified
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
