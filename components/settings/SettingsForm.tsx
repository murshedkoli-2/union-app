'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, LayoutDashboard, Building2, CreditCard, Settings, Upload, User } from 'lucide-react';
import { SettingsData } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Tab = 'general' | 'organization' | 'finance' | 'preferences' | 'account';

export default function SettingsForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [formData, setFormData] = useState<SettingsData>({
        siteName: '',
        adminEmail: '',
        enableNotifications: true,
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        unionNameEn: '',
        unionNameBn: '',
        unionAddressEn: '',
        unionAddressBn: '',
        chairmanNameEn: '',
        chairmanNameBn: '',
        unionEmail: '',
        unionWebsite: '',
        unionLogo: '',
        holdingTaxAmount: 500,
        isHoldingTaxMandatory: false,
    });

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                setFormData(data);
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success('Settings saved successfully');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            toast.error('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'general', label: 'General', icon: LayoutDashboard },
        { id: 'organization', label: 'Organization', icon: Building2 },
        { id: 'finance', label: 'Finance & Tax', icon: CreditCard },
        { id: 'account', label: 'Account', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Settings },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                                        activeTab === tab.id
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="hidden md:block mt-8 p-4 rounded-xl bg-card border shadow-sm">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">System Status</div>
                        <div className="flex items-center gap-2 text-sm text-emerald-500">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            Operational
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Header Action */}
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold">{tabs.find(t => t.id === activeTab)?.label} Settings</h2>
                            <button
                                type="submit"
                                disabled={saving}
                                className={cn(
                                    "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50",
                                    saving && "cursor-not-allowed"
                                )}
                            >
                                {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="rounded-xl border bg-card p-6 shadow-sm">
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Site Name</label>
                                            <input
                                                type="text"
                                                name="siteName"
                                                value={formData.siteName}
                                                onChange={handleChange}
                                                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                required
                                            />
                                            <p className="text-xs text-muted-foreground">Appears in the browser tab and dashboard header.</p>
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Admin Email</label>
                                            <input
                                                type="email"
                                                name="adminEmail"
                                                value={formData.adminEmail}
                                                onChange={handleChange}
                                                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border bg-card p-6 shadow-sm">
                                    <h3 className="text-base font-semibold mb-4">Branding</h3>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Union Logo</label>
                                            <div className="flex items-start gap-6">
                                                {formData.unionLogo ? (
                                                    <div className="relative group">
                                                        <div className="h-24 w-24 rounded-lg border bg-muted/20 p-2 flex items-center justify-center">
                                                            <img src={formData.unionLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(p => ({ ...p, unionLogo: '' }))}
                                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <div className="w-4 h-4 flex items-center justify-center text-[10px]">✕</div>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground">
                                                        <Upload size={24} />
                                                    </div>
                                                )}

                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                if (file.size > 500 * 1024) return toast.error('Max size 500KB');
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => setFormData(p => ({ ...p, unionLogo: reader.result as string }));
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Recommended format: PNG/JPG with transparent background.<br />
                                                        Maximum size: 500KB. Used on certificates and reports.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Organization Tab */}
                        {activeTab === 'organization' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="rounded-xl border bg-card p-6 shadow-sm">
                                    <div className="grid gap-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Union Name (English)</label>
                                                <input
                                                    name="unionNameEn"
                                                    value={formData.unionNameEn || ''}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    placeholder="e.g. 7No. Baghutia Union Parishad"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Union Name (Bangla)</label>
                                                <input
                                                    name="unionNameBn"
                                                    value={formData.unionNameBn || ''}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    placeholder="e.g. ৭নং বাঘুটিয়া ইউনিয়ন পরিষদ"
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t my-2"></div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Address (English)</label>
                                                <input
                                                    name="unionAddressEn"
                                                    value={formData.unionAddressEn || ''}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Address (Bangla)</label>
                                                <input
                                                    name="unionAddressBn"
                                                    value={formData.unionAddressBn || ''}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t my-2"></div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Chairman Name (English)</label>
                                                <input
                                                    name="chairmanNameEn"
                                                    value={formData.chairmanNameEn || ''}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Chairman Name (Bangla)</label>
                                                <input
                                                    name="chairmanNameBn"
                                                    value={formData.chairmanNameBn || ''}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t my-2"></div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Union Email</label>
                                                <input
                                                    type="email"
                                                    name="unionEmail"
                                                    value={formData.unionEmail || ''}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    placeholder="e.g. info@union.gov.bd"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Union Website</label>
                                                <input
                                                    type="url"
                                                    name="unionWebsite"
                                                    value={formData.unionWebsite || ''}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    placeholder="e.g. www.union.gov.bd"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Finance Tab */}
                        {activeTab === 'finance' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="rounded-xl border bg-card p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4">Holding Tax</h3>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2 max-w-sm">
                                            <label className="text-sm font-medium">Annual Tax Amount (Tk)</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-2.5 text-muted-foreground font-semibold">৳</div>
                                                <input
                                                    type="number"
                                                    name="holdingTaxAmount"
                                                    value={formData.holdingTaxAmount || 0}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full pl-8 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none font-mono"
                                                    placeholder="500"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Default amount for new yearly payments.</p>
                                        </div>

                                        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
                                            <input
                                                type="checkbox"
                                                id="isHoldingTaxMandatory"
                                                name="isHoldingTaxMandatory"
                                                checked={formData.isHoldingTaxMandatory || false}
                                                onChange={handleChange}
                                                className="mt-1 h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                                            />
                                            <div className="grid gap-1">
                                                <label htmlFor="isHoldingTaxMandatory" className="text-sm font-medium leading-none">
                                                    Enforce Payment for Certificates
                                                </label>
                                                <p className="text-xs text-muted-foreground">
                                                    When enabled, the system will prevent generating certificates for citizens who haven't paid holding tax for the current financial year.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="rounded-xl border bg-card p-6 shadow-sm">
                                    <div className="grid gap-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Appearance</label>
                                                <select
                                                    name="theme"
                                                    value={formData.theme}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                >
                                                    <option value="dark">Dark Mode</option>
                                                    <option value="light">Light Mode</option>
                                                    <option value="system">System Default</option>
                                                </select>
                                            </div>

                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Language</label>
                                                <select
                                                    name="language"
                                                    value={formData.language}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                >
                                                    <option value="en">English</option>
                                                    <option value="bn">Bangla (Coming Soon)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-4">
                                            <input
                                                type="checkbox"
                                                id="enableNotifications"
                                                name="enableNotifications"
                                                checked={formData.enableNotifications}
                                                onChange={handleChange}
                                                className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                                            />
                                            <label htmlFor="enableNotifications" className="text-sm font-medium leading-none">
                                                Enable Email Notifications
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Account Tab */}
                        {activeTab === 'account' && (
                            <AccountSettings />
                        )}
                    </form>
                </main>
            </div>
        </div>
    );
}

function AccountSettings() {
    const [profile, setProfile] = useState({ name: '', username: '', email: '' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(true);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Email Verify State
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [originalEmail, setOriginalEmail] = useState('');

    useEffect(() => {
        fetch('/api/auth/profile')
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    const email = data.email || '';
                    setProfile({ name: data.name || '', username: data.username || '', email });
                    setOriginalEmail(email);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingProfile(true);
        try {
            // Update Name/Username only
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: profile.name, username: profile.username })
            });
            const data = await res.json();
            if (res.ok) toast.success('Profile information updated');
            else toast.error(data.error || 'Failed to update profile');
        } catch (err) {
            toast.error('Error updating profile');
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleSendOtp = async () => {
        if (!profile.email) return toast.error('Please enter an email address');
        if (profile.email === originalEmail) return toast.info('Email is unchanged');

        setSendingOtp(true);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profile.email })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('OTP sent! Check system console.');
                setShowOtpInput(true);
            } else {
                toast.error(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            toast.error('Error sending OTP');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return toast.error('Please enter OTP');

        setVerifyingOtp(true);
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profile.email, otp })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Email verified and updated successfully');
                setOriginalEmail(profile.email);
                setShowOtpInput(false);
                setOtp('');
            } else {
                toast.error(data.error || 'Invalid OTP');
            }
        } catch (err) {
            toast.error('Error verifying OTP');
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error('New passwords do not match');
        }
        setChangingPassword(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Password changed successfully');
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                toast.error(data.error || 'Failed to change password');
            }
        } catch (err) {
            toast.error('Error changing password');
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Profile Settings */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>

                <div className="grid gap-6">
                    {/* Name & Username Form */}
                    <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Username</label>
                            <input
                                type="text"
                                value={profile.username}
                                onChange={e => setProfile({ ...profile, username: e.target.value })}
                                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={updatingProfile}
                                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 text-sm"
                            >
                                {updatingProfile ? 'Saving...' : 'Update Info'}
                            </button>
                        </div>
                    </form>

                    <div className="border-t"></div>

                    {/* Email Verification Form */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <div className="flex gap-3">
                            <input
                                type="email"
                                value={profile.email}
                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Enter admin email"
                            />
                            {profile.email !== originalEmail && (
                                <button
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 whitespace-nowrap text-sm"
                                >
                                    {sendingOtp ? 'Sending...' : 'Verify & Save'}
                                </button>
                            )}
                            {profile.email === originalEmail && originalEmail && (
                                <div className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                                    Verified
                                </div>
                            )}
                        </div>
                        {profile.email !== originalEmail && (
                            <p className="text-xs text-muted-foreground text-amber-600">
                                Email changed. You must verify to save. Check console for OTP.
                            </p>
                        )}
                    </div>

                    {/* OTP Input UI */}
                    {showOtpInput && (
                        <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-amber-500/50 mt-2 animate-in slide-in-from-top-2">
                            <h4 className="text-sm font-semibold mb-2">Enter Verification Code</h4>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="flex h-10 w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none tracking-widest text-center"
                                    placeholder="000000"
                                />
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={verifyingOtp}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 text-sm"
                                >
                                    {verifyingOtp ? 'Verifying...' : 'Confirm Code'}
                                </button>
                                <button
                                    onClick={() => setShowOtpInput(false)}
                                    className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Check your server console/terminal for the 6-digit code.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Password Change - (Reused Logic) */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="grid gap-6 max-w-md">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Current Password</label>
                        <input
                            type="password"
                            value={passwords.current}
                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                            required
                            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">New Password</label>
                        <input
                            type="password"
                            value={passwords.new}
                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                            required
                            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwords.confirm}
                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                            required
                            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={changingPassword}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 disabled:opacity-50"
                        >
                            {changingPassword ? 'Updating...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

