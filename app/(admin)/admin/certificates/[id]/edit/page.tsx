'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/providers/LanguageContext';
import { formatEnglishInput, formatBanglaInput } from '@/lib/utils';

interface WarishMember {
    nameEn: string;
    nameBn: string;
    relation: string;
    nid: string;
    dob: string;
}

interface Certificate {
    _id: string;
    certificateNumber: string;
    type: string;
    issueDate: string;
    status: string;
    citizenId: { name: string; nameBn: string; nid: string } | null;
    details?: Record<string, unknown>;
}

const DISABILITY_OPTIONS = [
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
];

const RELATION_OPTIONS = ['Self', 'Wife', 'Husband', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister'];

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

export default function EditCertificate({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { language } = useLanguage();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [certificate, setCertificate] = useState<Certificate | null>(null);

    // Basic fields
    const [issueDate, setIssueDate] = useState('');
    const [status, setStatus] = useState('');
    const [bodyTextEn, setBodyTextEn] = useState('');
    const [bodyTextBn, setBodyTextBn] = useState('');

    // Trade license
    const [businessInfo, setBusinessInfo] = useState({
        businessName: '', businessAddress: '', businessType: '', businessCapital: ''
    });

    // Warish / family
    const [deceasedInfo, setDeceasedInfo] = useState({
        nameEn: '', nameBn: '', fatherNameEn: '', fatherNameBn: '',
        motherNameEn: '', motherNameBn: '', addressEn: '', addressBn: ''
    });
    const [warishList, setWarishList] = useState<WarishMember[]>([]);
    const [newWarish, setNewWarish] = useState<WarishMember>({ nameEn: '', nameBn: '', relation: '', nid: '', dob: '' });

    // Disability
    const [disabilityTypes, setDisabilityTypes] = useState<string[]>([]);

    useEffect(() => {
        fetch(`/api/certificates/${id}`)
            .then(r => r.json())
            .then((cert: Certificate) => {
                setCertificate(cert);
                setIssueDate(cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '');
                setStatus(cert.status);

                const d = cert.details || {};
                setBodyTextEn((d.bodyTextEn as string) || '');
                setBodyTextBn((d.bodyTextBn as string) || '');

                setBusinessInfo({
                    businessName: (d.businessName as string) || '',
                    businessAddress: (d.businessAddress as string) || '',
                    businessType: (d.businessType as string) || '',
                    businessCapital: String(d.businessCapital ?? ''),
                });

                setDeceasedInfo({
                    nameEn: (d.deceasedNameEn as string) || '',
                    nameBn: (d.deceasedNameBn as string) || '',
                    fatherNameEn: (d.deceasedFatherNameEn as string) || '',
                    fatherNameBn: (d.deceasedFatherNameBn as string) || '',
                    motherNameEn: (d.deceasedMotherNameEn as string) || '',
                    motherNameBn: (d.deceasedMotherNameBn as string) || '',
                    addressEn: (d.deceasedAddressEn as string) || '',
                    addressBn: (d.deceasedAddressBn as string) || '',
                });

                if (Array.isArray(d.warishList)) {
                    setWarishList(
                        d.warishList.map(item => {
                            const member = item as Partial<WarishMember> & { name?: string };
                            return {
                                nameEn: member.nameEn || member.name || '',
                                nameBn: member.nameBn || '',
                                relation: member.relation || '',
                                nid: member.nid || '',
                                dob: member.dob || '',
                            };
                        })
                    );
                }

                // Reconstruct disability checkbox state from stored EN string
                const storedEn = (d.disabilityType as string) || '';
                if (storedEn) {
                    const enParts = storedEn.split(', ');
                    setDisabilityTypes(
                        DISABILITY_OPTIONS
                            .filter(opt => enParts.includes(opt.en))
                            .map(opt => `${opt.bn} (${opt.en})`)
                    );
                }
            })
            .catch(() => toast.error(language === 'en' ? 'Failed to load certificate' : 'সনদ লোড করা যায়নি'))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Type detection from stored Bangla type name
    const type = certificate?.type || '';
    const isWarish = type.includes('ওয়ারিশ') || type.includes('উত্তরাধিকার') || type === 'Warish' || type.includes('Warish') || type === 'Heirship' || type.includes('Heirship');
    const isFamily = type.includes('পারিবারিক') || type === 'Family' || type === 'Family Certificate';
    const isTrade = type.includes('ট্রেড') || type === 'Trade License' || type === 'Trade';
    const isDisability = type.includes('প্রতিবন্ধী') || type === 'Disability' || type.includes('Disability');
    const isWarishOrFamily = isWarish || isFamily;

    const addWarish = () => {
        if (!newWarish.nameEn || !newWarish.relation || !newWarish.dob) return;
        setWarishList(prev => [...prev, newWarish]);
        setNewWarish({ nameEn: '', nameBn: '', relation: '', nid: '', dob: '' });
    };

    const removeWarish = (index: number) => {
        setWarishList(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const details: Record<string, unknown> = {
                ...certificate?.details,
                ...(bodyTextEn ? { bodyTextEn } : {}),
                ...(bodyTextBn ? { bodyTextBn } : {}),
                ...(isTrade ? {
                    businessName: businessInfo.businessName,
                    businessAddress: businessInfo.businessAddress,
                    businessType: businessInfo.businessType,
                    businessCapital: businessInfo.businessCapital,
                } : {}),
                ...(isWarishOrFamily ? {
                    deceasedNameEn: deceasedInfo.nameEn,
                    deceasedNameBn: deceasedInfo.nameBn,
                    deceasedFatherNameEn: deceasedInfo.fatherNameEn,
                    deceasedFatherNameBn: deceasedInfo.fatherNameBn,
                    deceasedMotherNameEn: deceasedInfo.motherNameEn,
                    deceasedMotherNameBn: deceasedInfo.motherNameBn,
                    deceasedAddressEn: deceasedInfo.addressEn,
                    deceasedAddressBn: deceasedInfo.addressBn,
                    warishList,
                } : {}),
                ...(isDisability ? {
                    disabilityType: disabilityTypes.map(v => v.replace(/.*\((.+)\)/, '$1')).join(', '),
                    disabilityTypeBn: disabilityTypes.map(v => v.replace(/\s*\(.+\)/, '')).join(', '),
                } : {}),
            };

            const res = await fetch(`/api/certificates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ issueDate, status, details }),
            });

            if (res.ok) {
                toast.success(language === 'en' ? 'Certificate updated successfully' : 'সনদ সফলভাবে আপডেট করা হয়েছে');
                router.push(`/admin/certificates/${id}`);
            } else {
                const err = await res.json();
                toast.error(err.error || (language === 'en' ? 'Failed to update certificate' : 'সনদ আপডেট করা যায়নি'));
            }
        } catch {
            toast.error(language === 'en' ? 'Error saving certificate' : 'সনদ সংরক্ষণে ত্রুটি');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';
    const labelCls = 'text-sm font-medium block mb-1';

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (!certificate) {
        return <div className="text-center py-20 text-muted-foreground">{language === 'en' ? 'Certificate not found.' : 'সনদ পাওয়া যায়নি।'}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
                            {language === 'en' ? 'Edit Certificate' : 'সনদ সম্পাদনা'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {language === 'en' ? 'Certificate No' : 'সনদ নং'}:{' '}
                            <span className="font-mono text-primary">{certificate.certificateNumber}</span>
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {language === 'en' ? 'Save Changes' : 'পরিবর্তন সংরক্ষণ'}
                </button>
            </div>

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-semibold text-lg border-b border-border pb-2">
                        {language === 'en' ? 'Basic Information' : 'মৌলিক তথ্য'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>{language === 'en' ? 'Issue Date' : 'ইস্যুর তারিখ'}</label>
                            <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>{language === 'en' ? 'Status' : 'অবস্থা'}</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Issued">Issued</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm pt-1">
                        <div>
                            <span className="text-muted-foreground">{language === 'en' ? 'Applicant' : 'আবেদনকারী'}:</span>
                            <span className="ml-2 font-medium">{certificate.citizenId?.name || '—'}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">{language === 'en' ? 'Type' : 'ধরণ'}:</span>
                            <span className="ml-2 font-medium">{certificate.type}</span>
                        </div>
                    </div>
                </div>

                {/* Certificate Body Text */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-semibold text-lg border-b border-border pb-2">
                        {language === 'en' ? 'Certificate Body Text' : 'সনদের মূল লেখা'}
                    </h3>
                    <div>
                        <label className={labelCls}>{language === 'en' ? 'English Text' : 'ইংরেজি লেখা'}</label>
                        <textarea
                            value={bodyTextEn}
                            onChange={e => setBodyTextEn(e.target.value)}
                            rows={4}
                            className={`${inputCls} resize-y`}
                            placeholder="English certificate body text..."
                        />
                    </div>
                    <div>
                        <label className={labelCls}>{language === 'en' ? 'Bangla Text' : 'বাংলা লেখা'}</label>
                        <textarea
                            value={bodyTextBn}
                            onChange={e => setBodyTextBn(e.target.value)}
                            rows={4}
                            className={`${inputCls} resize-y font-bengali`}
                            placeholder="বাংলা সনদের মূল লেখা..."
                        />
                    </div>
                </div>

                {/* Trade License */}
                {isTrade && (
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-semibold text-lg border-b border-border pb-2">
                            {language === 'en' ? 'Trade License Information' : 'ট্রেড লাইসেন্স তথ্য'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>{language === 'en' ? 'Business Name' : 'প্রতিষ্ঠানের নাম'}</label>
                                <input value={businessInfo.businessName} onChange={e => setBusinessInfo({ ...businessInfo, businessName: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>{language === 'en' ? 'Business Address' : 'প্রতিষ্ঠানের ঠিকানা'}</label>
                                <input value={businessInfo.businessAddress} onChange={e => setBusinessInfo({ ...businessInfo, businessAddress: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>{language === 'en' ? 'Business Type' : 'ব্যবসার ধরন'}</label>
                                <input value={businessInfo.businessType} onChange={e => setBusinessInfo({ ...businessInfo, businessType: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>{language === 'en' ? 'Capital (BDT)' : 'মূলধন (টাকা)'}</label>
                                <input type="number" value={businessInfo.businessCapital} onChange={e => setBusinessInfo({ ...businessInfo, businessCapital: e.target.value })} className={inputCls} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Warish / Family */}
                {isWarishOrFamily && (
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <h3 className="font-semibold text-lg border-b border-border pb-2">
                            {isFamily
                                ? (language === 'en' ? 'Head of Family Information' : 'পরিবার প্রধানের তথ্য')
                                : (language === 'en' ? 'Deceased Person Information' : 'মৃত ব্যক্তির তথ্য')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>{language === 'en' ? 'Name (English)' : (isFamily ? 'নাম (ইংরেজি)' : 'মৃতের নাম (ইংরেজি)')}</label>
                                <input value={deceasedInfo.nameEn} onChange={e => setDeceasedInfo({ ...deceasedInfo, nameEn: formatEnglishInput(e.target.value) })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>{isFamily ? 'নাম (বাংলা)' : 'মৃতের নাম (বাংলা)'}</label>
                                <input value={deceasedInfo.nameBn} onChange={e => setDeceasedInfo({ ...deceasedInfo, nameBn: formatBanglaInput(e.target.value) })} className={`${inputCls} font-bengali`} />
                            </div>
                            <div>
                                <label className={labelCls}>{language === 'en' ? "Father's Name (English)" : 'পিতার নাম (ইংরেজি)'}</label>
                                <input value={deceasedInfo.fatherNameEn} onChange={e => setDeceasedInfo({ ...deceasedInfo, fatherNameEn: formatEnglishInput(e.target.value) })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>পিতার নাম (বাংলা)</label>
                                <input value={deceasedInfo.fatherNameBn} onChange={e => setDeceasedInfo({ ...deceasedInfo, fatherNameBn: formatBanglaInput(e.target.value) })} className={`${inputCls} font-bengali`} />
                            </div>
                            <div>
                                <label className={labelCls}>{language === 'en' ? "Mother's Name (English)" : 'মাতার নাম (ইংরেজি)'}</label>
                                <input value={deceasedInfo.motherNameEn} onChange={e => setDeceasedInfo({ ...deceasedInfo, motherNameEn: formatEnglishInput(e.target.value) })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>মাতার নাম (বাংলা)</label>
                                <input value={deceasedInfo.motherNameBn} onChange={e => setDeceasedInfo({ ...deceasedInfo, motherNameBn: formatBanglaInput(e.target.value) })} className={`${inputCls} font-bengali`} />
                            </div>
                            <div>
                                <label className={labelCls}>{language === 'en' ? 'Address (English)' : 'ঠিকানা (ইংরেজি)'}</label>
                                <input value={deceasedInfo.addressEn} onChange={e => setDeceasedInfo({ ...deceasedInfo, addressEn: formatEnglishInput(e.target.value) })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>ঠিকানা (বাংলা)</label>
                                <input value={deceasedInfo.addressBn} onChange={e => setDeceasedInfo({ ...deceasedInfo, addressBn: formatBanglaInput(e.target.value) })} className={`${inputCls} font-bengali`} />
                            </div>
                        </div>

                        {/* Warish / Members list */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">
                                    {isFamily
                                        ? (language === 'en' ? 'Family Members' : 'পরিবারের সদস্য')
                                        : (language === 'en' ? 'Heirs (Warish)' : 'ওয়ারিশ তালিকা')}
                                </h4>
                                <span className="text-xs bg-muted px-2 py-1 rounded">{language === 'en' ? 'Total' : 'মোট'}: {warishList.length}</span>
                            </div>

                            {/* Add new member row */}
                            <div className="grid grid-cols-1 gap-2 items-end bg-muted/30 p-3 rounded-lg md:grid-cols-12">
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs text-muted-foreground">{language === 'en' ? 'Name (En)' : 'নাম (ইংরেজি)'}</label>
                                    <input
                                        value={newWarish.nameEn}
                                        onChange={e => setNewWarish({ ...newWarish, nameEn: formatEnglishInput(e.target.value) })}
                                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                        placeholder="Name"
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs text-muted-foreground">{language === 'en' ? 'Name (Bn)' : 'নাম (বাংলা)'}</label>
                                    <input
                                        value={newWarish.nameBn}
                                        onChange={e => setNewWarish({ ...newWarish, nameBn: formatBanglaInput(e.target.value) })}
                                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary font-bengali"
                                        placeholder="নাম"
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs text-muted-foreground">NID</label>
                                    <input
                                        value={newWarish.nid}
                                        onChange={e => setNewWarish({ ...newWarish, nid: e.target.value })}
                                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                        placeholder="NID"
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs text-muted-foreground">{language === 'en' ? 'Date of Birth' : 'জন্ম তারিখ'}</label>
                                    <input
                                        type="date"
                                        value={formatDobForInput(newWarish.dob)}
                                        onChange={e => setNewWarish({ ...newWarish, dob: formatDobForStorage(e.target.value) })}
                                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs text-muted-foreground">{language === 'en' ? 'Relation' : 'সম্পর্ক'}</label>
                                    <select
                                        value={newWarish.relation}
                                        onChange={e => setNewWarish({ ...newWarish, relation: e.target.value })}
                                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                    >
                                        <option value="">{language === 'en' ? 'Select' : 'নির্বাচন'}</option>
                                        {RELATION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        onClick={addWarish}
                                        disabled={!newWarish.nameEn || !newWarish.relation || !newWarish.dob}
                                        className="w-full h-8 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1"
                                    >
                                        <Plus size={14} /> {language === 'en' ? 'Add' : 'যোগ'}
                                    </button>
                                </div>
                            </div>

                            {/* Members table */}
                            <div className="border border-border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">{language === 'en' ? 'Name (En)' : 'নাম (ইংরেজি)'}</th>
                                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">{language === 'en' ? 'Name (Bn)' : 'নাম (বাংলা)'}</th>
                                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">{language === 'en' ? 'Relation' : 'সম্পর্ক'}</th>
                                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">{language === 'en' ? 'DOB' : 'জন্ম তারিখ'}</th>
                                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">NID</th>
                                            <th className="px-3 py-2 text-right font-medium text-muted-foreground">{language === 'en' ? 'Action' : 'অ্যাকশন'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {warishList.map((w, idx) => (
                                            <tr key={idx}>
                                                <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                                                <td className="px-3 py-2">{w.nameEn}</td>
                                                <td className="px-3 py-2 font-bengali">{w.nameBn}</td>
                                                <td className="px-3 py-2">{w.relation}</td>
                                                <td className="px-3 py-2">{w.dob}</td>
                                                <td className="px-3 py-2">{w.nid}</td>
                                                <td className="px-3 py-2 text-right">
                                                    <button onClick={() => removeWarish(idx)} className="text-[var(--danger)] hover:opacity-80">
                                                        <X size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {warishList.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-3 py-4 text-center text-muted-foreground">
                                                    {language === 'en'
                                                        ? (isFamily ? 'No family members added.' : 'No heirs added.')
                                                        : (isFamily ? 'কোনো পরিবারের সদস্য যোগ করা হয়নি।' : 'কোনো উত্তরাধিকারী যোগ করা হয়নি।')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Disability */}
                {isDisability && (
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-semibold text-lg border-b border-border pb-2">
                            {language === 'en' ? 'Disability Information' : 'প্রতিবন্ধিতার তথ্য'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {DISABILITY_OPTIONS.map(item => {
                                const value = `${item.bn} (${item.en})`;
                                const isChecked = disabilityTypes.includes(value);
                                return (
                                    <label key={item.en} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${isChecked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => setDisabilityTypes(prev => isChecked ? prev.filter(v => v !== value) : [...prev, value])}
                                            className="rounded border-border"
                                        />
                                        <span className="text-sm">{language === 'en' ? item.en : item.bn}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Bottom action bar */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={() => router.back()}
                        className="px-5 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors"
                    >
                        {language === 'en' ? 'Cancel' : 'বাতিল'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {language === 'en' ? 'Save Changes' : 'পরিবর্তন সংরক্ষণ'}
                    </button>
                </div>
            </div>
        </div>
    );
}
