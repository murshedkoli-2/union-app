'use client';

import { useLanguage } from '@/components/providers/LanguageContext';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface CertificateType {
    _id: string;
    name: string;
    nameBn: string;
    bodyTextEn?: string;
    bodyTextBn?: string;
    fee: number;
}

export default function CertificateTypes() {
    const { t, language } = useLanguage();
    const [types, setTypes] = useState<CertificateType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<CertificateType>>({});

    // Form State (Add)
    const [formData, setFormData] = useState<Partial<CertificateType>>({
        name: '',
        nameBn: '',
        bodyTextEn: '',
        bodyTextBn: '',
        fee: 0
    });

    const fetchTypes = useCallback(async () => {
        try {
            const res = await fetch('/api/certificate-types');
            const data = await res.json();
            setTypes(data);
        } catch (error) {
            console.error('Failed to fetch types:', error);
            toast.error(language === 'en' ? 'Failed to load certificate types' : 'সনদের ধরণ লোড করা যায়নি');
        } finally {
            setLoading(false);
        }
    }, [language]);

    useEffect(() => {
        fetchTypes();
    }, [fetchTypes]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await fetch('/api/certificate-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(t.certificates.types.messages.added);
                setIsAdding(false);
                setFormData({ name: '', nameBn: '', bodyTextEn: '', bodyTextBn: '', fee: 0 });
                fetchTypes();
            } else {
                toast.error(t.certificates.types.messages.error);
            }
        } catch {
            toast.error(t.certificates.types.messages.error);
        }
    }

    const startEdit = (type: CertificateType) => {
        setEditingId(type._id);
        setEditForm({ ...type });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        try {
            const res = await fetch('/api/certificate-types', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: editingId, ...editForm })
            });

            if (res.ok) {
                toast.success(t.certificates.types.messages.updated);
                setEditingId(null);
                fetchTypes();
            } else {
                toast.error(language === 'en' ? 'Failed to update' : 'আপডেট করা যায়নি');
            }
        } catch {
            toast.error(language === 'en' ? 'Error updating type' : 'ধরণ আপডেটে ত্রুটি হয়েছে');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{t.certificates.types.title}</h1>
                    <p className="text-muted-foreground mt-1">{t.certificates.types.subtitle}</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    {isAdding ? <X size={18} /> : <Plus size={18} />}
                    {isAdding ? t.certificates.types.cancel : t.certificates.types.addNew}
                </button>
            </div>

            {isAdding && (
                <div className="rounded-xl border bg-card p-6 shadow-sm animate-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.certificates.types.form.nameEn}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t.certificates.types.form.exampleEn}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.certificates.types.form.nameBn}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t.certificates.types.form.exampleBn}
                                    value={formData.nameBn}
                                    onChange={e => setFormData({ ...formData, nameBn: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.certificates.types.form.fee}</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={formData.fee}
                                    onChange={e => setFormData({ ...formData, fee: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{language === 'en' ? 'Body Text (English)' : 'মূল লেখা (ইংরেজি)'}</label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                                    placeholder={language === 'en' ? 'Certificate body text in English (optional)' : 'সনদের মূল লেখা ইংরেজিতে (ঐচ্ছিক)'}
                                    value={formData.bodyTextEn || ''}
                                    onChange={e => setFormData({ ...formData, bodyTextEn: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{language === 'en' ? 'Body Text (Bangla)' : 'মূল লেখা (বাংলা)'}</label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y font-bengali"
                                    placeholder={language === 'en' ? 'Certificate body text in Bangla (optional)' : 'সনদের মূল লেখা বাংলায় (ঐচ্ছিক)'}
                                    value={formData.bodyTextBn || ''}
                                    onChange={e => setFormData({ ...formData, bodyTextBn: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Save size={16} />
                                {t.certificates.types.save}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t.certificates.types.table.nameEn}</th>
                            <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t.certificates.types.table.nameBn}</th>
                            <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t.certificates.types.table.fee}</th>
                            <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{language === 'en' ? 'Body Text' : 'মূল লেখা'}</th>
                            <th className="px-6 py-4 text-right font-semibold text-muted-foreground">{t.certificates.types.table.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">{t.certificates.types.table.loading}</td></tr>
                        ) : types.length === 0 ? (
                            <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">{t.certificates.types.table.noData}</td></tr>
                        ) : (
                            types.map((type) => (
                                <React.Fragment key={type._id}>
                                    <tr className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">{type.name}</td>
                                        <td className="px-6 py-4 font-noto-bengali">{type.nameBn}</td>
                                        <td className="px-6 py-4 font-mono">{`৳${type.fee}`}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1">
                                                {type.bodyTextEn && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">EN</span>}
                                                {type.bodyTextBn && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">BN</span>}
                                                {!type.bodyTextEn && !type.bodyTextBn && <span className="text-xs text-muted-foreground">—</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => editingId === type._id ? cancelEdit() : startEdit(type)}
                                                    className={`transition-colors p-2 ${editingId === type._id ? 'text-muted-foreground hover:text-destructive' : 'text-primary hover:text-primary/80'}`}
                                                    title={language === 'en' ? (editingId === type._id ? 'Cancel' : 'Edit') : (editingId === type._id ? 'বাতিল' : 'সম্পাদনা')}
                                                >
                                                    {editingId === type._id ? <X size={18} /> : <Edit size={18} />}
                                                </button>
                                                <button
                                                    disabled
                                                    className="text-muted-foreground/30 cursor-not-allowed p-2"
                                                    title={language === 'en' ? 'Delete disabled' : 'ডিলিট বন্ধ'}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {editingId === type._id && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 bg-muted/20 border-t border-border">
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-muted-foreground">{t.certificates.types.form.nameEn}</label>
                                                            <input
                                                                type="text"
                                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                                value={editForm.name || ''}
                                                                onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-muted-foreground">{t.certificates.types.form.nameBn}</label>
                                                            <input
                                                                type="text"
                                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bengali"
                                                                value={editForm.nameBn || ''}
                                                                onChange={e => setEditForm(prev => ({ ...prev, nameBn: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-muted-foreground">{t.certificates.types.form.fee}</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                                value={editForm.fee}
                                                                onChange={e => setEditForm(prev => ({ ...prev, fee: Number(e.target.value) }))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-muted-foreground">{language === 'en' ? 'Body Text (English)' : 'মূল লেখা (ইংরেজি)'}</label>
                                                            <textarea
                                                                rows={3}
                                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                                                                placeholder={language === 'en' ? 'Certificate body text in English (optional)' : 'সনদের মূল লেখা ইংরেজিতে (ঐচ্ছিক)'}
                                                                value={editForm.bodyTextEn || ''}
                                                                onChange={e => setEditForm(prev => ({ ...prev, bodyTextEn: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-muted-foreground">{language === 'en' ? 'Body Text (Bangla)' : 'মূল লেখা (বাংলা)'}</label>
                                                            <textarea
                                                                rows={3}
                                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y font-bengali"
                                                                placeholder={language === 'en' ? 'Certificate body text in Bangla (optional)' : 'সনদের মূল লেখা বাংলায় (ঐচ্ছিক)'}
                                                                value={editForm.bodyTextBn || ''}
                                                                onChange={e => setEditForm(prev => ({ ...prev, bodyTextBn: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={cancelEdit} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">
                                                            {language === 'en' ? 'Cancel' : 'বাতিল'}
                                                        </button>
                                                        <button onClick={handleUpdate} className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                                                            <Save size={14} />
                                                            {language === 'en' ? 'Save Changes' : 'পরিবর্তন সংরক্ষণ'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
