'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatEnglishInput, formatBanglaInput } from '@/lib/utils';

import { useLanguage } from '@/components/providers/LanguageContext';

const defaultAddress = {
    village: '',
    villageBn: '',
    postOffice: '',
    postOfficeBn: '',
    ward: '',
    union: 'Kalikaccha',
    unionBn: 'কালিকচ্ছ',
    upazila: 'Sarail',
    upazilaBn: 'সরাইল',
    district: 'Brahmanbaria',
    districtBn: 'ব্রাহ্মণবাড়িয়া'
};

function AddCitizenContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, language } = useLanguage();
    const editId = searchParams.get('id');
    const isEditMode = Boolean(editId);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);
    const [sameAsPermanent, setSameAsPermanent] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        nameBn: '',
        fatherName: '',
        fatherNameBn: '',
        motherName: '',
        motherNameBn: '',
        spouseName: '',
        dob: '',
        nid: '',
        phone: '',
        gender: 'Male',
        religion: 'Islam',
        presentAddress: { ...defaultAddress },
        permanentAddress: { ...defaultAddress }
    });

    const formatDateForInput = (value?: string) => {
        if (!value) return '';
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    // Load initial state (edit mode or session draft)
    useEffect(() => {
        async function loadInitialData() {
            if (isEditMode && editId) {
                try {
                    const res = await fetch(`/api/citizens/${editId}`);
                    if (!res.ok) throw new Error('Failed to load citizen');
                    const data = await res.json();

                    // Migrate: if old data has only `address`, use it as presentAddress and permanentAddress
                    const present = data.presentAddress || data.address || {};
                    const permanent = data.permanentAddress || data.address || {};

                    setFormData(prev => ({
                        ...prev,
                        ...data,
                        dob: formatDateForInput(data.dob),
                        presentAddress: { ...prev.presentAddress, ...present },
                        permanentAddress: { ...prev.permanentAddress, ...permanent }
                    }));

                    // Check if addresses are the same
                    const p = data.presentAddress || data.address || {};
                    const pm = data.permanentAddress || data.address || {};
                    if (p.village === pm.village && p.villageBn === pm.villageBn &&
                        p.postOffice === pm.postOffice && p.postOfficeBn === pm.postOfficeBn &&
                        p.ward === pm.ward) {
                        setSameAsPermanent(true);
                    }
                } catch {
                    toast.error(language === 'en' ? 'Failed to load citizen data' : 'নাগরিকের তথ্য লোড করা যায়নি');
                } finally {
                    setIsLoaded(true);
                }
                return;
            }

            const savedData = sessionStorage.getItem('citizen_registration_form');
            const savedStep = sessionStorage.getItem('citizen_registration_step');

            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    setFormData(prev => ({
                        ...prev,
                        ...parsedData,
                        presentAddress: { ...prev.presentAddress, ...(parsedData.presentAddress || parsedData.address || {}) },
                        permanentAddress: { ...prev.permanentAddress, ...(parsedData.permanentAddress || parsedData.address || {}) }
                    }));
                    if (parsedData.sameAsPermanent) setSameAsPermanent(true);
                } catch {
                    console.error('Failed to parse saved form data');
                }
            }

            if (savedStep) {
                setStep(parseInt(savedStep) || 1);
            }
            setIsLoaded(true);
        }

        loadInitialData();
    }, [editId, isEditMode, language]);

    // Save to Session Storage
    useEffect(() => {
        if (isLoaded && !isEditMode) {
            sessionStorage.setItem('citizen_registration_form', JSON.stringify({ ...formData, sameAsPermanent }));
            sessionStorage.setItem('citizen_registration_step', step.toString());
        }
    }, [formData, step, isLoaded, isEditMode, sameAsPermanent]);

    // Sync permanent address when sameAsPermanent is toggled
    useEffect(() => {
        if (sameAsPermanent) {
            setFormData(prev => ({
                ...prev,
                permanentAddress: { ...prev.presentAddress }
            }));
        }
    }, [sameAsPermanent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'nameBn' || name === 'fatherNameBn' || name === 'motherNameBn' || name.endsWith('Bn')) {
            formattedValue = formatBanglaInput(value);
        } else if (name === 'name' || name === 'fatherName' || name === 'motherName' || ((name.includes('presentAddress.') || name.includes('permanentAddress.')) && !name.endsWith('Bn'))) {
            formattedValue = formatEnglishInput(value);
        }

        if (name.includes('.')) {
            const [parent, child] = name.split('.') as [string, string];
            if (parent === 'presentAddress' || parent === 'permanentAddress') {
                setFormData(prev => {
                    const updated = {
                        ...prev,
                        [parent]: {
                            ...prev[parent],
                            [child]: formattedValue
                        }
                    };
                    // If sameAsPermanent and editing present, also sync permanent
                    if (sameAsPermanent && parent === 'presentAddress') {
                        updated.permanentAddress = { ...updated.presentAddress };
                    }
                    return updated;
                });
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        }
    };

    const validateStep = (currentStep: number) => {
        if (currentStep === 1) {
            if (!formData.name || !formData.fatherName || !formData.motherName || !formData.dob) {
                toast.error(language === 'en' ? 'Please fill in all required English fields' : 'সব প্রয়োজনীয় ইংরেজি তথ্য পূরণ করুন');
                return false;
            }
            const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
            if (!dateRegex.test(formData.dob)) {
                toast.error(language === 'en' ? 'Date of Birth must be in DD/MM/YYYY format' : 'জন্মতারিখ DD/MM/YYYY ফরম্যাটে লিখুন');
                return false;
            }
        } else if (currentStep === 2) {
            if (!formData.nameBn || !formData.fatherNameBn || !formData.motherNameBn) {
                toast.error(language === 'en' ? 'Please fill in all required Bangla fields' : 'সব প্রয়োজনীয় বাংলা তথ্য পূরণ করুন');
                return false;
            }
        } else if (currentStep === 3) {
            if (!formData.nid || !formData.phone) {
                toast.error(language === 'en' ? 'Please fill in NID and phone' : 'এনআইডি এবং ফোন নম্বর দিন');
                return false;
            }
        } else if (currentStep === 4) {
            if (!formData.presentAddress.village || !formData.presentAddress.postOffice || !formData.presentAddress.ward ||
                !formData.presentAddress.villageBn || !formData.presentAddress.postOfficeBn) {
                toast.error(language === 'en' ? 'Please fill in all required present address fields' : 'বর্তমান ঠিকানার সব প্রয়োজনীয় ঘর পূরণ করুন');
                return false;
            }
        } else if (currentStep === 5) {
            if (!formData.permanentAddress.village || !formData.permanentAddress.postOffice || !formData.permanentAddress.ward ||
                !formData.permanentAddress.villageBn || !formData.permanentAddress.postOfficeBn) {
                toast.error(language === 'en' ? 'Please fill in all required permanent address fields' : 'স্থায়ী ঠিকানার সব প্রয়োজনীয় ঘর পূরণ করুন');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const doSubmit = async () => {
        if (!validateStep(5)) return;

        setLoading(true);

        try {
            // Convert DD/MM/YYYY to YYYY-MM-DD
            const [day, month, year] = formData.dob.split('/');
            const isoDob = `${year}-${month}-${day}`;

            const res = await fetch(isEditMode && editId ? `/api/citizens/${editId}` : '/api/citizens', {
                method: isEditMode ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    dob: isoDob,
                    // Keep legacy address field = presentAddress for backward compatibility
                    address: formData.presentAddress,
                    ...(isEditMode ? {} : { status: 'approved' })
                })
            });

            if (res.ok) {
                toast.success(isEditMode
                    ? (language === 'en' ? 'Citizen updated successfully' : 'নাগরিকের তথ্য সফলভাবে আপডেট হয়েছে')
                    : t.citizens.form.success
                );
                if (!isEditMode) {
                    sessionStorage.removeItem('citizen_registration_form');
                    sessionStorage.removeItem('citizen_registration_step');
                }
                router.push('/admin/citizens');
            } else {
                const data = await res.json();
                toast.error(data.error || t.citizens.form.error);
            }
        } catch {
            toast.error(t.citizens.form.error);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return null;

    const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none";

    // Reusable address fields renderer
    const renderAddressFields = (prefix: 'presentAddress' | 'permanentAddress', disabled = false) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium">{t.citizens.form.village} [English] <span className="text-red-500">*</span></label>
                <input name={`${prefix}.village`} value={formData[prefix].village} onChange={handleChange} disabled={disabled} className={`${inputClass} ${disabled ? 'opacity-60' : ''}`} placeholder="e.g. Kalikaccha" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">{t.citizens.form.village} [Bangla] <span className="text-red-500">*</span></label>
                <input name={`${prefix}.villageBn`} value={formData[prefix].villageBn} onChange={handleChange} disabled={disabled} className={`${inputClass} ${disabled ? 'opacity-60' : ''}`} placeholder="উদাহরণ: কালিকচ্ছ" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">{t.citizens.form.postOffice} [English] <span className="text-red-500">*</span></label>
                <input name={`${prefix}.postOffice`} value={formData[prefix].postOffice} onChange={handleChange} disabled={disabled} className={`${inputClass} ${disabled ? 'opacity-60' : ''}`} placeholder="e.g. Kalikaccha" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">{t.citizens.form.postOffice} [Bangla] <span className="text-red-500">*</span></label>
                <input name={`${prefix}.postOfficeBn`} value={formData[prefix].postOfficeBn} onChange={handleChange} disabled={disabled} className={`${inputClass} ${disabled ? 'opacity-60' : ''}`} placeholder="উদাহরণ: কালিকচ্ছ" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">{t.citizens.form.ward} <span className="text-red-500">*</span></label>
                <select name={`${prefix}.ward`} value={formData[prefix].ward} onChange={handleChange} disabled={disabled} className={`${inputClass} ${disabled ? 'opacity-60' : ''}`}>
                    <option value="">{language === 'en' ? 'Select Ward' : 'ওয়ার্ড নির্বাচন করুন'}</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>Ward {n}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'en' ? 'Union' : 'ইউনিয়ন'}</label>
                <input value={`${formData[prefix].union} / ${formData[prefix].unionBn}`} className={`${inputClass} opacity-60`} readOnly />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'en' ? 'Upazila' : 'উপজেলা'}</label>
                <input value={`${formData[prefix].upazila} / ${formData[prefix].upazilaBn}`} className={`${inputClass} opacity-60`} readOnly />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'en' ? 'District' : 'জেলা'}</label>
                <input value={`${formData[prefix].district} / ${formData[prefix].districtBn}`} className={`${inputClass} opacity-60`} readOnly />
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
                        {isEditMode
                            ? (language === 'en' ? 'Edit Citizen' : 'নাগরিকের তথ্য সম্পাদনা')
                            : t.citizens.form.title}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t.citizens.subtitle} - {language === 'en' ? 'Step' : 'ধাপ'} {step} {language === 'en' ? 'of' : '/'} 5</p>
                </div>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-4 border-b border-border pb-6 overflow-x-auto">
                {[
                    { num: 1, label: language === 'en' ? 'English Info' : 'ইংরেজি তথ্য' },
                    { num: 2, label: language === 'en' ? 'Bangla Info' : 'বাংলা তথ্য' },
                    { num: 3, label: language === 'en' ? 'Identity' : 'পরিচয়' },
                    { num: 4, label: language === 'en' ? 'Present Address' : 'বর্তমান ঠিকানা' },
                    { num: 5, label: language === 'en' ? 'Permanent Address' : 'স্থায়ী ঠিকানা' }
                ].map((s, i, arr) => (
                    <span key={s.num} className="contents">
                        <div className={`flex items-center gap-2 ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= s.num ? 'border-primary bg-primary/10' : 'border-muted'}`}>{s.num}</div>
                            <span className="font-medium whitespace-nowrap">{s.label}</span>
                        </div>
                        {i < arr.length - 1 && <div className="h-px bg-border flex-1 min-w-[20px]" />}
                    </span>
                ))}
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm min-h-[500px]">
                {/* Use div instead of form to prevent Bangla IME auto-submit */}
                <div className="space-y-8">

                    {/* Step 1: Personal Info (English) */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold border-b border-border pb-2">{t.citizens.form.personalInfo} (English)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.nameEn} <span className="text-red-500">*</span></label>
                                    <input name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g. Abdur Rahman" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.fatherName} ({t.common.english}) <span className="text-red-500">*</span></label>
                                    <input name="fatherName" value={formData.fatherName} onChange={handleChange} className={inputClass} placeholder="e.g. Abdul Karim" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.motherName} ({t.common.english}) <span className="text-red-500">*</span></label>
                                    <input name="motherName" value={formData.motherName} onChange={handleChange} className={inputClass} placeholder="e.g. Fatema Begum" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.dob} <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <select
                                            value={formData.dob.split('/')[0] || ''}
                                            onChange={(e) => {
                                                const day = e.target.value;
                                                const [, month = '', year = ''] = formData.dob.split('/');
                                                setFormData(prev => ({ ...prev, dob: `${day}/${month}/${year}` }));
                                            }}
                                            className={`w-1/3 ${inputClass}`}
                                        >
                                            <option value="">{language === 'en' ? 'Day' : 'দিন'}</option>
                                            {Array.from({ length: 31 }, (_, i) => {
                                                const d = (i + 1).toString().padStart(2, '0');
                                                return <option key={d} value={d}>{d}</option>;
                                            })}
                                        </select>
                                        <select
                                            value={formData.dob.split('/')[1] || ''}
                                            onChange={(e) => {
                                                const month = e.target.value;
                                                const [day = '', , year = ''] = formData.dob.split('/');
                                                setFormData(prev => ({ ...prev, dob: `${day}/${month}/${year}` }));
                                            }}
                                            className={`w-1/3 ${inputClass}`}
                                        >
                                            <option value="">{language === 'en' ? 'Month' : 'মাস'}</option>
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
                                                const mv = (i + 1).toString().padStart(2, '0');
                                                return <option key={mv} value={mv}>{m}</option>;
                                            })}
                                        </select>
                                        <select
                                            value={formData.dob.split('/')[2] || ''}
                                            onChange={(e) => {
                                                const year = e.target.value;
                                                const [day = '', month = ''] = formData.dob.split('/');
                                                setFormData(prev => ({ ...prev, dob: `${day}/${month}/${year}` }));
                                            }}
                                            className={`w-1/3 ${inputClass}`}
                                        >
                                            <option value="">{language === 'en' ? 'Year' : 'বছর'}</option>
                                            {Array.from({ length: 120 }, (_, i) => {
                                                const y = (new Date().getFullYear() - i).toString();
                                                return <option key={y} value={y}>{y}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{language === 'en' ? 'Spouse Name (Optional)' : 'স্বামী/স্ত্রীর নাম (ঐচ্ছিক)'}</label>
                                    <input name="spouseName" value={formData.spouseName} onChange={handleChange} className={inputClass} placeholder="e.g. Rina Begum" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.gender}</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                                        <option value="Male">{language === 'en' ? 'Male' : 'পুরুষ'}</option>
                                        <option value="Female">{language === 'en' ? 'Female' : 'মহিলা'}</option>
                                        <option value="Other">{language === 'en' ? 'Other' : 'অন্যান্য'}</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{language === 'en' ? 'Religion' : 'ধর্ম'}</label>
                                    <select name="religion" value={formData.religion} onChange={handleChange} className={inputClass}>
                                        <option value="Islam">Islam</option>
                                        <option value="Hinduism">Hinduism</option>
                                        <option value="Christianity">Christianity</option>
                                        <option value="Buddhism">Buddhism</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Personal Info (Bangla) */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold border-b border-border pb-2">{t.citizens.form.personalInfo} (Bangla)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.nameBn} <span className="text-red-500">*</span></label>
                                    <input name="nameBn" value={formData.nameBn} onChange={handleChange} className={inputClass} placeholder="উদাহরণ: আবদুর রহমান" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.fatherName} ({t.common.bangla}) <span className="text-red-500">*</span></label>
                                    <input name="fatherNameBn" value={formData.fatherNameBn} onChange={handleChange} className={inputClass} placeholder="উদাহরণ: আব্দুল করিম" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.motherName} ({t.common.bangla}) <span className="text-red-500">*</span></label>
                                    <input name="motherNameBn" value={formData.motherNameBn} onChange={handleChange} className={inputClass} placeholder="উদাহরণ: ফাতেমা বেগম" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Identity & Contact */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold border-b border-border pb-2">{language === 'en' ? 'Identity & Contact' : 'পরিচয় ও যোগাযোগ'}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.nid} <span className="text-red-500">*</span></label>
                                    <input name="nid" value={formData.nid} onChange={handleChange} className={inputClass} placeholder="10 or 17 digit number" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.phone} <span className="text-red-500">*</span></label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="017..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Present Address (English + Bangla) */}
                    {step === 4 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold border-b border-border pb-2">
                                {language === 'en' ? 'Present Address' : 'বর্তমান ঠিকানা'}
                            </h3>
                            {renderAddressFields('presentAddress')}
                        </div>
                    )}

                    {/* Step 5: Permanent Address (English + Bangla) */}
                    {step === 5 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <h3 className="text-lg font-semibold">
                                    {language === 'en' ? 'Permanent Address' : 'স্থায়ী ঠিকানা'}
                                </h3>
                                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={sameAsPermanent}
                                        onChange={(e) => setSameAsPermanent(e.target.checked)}
                                        className="rounded border-border"
                                    />
                                    {language === 'en' ? 'Same as present address' : 'বর্তমান ঠিকানার মতো'}
                                </label>
                            </div>
                            {renderAddressFields('permanentAddress', sameAsPermanent)}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t border-border mt-8">
                        {step > 1 ? (
                            <button type="button" onClick={handleBack} className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors">
                                {language === 'en' ? 'Back' : 'পেছনে যান'}
                            </button>
                        ) : (
                            <button type="button" onClick={() => router.back()} className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors">
                                {language === 'en' ? 'Cancel' : 'বাতিল'}
                            </button>
                        )}

                        {step < 5 ? (
                            <button type="button" onClick={handleNext} className="px-8 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                {language === 'en' ? 'Next' : 'পরবর্তী'}
                            </button>
                        ) : (
                            <button type="button" onClick={doSubmit} disabled={loading} className="inline-flex items-center gap-2 px-8 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                {isEditMode
                                    ? (language === 'en' ? 'Update Citizen' : 'নাগরিক আপডেট করুন')
                                    : t.citizens.form.submit}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AddCitizen() {
    return (
        <Suspense fallback={null}>
            <AddCitizenContent />
        </Suspense>
    );
}
