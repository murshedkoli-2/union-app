'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatEnglishInput, formatBanglaInput } from '@/lib/utils';

import { useLanguage } from '@/components/providers/LanguageContext';

export default function AddCitizen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
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
        const savedData = sessionStorage.getItem('citizen_registration_form');
        const savedStep = sessionStorage.getItem('citizen_registration_step');

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
            } catch (e) {
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
            sessionStorage.setItem('citizen_registration_form', JSON.stringify(formData));
            sessionStorage.setItem('citizen_registration_step', step.toString());
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
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: formattedValue
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric
        if (value.length > 8) value = value.slice(0, 8); // Limit to 8 digits

        // Format as DD/MM/YYYY
        if (value.length > 4) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        } else if (value.length > 2) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }

        setFormData(prev => ({ ...prev, dob: value }));
    };

    const validateStep = (currentStep: number) => {
        if (currentStep === 1) {
            // Personal English
            if (!formData.name || !formData.fatherName || !formData.motherName || !formData.dob) {
                toast.error('Please fill in all required English fields');
                return false;
            }
            // Date Validation regex for DD/MM/YYYY
            const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
            if (!dateRegex.test(formData.dob)) {
                toast.error('Date of Birth must be in DD/MM/YYYY format');
                return false;
            }
        } else if (currentStep === 2) {
            // Personal Bangla
            if (!formData.nameBn || !formData.fatherNameBn || !formData.motherNameBn) {
                toast.error('Please fill in all required Bangla fields');
                return false;
            }
        } else if (currentStep === 3) {
            // Identity
            if (!formData.nid || !formData.phone) {
                toast.error('Please fill in NID and Phone');
                return false;
            }
        } else if (currentStep === 4) {
            // Address English
            if (!formData.address.village || !formData.address.postOffice || !formData.address.ward) {
                toast.error('Please fill in all required English address fields');
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
            toast.error('Please fill in all required Bangla address fields');
            return;
        }

        setLoading(true);

        try {
            // Convert DD/MM/YYYY to YYYY-MM-DD
            const [day, month, year] = formData.dob.split('/');
            const isoDob = `${year}-${month}-${day}`;

            const res = await fetch('/api/citizens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    dob: isoDob,
                    status: 'approved'
                })
            });

            if (res.ok) {
                toast.success(t.citizens.form.success);
                // Clear Storage
                sessionStorage.removeItem('citizen_registration_form');
                sessionStorage.removeItem('citizen_registration_step');
                router.push('/admin/citizens');
            } else {
                const data = await res.json();
                toast.error(data.error || t.citizens.form.error);
            }
        } catch (error) {
            toast.error(t.citizens.form.error);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return null; // Prevent hydration mismatch or flash

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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{t.citizens.form.title}</h1>
                    <p className="text-muted-foreground mt-1">{t.citizens.subtitle} - Step {step} of 5</p>
                </div>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-4 border-b border-border pb-6 overflow-x-auto">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-muted'}`}>1</div>
                    <span className="font-medium whitespace-nowrap">English Info</span>
                </div>
                <div className="h-px bg-border flex-1 min-w-[20px]" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-muted'}`}>2</div>
                    <span className="font-medium whitespace-nowrap">Bangla Info</span>
                </div>
                <div className="h-px bg-border flex-1 min-w-[20px]" />
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary/10' : 'border-muted'}`}>3</div>
                    <span className="font-medium whitespace-nowrap">Identity</span>
                </div>
                <div className="h-px bg-border flex-1 min-w-[20px]" />
                <div className={`flex items-center gap-2 ${step >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 4 ? 'border-primary bg-primary/10' : 'border-muted'}`}>4</div>
                    <span className="font-medium whitespace-nowrap">Address (En)</span>
                </div>
                <div className="h-px bg-border flex-1 min-w-[20px]" />
                <div className={`flex items-center gap-2 ${step >= 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 5 ? 'border-primary bg-primary/10' : 'border-muted'}`}>5</div>
                    <span className="font-medium whitespace-nowrap">Address (Bn)</span>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm min-h-[500px]">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Step 1: Personal Info (English) */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold border-b border-border pb-2">{t.citizens.form.personalInfo} (English)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.nameEn} <span className="text-red-500">*</span></label>
                                    <input name="name" required value={formData.name} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Abdur Rahman" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.fatherName} ({t.common.english}) <span className="text-red-500">*</span></label>
                                    <input name="fatherName" required value={formData.fatherName} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Abdul Karim" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.motherName} ({t.common.english}) <span className="text-red-500">*</span></label>
                                    <input name="motherName" required value={formData.motherName} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Fatema Begum" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.dob} <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <select
                                            value={formData.dob.split('/')[0] || ''}
                                            onChange={(e) => {
                                                const day = e.target.value;
                                                const [_, month = '', year = ''] = formData.dob.split('/');
                                                setFormData(prev => ({ ...prev, dob: `${day}/${month}/${year}` }));
                                            }}
                                            className="w-1/3 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        >
                                            <option value="">Day</option>
                                            {Array.from({ length: 31 }, (_, i) => {
                                                const d = (i + 1).toString().padStart(2, '0');
                                                return <option key={d} value={d}>{d}</option>;
                                            })}
                                        </select>
                                        <select
                                            value={formData.dob.split('/')[1] || ''}
                                            onChange={(e) => {
                                                const month = e.target.value;
                                                const [day = '', _, year = ''] = formData.dob.split('/');
                                                setFormData(prev => ({ ...prev, dob: `${day}/${month}/${year}` }));
                                            }}
                                            className="w-1/3 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        >
                                            <option value="">Month</option>
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
                                                const mv = (i + 1).toString().padStart(2, '0');
                                                return <option key={mv} value={mv}>{m}</option>;
                                            })}
                                        </select>
                                        <select
                                            value={formData.dob.split('/')[2] || ''}
                                            onChange={(e) => {
                                                const year = e.target.value;
                                                const [day = '', month = '', _] = formData.dob.split('/');
                                                setFormData(prev => ({ ...prev, dob: `${day}/${month}/${year}` }));
                                            }}
                                            className="w-1/3 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        >
                                            <option value="">Year</option>
                                            {Array.from({ length: 120 }, (_, i) => {
                                                const y = (new Date().getFullYear() - i).toString();
                                                return <option key={y} value={y}>{y}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Spouse Name (Optional)</label>
                                    <input name="spouseName" value={formData.spouseName} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Rina Begum" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.gender}</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Religion</label>
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
                            <h3 className="text-lg font-semibold border-b border-border pb-2">{t.citizens.form.personalInfo} (Bangla)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.nameBn} <span className="text-red-500">*</span></label>
                                    <input name="nameBn" required value={formData.nameBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="উদাহরণ: আবদুর রহমান" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.fatherName} ({t.common.bangla}) <span className="text-red-500">*</span></label>
                                    <input name="fatherNameBn" required value={formData.fatherNameBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="উদাহরণ: আব্দুল করিম" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.motherName} ({t.common.bangla}) <span className="text-red-500">*</span></label>
                                    <input name="motherNameBn" required value={formData.motherNameBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="উদাহরণ: ফাতেমা বেগম" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Identity & Contact */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold border-b border-border pb-2">Identity & Contact</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.nid} <span className="text-red-500">*</span></label>
                                    <input name="nid" required value={formData.nid} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="10 or 17 digit number" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.phone} <span className="text-red-500">*</span></label>
                                    <input name="phone" required value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="017..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Address (English) */}
                    {step === 4 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold border-b border-border pb-2">{t.citizens.form.addressInfo} (English)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.village} [English] <span className="text-red-500">*</span></label>
                                    <input name="address.village" required value={formData.address.village} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Kalikaccha" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.postOffice} [English] <span className="text-red-500">*</span></label>
                                    <input name="address.postOffice" required value={formData.address.postOffice} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Kalikaccha" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.ward} <span className="text-red-500">*</span></label>
                                    <select name="address.ward" required value={formData.address.ward} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                                        <option value="">Select Ward</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>Ward {n}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Union [English]</label>
                                    <input name="address.union" required value={formData.address.union} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Upazila [English]</label>
                                    <input name="address.upazila" required value={formData.address.upazila} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">District [English]</label>
                                    <input name="address.district" required value={formData.address.district} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Address (Bangla) */}
                    {step === 5 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-semibold border-b border-border pb-2">{t.citizens.form.addressInfo} (Bangla)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.village} [Bangla] <span className="text-red-500">*</span></label>
                                    <input name="address.villageBn" required value={formData.address.villageBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="উদাহরণ: কালিকচ্ছ" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.citizens.form.postOffice} [Bangla] <span className="text-red-500">*</span></label>
                                    <input name="address.postOfficeBn" required value={formData.address.postOfficeBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="উদাহরণ: কালিকচ্ছ" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Union [Bangla]</label>
                                    <input name="address.unionBn" required value={formData.address.unionBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Upazila [Bangla]</label>
                                    <input name="address.upazilaBn" required value={formData.address.upazilaBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">District [Bangla]</label>
                                    <input name="address.districtBn" required value={formData.address.districtBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t border-border mt-8">
                        {step > 1 ? (
                            <button type="button" onClick={handleBack} className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors">
                                Back
                            </button>
                        ) : (
                            <button type="button" onClick={() => router.back()} className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors">
                                Cancel
                            </button>
                        )}

                        {step < 5 ? (
                            <button type="button" onClick={handleNext} className="px-8 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                Next
                            </button>
                        ) : (
                            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                {t.citizens.form.submit}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
