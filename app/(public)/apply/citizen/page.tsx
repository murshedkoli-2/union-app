'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { VILLAGES, POST_OFFICES } from '@/lib/constants';
import { toast } from 'sonner';
import { useLanguage } from '@/components/providers/LanguageContext';

export default function PublicCitizenApply() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        nameBn: '',
        fatherName: '',
        fatherNameBn: '',
        motherName: '',
        motherNameBn: '',
        nid: '',
        phone: '',
        dob: '',
        gender: 'Male',
        holdingNumber: '',
        address: {
            village: '',
            postOffice: '',
            ward: '',
            district: 'Brahmanbaria',
            upazila: 'Sarail',
            union: 'Kalikaccha'
        }
    });

    const wards = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: { ...prev.address, [addressField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/public/apply/citizen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit application');
            }

            setSuccess(true);
            toast.success(t.citizenApply.successTitle);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <UserPlus size={40} />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{t.citizenApply.successTitle}</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    {t.citizenApply.successDesc}
                </p>
                <Link href="/" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    {t.citizenApply.returnHome}
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{t.citizenApply.title}</h1>
                <p className="text-muted-foreground mt-2">{t.citizenApply.subtitle}</p>
            </div>

            <div className="rounded-xl border bg-card p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">{t.citizenApply.personalInfo}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.nameEn} <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t.citizenApply.placeholders.nameEn}
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.nameBn} <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="nameBn"
                                    value={formData.nameBn}
                                    onChange={handleChange}
                                    placeholder={t.citizenApply.placeholders.nameBn}
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.fatherNameEn} <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="fatherName"
                                    value={formData.fatherName}
                                    onChange={handleChange}
                                    placeholder={t.citizenApply.placeholders.fatherEn}
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.fatherNameBn} <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="fatherNameBn"
                                    value={formData.fatherNameBn}
                                    onChange={handleChange}
                                    placeholder={t.citizenApply.placeholders.fatherBn}
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.motherNameEn} <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="motherName"
                                    value={formData.motherName}
                                    onChange={handleChange}
                                    placeholder={t.citizenApply.placeholders.motherEn}
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.motherNameBn} <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="motherNameBn"
                                    value={formData.motherNameBn}
                                    onChange={handleChange}
                                    placeholder={t.citizenApply.placeholders.motherBn}
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.holdingNumber} <span className="text-muted-foreground text-xs font-normal">{t.citizenApply.holdingOptional}</span></label>
                                <input
                                    name="holdingNumber"
                                    value={formData.holdingNumber}
                                    onChange={handleChange}
                                    placeholder={t.citizenApply.placeholders.holding}
                                    className="flex h-10 w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                                />
                                <p className="text-[10px] text-muted-foreground">{t.citizenApply.holdingDesc}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.nid} <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="nid"
                                    value={formData.nid}
                                    onChange={handleChange}
                                    placeholder={t.citizenApply.placeholders.nid}
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.phone} <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder={t.citizenApply.placeholders.phone}
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.dob} <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.gender} <span className="text-destructive">*</span></label>
                                <div className="relative">
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="flex h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                        <option value="Male">{t.citizenApply.m}</option>
                                        <option value="Female">{t.citizenApply.f}</option>
                                        <option value="Other">{t.citizenApply.o}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">{t.citizenApply.addressInfo}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.district}</label>
                                <input
                                    disabled
                                    value={formData.address.district}
                                    className="flex h-10 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm opacity-70 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.upazila}</label>
                                <input
                                    disabled
                                    value={formData.address.upazila}
                                    className="flex h-10 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm opacity-70 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.union}</label>
                                <input
                                    disabled
                                    value={formData.address.union}
                                    className="flex h-10 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm opacity-70 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.village} <span className="text-destructive">*</span></label>
                                <div className="relative">
                                    <select
                                        name="address.village"
                                        value={formData.address.village}
                                        onChange={handleChange}
                                        className="flex h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        required
                                    >
                                        <option value="">{t.citizenApply.selectVillage}</option>
                                        {VILLAGES.map(v => <option key={v.en} value={v.en}>{v.en} ({v.bn})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.postOffice} <span className="text-destructive">*</span></label>
                                <div className="relative">
                                    <select
                                        name="address.postOffice"
                                        value={formData.address.postOffice}
                                        onChange={handleChange}
                                        className="flex h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        required
                                    >
                                        <option value="">{t.citizenApply.selectPostOffice}</option>
                                        {POST_OFFICES.map(p => <option key={p.en} value={p.en}>{p.en} ({p.bn})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t.citizenApply.ward} <span className="text-destructive">*</span></label>
                                <div className="relative">
                                    <select
                                        name="address.ward"
                                        value={formData.address.ward}
                                        onChange={handleChange}
                                        className="flex h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        required
                                    >
                                        <option value="">{t.citizenApply.selectWard}</option>
                                        {wards.map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3">
                        <Link
                            href="/"
                            className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-lg border border-border bg-background px-8 text-sm font-medium hover:bg-muted transition-colors"
                        >
                            {t.citizenApply.cancel}
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                    {t.citizenApply.submitting}
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} className="mr-2" />
                                    {t.citizenApply.submit}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
