'use client';

import { useLanguage } from '@/components/providers/LanguageContext';
import { formatEnglishInput, formatBanglaInput } from '@/lib/utils';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Check, ArrowLeft, Loader2, X } from 'lucide-react';
import Link from 'next/link';
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
    bodyTextEn?: string;
    bodyTextBn?: string;
    fee: number;
}

const MEMBER_RELATION_OPTIONS = [
    { value: 'Self', labelEn: 'Self', labelBn: 'নিজ' },
    { value: 'Wife', labelEn: 'Wife', labelBn: 'স্ত্রী' },
    { value: 'Husband', labelEn: 'Husband', labelBn: 'স্বামী' },
    { value: 'Son', labelEn: 'Son', labelBn: 'পুত্র' },
    { value: 'Daughter', labelEn: 'Daughter', labelBn: 'কন্যা' },
    { value: 'Father', labelEn: 'Father', labelBn: 'পিতা' },
    { value: 'Mother', labelEn: 'Mother', labelBn: 'মাতা' },
    { value: 'Brother', labelEn: 'Brother', labelBn: 'ভাই' },
    { value: 'Sister', labelEn: 'Sister', labelBn: 'বোন' },
];

const formatDobForStorage = (value: string) => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-');
        return `${day}/${month}/${year}`;
    }
    return value;
};

const formatDobForInput = (value: string) => {
    if (!value) return '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    }
    return value;
};

export default function IssueCertificate() {
    const { t, language } = useLanguage();
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

                const citizenList = Array.isArray(cData) ? cData : [];
                setCitizens(citizenList);
                setCertTypes(Array.isArray(tData) ? tData : []);

                // Check for citizenId param
                const searchParams = new URL(window.location.href).searchParams;
                const citizenId = searchParams.get('citizenId');

                if (citizenId && citizenList.length > 0) {
                    const preSelected = citizenList.find((c: Citizen) => c._id === citizenId);
                    if (preSelected) {
                        setSelectedCitizen(preSelected);
                        setIsManual(false);
                        setStep(2); // Auto-advance to next step
                    }
                }

            } catch {
                toast.error(language === 'en' ? 'Failed to load initial data' : 'প্রাথমিক তথ্য লোড করা যায়নি');
            } finally {
                setLoadingData(false);
            }
        }
        loadData();
    }, [language]);

    // Manual Applicant State
    const [isManual, setIsManual] = useState(false);
    const [manualApplicant, setManualApplicant] = useState({
        name: '',
        phone: '',
        nid: '',
        address: ''
    });

    // Disability Info - multiple selection
    const [disabilityTypes, setDisabilityTypes] = useState<string[]>([]);

    // Custom certificate body text (per-certificate edit, does not change default template)
    const [customBodyTextEn, setCustomBodyTextEn] = useState('');
    const [customBodyTextBn, setCustomBodyTextBn] = useState('');
    const [showBodyTextEditor, setShowBodyTextEditor] = useState(false);

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
        if (!newWarish.nameEn || !newWarish.relation || !newWarish.dob) return;
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
            const isWarish = selectedType.name === 'Warish Certificate' || selectedType.name === 'Succession Certificate' || selectedType.name === 'Warish' || selectedType.nameBn === 'ওয়ারিশ সনদ' || selectedType.name === 'Heirship' || selectedType.name === 'Heirship Certificate' || selectedType.nameBn === 'উত্তরাধিকার সনদ';
            const isFamilyCert = selectedType.name === 'Family' || selectedType.name === 'Family Certificate' || selectedType.nameBn === 'পারিবারিক সনদ' || selectedType.nameBn === 'পারিবারিক';
            const isDisability = selectedType.name === 'Disability' || selectedType.name?.includes('Disability') || selectedType.nameBn?.includes('প্রতিবন্ধী');

            const payload = {
                citizenId: isManual ? null : selectedCitizen?._id,
                type: selectedType.nameBn,
                issueDate: new Date(),
                status: 'Issued',
                feePaid: selectedType.fee,
                isPaid: true,
                details: {
                    ...(customBodyTextEn && customBodyTextEn !== (selectedType.bodyTextEn || '')
                        ? { bodyTextEn: customBodyTextEn }
                        : selectedType.bodyTextEn ? { bodyTextEn: selectedType.bodyTextEn } : {}),
                    ...(customBodyTextBn && customBodyTextBn !== (selectedType.bodyTextBn || '')
                        ? { bodyTextBn: customBodyTextBn }
                        : selectedType.bodyTextBn ? { bodyTextBn: selectedType.bodyTextBn } : {}),
                    ...(isManual ? { applicantInfo: manualApplicant } : {}),
                    ...(isTradeLicense ? {
                        businessName: businessInfo.businessName,
                        businessAddress: businessInfo.businessAddress,
                        businessType: businessInfo.businessType,
                        businessCapital: businessInfo.businessCapital
                    } : {}),
                    ...(isWarish || isFamilyCert ? {
                        deceasedNameEn: deceasedInfo.nameEn,
                        deceasedNameBn: deceasedInfo.nameBn,
                        deceasedFatherNameEn: deceasedInfo.fatherNameEn,
                        deceasedFatherNameBn: deceasedInfo.fatherNameBn,
                        deceasedMotherNameEn: deceasedInfo.motherNameEn,
                        deceasedMotherNameBn: deceasedInfo.motherNameBn,
                        deceasedAddressEn: deceasedInfo.addressEn,
                        deceasedAddressBn: deceasedInfo.addressBn,
                        warishList
                    } : {}),
                    ...(isDisability ? {
                        disabilityType: disabilityTypes.map(v => v.replace(/.*\((.+)\)/, '$1')).join(', '),
                        disabilityTypeBn: disabilityTypes.map(v => v.replace(/\s*\(.+\)/, '')).join(', ')
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
        } catch {
            toast.error(language === 'en' ? 'Error submitting request' : 'আবেদন জমা দিতে ত্রুটি হয়েছে');
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
                    <span className="font-medium hidden md:inline">{language === 'en' ? 'Details' : 'বিস্তারিত'}</span>
                </div>
                <div className="h-px bg-border flex-1" />
                <div className={`flex items-center gap-2 ${step >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 4 ? 'border-primary bg-primary/10' : 'border-muted'}`}>4</div>
                    <span className="font-medium hidden md:inline">{t.certificates.issuePage.steps.review}</span>
                </div>
            </div>

            {loadingData ? (
                <div className="py-20 text-center text-muted-foreground">{language === 'en' ? 'Loading data...' : 'তথ্য লোড হচ্ছে...'}</div>
            ) : (
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[400px]">
                    {/* Step 1: Select Citizen */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="flex gap-4 border-b border-border pb-4 mb-4">
                                <button
                                    onClick={() => setIsManual(false)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${!isManual ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                                >
                                    {language === 'en' ? 'Registered Citizen' : 'নিবন্ধিত নাগরিক'}
                                </button>
                                <button
                                    onClick={() => { setIsManual(true); setSelectedCitizen(null); }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isManual ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                                >
                                    {language === 'en' ? 'Manual Entry (Non-Resident)' : 'ম্যানুয়াল এন্ট্রি (অ-নিবাসী)'}
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
                                                        <p className="text-sm text-muted-foreground">{language === 'en' ? 'Phone' : 'ফোন'}: {citizen.phone}</p>
                                                    </div>
                                                    {selectedCitizen?._id === citizen._id && <Check className="text-primary" size={20} />}
                                                </div>
                                            </div>
                                        ))}
                                        {filteredCitizens.length === 0 && (
                                            <div className="col-span-full text-center py-10 text-muted-foreground">
                                                {language === 'en' ? 'No citizens found.' : 'কোনো নাগরিক পাওয়া যায়নি।'} <Link href="/admin/citizens/add" className="text-primary hover:underline">{language === 'en' ? 'Register new?' : 'নতুন নিবন্ধন?'}</Link>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{language === 'en' ? 'Applicant Name' : 'আবেদনকারীর নাম'}</label>
                                            <input
                                                value={manualApplicant.name}
                                                onChange={e => setManualApplicant({ ...manualApplicant, name: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder={language === 'en' ? 'Full name' : 'পূর্ণ নাম'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{language === 'en' ? 'Phone Number' : 'ফোন নম্বর'}</label>
                                            <input
                                                value={manualApplicant.phone}
                                                onChange={e => setManualApplicant({ ...manualApplicant, phone: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder={language === 'en' ? '017xxxxxxxx' : '০১৭xxxxxxxx'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{language === 'en' ? 'NID (Optional)' : 'এনআইডি (ঐচ্ছিক)'}</label>
                                            <input
                                                value={manualApplicant.nid}
                                                onChange={e => setManualApplicant({ ...manualApplicant, nid: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder={language === 'en' ? 'National ID' : 'জাতীয় পরিচয়পত্র'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{language === 'en' ? 'Address' : 'ঠিকানা'}</label>
                                            <input
                                                value={manualApplicant.address}
                                                onChange={e => setManualApplicant({ ...manualApplicant, address: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder={language === 'en' ? 'Full address' : 'সম্পূর্ণ ঠিকানা'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!isManual && !selectedCitizen}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                        const isWarishStep = selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession') || selectedType?.name?.includes('Heirship') || selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক';
                                        const isDisabilityStep = selectedType?.name?.includes('Disability') || selectedType?.nameBn?.includes('প্রতিবন্ধী');
                                        const isTradeLicense = selectedType?.name === 'Trade License' || selectedType?.nameBn === 'ট্রেড লাইসেন্স';
                                        setStep((isWarishStep || isTradeLicense || isDisabilityStep) ? 3 : 4);
                                    }}
                                    disabled={!selectedType}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">{language === 'en' ? 'Applicant Information' : 'আবেদনকারীর তথ্য'}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">{language === 'en' ? 'Name' : 'নাম'}</span>
                                        <span className="font-medium text-foreground">{isManual ? manualApplicant.name : selectedCitizen?.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">{language === 'en' ? 'Phone' : 'ফোন'}</span>
                                        <span className="font-medium text-foreground">{isManual ? manualApplicant.phone : selectedCitizen?.phone}</span>
                                    </div>
                                    {isManual && (
                                        <div className="col-span-2">
                                            <span className="text-xs text-muted-foreground block">{language === 'en' ? 'Address' : 'ঠিকানা'}</span>
                                            <span className="font-medium text-foreground">{manualApplicant.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>



                            {(selectedType?.name === 'Trade License' || selectedType?.nameBn === 'ট্রেড লাইসেন্স') && (
                                <div className="space-y-6 border border-border rounded-lg p-5 animate-in slide-in-from-right-4">
                                    <h4 className="font-medium text-foreground pb-2 border-b border-border">{language === 'en' ? 'Trade License Information' : 'ট্রেড লাইসেন্স তথ্য'}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{language === 'en' ? 'Business Name' : 'প্রতিষ্ঠানের নাম'}</label>
                                            <input
                                                value={businessInfo.businessName}
                                                onChange={e => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder={language === 'en' ? 'Business Name' : 'প্রতিষ্ঠানের নাম'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{language === 'en' ? 'Business Address' : 'প্রতিষ্ঠানের ঠিকানা'}</label>
                                            <input
                                                value={businessInfo.businessAddress}
                                                onChange={e => setBusinessInfo({ ...businessInfo, businessAddress: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder={language === 'en' ? 'Address' : 'ঠিকানা'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{language === 'en' ? 'Type' : 'ধরণ'}</label>
                                            <input
                                                value={businessInfo.businessType}
                                                onChange={e => setBusinessInfo({ ...businessInfo, businessType: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="e.g. Proprietorship"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{language === 'en' ? 'Capital' : 'মূলধন'}</label>
                                            <input
                                                type="number"
                                                value={businessInfo.businessCapital}
                                                onChange={e => setBusinessInfo({ ...businessInfo, businessCapital: e.target.value })}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder={language === 'en' ? 'BDT' : 'টাকা'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession') || selectedType?.name?.includes('Heirship') || selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক') && (
                                <div className="space-y-6 border border-border rounded-lg p-5">
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-foreground pb-2 border-b border-border">{language === 'en' ? ((selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক') ? 'Head of Family Information' : 'Deceased Person Information') : ((selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক') ? 'পরিবার প্রধানের তথ্য' : 'মৃত ব্যক্তির তথ্য')}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">{language === 'en' ? ((selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক') ? 'Head of Family Name (English)' : 'Deceased Name (English)') : ((selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক') ? 'পরিবার প্রধানের নাম (ইংরেজি)' : 'মৃত ব্যক্তির নাম (ইংরেজি)')}</label>
                                                <input
                                                    value={deceasedInfo.nameEn}
                                                    onChange={(e) => setDeceasedInfo({ ...deceasedInfo, nameEn: formatEnglishInput(e.target.value) })}
                                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder={language === 'en' ? 'Name in English' : 'ইংরেজিতে নাম'}
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
                                                <label className="text-sm font-medium">{language === 'en' ? 'Father\'s Name (English)' : 'পিতার নাম (ইংরেজি)'}</label>
                                                <input
                                                    value={deceasedInfo.fatherNameEn}
                                                    onChange={(e) => setDeceasedInfo({ ...deceasedInfo, fatherNameEn: formatEnglishInput(e.target.value) })}
                                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder={language === 'en' ? 'Father\'s Name' : 'পিতার নাম'}
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
                                                <label className="text-sm font-medium">{language === 'en' ? 'Mother\'s Name (English)' : 'মাতার নাম (ইংরেজি)'}</label>
                                                <input
                                                    value={deceasedInfo.motherNameEn}
                                                    onChange={(e) => setDeceasedInfo({ ...deceasedInfo, motherNameEn: formatEnglishInput(e.target.value) })}
                                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder={language === 'en' ? 'Mother\'s Name' : 'মাতার নাম'}
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
                                                <label className="text-sm font-medium">{language === 'en' ? 'Address (English)' : 'ঠিকানা (ইংরেজি)'}</label>
                                                <input
                                                    value={deceasedInfo.addressEn}
                                                    onChange={(e) => setDeceasedInfo({ ...deceasedInfo, addressEn: formatEnglishInput(e.target.value) })}
                                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder={language === 'en' ? 'Full address in English' : 'ইংরেজিতে সম্পূর্ণ ঠিকানা'}
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
                                            <h4 className="font-medium text-foreground">{language === 'en' ? ((selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক') ? 'Family Members List' : (selectedType?.name?.includes('Heirship') ? 'Heir List' : 'Warish List')) : ((selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক') ? 'পরিবারের সদস্যর তালিকা' : (selectedType?.name?.includes('Heirship') ? 'উত্তরাধিকারীর তালিকা' : 'ওয়ারিশ তালিকা'))}</h4>
                                            <span className="text-xs bg-muted px-2 py-1 rounded">{language === 'en' ? 'Total' : 'মোট'}: {warishList.length}</span>
                                        </div>

                                        <div className="grid grid-cols-12 gap-2 items-end bg-muted/30 p-3 rounded-lg">
                                            <div className="col-span-4 grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-xs text-muted-foreground">{language === 'en' ? 'Name (En)' : 'নাম (ইংরেজি)'}</label>
                                                    <input
                                                        placeholder={language === 'en' ? 'Name (English)' : 'নাম (ইংরেজি)'}
                                                        value={newWarish.nameEn}
                                                        onChange={(e) => setNewWarish({ ...newWarish, nameEn: formatEnglishInput(e.target.value) })}
                                                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-muted-foreground">{language === 'en' ? 'Name (Bn)' : 'নাম (বাংলা)'}</label>
                                                    <input
                                                        placeholder="নাম (বাংলা)"
                                                        value={newWarish.nameBn}
                                                        onChange={(e) => setNewWarish({ ...newWarish, nameBn: formatBanglaInput(e.target.value) })}
                                                        className="w-full rounded-lg border border-border px-3 py-2 text-sm font-bengali"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-xs text-muted-foreground">{language === 'en' ? 'NID/Birth' : 'এনআইডি/জন্মনিবন্ধন'}</label>
                                                <input
                                                    value={newWarish.nid}
                                                    onChange={e => setNewWarish({ ...newWarish, nid: e.target.value })}
                                                    className="w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                                    placeholder={language === 'en' ? 'NID' : 'এনআইডি'}
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-xs text-muted-foreground">{language === 'en' ? 'Date of Birth' : 'জন্ম তারিখ'}</label>
                                                <input
                                                    type="date"
                                                    value={formatDobForInput(newWarish.dob)}
                                                    onChange={e => setNewWarish({ ...newWarish, dob: formatDobForStorage(e.target.value) })}
                                                    className="w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-xs text-muted-foreground">{language === 'en' ? 'Relation' : 'সম্পর্ক'}</label>
                                                <select
                                                    value={newWarish.relation}
                                                    onChange={e => setNewWarish({ ...newWarish, relation: e.target.value })}
                                                    className="w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                                >
                                                    <option value="">{language === 'en' ? 'Select' : 'নির্বাচন করুন'}</option>
                                                    {MEMBER_RELATION_OPTIONS.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {language === 'en' ? option.labelEn : option.labelBn}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <button
                                                    onClick={addWarish}
                                                    disabled={!newWarish.nameEn || !newWarish.relation || !newWarish.dob}
                                                    className="w-full h-8 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 disabled:opacity-50"
                                                >
                                                    {language === 'en' ? 'Add' : 'যোগ করুন'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border border-border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">{language === 'en' ? 'Name (En)' : 'নাম (ইংরেজি)'}</th>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">{language === 'en' ? 'Name (Bn)' : 'নাম (বাংলা)'}</th>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">{language === 'en' ? 'Relation' : 'সম্পর্ক'}</th>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">{language === 'en' ? 'DOB' : 'জন্ম তারিখ'}</th>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">{language === 'en' ? 'NID/Birth' : 'এনআইডি/জন্মনিবন্ধন'}</th>
                                                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">{language === 'en' ? 'Action' : 'অ্যাকশন'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {warishList.map((w, idx) => (
                                                        <tr key={idx}>
                                                            <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                                                            <td className="px-3 py-2">{w.nameEn}</td>
                                                            <td className="px-3 py-2">{w.nameBn}</td>
                                                            <td className="px-3 py-2">{w.relation}</td>
                                                            <td className="px-3 py-2">{w.dob}</td>
                                                            <td className="px-3 py-2">{w.nid}</td>
                                                            <td className="px-3 py-2 text-right">
                                                                <button
                                                                    onClick={() => removeWarish(idx)}
                                                                    className="text-[var(--danger)] hover:opacity-80"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {warishList.length === 0 && (
                                                        <tr>
                                                            <td colSpan={7} className="px-3 py-4 text-center text-muted-foreground">
                                                                {language === 'en'
                                                                    ? ((selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক')
                                                                        ? 'No family members added.'
                                                                        : 'No heirs added.')
                                                                    : ((selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক')
                                                                        ? 'কোনো পরিবারের সদস্য যোগ করা হয়নি।'
                                                                        : 'কোনো উত্তরাধিকারী যোগ করা হয়নি।')}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            
                            {(selectedType?.name?.includes('Disability') || selectedType?.nameBn?.includes('প্রতিবন্ধী')) && (
                                <div className="space-y-6 border border-border rounded-lg p-5 animate-in slide-in-from-right-4">
                                    <h4 className="font-medium text-foreground pb-2 border-b border-border">{language === 'en' ? 'Disability Information' : 'প্রতিবন্ধিতার তথ্য'}</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{language === 'en' ? 'Type of Disability (select one or more)' : 'প্রতিবন্ধিতার ধরন (এক বা একাধিক নির্বাচন করুন)'}</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {[
                                                    { en: 'Physical Disability', bn: 'শারীরিক প্রতিবন্ধী' },
                                                    { en: 'Visual Disability', bn: 'দৃষ্টি প্রতিবন্ধী' },
                                                    { en: 'Hearing Disability', bn: 'শ্রবণ প্রতিবন্ধী' },
                                                    { en: 'Speech Disability', bn: 'বাক প্রতিবন্ধী' },
                                                    { en: 'Intellectual Disability', bn: 'বুদ্ধি প্রতিবন্ধী' },
                                                    { en: 'Mental Disability', bn: 'মানসিক প্রতিবন্ধী' },
                                                    { en: 'Autism / ASD', bn: 'অটিজম / অটিজম স্পেকট্রাম' },
                                                    { en: 'Cerebral Palsy', bn: 'সেরিব্রাল পালসি' },
                                                    { en: 'Down Syndrome', bn: 'ডাউন সিন্ড্রোম' },
                                                    { en: 'Other', bn: 'অন্যান্য' },
                                                ].map((item) => {
                                                    const value = `${item.bn} (${item.en})`;
                                                    const isChecked = disabilityTypes.includes(value);
                                                    return (
                                                        <label key={item.en} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${isChecked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => {
                                                                    setDisabilityTypes(prev =>
                                                                        isChecked ? prev.filter(v => v !== value) : [...prev, value]
                                                                    );
                                                                }}
                                                                className="rounded border-border"
                                                            />
                                                            <span className="text-sm">{language === 'en' ? item.en : item.bn}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Edit Certificate Body Text (per-certificate, optional) */}
                            <div className="border border-border rounded-lg p-5 animate-in slide-in-from-right-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!showBodyTextEditor && !customBodyTextEn && !customBodyTextBn) {
                                            setCustomBodyTextEn(selectedType?.bodyTextEn || '');
                                            setCustomBodyTextBn(selectedType?.bodyTextBn || '');
                                        }
                                        setShowBodyTextEditor(!showBodyTextEditor);
                                    }}
                                    className="w-full flex items-center justify-between"
                                >
                                    <h4 className="font-medium text-foreground">{language === 'en' ? 'Edit Certificate Text (Optional)' : 'সনদের লেখা সম্পাদনা (ঐচ্ছিক)'}</h4>
                                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                                        {showBodyTextEditor
                                            ? (language === 'en' ? 'Click to collapse' : 'সংকুচিত করুন')
                                            : (language === 'en' ? 'Click to expand' : 'প্রসারিত করুন')}
                                    </span>
                                </button>
                                {showBodyTextEditor && (
                                    <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                        <p className="text-xs text-muted-foreground">
                                            {language === 'en'
                                                ? 'Edit the certificate body text below. This change only applies to this certificate, not to the default template.'
                                                : 'নিচে সনদের মূল লেখা সম্পাদনা করুন। এই পরিবর্তন শুধুমাত্র এই সনদের জন্য প্রযোজ্য, ডিফল্ট টেমপ্লেটে কোনো প্রভাব পড়বে না।'}
                                        </p>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{language === 'en' ? 'English Text' : 'ইংরেজি লেখা'}</label>
                                            <textarea
                                                value={customBodyTextEn}
                                                onChange={e => setCustomBodyTextEn(e.target.value)}
                                                rows={4}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                                                placeholder={language === 'en' ? 'English certificate body text...' : 'ইংরেজি সনদের মূল লেখা...'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{language === 'en' ? 'Bangla Text' : 'বাংলা লেখা'}</label>
                                            <textarea
                                                value={customBodyTextBn}
                                                onChange={e => setCustomBodyTextBn(e.target.value)}
                                                rows={4}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y font-bengali"
                                                placeholder={language === 'en' ? 'Bangla certificate body text...' : 'বাংলা সনদের মূল লেখা...'}
                                            />
                                        </div>
                                        {(customBodyTextEn !== (selectedType?.bodyTextEn || '') || customBodyTextBn !== (selectedType?.bodyTextBn || '')) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCustomBodyTextEn(selectedType?.bodyTextEn || '');
                                                    setCustomBodyTextBn(selectedType?.bodyTextBn || '');
                                                }}
                                                className="text-xs text-muted-foreground hover:text-foreground underline"
                                            >
                                                {language === 'en' ? 'Reset to default text' : 'ডিফল্ট লেখায় ফিরে যান'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

<div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium"
                                >
                                    {t.certificates.issuePage.reviewSection.back}
                                </button>
                                <button
                                    onClick={() => {
                                        const isWarishStep = selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession') || selectedType?.name?.includes('Heirship') || selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক';
                                        const isDisabilityStep = selectedType?.name?.includes('Disability') || selectedType?.nameBn?.includes('প্রতিবন্ধী');
                                        const isTradeLicense = selectedType?.name === 'Trade License' || selectedType?.nameBn === 'ট্রেড লাইসেন্স';

                                        if (isTradeLicense) {
                                            if (!businessInfo.businessName || !businessInfo.businessAddress || !businessInfo.businessType || !businessInfo.businessCapital) {
                                                toast.error(language === 'en' ? 'Please fill in all Trade License information' : 'ট্রেড লাইসেন্সের সব তথ্য পূরণ করুন');
                                                return;
                                            }
                                        }

                                        if (isWarishStep) {
                                            const isFamilyStep = selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক';
                                            if (!deceasedInfo.nameEn || !deceasedInfo.nameBn) {
                                                toast.error(language === 'en' ? 'Please fill in deceased person name' : 'মৃত ব্যক্তির নাম পূরণ করুন');
                                                return;
                                            }
                                            if (warishList.length === 0) {
                                                toast.error(language === 'en'
                                                    ? (isFamilyStep ? 'Please add at least one family member' : 'Please add at least one heir')
                                                    : (isFamilyStep ? 'কমপক্ষে একজন পরিবারের সদস্য যুক্ত করুন' : 'কমপক্ষে একজন উত্তরাধিকারী যুক্ত করুন'));
                                                return;
                                            }
                                        }

                                        if (isDisabilityStep) {
                                            if (disabilityTypes.length === 0) {
                                                toast.error(language === 'en' ? 'Please select at least one disability type' : 'কমপক্ষে একটি প্রতিবন্ধিতার ধরন নির্বাচন করুন');
                                                return;
                                            }
                                        }

                                        setStep(4);
                                    }}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
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
                                        {isManual && <span className="text-xs text-muted-foreground block">{language === 'en' ? '(Manual Entry)' : '(ম্যানুয়াল এন্ট্রি)'}</span>}
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
                                <div className="bg-primary/10 border border-primary/20 p-5 rounded-lg space-y-3">
                                    <h4 className="font-medium text-foreground border-b border-primary/20 pb-2">{language === 'en' ? 'Business Details' : 'ব্যবসার বিবরণ'}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="block text-xs text-muted-foreground">{language === 'en' ? 'Business Name' : 'প্রতিষ্ঠানের নাম'}</span>
                                            <span className="font-medium text-foreground">{businessInfo.businessName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-muted-foreground">{language === 'en' ? 'Address' : 'ঠিকানা'}</span>
                                            <span className="font-medium text-foreground">{businessInfo.businessAddress}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-muted-foreground">{language === 'en' ? 'Type' : 'ধরণ'}</span>
                                            <span className="font-medium text-foreground">{businessInfo.businessType}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-muted-foreground">{language === 'en' ? 'Capital' : 'মূলধন'}</span>
                                            <span className="font-medium text-foreground">{businessInfo.businessCapital} BDT</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warish Verification Details */}
                            {(selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession') || selectedType?.name?.includes('Heirship')) && (
                                <div className="space-y-4">
                                    <div className="bg-muted/30 border border-border p-5 rounded-lg space-y-3">
                                        <h4 className="font-medium text-foreground border-b border-border pb-2">{language === 'en' ? ((selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক') ? 'Head of Family Information' : 'Deceased Information') : ((selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক') ? 'পরিবার প্রধানের তথ্য' : 'মৃত ব্যক্তির তথ্য')}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                            <div>
                                                <span className="block text-xs text-muted-foreground">{language === 'en' ? 'Name (En)' : 'নাম (ইংরেজি)'}</span>
                                                <span className="font-medium">{deceasedInfo.nameEn}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-muted-foreground">{language === 'en' ? 'Name (Bn)' : 'নাম (বাংলা)'}</span>
                                                <span className="font-medium">{deceasedInfo.nameBn}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-muted-foreground">{language === 'en' ? 'Father (En)' : 'পিতা (ইংরেজি)'}</span>
                                                <span className="font-medium">{deceasedInfo.fatherNameEn}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-muted-foreground">{language === 'en' ? 'Father (Bn)' : 'পিতা (বাংলা)'}</span>
                                                <span className="font-medium">{deceasedInfo.fatherNameBn}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-muted-foreground">{language === 'en' ? 'Mother (En)' : 'মাতা (ইংরেজি)'}</span>
                                                <span className="font-medium">{deceasedInfo.motherNameEn}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-muted-foreground">{language === 'en' ? 'Mother (Bn)' : 'মাতা (বাংলা)'}</span>
                                                <span className="font-medium">{deceasedInfo.motherNameBn}</span>
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="block text-xs text-muted-foreground">{language === 'en' ? 'Address' : 'ঠিকানা'}</span>
                                                <span className="font-medium">{deceasedInfo.addressEn} / {deceasedInfo.addressBn}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-border rounded-lg overflow-hidden">
                                        <div className="bg-muted px-4 py-2 border-b border-border flex justify-between items-center">
                                            <h4 className="font-medium text-sm">{language === 'en' ? ((selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক') ? 'Family Members List' : 'Heir List') : ((selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক') ? 'পরিবারের সদস্যর তালিকা' : 'উত্তরাধিকারীর তালিকা')}</h4>
                                            <span className="text-xs bg-background px-2 py-0.5 rounded border">{language === 'en' ? 'Total' : 'মোট'}: {warishList.length}</span>
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead className="bg-background">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">#</th>
                                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">{language === 'en' ? 'Name' : 'নাম'}</th>
                                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">{language === 'en' ? 'Relation' : 'সম্পর্ক'}</th>
                                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">{language === 'en' ? 'DOB' : 'জন্ম তারিখ'}</th>
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
                                                        <td className="px-4 py-2">{w.dob}</td>
                                                        <td className="px-4 py-2">{w.nid}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                                                        {/* Disability Verification Details */}
                            {(selectedType?.name?.includes('Disability') || selectedType?.nameBn?.includes('প্রতিবন্ধী')) && (
                                <div className="bg-primary/10 border border-primary/20 p-5 rounded-lg space-y-3">
                                    <h4 className="font-medium text-foreground border-b border-primary/20 pb-2">{language === 'en' ? 'Disability Details' : 'প্রতিবন্ধিতার বিবরণ'}</h4>
                                    <div className="text-sm">
                                        <span className="block text-xs text-muted-foreground">{language === 'en' ? 'Type of Disability' : 'প্রতিবন্ধিতার ধরন'}</span>
                                        <span className="font-medium text-foreground">{language === 'en' ? disabilityTypes.map(v => v.replace(/.*\((.+)\)/, '$1')).join(', ') : disabilityTypes.map(v => v.replace(/\s*\(.+\)/, '')).join(', ')}</span>
                                    </div>
                                </div>
                            )}

<div className="tone-warning rounded-lg border p-4 text-sm">
                                <p>{t.certificates.issuePage.reviewSection.disclaimer}</p>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => {
                                        const isWarishStep = selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession') || selectedType?.name?.includes('Heirship') || selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === 'পারিবারিক সনদ' || selectedType?.nameBn === 'পারিবারিক';
                                        const isDisabilityStep = selectedType?.name?.includes('Disability') || selectedType?.nameBn?.includes('প্রতিবন্ধী');
                                        const isTradeLicense = selectedType?.name === 'Trade License' || selectedType?.nameBn === 'ট্রেড লাইসেন্স' || selectedType?.name === 'Trade';

                                        if (isWarishStep || isTradeLicense || isDisabilityStep) {
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
                                    className="inline-flex items-center gap-2 px-8 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
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

