'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Save, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface TeamMember {
    _id: string;
    nameEn: string;
    nameBn: string;
    designation: string;
    phone: string;
    image?: string;
    order: number;
}

export default function TeamManagementPage() {
    const { t, language } = useLanguage();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState({
        nameEn: '',
        nameBn: '',
        designation: '',
        phone: '',
        image: '',
        order: 0
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await fetch('/api/team');
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (error) {
            console.error('Failed to fetch team members');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setFormData({
            nameEn: member.nameEn,
            nameBn: member.nameBn,
            designation: member.designation,
            phone: member.phone,
            image: member.image || '',
            order: member.order
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            nameEn: '',
            nameBn: '',
            designation: '',
            phone: '',
            image: '',
            order: 0
        });
        setEditingMember(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = '/api/team';
            const method = editingMember ? 'PUT' : 'POST';
            const body = editingMember ? { ...formData, _id: editingMember._id } : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(t.team.form.success);
                setIsDialogOpen(false);
                resetForm();
                fetchMembers();
            } else {
                toast.error(t.team.form.error);
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(t.team.form.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.team.form.deleteConfirm)) return;

        try {
            await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
            toast.success('Member deleted');
            fetchMembers();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete');
        }
    };

    const filteredMembers = members.filter(m =>
        m.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.nameBn.includes(searchTerm) ||
        m.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t.team.adminTitle}</h1>
                    <p className="text-muted-foreground">{t.team.subtitle}</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus size={16} />
                            {t.team.addMember}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingMember ? t.team.editMember : t.team.addMember}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.team.form.nameEn}</label>
                                    <Input
                                        required
                                        value={formData.nameEn}
                                        onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.team.form.nameBn}</label>
                                    <Input
                                        required
                                        value={formData.nameBn}
                                        onChange={e => setFormData({ ...formData, nameBn: e.target.value })}
                                        placeholder="জন ডো"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.team.form.designation}</label>
                                <Input
                                    required
                                    value={formData.designation}
                                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    placeholder="Chairman / Member (Word No. 1)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.team.form.phone}</label>
                                    <Input
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="017..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.team.form.order}</label>
                                    <Input
                                        type="number"
                                        value={formData.order}
                                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.team.form.image}</label>
                                <Input
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="Image URL"
                                />
                                <p className="text-xs text-muted-foreground">Optional. Provide a direct link to an image.</p>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    {t.team.form.cancel}
                                </Button>
                                <Button type="submit">
                                    {t.team.form.submit}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 max-w-sm bg-background border border-border rounded-lg px-3 py-2">
                <Search size={18} className="text-muted-foreground" />
                <input
                    type="text"
                    placeholder={t.common.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t.team.table.name}</TableHead>
                            <TableHead>{t.team.table.designation}</TableHead>
                            <TableHead>{t.team.table.phone}</TableHead>
                            <TableHead className="text-right">{t.team.table.order}</TableHead>
                            <TableHead className="text-right">{t.team.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No members found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMembers.map((member) => (
                                <TableRow key={member._id}>
                                    <TableCell className="font-medium">
                                        <div>{language === 'en' ? member.nameEn : member.nameBn}</div>
                                        <div className="text-xs text-muted-foreground md:hidden">{member.designation}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{member.designation}</TableCell>
                                    <TableCell>{member.phone}</TableCell>
                                    <TableCell className="text-right">{member.order}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                                                <Pencil size={16} className="text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(member._id)}>
                                                <Trash2 size={16} className="text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
