'use client';

import { useLanguage } from '@/components/providers/LanguageContext';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Citizen {
    _id: string;
    name: string;
    nid: string;
    phone: string;
}

interface CertificateType {
    _id: string;
    name: string;
    nameBn: string;
    fee: number;
}

export default function IssueCertificate() {
    const { t } = useLanguage();
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Data
    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const [certTypes, setCertTypes] = useState<CertificateType[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Selection
    const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
    const [selectedType, setSelectedType] = useState<CertificateType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const [citizensRes, typesRes] = await Promise.all([
                    fetch('/api/citizens'), // Fetch all citizens (including pending)
                    fetch('/api/certificate-types')
                ]);

                const cData = await citizensRes.json();
                const tData = await typesRes.json();

                setCitizens(Array.isArray(cData) ? cData : []);
                setCertTypes(Array.isArray(tData) ? tData : []);
            } catch (err) {
                toast.error('Failed to load initial data');
            } finally {
                setLoadingData(false);
            }
        }
        loadData();
    }, []);

    const filteredCitizens = citizens.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nid.includes(searchTerm) ||
        c.phone.includes(searchTerm)
    );

    const handleSubmit = async () => {
        if (!selectedCitizen || !selectedType) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    citizenId: selectedCitizen._id,
                    type: selectedType.nameBn, // Using Bn name as type for now based on display
                    issueDate: new Date(),
                    status: 'Issued', // Admin issuing directly
                    feePaid: selectedType.fee,
                    isPaid: true
                })
            });

            if (res.ok) {
                const newCert = await res.json();
                toast.success(t.certificates.issuePage.success);
                router.push(`/admin/certificates/${newCert._id}`);
            } else {
                const err = await res.json();
                toast.error(err.error || t.certificates.issuePage.error);
            }
        } catch (error) {
            toast.error('Error submitting request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{t.certificates.issuePage.title}</h1>
                    <p className="text-muted-foreground mt-1">{t.certificates.issuePage.subtitle}</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-muted'}`}>1</div>
                    <span className="font-medium">{t.certificates.issuePage.steps.selectCitizen}</span>
                </div>
                <div className="h-px bg-border flex-1" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-muted'}`}>2</div>
                    <span className="font-medium">{t.certificates.issuePage.steps.selectType}</span>
                </div>
                <div className="h-px bg-border flex-1" />
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary/10' : 'border-muted'}`}>3</div>
                    <span className="font-medium">{t.certificates.issuePage.steps.review}</span>
                </div>
            </div>

            {loadingData ? (
                <div className="py-20 text-center text-muted-foreground">Loading data...</div>
            ) : (
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[400px]">
                    {/* Step 1: Select Citizen */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    placeholder={t.certificates.issuePage.searchPlaceholder}
                                    className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                                {filteredCitizens.map(citizen => (
                                    <div
                                        key={citizen._id}
                                        onClick={() => setSelectedCitizen(citizen)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedCitizen?._id === citizen._id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-foreground">{citizen.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">NID: {citizen.nid}</p>
                                                <p className="text-sm text-muted-foreground">Phone: {citizen.phone}</p>
                                            </div>
                                            {selectedCitizen?._id === citizen._id && <Check className="text-primary" size={20} />}
                                        </div>
                                    </div>
                                ))}
                                {filteredCitizens.length === 0 && (
                                    <div className="col-span-full text-center py-10 text-muted-foreground">
                                        No citizens found. <a href="/admin/citizens/add" className="text-primary hover:underline">Register New?</a>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!selectedCitizen}
                                    className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {t.certificates.issuePage.reviewSection.next}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Type */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold">{t.certificates.issuePage.chooseType}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {certTypes.map(type => (
                                    <div
                                        key={type._id}
                                        onClick={() => setSelectedType(type)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedType?._id === type._id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold text-foreground">{type.name}</h3>
                                                <p className="text-sm text-muted-foreground font-noto-bengali">{type.nameBn}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-mono font-medium text-lg">৳{type.fee}</span>
                                                {selectedType?._id === type._id && <Check className="text-primary ml-auto mt-1" size={16} />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium"
                                >
                                    {t.certificates.issuePage.reviewSection.back}
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!selectedType}
                                    className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {t.certificates.issuePage.reviewSection.reviewOrder}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="bg-muted/30 p-6 rounded-xl space-y-4 border border-border">
                                <div className="flex justify-between items-center border-b border-border pb-4">
                                    <span className="text-muted-foreground">{t.certificates.issuePage.reviewSection.citizen}</span>
                                    <div className="text-right">
                                        <span className="block font-semibold">{selectedCitizen?.name}</span>
                                        <span className="text-sm text-muted-foreground">{selectedCitizen?.nid}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-b border-border pb-4">
                                    <span className="text-muted-foreground">{t.certificates.issuePage.reviewSection.certType}</span>
                                    <div className="text-right">
                                        <span className="block font-semibold">{selectedType?.name}</span>
                                        <span className="text-sm text-muted-foreground font-noto-bengali">{selectedType?.nameBn}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-semibold text-lg">{t.certificates.issuePage.reviewSection.totalFee}</span>
                                    <span className="font-bold text-xl text-primary font-mono">৳{selectedType?.fee}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
                                <p>{t.certificates.issuePage.reviewSection.disclaimer}</p>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium"
                                    disabled={submitting}
                                >
                                    {t.certificates.issuePage.reviewSection.back}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                >
                                    {submitting && <Loader2 className="animate-spin" size={18} />}
                                    {t.certificates.issuePage.reviewSection.issueBtn}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
