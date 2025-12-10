'use client';

import { useState, useEffect } from 'react';
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
        fee: 0
    });

    useEffect(() => {
        fetchTypes();
    }, []);

    async function fetchTypes() {
        try {
            const res = await fetch('/api/certificate-types');
            const data = await res.json();
            setTypes(data);
        } catch (error) {
            console.error('Failed to fetch types:', error);
            toast.error('Failed to load certificate types');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await fetch('/api/certificate-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Certificate type added successfully');
                setIsAdding(false);
                setFormData({ name: '', nameBn: '', fee: 0 });
                fetchTypes();
            } else {
                toast.error('Failed to add certificate type');
            }
        } catch (error) {
            toast.error('Error submitting form');
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
                toast.success('Certificate type updated');
                setEditingId(null);
                fetchTypes();
            } else {
                toast.error('Failed to update');
            }
        } catch (error) {
            toast.error('Error updating type');
        }
    };

    const handleDelete = async (id: string) => {
        // Disabled as per request
        toast.error('Delete action is currently disabled for safety.');
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Certificate Types</h1>
                    <p className="text-muted-foreground mt-1">Manage certificate categories and fees.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                    {isAdding ? <X size={18} /> : <Plus size={18} />}
                    {isAdding ? 'Cancel' : 'Add New Type'}
                </button>
            </div>

            {isAdding && (
                <div className="rounded-xl border bg-card p-6 shadow-sm animate-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name (English)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="e.g. Trade License"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name (Bangla)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="e.g. ট্রেড লাইসেন্স"
                                    value={formData.nameBn}
                                    onChange={e => setFormData({ ...formData, nameBn: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Fee (BDT)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={formData.fee}
                                    onChange={e => setFormData({ ...formData, fee: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                <Save size={16} />
                                Save Type
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Name (En)</th>
                            <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Name (Bn)</th>
                            <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Fee</th>
                            <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading types...</td></tr>
                        ) : types.length === 0 ? (
                            <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No types found.</td></tr>
                        ) : (
                            types.map((type) => (
                                <tr key={type._id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-medium">{type.name}</td>
                                    <td className="px-6 py-4 font-noto-bengali">{type.nameBn}</td>
                                    <td className="px-6 py-4 font-mono">
                                        {editingId === type._id ? (
                                            <input
                                                type="number"
                                                className="w-24 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                                value={editForm.fee}
                                                onChange={e => setEditForm(prev => ({ ...prev, fee: Number(e.target.value) }))}
                                                autoFocus
                                            />
                                        ) : (
                                            `৳${type.fee}`
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingId === type._id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={handleUpdate} className="text-emerald-600 hover:text-emerald-700 p-1" title="Save">
                                                    <Save size={18} />
                                                </button>
                                                <button onClick={cancelEdit} className="text-muted-foreground hover:text-destructive p-1" title="Cancel">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => startEdit(type)}
                                                    className="text-primary hover:text-primary/80 transition-colors p-2"
                                                    title="Edit Fee"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    disabled
                                                    className="text-muted-foreground/30 cursor-not-allowed p-2"
                                                    title="Delete Disabled"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
