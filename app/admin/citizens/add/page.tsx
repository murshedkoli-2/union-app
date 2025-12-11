'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatEnglishInput, formatBanglaInput } from '@/lib/utils';

import { useLanguage } from '@/components/providers/LanguageContext';

export default function AddCitizen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        nameBn: '',
        fatherName: '',
        fatherNameBn: '',
        motherName: '',
        motherNameBn: '',
        spouseName: '', // Optional
        dob: '',
        nid: '',
        phone: '',
        gender: 'Male',
        religion: 'Islam',
        address: {
            village: '',
            postOffice: '',
            ward: '',
            union: 'Kalikaccha', // Default
            upazila: 'Sarail', // Default
            district: 'Brahmanbaria' // Default
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Apply Language Validation
        if (name.includes('Bn') || name.includes('village') || name.includes('union') || name.includes('upazila') || name.includes('district') || name.includes('postOffice')) {
            // Assuming default address fields in form are Bangla or mixed, but usually specific Bn fields are strict.
            // Let's be specific to fields clearly labeled/named as Bangla.
            // Actually, for address fields like village/postOffice in this specific form, they might be mixed unless specified.
            // Looking at the form fields:
            // nameBn, fatherNameBn, motherNameBn are clearly Bangla.
            // name, fatherName, motherName are clearly English.
            // Address fields in this form seem generic "address.village" etc. 
            // If the user wants strictness "whole app", I should check if there are separate En/Bn address fields. 
            // In this specific file, address is structured as shared fields.
            // However, looking at the code, there are NO separate addressBn fields in formData.
            // So I will only enforce on the explicit 'Bn' suffix fields and 'name' family fields.
        }

        if (name === 'nameBn' || name === 'fatherNameBn' || name === 'motherNameBn') {
            formattedValue = formatBanglaInput(value);
        } else if (name === 'name' || name === 'fatherName' || name === 'motherName') {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/citizens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    status: 'approved'
                })
            });

            if (res.ok) {
                toast.success(t.citizens.form.success);
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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{t.citizens.form.title}</h1>
                    <p className="text-muted-foreground mt-1">{t.citizens.subtitle}</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">{t.citizens.form.personalInfo}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.citizens.form.nameEn}</label>
                                <input name="name" required value={formData.name} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Abdur Rahman" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.citizens.form.nameBn}</label>
                                <input name="nameBn" required value={formData.nameBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="উদাহরণ: আবদুর রহমান" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.citizens.form.dob}</label>
                                <input name="dob" type="date" required value={formData.dob} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.citizens.form.fatherName} ({t.common.english})</label>
                                <input name="fatherName" required value={formData.fatherName} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.citizens.form.fatherName} ({t.common.bangla})</label>
                                <input name="fatherNameBn" required value={formData.fatherNameBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.citizens.form.motherName} ({t.common.english})</label>
                                <input name="motherName" required value={formData.motherName} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.citizens.form.motherName} ({t.common.bangla})</label>
                                <input name="motherNameBn" required value={formData.motherNameBn} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Spouse Name (Optional)</label>
                                <input name="spouseName" value={formData.spouseName} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
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

                    {/* Identity & Contact */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Identity & Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.citizens.form.nid}</label>
                                <input name="nid" required value={formData.nid} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="10 or 17 digit number" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.citizens.form.phone}</label>
                                <input name="phone" required value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="017..." />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">{t.citizens.form.addressInfo}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.citizens.form.village}</label>
                                <input name="address.village" required value={formData.address.village} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.citizens.form.postOffice}</label>
                                <input name="address.postOffice" required value={formData.address.postOffice} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.citizens.form.ward}</label>
                                <select name="address.ward" required value={formData.address.ward} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                                    <option value="">Select Ward</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>Ward {n}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Union</label>
                                <input name="address.union" required value={formData.address.union} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" readOnly />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={() => router.back()} className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium mr-4">Cancel</button>
                        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {t.citizens.form.submit}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
