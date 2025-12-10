'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { VILLAGES, POST_OFFICES } from '@/lib/constants';
import { toast } from 'sonner';

export default function PublicCitizenApply() {
    const router = useRouter();
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
            // We need a public API endpoint for this. 
            // Currently /api/citizens is protected or will be? 
            // We should use a specific public endpoint or update the existing one to handle 'pending' status for public requests.
            // For now, let's assume /api/citizens allows it but sets status to pending (we need to implement that logic).
            // Actually, better to separate: /api/public/apply/citizen

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
            toast.success("Application submitted successfully!");
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
                <h1 className="text-3xl font-bold text-foreground mb-4">Application Submitted!</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    Your citizen registration application has been received. Please wait for admin approval. You will be notified once approved.
                </p>
                <Link href="/" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Return to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Citizen Registration</h1>
                <p className="text-muted-foreground mt-2">Fill out the form below to register as a citizen of Kalikaccha Union.</p>
            </div>

            <div className="rounded-xl border bg-card p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Personal Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Full Name (English) <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Abdur Rahman"
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Full Name (Bangla) <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="nameBn"
                                    value={formData.nameBn}
                                    onChange={handleChange}
                                    placeholder="উদাহরণ: আবদুর রহমান"
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Father's Name (English) <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="fatherName"
                                    value={formData.fatherName}
                                    onChange={handleChange}
                                    placeholder="Father's Name"
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Father's Name (Bangla) <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="fatherNameBn"
                                    value={formData.fatherNameBn}
                                    onChange={handleChange}
                                    placeholder="বাবার নাম"
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Mother's Name (English) <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="motherName"
                                    value={formData.motherName}
                                    onChange={handleChange}
                                    placeholder="Mother's Name"
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Mother's Name (Bangla) <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="motherNameBn"
                                    value={formData.motherNameBn}
                                    onChange={handleChange}
                                    placeholder="মায়ের নাম"
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Holding Number <span className="text-muted-foreground text-xs font-normal">(Optional for Family Tax)</span></label>
                                <input
                                    name="holdingNumber"
                                    value={formData.holdingNumber}
                                    onChange={handleChange}
                                    placeholder="e.g. 123/A"
                                    className="flex h-10 w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                                />
                                <p className="text-[10px] text-muted-foreground">Used to group family members for shared tax payments.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">NID Number <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="nid"
                                    value={formData.nid}
                                    onChange={handleChange}
                                    placeholder="National ID Number"
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Phone Number <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="017..."
                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Date of Birth <span className="text-destructive">*</span></label>
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
                                <label className="text-sm font-medium text-foreground">Gender <span className="text-destructive">*</span></label>
                                <div className="relative">
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="flex h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Address Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">District</label>
                                <input
                                    disabled
                                    value={formData.address.district}
                                    className="flex h-10 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm opacity-70 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Upazila</label>
                                <input
                                    disabled
                                    value={formData.address.upazila}
                                    className="flex h-10 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm opacity-70 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Union</label>
                                <input
                                    disabled
                                    value={formData.address.union}
                                    className="flex h-10 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm opacity-70 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Village <span className="text-destructive">*</span></label>
                                <div className="relative">
                                    <select
                                        name="address.village"
                                        value={formData.address.village}
                                        onChange={handleChange}
                                        className="flex h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        required
                                    >
                                        <option value="">Select Village</option>
                                        {VILLAGES.map(v => <option key={v.en} value={v.en}>{v.en} ({v.bn})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Post Office <span className="text-destructive">*</span></label>
                                <div className="relative">
                                    <select
                                        name="address.postOffice"
                                        value={formData.address.postOffice}
                                        onChange={handleChange}
                                        className="flex h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        required
                                    >
                                        <option value="">Select Post Office</option>
                                        {POST_OFFICES.map(p => <option key={p.en} value={p.en}>{p.en} ({p.bn})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Ward No <span className="text-destructive">*</span></label>
                                <div className="relative">
                                    <select
                                        name="address.ward"
                                        value={formData.address.ward}
                                        onChange={handleChange}
                                        className="flex h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        required
                                    >
                                        <option value="">Select Ward</option>
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
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} className="mr-2" />
                                    Submit Application
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
