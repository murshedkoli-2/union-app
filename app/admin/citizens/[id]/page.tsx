'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Loader2, Phone, MapPin, Calendar, FileText, CheckCircle, AlertCircle, Banknote, User, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/providers/LanguageContext';

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

interface CitizenDetailsData {
    _id: string;
    name: string;
    nid: string;
    dob: string;
    gender: string;
    religion?: string;
    phone: string;
    fatherName: string;
    fatherNameBn?: string;
    motherName: string;
    motherNameBn?: string;
    spouseName?: string;
    status?: string;
    address?: {
        village?: string;
        postOffice?: string;
        ward?: string;
        union?: string;
    };
}

interface CitizenSettings {
    holdingTaxAmount?: number;
    holdingTaxYearStartMonth?: number;
}

export default function CitizenDetails({ params }: { params: Promise<{ id: string }> }) {
    const { language } = useLanguage();
    const { id } = use(params);
    const router = useRouter();

    // Data States
    const [citizen, setCitizen] = useState<CitizenDetailsData | null>(null);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [taxHistory, setTaxHistory] = useState<TaxRecord[]>([]);
    const [settings, setSettings] = useState<CitizenSettings | null>(null);

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

                if (!citizenRes.ok) throw new Error(language === 'en' ? 'Citizen not found' : 'নাগরিক পাওয়া যায়নি');

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
                toast.error(language === 'en' ? 'Failed to load profile data' : 'প্রোফাইল তথ্য লোড করা যায়নি');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, language]);

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
        if (!confirm(language === 'en' ? `Collect tax for FY ${currentFY}? Amount: ৳${taxAmount}` : `অর্থবছর ${currentFY} এর কর সংগ্রহ করবেন? পরিমাণ: ৳${taxAmount}`)) return;

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
                toast.success(language === 'en' ? 'Tax payment recorded successfully' : 'ট্যাক্স পেমেন্ট সফলভাবে রেকর্ড হয়েছে');
            } else {
                const err = await res.json();
                toast.error(err.error || (language === 'en' ? 'Failed to record payment' : 'পেমেন্ট রেকর্ড করা যায়নি'));
            }
        } catch {
            toast.error(language === 'en' ? 'Error processing payment' : 'পেমেন্ট প্রক্রিয়ায় ত্রুটি হয়েছে');
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
                    <button
                        onClick={() => router.push(`/admin/citizens/add?id=${citizen._id}`)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted/60 transition-colors"
                    >
                        <Pencil size={16} /> {language === 'en' ? 'Edit' : 'সম্পাদনা'}
                    </button>
                    <button disabled className="tone-danger inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium opacity-60 cursor-not-allowed" title={language === 'en' ? 'Delete disabled' : 'ডিলিট বন্ধ'}>
                        <Trash2 size={18} /> {language === 'en' ? 'Delete' : 'ডিলিট'}
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
                            {language === 'en' ? 'Personal Details' : 'ব্যক্তিগত তথ্য'}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">{language === 'en' ? 'Date of Birth' : 'জন্ম তারিখ'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar size={16} className="text-muted-foreground" />
                                    <span className="font-medium">{new Date(citizen.dob).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{language === 'en' ? 'Gender' : 'লিঙ্গ'}</p>
                                <p className="font-medium mt-1 capitalize">{citizen.gender}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{language === 'en' ? 'Religion' : 'ধর্ম'}</p>
                                <p className="font-medium mt-1">{citizen.religion || (language === 'en' ? 'Islam' : 'ইসলাম')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{language === 'en' ? 'Mobile' : 'মোবাইল'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Phone size={16} className="text-muted-foreground" />
                                    <span className="font-medium">{citizen.phone}</span>
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <p className="text-sm text-muted-foreground">{language === 'en' ? 'Address' : 'ঠিকানা'}</p>
                                <div className="flex items-start gap-2 mt-1">
                                    <MapPin size={16} className="text-muted-foreground mt-0.5" />
                                    <span className="font-medium">
                                        {citizen.address?.village}, {citizen.address?.postOffice}, <br />
                                        {language === 'en' ? 'Ward' : 'ওয়ার্ড'}: {citizen.address?.ward}, {language === 'en' ? 'Union' : 'ইউনিয়ন'}: {citizen.address?.union}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Family Members (From Schema) */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <h3 className="text-lg font-semibold border-b border-border pb-4 flex items-center gap-2">
                            <User size={20} className="text-primary" />
                            {language === 'en' ? 'Family Information' : 'পারিবারিক তথ্য'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <p className="text-sm text-muted-foreground">{language === 'en' ? 'Father\'s Name' : 'পিতার নাম'}</p>
                                <p className="font-medium text-lg">{citizen.fatherName}</p>
                                <p className="text-xs text-muted-foreground mt-1">{citizen.fatherNameBn}</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <p className="text-sm text-muted-foreground">{language === 'en' ? 'Mother\'s Name' : 'মাতার নাম'}</p>
                                <p className="font-medium text-lg">{citizen.motherName}</p>
                                <p className="text-xs text-muted-foreground mt-1">{citizen.motherNameBn}</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg md:col-span-2">
                                <p className="text-sm text-muted-foreground">{language === 'en' ? 'Spouse Name' : 'স্বামী/স্ত্রীর নাম'}</p>
                                <p className="font-medium text-lg">{citizen.spouseName || (language === 'en' ? 'N/A' : 'প্রযোজ্য নয়')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Certificates History */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-primary" />
                            {language === 'en' ? 'Issued Certificates' : 'ইস্যুকৃত সনদ'} ({certificates.length})
                        </h3>

                        {certificates.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                {language === 'en' ? 'No certificates issued yet.' : 'এখনও কোনো সনদ ইস্যু করা হয়নি।'}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {certificates.map(cert => (
                                    <div key={cert._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                                        <div>
                                            <p className="font-semibold text-foreground">{cert.type}</p>
                                            <button
                                                onClick={() => router.push(`/admin/certificates/${cert._id}`)}
                                                className="text-xs text-primary font-mono mt-1 hover:underline"
                                            >
                                                {cert.certificateNumber || (language === 'en' ? 'Pending' : 'অপেক্ষমান')}
                                            </button>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <p className="text-sm text-muted-foreground">{new Date(cert.issueDate).toLocaleDateString()}</p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium mt-1 ${cert.status === 'Issued' ? 'tone-success' : 'tone-warning'}`}>
                                                {cert.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => router.push(`/admin/certificates/issue?citizenId=${citizen._id}`)}
                            className="mt-4 w-full py-2 bg-primary/5 text-primary rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
                        >
                            {language === 'en' ? 'Issue New Certificate' : 'নতুন সনদ ইস্যু করুন'}
                        </button>
                    </div>
                </div>

                {/* Right Column: Status & Tax */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Holding Tax Status */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <h3 className="text-lg font-semibold border-b border-border pb-4 flex items-center gap-2">
                            <Banknote size={20} className="text-primary" />
                            {language === 'en' ? 'Holding Tax' : 'হোল্ডিং ট্যাক্স'}
                        </h3>

                        <div className={`p-4 rounded-xl border ${isTaxPaid ? 'bg-primary/10 border-primary/20' : 'bg-accent/10 border-accent/25'}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className={`font-semibold ${isTaxPaid ? 'text-primary' : 'text-accent-foreground'}`}>
                                        {language === 'en' ? 'FY' : 'অর্থবছর'} {currentFY}
                                    </p>
                                    <p className={`text-sm mt-1 ${isTaxPaid ? 'text-primary/90' : 'text-muted-foreground'}`}>
                                        {isTaxPaid ? (language === 'en' ? 'Paid' : 'পরিশোধিত') : (language === 'en' ? 'Unpaid' : 'অপরিশোধিত')}
                                    </p>
                                </div>
                                {isTaxPaid ? <CheckCircle className="text-primary" /> : <AlertCircle className="text-accent" />}
                            </div>

                            {!isTaxPaid && (
                                <div className="mt-4">
                                    <div className="flex justify-between items-center text-sm mb-3">
                                        <span className="text-muted-foreground">{language === 'en' ? 'Amount Due:' : 'বকেয়া:'}</span>
                                        <span className="font-bold text-foreground">৳{taxAmount}</span>
                                    </div>
                                    <button
                                        onClick={handlePayTax}
                                        disabled={payingTax || taxAmount === 0}
                                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {payingTax ? <Loader2 className="animate-spin mx-auto" size={18} /> : (language === 'en' ? 'Pay Now' : 'এখন পরিশোধ করুন')}
                                    </button>
                                    {taxAmount === 0 && <p className="text-xs text-center mt-2 text-muted-foreground opacity-70">{language === 'en' ? 'Tax amount is not configured in settings.' : 'সেটিংসে ট্যাক্সের পরিমাণ নির্ধারিত নেই।'}</p>}
                                </div>
                            )}
                        </div>

                        {/* Payment History */}
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">{language === 'en' ? 'Payment History' : 'পেমেন্ট ইতিহাস'}</h4>
                            {taxHistory.length === 0 ? (
                                <p className="text-sm text-center text-muted-foreground py-4">{language === 'en' ? 'No payment history.' : 'কোনো পেমেন্ট ইতিহাস নেই।'}</p>
                            ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {taxHistory.map(record => (
                                        <div key={record._id} className="flex justify-between items-center p-3 bg-muted/40 rounded-lg text-sm">
                                            <div>
                                                <p className="font-medium">{language === 'en' ? 'FY' : 'অর্থবছর'} {record.financialYear}</p>
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
                        <h3 className="text-lg font-semibold mb-4">{language === 'en' ? 'Account Status' : 'অ্যাকাউন্ট অবস্থা'}</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">{language === 'en' ? 'Registration Status' : 'নিবন্ধন অবস্থা'}</p>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 border text-xs font-medium ${citizen.status === 'approved' ? 'tone-success' : 'tone-warning'}`}>
                                    {citizen.status || (language === 'en' ? 'Active' : 'সক্রিয়')}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-1">{language === 'en' ? 'NID Status' : 'এনআইডি অবস্থা'}</p>
                                <div className="flex items-center gap-2 text-[var(--success)] text-sm font-medium">
                                    <CheckCircle size={16} /> {language === 'en' ? 'Verified' : 'যাচাইকৃত'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
