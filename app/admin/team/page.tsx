'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import Image from 'next/image';
import { formatEnglishInput, formatBanglaInput } from '@/lib/utils';
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
    ward?: string;
    // order removed
}

export default function TeamManagementPage() {
    const { t, language } = useLanguage();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    // Form State
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState({
        nameEn: '',
        nameBn: '',
        designation: '',
        phone: '',
        image: '',
        ward: ''
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

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
        } catch {
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
            ward: member.ward || ''
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
            ward: ''
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

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleView = (member: TeamMember) => {
        setSelectedMember(member);
        setIsViewDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await fetch(`/api/team?id=${deleteId}`, { method: 'DELETE' });
            toast.success(language === 'en' ? 'Member deleted' : 'সদস্য মুছে ফেলা হয়েছে');
            fetchMembers();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(language === 'en' ? 'Failed to delete' : 'মুছে ফেলা যায়নি');
        } finally {
            setDeleteId(null);
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
                    <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
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
                                        onChange={e => setFormData({ ...formData, nameEn: formatEnglishInput(e.target.value) })}
                                        placeholder={language === 'en' ? 'John Doe' : 'জন ডো'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.team.form.nameBn}</label>
                                    <Input
                                        required
                                        value={formData.nameBn}
                                        onChange={e => setFormData({ ...formData, nameBn: formatBanglaInput(e.target.value) })}
                                        placeholder={language === 'en' ? 'জন ডো' : 'জন ডো'}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.team.form.designation}</label>
                                <select
                                    required
                                    value={formData.designation}
                                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">{language === 'en' ? 'Select designation' : 'পদবী নির্বাচন করুন'}</option>
                                    <option value="Chairman">{language === 'en' ? 'Chairman' : 'চেয়ারম্যান'}</option>
                                    <option value="Member">{language === 'en' ? 'Member' : 'সদস্য'}</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.team.form.phone}</label>
                                    <Input
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder={language === 'en' ? '017...' : '০১৭...'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{language === 'en' ? 'Ward No.' : 'ওয়ার্ড নং'}</label>
                                    <select
                                        value={formData.ward}
                                        onChange={e => setFormData({ ...formData, ward: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="">{language === 'en' ? 'Select ward (optional)' : 'ওয়ার্ড নির্বাচন করুন (ঐচ্ছিক)'}</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                            <option key={n} value={n.toString()}>{language === 'en' ? `Ward ${n}` : `ওয়ার্ড ${n}`}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.team.form.image}</label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="cursor-pointer"
                                    />
                                    {formData.image && (
                                        <div className="h-10 w-10 rounded-full overflow-hidden border border-border">
                                            <Image src={formData.image} alt="Preview" width={40} height={40} className="h-full w-full object-cover" unoptimized />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">{language === 'en' ? 'Upload an image (Max 2MB)' : 'ছবি আপলোড করুন (সর্বোচ্চ ২ এমবি)'}</p>
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
                            <TableHead>{language === 'en' ? 'Ward' : 'ওয়ার্ড'}</TableHead>
                            <TableHead>{t.team.table.phone}</TableHead>
                            <TableHead className="text-right">{t.team.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {language === 'en' ? 'Loading...' : 'লোড হচ্ছে...'}
                                </TableCell>
                            </TableRow>
                        ) : filteredMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {language === 'en' ? 'No members found' : 'কোনো সদস্য পাওয়া যায়নি'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMembers.map((member) => (
                                <TableRow key={member._id}>
                                    <TableCell className="font-medium">
                                        <button
                                            type="button"
                                            onClick={() => handleView(member)}
                                            className="text-left text-foreground transition-colors hover:text-primary"
                                        >
                                            {language === 'en' ? member.nameEn : member.nameBn}
                                        </button>
                                        <div className="text-xs text-muted-foreground md:hidden">{member.designation}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{member.designation}</TableCell>
                                    <TableCell>{member.ward || '-'}</TableCell>
                                    <TableCell>{member.phone}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(member)}
                                                aria-label={language === 'en' ? 'View member' : 'সদস্য দেখুন'}
                                            >
                                                <Eye size={16} className="text-muted-foreground" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                                                <Pencil size={16} className="text-primary" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(member._id)} disabled>
                                                <Trash2 size={16} className="text-[var(--danger)]" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>{language === 'en' ? 'Member Details' : 'সদস্যের বিস্তারিত'}</DialogTitle>
                    </DialogHeader>

                    {selectedMember && (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 overflow-hidden rounded-full border border-border bg-muted/30">
                                    {selectedMember.image ? (
                                        <Image
                                            src={selectedMember.image}
                                            alt={language === 'en' ? selectedMember.nameEn : selectedMember.nameBn}
                                            width={56}
                                            height={56}
                                            className="h-full w-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
                                            {language === 'en' ? 'No Image' : 'ছবি নেই'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-foreground">
                                        {language === 'en' ? selectedMember.nameEn : selectedMember.nameBn}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{selectedMember.designation}</p>
                                </div>
                            </div>

                            <div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
                                <div className="flex items-center justify-between gap-4 text-sm">
                                    <span className="text-muted-foreground">{language === 'en' ? 'Phone' : 'ফোন'}</span>
                                    <span className="font-medium text-foreground">{selectedMember.phone}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 text-sm">
                                    <span className="text-muted-foreground">{language === 'en' ? 'Ward' : 'ওয়ার্ড'}</span>
                                    <span className="font-medium text-foreground">{selectedMember.ward || '-'}</span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="button" variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                                    {language === 'en' ? 'Close' : 'বন্ধ করুন'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {language === 'en'
                                ? 'This action cannot be undone. This will permanently delete the team member from the database.'
                                : 'এই কাজটি ফিরিয়ে আনা যাবে না। এতে টিম সদস্য স্থায়ীভাবে ডাটাবেস থেকে মুছে যাবে।'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{language === 'en' ? 'Cancel' : 'বাতিল'}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">{language === 'en' ? 'Delete' : 'মুছুন'}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
