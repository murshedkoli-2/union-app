'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useLanguage } from '@/components/providers/LanguageContext';

export default function PublicCertificateApply() {
    const router = useRouter();
    const { t } = useLanguage();
    const [step, setStep] = useState(1); // 1: Identify, 2: Select Type & Details
    const [loading, setLoading] = useState(false);
    const [identifying, setIdentifying] = useState(false);
    const [nid, setNid] = useState('');
    const [dob, setDob] = useState(''); // Optional verification
    const [citizen, setCitizen] = useState<any>(null);
    const [certificateTypes, setCertificateTypes] = useState<any[]>([]);

    // Non-resident / Manual Applicant State
    const [isNonResident, setIsNonResident] = useState(false);
    const [applicantName, setApplicantName] = useState('');
    const [applicantPhone, setApplicantPhone] = useState('');
    const [applicantAddress, setApplicantAddress] = useState('');

    // Form Data for Step 2
    const [selectedType, setSelectedType] = useState('');
    const [details, setDetails] = useState(''); // Additional text details

    // Trade License Specific State
    const [businessName, setBusinessName] = useState('');
    const [businessAddress, setBusinessAddress] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [businessCapital, setBusinessCapital] = useState('');

    // Warish Specific State
    const [deceasedName, setDeceasedName] = useState('');
    const [deceasedFatherName, setDeceasedFatherName] = useState('');
    const [deceasedMotherName, setDeceasedMotherName] = useState('');
    const [warishList, setWarishList] = useState<{ name: string; relation: string; nid: string; dob: string }[]>([]);
    const [newWarishName, setNewWarishName] = useState('');
    const [newWarishRelation, setNewWarishRelation] = useState('');
    const [newWarishNid, setNewWarishNid] = useState('');
    const [newWarishDob, setNewWarishDob] = useState('');

    // Fetch types on mount
    useEffect(() => {
        fetch('/api/certificate-types')
            .then(res => res.json())
            .then(data => setCertificateTypes(data || []))
            .catch(err => console.error(err));
    }, []);

    const handleIdentify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIdentifying(true);
        try {
            const res = await fetch('/api/public/identify-citizen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nid, dob })
            });

            if (!res.ok) {
                if (res.status === 404) throw new Error('Citizen not found. Please register first.');
                throw new Error('Verification failed');
            }

            const data = await res.json();
            setCitizen(data);
            setStep(2);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIdentifying(false);
        }
    };

    const addWarish = () => {
        if (!newWarishName || !newWarishRelation) return;
        setWarishList([...warishList, {
            name: newWarishName,
            relation: newWarishRelation,
            nid: newWarishNid,
            dob: newWarishDob
        }]);
        setNewWarishName('');
        setNewWarishRelation('');
        setNewWarishNid('');
        setNewWarishDob('');
    };

    const removeWarish = (index: number) => {
        setWarishList(warishList.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const isWarish = selectedType === 'Warish Certificate' || selectedType === 'Succession Certificate';

            const res = await fetch('/api/public/apply/certificate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    citizenId: isNonResident ? null : citizen._id,
                    type: selectedType,
                    details: {
                        requestNote: details,
                        ...(isNonResident ? {
                            applicantName,
                            applicantPhone,
                            applicantAddress
                        } : {}),
                        ...(selectedType === 'Trade License' ? {
                            businessName,
                            businessAddress,
                            businessType,
                            businessCapital
                        } : {}),
                        ...(isWarish ? {
                            deceasedName,
                            deceasedFatherName,
                            deceasedMotherName,
                            warishList
                        } : {})
                    }
                })
            });

            if (!res.ok) throw new Error('Application failed');

            setStep(3); // Success state
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{t.certificateApply.successTitle}</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    {t.certificateApply.successDesc}
                </p>
                <Link href="/" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    {t.certificateApply.returnHome}
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl animate-fade-in">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{t.certificateApply.title}</h1>
                <p className="text-muted-foreground mt-2">{t.certificateApply.subtitle}</p>
            </div>

            <div className="rounded-xl border bg-card p-8 shadow-sm">
                {step === 1 && (
                    <div className="space-y-6">
                        {/* Mode Selection */}
                        <div className="flex gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => { setIsNonResident(false); setStep(1); }}
                                className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-all ${!isNonResident ? 'bg-primary text-white border-primary' : 'bg-background hover:bg-muted/50 border-border text-muted-foreground'}`}
                            >
                                {t.certificateApply?.verifyBtn || "Registered Citizen"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsNonResident(true)}
                                className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-all ${isNonResident ? 'bg-primary text-white border-primary' : 'bg-background hover:bg-muted/50 border-border text-muted-foreground'}`}
                            >
                                {t.certificateApply?.nonResidentBtn || "Non-Resident / Trade License"}
                            </button>
                        </div>

                        {!isNonResident ? (
                            <form onSubmit={handleIdentify} className="space-y-6">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex gap-4">
                                    <AlertCircle className="text-primary shrink-0" />
                                    <p className="text-sm text-muted-foreground">
                                        {t.certificateApply.alert}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.certificateApply.nid}</label>
                                    <input
                                        required
                                        value={nid}
                                        onChange={e => setNid(e.target.value)}
                                        className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        placeholder={t.certificateApply.nidPlaceholder}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.certificateApply.dob}</label>
                                    <input
                                        type="date"
                                        required
                                        value={dob}
                                        onChange={e => setDob(e.target.value)}
                                        className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={identifying}
                                    className="w-full h-11 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                                >
                                    {identifying ? <Loader2 size={18} className="animate-spin" /> : t.certificateApply.verifyBtn}
                                </button>
                                <div className="text-center">
                                    <Link href="/apply/citizen" className="text-sm text-primary hover:underline">
                                        {t.certificateApply.registerLink}
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6 animate-fade-in">
                                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 text-sm">
                                    You are applying as a non-resident or business owner. Please provide your contact details below. These details will be printed on your certificate.
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Applicant Name (আবেদনকারীর নাম)</label>
                                    <input
                                        required
                                        value={applicantName}
                                        onChange={e => setApplicantName(e.target.value)}
                                        className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone Number (মোবাইল নম্বর)</label>
                                    <input
                                        required
                                        value={applicantPhone}
                                        onChange={e => setApplicantPhone(e.target.value)}
                                        className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="017xxxxxxxx"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Applicant Address (ঠিকানা)</label>
                                    <textarea
                                        required
                                        value={applicantAddress}
                                        onChange={e => setApplicantAddress(e.target.value)}
                                        className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
                                        placeholder="Full Address"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full h-11 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                                >
                                    Proceed to Next Step
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                        {!isNonResident && citizen ? (
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                                <div>
                                    <div className="font-semibold">{citizen.name}</div>
                                    <div className="text-sm text-muted-foreground">NID: {citizen.nid}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {t.certificateApply.change}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                                <div>
                                    <div className="font-semibold">{applicantName}</div>
                                    <div className="text-sm text-muted-foreground">{applicantPhone}</div>
                                    <div className="text-xs text-muted-foreground opacity-70">Non-Resident Applicant</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {t.certificateApply.change}
                                </button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t.certificateApply.typeLabel}</label>
                            <select
                                required
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value)}
                                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="">{t.certificateApply.selectType}</option>
                                {certificateTypes.map(t => (
                                    <option key={t._id} value={t.name}>{t.name} - ৳{t.fee}</option>
                                ))}
                            </select>
                        </div>

                        {selectedType === 'Trade License' && (
                            <div className="space-y-4 border-l-2 border-primary/20 pl-4 py-2">
                                <h3 className="font-medium text-sm text-primary">Business Information</h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Business Name (ব্যবসা প্রতিষ্ঠানের নাম)</label>
                                    <input
                                        required
                                        value={businessName}
                                        onChange={e => setBusinessName(e.target.value)}
                                        className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Enter business name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Business Address (ব্যবসা প্রতিষ্ঠানের ঠিকানা)</label>
                                    <input
                                        required
                                        value={businessAddress}
                                        onChange={e => setBusinessAddress(e.target.value)}
                                        className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Enter business address"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Business Type (ব্যবসার ধরণ)</label>
                                        <input
                                            required
                                            value={businessType}
                                            onChange={e => setBusinessType(e.target.value)}
                                            className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="e.g. Proprietorship, Limited Company"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Business Capital (ব্যবসার মূলধন)</label>
                                        <input
                                            required
                                            type="number"
                                            value={businessCapital}
                                            onChange={e => setBusinessCapital(e.target.value)}
                                            className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="Capital amount (BDT)"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {(selectedType === 'Warish Certificate' || selectedType === 'Succession Certificate') && (
                            <div className="space-y-6 border-l-2 border-primary/20 pl-4 py-2 animate-fade-in">
                                <h3 className="font-medium text-sm text-primary">Deceased Information (মৃত ব্যক্তির তথ্য)</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Deceased Name (মৃত ব্যক্তির নাম)</label>
                                        <input
                                            required
                                            value={deceasedName}
                                            onChange={e => setDeceasedName(e.target.value)}
                                            className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="Name of the deceased person"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Father's Name (পিতার নাম)</label>
                                            <input
                                                required
                                                value={deceasedFatherName}
                                                onChange={e => setDeceasedFatherName(e.target.value)}
                                                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                placeholder="Father's name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Mother's Name (মাতার নাম)</label>
                                            <input
                                                required
                                                value={deceasedMotherName}
                                                onChange={e => setDeceasedMotherName(e.target.value)}
                                                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                placeholder="Mother's name"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-sm text-primary">Warish List (উত্তরাধিকারীর তালিকা)</h3>
                                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                            Total: {warishList.length}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-muted/30 p-4 rounded-lg">
                                        <div className="col-span-12 md:col-span-3 space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Name (উত্তরাধিকারীর নাম)</label>
                                            <input
                                                value={newWarishName}
                                                onChange={e => setNewWarishName(e.target.value)}
                                                className="flex h-9 w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                                placeholder="Enter name"
                                            />
                                        </div>
                                        <div className="col-span-12 md:col-span-3 space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">NID (এনআইডি)</label>
                                            <input
                                                value={newWarishNid}
                                                onChange={e => setNewWarishNid(e.target.value)}
                                                className="flex h-9 w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                                placeholder="NID Number"
                                            />
                                        </div>
                                        <div className="col-span-12 md:col-span-2 space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">DOB (জন্ম তারিখ)</label>
                                            <input
                                                type="date"
                                                value={newWarishDob}
                                                onChange={e => setNewWarishDob(e.target.value)}
                                                className="flex h-9 w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div className="col-span-12 md:col-span-2 space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Relation (সম্পর্ক)</label>
                                            <select
                                                value={newWarishRelation}
                                                onChange={e => setNewWarishRelation(e.target.value)}
                                                className="flex h-9 w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                            >
                                                <option value="">Select</option>
                                                <option value="Wife">Wife (স্ত্রী)</option>
                                                <option value="Husband">Husband (স্বামী)</option>
                                                <option value="Son">Son (পুত্র)</option>
                                                <option value="Daughter">Daughter (কন্যা)</option>
                                                <option value="Father">Father (পিতা)</option>
                                                <option value="Mother">Mother (মাতা)</option>
                                                <option value="Brother">Brother (ভাই)</option>
                                                <option value="Sister">Sister (বোন)</option>
                                            </select>
                                        </div>
                                        <div className="col-span-12 md:col-span-2">
                                            <button
                                                type="button"
                                                onClick={addWarish}
                                                disabled={!newWarishName || !newWarishRelation}
                                                className="flex h-9 w-full items-center justify-center rounded bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    {warishList.length > 0 ? (
                                        <div className="border border-border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">NID</th>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">DOB</th>
                                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Relation</th>
                                                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {warishList.map((w, idx) => (
                                                        <tr key={idx} className="bg-background">
                                                            <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                                                            <td className="px-3 py-2">{w.name}</td>
                                                            <td className="px-3 py-2 text-xs">{w.nid}</td>
                                                            <td className="px-3 py-2 text-xs">{w.dob}</td>
                                                            <td className="px-3 py-2">{w.relation}</td>
                                                            <td className="px-3 py-2 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeWarish(idx)}
                                                                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-center text-sm text-muted-foreground py-4 border border-dashed border-border rounded-lg">
                                            No heirs added yet. Please add heirs from the form above.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t.certificateApply.detailsLabel}</label>
                            <textarea
                                value={details}
                                onChange={e => setDetails(e.target.value)}
                                className="flex min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder={t.certificateApply.detailsPlaceholder}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : t.certificateApply.submitBtn}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
