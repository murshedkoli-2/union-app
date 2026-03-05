'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useLanguage } from '@/components/providers/LanguageContext';
import { formatEnglishInput, formatBanglaInput } from '@/lib/utils';

export default function PublicCitizenApply() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);

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
        address: {
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
            districtBn: 'ব্রাহ্মণবাড়িয়া'
        }
    });

    // Load from Session Storage
    useEffect(() => {
        const savedData = sessionStorage.getItem('public_citizen_apply_form');
        const savedStep = sessionStorage.getItem('public_citizen_apply_step');

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setFormData(prev => ({
                    ...prev,
                    ...parsedData,
                    address: {
                        ...prev.address,
                        ...(parsedData.address || {})
                    }
                }));
            } catch {
                console.error('Failed to parse saved form data');
            }
        }

        if (savedStep) {
            setStep(parseInt(savedStep) || 1);
        }
        setIsLoaded(true);
    }, []);

    // Save to Session Storage
    useEffect(() => {
        if (isLoaded) {
            sessionStorage.setItem('public_citizen_apply_form', JSON.stringify(formData));
            sessionStorage.setItem('public_citizen_apply_step', step.toString());
        }
    }, [formData, step, isLoaded]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'nameBn' || name === 'fatherNameBn' || name === 'motherNameBn' || name.endsWith('Bn')) {
            formattedValue = formatBanglaInput(value);
        } else if (name === 'name' || name === 'fatherName' || name === 'motherName' || (name.includes('address.') && !name.endsWith('Bn'))) {
            formattedValue = formatEnglishInput(value);
        }

        if (name.includes('.')) {
            const [, child] = name.split('.') as ['address', keyof typeof formData.address];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [child]: formattedValue
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        }
    };

    const validateStep = (currentStep: number) => {
        if (currentStep === 1) {
            // Personal English
            if (!formData.name || !formData.fatherName || !formData.motherName || !formData.dob) {
                toast.error(language === 'en' ? 'Please fill in all required English fields' : 'সব প্রয়োজনীয় ইংরেজি তথ্য পূরণ করুন');
                return false;
            }
            // Date Validation regex for DD/MM/YYYY
            const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
            if (!dateRegex.test(formData.dob)) {
                toast.error(language === 'en' ? 'Date of Birth must be in DD/MM/YYYY format' : 'জন্মতারিখ DD/MM/YYYY ফরম্যাটে লিখুন');
                return false;
            }
        } else if (currentStep === 2) {
            // Personal Bangla
            if (!formData.nameBn || !formData.fatherNameBn || !formData.motherNameBn) {
                toast.error(language === 'en' ? 'Please fill in all required Bangla fields' : 'সব প্রয়োজনীয় বাংলা তথ্য পূরণ করুন');
                return false;
            }
        } else if (currentStep === 3) {
            // Identity
            if (!formData.nid || !formData.phone) {
                toast.error(language === 'en' ? 'Please fill in NID and phone' : 'এনআইডি এবং ফোন নম্বর দিন');
                return false;
            }
        } else if (currentStep === 4) {
            // Address English
            if (!formData.address.village || !formData.address.postOffice || !formData.address.ward) {
                toast.error(language === 'en' ? 'Please fill in all required English address fields' : 'ইংরেজি ঠিকানার সব প্রয়োজনীয় ঘর পূরণ করুন');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep(5) && (!formData.address.villageBn || !formData.address.postOfficeBn)) {
            toast.error(language === 'en' ? 'Please fill in all required Bangla address fields' : 'বাংলা ঠিকানার সব প্রয়োজনীয় ঘর পূরণ করুন');
            return;
        }

        setLoading(true);

        try {
            // Convert DD/MM/YYYY to YYYY-MM-DD
            const [day, month, year] = formData.dob.split('/');
            const isoDob = `${year}-${month}-${day}`;

            const res = await fetch('/api/public/apply/citizen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    dob: isoDob,
                    // status is handled by backend default to 'pending'
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit application');
            }

            setSuccess(true);
            toast.success(t.citizenApply.successTitle);
            // Clear Storage
            sessionStorage.removeItem('public_citizen_apply_form');
            sessionStorage.removeItem('public_citizen_apply_step');

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to submit application';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return null;

    if (success) {
        return (
            <div className="reveal-up min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
                <div className="tone-success h-20 w-20 rounded-full border flex items-center justify-center mb-6">
                    <UserPlus size={40} />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{t.citizenApply.successTitle}</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    {t.citizenApply.successDesc}
                </p>
                <Link href="/" className="inline-flex h-11 items-center rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                    {t.citizenApply.returnHome}
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8 reveal-up md:py-10">
            <div className="mb-6 rounded-2xl border border-border/70 bg-secondary/35 p-5 md:p-6 reveal-up reveal-delay-1">
                <p className="text-sm font-medium text-primary">{language === 'en' ? 'Citizen Service Portal' : 'নাগরিক সেবা পোর্টাল'}</p>
                <p className="mt-2 text-sm text-muted-foreground">{language === 'en' ? 'Complete each step carefully. Your information is saved in your session until you submit.' : 'প্রতিটি ধাপ সতর্কভাবে পূরণ করুন। সাবমিট না করা পর্যন্ত আপনার তথ্য সেশনে সংরক্ষিত থাকবে।'}</p>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <Link href="/" className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground font-display sm:text-3xl">{t.citizenApply.title}</h1>
                    <p className="text-muted-foreground mt-1">{t.citizenApply.subtitle} - Step {step} of 5</p>
                </div>
            </div>

            {/* Stepper Indicator */}
            <div className="mb-8 flex items-center gap-4 overflow-x-auto rounded-xl border border-border/60 bg-card/75 p-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-muted'}`}>1</div>
                    <span className="font-medium whitespace-nowrap">{language === 'en' ? 'English Info' : 'ইংরেজি তথ্য'}</span>
                </div>
                <div className="h-px bg-border flex-1 min-w-[20px]" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-muted'}`}>2</div>
                    <span className="font-medium whitespace-nowrap">{language === 'en' ? 'Bangla Info' : 'বাংলা তথ্য'}</span>
                </div>
                <div className="h-px bg-border flex-1 min-w-[20px]" />
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary/10' : 'border-muted'}`}>3</div>
                    <span className="font-medium whitespace-nowrap">{language === 'en' ? 'Identity' : 'পরিচয়'}</span>
                </div>
                <div className="h-px bg-border flex-1 min-w-[20px]" />
                <div className={`flex items-center gap-2 ${step >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 4 ? 'border-primary bg-primary/10' : 'border-muted'}`}>4</div>
                    <span className="font-medium whitespace-nowrap">{language === 'en' ? 'Address (En)' : 'ঠিকানা (ইংরেজি)'}</span>
                </div>
                <div className="h-px bg-border flex-1 min-w-[20px]" />
                <div className={`flex items-center gap-2 ${step >= 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 5 ? 'border-primary bg-primary/10' : 'border-muted'}`}>5</div>
                    <span className="font-medium whitespace-nowrap">{language === 'en' ? 'Address (Bn)' : 'ঠিকানা (বাংলা)'}</span>
                </div>
            </div>

            <div className="min-h-[500px] rounded-2xl border border-border/70 bg-card p-5 shadow-sm reveal-up reveal-delay-2 sm:p-7 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8 [&_input]:h-11 [&_select]:h-11 [&_input]:px-3 [&_select]:px-3">

                    {/* Step 1: Personal Info (English) */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold border-b border-border pb-2">{t.citizenApply.personalInfo} (English)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.nameEn} <span className="text-red-500">*</span></label>
                                    <input name="name" required value={formData.name} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Abdur Rahman" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.fatherNameEn} <span className="text-red-500">*</span></label>
                                    <input name="fatherName" required value={formData.fatherName} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Abdul Karim" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.motherNameEn} <span className="text-red-500">*</span></label>
                                    <input name="motherName" required value={formData.motherName} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Fatema Begum" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.dob} <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <select
                                            value={formData.dob.split('/')[0] || ''}
                                            onChange={(e) => {
                                                const day = e.target.value;
                                                const [, month = '', year = ''] = formData.dob.split('/');
                                                setFormData(prev => ({ ...prev, dob: `${day}/${month}/${year}` }));
                                            }}
                                            className="w-1/3 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
                                            className="w-1/3 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
                                            className="w-1/3 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
                                    <input name="spouseName" value={formData.spouseName} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Rina Begum" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.gender}</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                                        <option value="Male">{language === 'en' ? 'Male' : 'পুরুষ'}</option>
                                        <option value="Female">{language === 'en' ? 'Female' : 'মহিলা'}</option>
                                        <option value="Other">{language === 'en' ? 'Other' : 'অন্যান্য'}</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{language === 'en' ? 'Religion' : 'ধর্ম'}</label>
                                    <select name="religion" value={formData.religion} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
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
                            <h3 className="text-lg font-semibold border-b border-border pb-2">{t.citizenApply.personalInfo} (Bangla)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.nameBn} <span className="text-red-500">*</span></label>
                                    <input name="nameBn" required value={formData.nameBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="উদাহরণ: আবদুর রহমান" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.fatherNameBn} <span className="text-red-500">*</span></label>
                                    <input name="fatherNameBn" required value={formData.fatherNameBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="উদাহরণ: আব্দুল করিম" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.motherNameBn} <span className="text-red-500">*</span></label>
                                    <input name="motherNameBn" required value={formData.motherNameBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="উদাহরণ: ফাতেমা বেগম" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Identity & Contact */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold border-b border-border pb-2">{language === 'en' ? 'Identity & Contact' : 'পরিচয় ও যোগাযোগ'}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.nid} <span className="text-red-500">*</span></label>
                                    <input name="nid" required value={formData.nid} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="10 or 17 digit number" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.phone} <span className="text-red-500">*</span></label>
                                    <input name="phone" required value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="017..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Address (English) */}
                    {step === 4 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold border-b border-border pb-2">{t.citizenApply.addressInfo} (English)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.village} [English] <span className="text-red-500">*</span></label>
                                    <input name="address.village" required value={formData.address.village} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Kalikaccha" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.postOffice} [English] <span className="text-red-500">*</span></label>
                                    <input name="address.postOffice" required value={formData.address.postOffice} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Kalikaccha" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.ward} <span className="text-red-500">*</span></label>
                                    <select name="address.ward" required value={formData.address.ward} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                                        <option value="">{language === 'en' ? 'Select Ward' : 'ওয়ার্ড নির্বাচন করুন'}</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>Ward {n}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.union} [English]</label>
                                    <input name="address.union" required value={formData.address.union} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.upazila} [English]</label>
                                    <input name="address.upazila" required value={formData.address.upazila} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.district} [English]</label>
                                    <input name="address.district" required value={formData.address.district} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Address (Bangla) */}
                    {step === 5 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold border-b border-border pb-2">{t.citizenApply.addressInfo} (Bangla)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.village} [Bangla] <span className="text-red-500">*</span></label>
                                    <input name="address.villageBn" required value={formData.address.villageBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="উদাহরণ: কালিকচ্ছ" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.postOffice} [Bangla] <span className="text-red-500">*</span></label>
                                    <input name="address.postOfficeBn" required value={formData.address.postOfficeBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="উদাহরণ: কালিকচ্ছ" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.union} [Bangla]</label>
                                    <input name="address.unionBn" required value={formData.address.unionBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.upazila} [Bangla]</label>
                                    <input name="address.upazilaBn" required value={formData.address.upazilaBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizenApply.district} [Bangla]</label>
                                    <input name="address.districtBn" required value={formData.address.districtBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t border-border mt-8">
                        {step > 1 ? (
                            <button type="button" onClick={handleBack} className="inline-flex h-11 items-center rounded-lg px-6 font-medium text-muted-foreground transition-colors hover:bg-muted">
                                {language === 'en' ? 'Back' : 'পেছনে যান'}
                            </button>
                        ) : (
                            <button type="button" onClick={() => router.back()} className="inline-flex h-11 items-center rounded-lg px-6 font-medium text-muted-foreground transition-colors hover:bg-muted">
                                {language === 'en' ? 'Cancel' : 'বাতিল'}
                            </button>
                        )}

                        {step < 5 ? (
                            <button type="button" onClick={handleNext} className="inline-flex h-11 items-center rounded-lg bg-primary px-8 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                                {language === 'en' ? 'Next' : 'পরবর্তী'}
                            </button>
                        ) : (
                            <button type="submit" disabled={loading} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-8 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                {t.citizenApply.submit}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
