'use client';

import { useLanguage } from '@/components/providers/LanguageContext';
import { formatEnglishInput, formatBanglaInput } from '@/lib/utils';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, Check, ArrowLeft, Loader2, X } from 'lucide-react';
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

    // Manual Applicant State
    const [isManual, setIsManual] = useState(false);
    const [manualApplicant, setManualApplicant] = useState({
        name: '',
        phone: '',
        nid: '',
        address: ''
    });

    // Trade License Business Info
    const [businessInfo, setBusinessInfo] = useState({
        businessName: '',
        businessAddress: '',
        businessType: '',
        businessCapital: ''
    });

    // Warish Info
    const [deceasedInfo, setDeceasedInfo] = useState({
        nameEn: '',
        nameBn: '',
        fatherNameEn: '',
        fatherNameBn: '',
        motherNameEn: '',
        motherNameBn: '',
        addressEn: '',
        addressBn: ''
    });
    const [warishList, setWarishList] = useState<{ nameEn: string; nameBn: string; relation: string; nid: string; dob: string }[]>([]);
    const [newWarish, setNewWarish] = useState({ nameEn: '', nameBn: '', relation: '', nid: '', dob: '' });

    const addWarish = () => {
        if (!newWarish.nameEn || !newWarish.relation) return; // nameBn is optional? Let's require at least English or both.
        setWarishList([...warishList, newWarish]);
        setNewWarish({ nameEn: '', nameBn: '', relation: '', nid: '', dob: '' });
    };

    const removeWarish = (index: number) => {
        setWarishList(warishList.filter((_, i) => i !== index));
    };

    const filteredCitizens = citizens.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nid.includes(searchTerm) ||
        c.phone.includes(searchTerm)
    );

    const handleSubmit = async () => {
        if (!isManual && !selectedCitizen) return;
        if (!selectedType) return;

        setSubmitting(true);
        try {
            const isTradeLicense = selectedType.nameBn === 'ট্রেড লাইসেন্স' || selectedType.name === 'Trade License' || selectedType.name === 'Trade';
            const isWarish = selectedType.name === 'Warish Certificate' || selectedType.name === 'Succession Certificate' || selectedType.name === 'Warish' || selectedType.nameBn === 'ওয়ারিশ সনদ';

            const payload = {
                citizenId: isManual ? null : selectedCitizen?._id,
                type: selectedType.nameBn,
                issueDate: new Date(),
                status: 'Issued',
                feePaid: selectedType.fee,
                isPaid: true,
                details: {
                    ...(isManual ? { applicantInfo: manualApplicant } : {}),
                    ...(isTradeLicense ? {
                        businessName: businessInfo.businessName,
                        businessAddress: businessInfo.businessAddress,
                        businessType: businessInfo.businessType,
                        businessCapital: businessInfo.businessCapital
                    } : {}),
                    ...(isWarish ? {
                        deceasedNameEn: deceasedInfo.nameEn,
                        deceasedNameBn: deceasedInfo.nameBn,
                        deceasedFatherNameEn: deceasedInfo.fatherNameEn,
                        deceasedFatherNameBn: deceasedInfo.fatherNameBn,
                        deceasedMotherNameEn: deceasedInfo.motherNameEn,
                        deceasedMotherNameBn: deceasedInfo.motherNameBn,
                        deceasedAddressEn: deceasedInfo.addressEn,
                        deceasedAddressBn: deceasedInfo.addressBn,
                        warishList
                    } : {})
                }
            };

            const res = await fetch('/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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
                    <span className="font-medium hidden md:inline">{t.certificates.issuePage.steps.selectCitizen}</span>
                </div>
                <div className="h-px bg-border flex-1" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-muted'}`}>2</div>
                    <span className="font-medium hidden md:inline">{t.certificates.issuePage.steps.selectType}</span>
                </div>
                <div className="h-px bg-border flex-1" />
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary/10' : 'border-muted'}`}>3</div>
                    <span className="font-medium hidden md:inline">Details</span>
                </div>
                <div className="h-px bg-border flex-1" />
                <div className={`flex items-center gap-2 ${step >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 4 ? 'border-primary bg-primary/10' : 'border-muted'}`}>4</div>
                    <span className="font-medium hidden md:inline">{t.certificates.issuePage.steps.review}</span>
                </div>
            </div>

            {loadingData ? (
                <div className="py-20 text-center text-muted-foreground">Loading data...</div>
            ) : (
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[400px]">
                    {/* Step 1: Select Citizen */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="flex gap-4 border-b border-border pb-4 mb-4">
                                <button
                                    onClick={() => setIsManual(false)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${!isManual ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'}`}
                                >
                                    Registered Citizen
                                </button>
                                <button
                                    onClick={() => { setIsManual(true); setSelectedCitizen(null); }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isManual ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'}`}
                                >
                                    Manual Entry (Non-Resident)
                                </button>
                            </div>

                            {!isManual ? (
                                <>
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
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Applicant Name</label>
                                            <input
                                                value={manualApplicant.name}
                                                onChange={e => setManualApplicant({ ...manualApplicant, name: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="Full Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Phone Number</label>
                                            <input
                                                value={manualApplicant.phone}
                                                onChange={e => setManualApplicant({ ...manualApplicant, phone: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="017xxxxxxxx"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">NID (Optional)</label>
                                            <input
                                                value={manualApplicant.nid}
                                                onChange={e => setManualApplicant({ ...manualApplicant, nid: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="National ID"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Address</label>
                                            <input
                                                value={manualApplicant.address}
                                                onChange={e => setManualApplicant({ ...manualApplicant, address: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="Full Address"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!isManual && !selectedCitizen}
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
                                    onClick={() => {
                                        const isWarishStep = selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession');
                                        const isTradeLicense = selectedType?.name === 'Trade License' || selectedType?.nameBn === 'ট্রেড লাইসেন্স';
                                        setStep((isWarishStep || isTradeLicense) ? 3 : 4);
                                    }}
                                    disabled={!selectedType}
                                    className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {t.certificates.issuePage.reviewSection.next}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Warish Details */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            {/* Applicant Info Summary (Read Only) */}
                            <div className="bg-muted/20 p-4 rounded-lg border border-border/50">
                                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Applicant Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Name</span>
                                        <span className="font-medium text-foreground">{isManual ? manualApplicant.name : selectedCitizen?.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Phone</span>
                                        <span className="font-medium text-foreground">{isManual ? manualApplicant.phone : selectedCitizen?.phone}</span>
                                    </div>
                                    {isManual && (
                                        <div className="col-span-2">
                                            <span className="text-xs text-muted-foreground block">Address</span>
                                            <span className="font-medium text-foreground">{manualApplicant.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>



                            {(selectedType?.name === 'Trade License' || selectedType?.nameBn === 'ট্রেড লাইসেন্স') && (
                                <div className="space-y-6 border border-border rounded-lg p-5 animate-in slide-in-from-right-4">
                                    <h4 className="font-medium text-foreground pb-2 border-b border-border">Trade License Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Business Name (প্রতিষ্ঠানের নাম)</label>
                                            <input
                                                value={businessInfo.businessName}
                                                onChange={e => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="Business Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Business Address (ঠিকানা)</label>
                                            <input
                                                value={businessInfo.businessAddress}
                                                onChange={e => setBusinessInfo({ ...businessInfo, businessAddress: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="Address"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Type (ধরণ)</label>
                                            <input
                                                value={businessInfo.businessType}
                                                onChange={e => setBusinessInfo({ ...businessInfo, businessType: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="e.g. Proprietorship"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Capital (মূলধন)</label>
                                            <input
                                                type="number"
                                                value={businessInfo.businessCapital}
                                                onChange={e => setBusinessInfo({ ...businessInfo, businessCapital: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="BDT"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession')) && (
                                <div className="space-y-6 border border-border rounded-lg p-5">
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-foreground pb-2 border-b border-border">Deceased Person Information (মৃত ব্যক্তির তথ্য)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Deceased Name (English)</label>
                                                <input
                                                    value={deceasedInfo.nameEn}
                                                    onChange={(e) => setDeceasedInfo({ ...deceasedInfo, nameEn: formatEnglishInput(e.target.value) })}
                                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder="Name in English"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">মৃত ব্যক্তির নাম (বাংলা)</label>
                                                <input
                                                    value={deceasedInfo.nameBn}
                                                    onChange={(e) => setDeceasedInfo({ ...deceasedInfo, nameBn: formatBanglaInput(e.target.value) })}
                                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bengali"
                                                    placeholder="নাম বাংলায়"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Father&apos;s Name (English)</label>
                                                <input
                                                    value={deceasedInfo.fatherNameEn}
                                                    onChange={(e) => setDeceasedInfo({ ...deceasedInfo, fatherNameEn: formatEnglishInput(e.target.value) })}
                                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder="Father's Name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">পিতার নাম (বাংলা)</label>
                                                <input
                                                    value={deceasedInfo.fatherNameBn}
                                                    onChange={(e) => setDeceasedInfo({ ...deceasedInfo, fatherNameBn: formatBanglaInput(e.target.value) })}
                                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bengali"
                                                    placeholder="পিতার নাম"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Mother&apos;s Name (English)</label>
                                                <input
                                                    value={deceasedInfo.motherNameEn}
                                                    onChange={(e) => setDeceasedInfo({ ...deceasedInfo, motherNameEn: formatEnglishInput(e.target.value) })}
                                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder="Mother's Name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">মাতার নাম (বাংলা)</label>
                                                <input
                                                    value={deceasedInfo.motherNameBn}
                                                    onChange={(e) => setDeceasedInfo({ ...deceasedInfo, motherNameBn: formatBanglaInput(e.target.value) })}
                                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bengali"
                                                    placeholder="মাতার নাম"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <label className="text-sm font-medium">Address (English)</label>
                                                <input
                                                    value={deceasedInfo.addressEn}
                                                    onChange={(e) => setDeceasedInfo({ ...deceasedInfo, addressEn: formatEnglishInput(e.target.value) })}
                                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder="Full Address in English"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <label className="text-sm font-medium">ঠিকানা (বাংলা)</label>
                                                <input
                                                    value={deceasedInfo.addressBn}
                                                    onChange={(e) => setDeceasedInfo({ ...deceasedInfo, addressBn: formatBanglaInput(e.target.value) })}
                                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bengali"
                                                    placeholder="সম্পূর্ণ ঠিকানা বাংলায়"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center pb-2 border-b border-border">
                                            <h4 className="font-medium text-foreground">Warish List (উত্তরাধিকারীর তালিকা)</h4>
                                            <span className="text-xs bg-muted px-2 py-1 rounded">Total: {warishList.length}</span>
                                        </div>

                                        <div className="grid grid-cols-12 gap-2 items-end bg-muted/30 p-3 rounded-lg">
                                            <div className="col-span-6 grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-xs text-muted-foreground">Name (Eng)</label>
                                                    <input
                                                        placeholder="Name (English)"
                                                        value={newWarish.nameEn}
                                                        onChange={(e) => setNewWarish({ ...newWarish, nameEn: formatEnglishInput(e.target.value) })}
                                                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-muted-foreground">Name (Ban)</label>
                                                    <input
                                                        placeholder="নাম (বাংলা)"
                                                        value={newWarish.nameBn}
                                                        onChange={(e) => setNewWarish({ ...newWarish, nameBn: formatBanglaInput(e.target.value) })}
                                                        className="w-full rounded-lg border border-border px-3 py-2 text-sm font-bengali"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-xs text-muted-foreground">NID/Birth</label>
                                                <input
                                                    value={newWarish.nid}
                                                    onChange={e => setNewWarish({ ...newWarish, nid: e.target.value })}
                                                    className="w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                                    placeholder="NID"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-xs text-muted-foreground">Relation</label>
                                                <select
                                                    value={newWarish.relation}
                                                    onChange={e => setNewWarish({ ...newWarish, relation: e.target.value })}
                                                    className="w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                                >
                                                    <option value="">Select</option>
                                                    <option value="Wife">Wife</option>
                                                    <option value="Husband">Husband</option>
                                                    <option value="Son">Son</option>
                                                    <option value="Daughter">Daughter</option>
                                                    <option value="Father">Father</option>
                                                    <option value="Mother">Mother</option>
                                                    <option value="Brother">Brother</option>
                                                    <option value="Sister">Sister</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <button
                                                    onClick={addWarish}
                                                    disabled={!newWarish.nameEn || !newWarish.relation}
                                                    className="w-full h-8 bg-primary text-white rounded text-sm hover:bg-primary/90 disabled:opacity-50"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border border-border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name (En)</th>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name (Bn)</th>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Relation</th>
                                                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {warishList.map((w, idx) => (
                                                        <tr key={idx}>
                                                            <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                                                            <td className="px-3 py-2">{w.nameEn}</td>
                                                            <td className="px-3 py-2">{w.nameBn}</td>
                                                            <td className="px-3 py-2">{w.relation}</td>
                                                            <td className="px-3 py-2 text-right">
                                                                <button
                                                                    onClick={() => removeWarish(idx)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {warishList.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                                                                No heirs added.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium"
                                >
                                    {t.certificates.issuePage.reviewSection.back}
                                </button>
                                <button
                                    onClick={() => {
                                        const isWarishStep = selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession');
                                        const isTradeLicense = selectedType?.name === 'Trade License' || selectedType?.nameBn === 'ট্রেড লাইসেন্স';

                                        if (isTradeLicense) {
                                            if (!businessInfo.businessName || !businessInfo.businessAddress || !businessInfo.businessType || !businessInfo.businessCapital) {
                                                toast.error('Please fill in all Trade License information');
                                                return;
                                            }
                                        }

                                        if (isWarishStep) {
                                            if (!deceasedInfo.nameEn || !deceasedInfo.nameBn) {
                                                toast.error('Please fill in Deceased Person name');
                                                return;
                                            }
                                            if (warishList.length === 0) {
                                                toast.error('Please add at least one heir');
                                                return;
                                            }
                                        }

                                        setStep(4);
                                    }}
                                    className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    {t.certificates.issuePage.reviewSection.reviewOrder}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="bg-muted/30 p-6 rounded-xl space-y-4 border border-border">
                                <div className="flex justify-between items-center border-b border-border pb-4">
                                    <span className="text-muted-foreground">{t.certificates.issuePage.reviewSection.citizen}</span>
                                    <div className="text-right">
                                        <span className="block font-semibold">{isManual ? manualApplicant.name : selectedCitizen?.name}</span>
                                        <span className="text-sm text-muted-foreground">{isManual ? manualApplicant.phone : selectedCitizen?.nid}</span>
                                        {isManual && <span className="text-xs text-muted-foreground block">(Manual Entry)</span>}
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

                            {/* Trade License Verification Details */}
                            {(selectedType?.name === 'Trade License' || selectedType?.nameBn === 'ট্রেড লাইসেন্স') && (
                                <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-lg space-y-3">
                                    <h4 className="font-medium text-blue-900 border-b border-blue-200 pb-2">Business Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="block text-xs text-blue-600/80">Business Name</span>
                                            <span className="font-medium text-blue-950">{businessInfo.businessName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-blue-600/80">Address</span>
                                            <span className="font-medium text-blue-950">{businessInfo.businessAddress}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-blue-600/80">Type</span>
                                            <span className="font-medium text-blue-950">{businessInfo.businessType}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-blue-600/80">Capital</span>
                                            <span className="font-medium text-blue-950">{businessInfo.businessCapital} BDT</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warish Verification Details */}
                            {(selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession')) && (
                                <div className="space-y-4">
                                    <div className="bg-muted/30 border border-border p-5 rounded-lg space-y-3">
                                        <h4 className="font-medium text-foreground border-b border-border pb-2">Deceased Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                            <div>
                                                <span className="block text-xs text-muted-foreground">Name (En)</span>
                                                <span className="font-medium">{deceasedInfo.nameEn}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-muted-foreground">Name (Bn)</span>
                                                <span className="font-medium">{deceasedInfo.nameBn}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-muted-foreground">Father (En)</span>
                                                <span className="font-medium">{deceasedInfo.fatherNameEn}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-muted-foreground">Father (Bn)</span>
                                                <span className="font-medium">{deceasedInfo.fatherNameBn}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-muted-foreground">Mother (En)</span>
                                                <span className="font-medium">{deceasedInfo.motherNameEn}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-muted-foreground">Mother (Bn)</span>
                                                <span className="font-medium">{deceasedInfo.motherNameBn}</span>
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="block text-xs text-muted-foreground">Address</span>
                                                <span className="font-medium">{deceasedInfo.addressEn} / {deceasedInfo.addressBn}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-border rounded-lg overflow-hidden">
                                        <div className="bg-muted px-4 py-2 border-b border-border flex justify-between items-center">
                                            <h4 className="font-medium text-sm">Heir List</h4>
                                            <span className="text-xs bg-background px-2 py-0.5 rounded border">Total: {warishList.length}</span>
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead className="bg-background">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">#</th>
                                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Relation</th>
                                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">NID</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {warishList.map((w, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-2 text-muted-foreground">{idx + 1}</td>
                                                        <td className="px-4 py-2">
                                                            <div>{w.nameEn}</div>
                                                            <div className="text-xs text-muted-foreground">{w.nameBn}</div>
                                                        </td>
                                                        <td className="px-4 py-2">{w.relation}</td>
                                                        <td className="px-4 py-2">{w.nid}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
                                <p>{t.certificates.issuePage.reviewSection.disclaimer}</p>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => {
                                        const isWarishStep = selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession');
                                        const isTradeLicense = selectedType?.name === 'Trade License' || selectedType?.nameBn === 'ট্রেড লাইসেন্স' || selectedType?.name === 'Trade';

                                        if (isWarishStep || isTradeLicense) {
                                            setStep(3); // Back to Details
                                        } else {
                                            setStep(2); // Back to Type Selection
                                        }
                                    }}
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
            )
            }
        </div>
    );
}

