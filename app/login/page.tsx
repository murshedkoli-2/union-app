'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageContext';

export default function LoginPage() {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Steps: 'login' (Credentials) -> 'otp' (2FA)
    const [step, setStep] = useState<'login' | 'otp'>('login');

    // Data
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [emailFor2FA, setEmailFor2FA] = useState('');
    const [otp, setOtp] = useState('');

    // UI
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                // Success Scenario 1: No OTP required (Legacy/No Email)
                if (data.success) {
                    router.push('/admin/dashboard');
                    router.refresh();
                }
                // Success Scenario 2: OTP Required
                else if (data.requireOtp) {
                    setEmailFor2FA(data.email);
                    setMessage(data.message || (language === 'en' ? 'Please check your email for the OTP.' : 'ওটিপির জন্য আপনার ইমেইল চেক করুন।'));
                    setStep('otp');
                }
            } else {
                setError(data.error || (language === 'en' ? 'Login failed' : 'লগইন ব্যর্থ হয়েছে'));
            }
        } catch {
            setError(language === 'en' ? 'Something went wrong' : 'কিছু সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailFor2FA, otp }),
            });
            const data = await res.json();

            if (res.ok) {
                router.push('/admin/dashboard');
                router.refresh();
            } else {
                setError(data.error || (language === 'en' ? 'Invalid OTP' : 'ওটিপি সঠিক নয়'));
            }
        } catch {
            setError(language === 'en' ? 'Verification failed' : 'যাচাই ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20">
            <div className="w-full max-w-md p-8 bg-card rounded-2xl shadow-lg border border-border animate-fade-in relative overflow-hidden">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-2xl font-bold font-display">
                        {step === 'login' ? (language === 'en' ? 'Welcome Back' : 'আবার স্বাগতম') : (language === 'en' ? 'Security Verification' : 'নিরাপত্তা যাচাই')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {step === 'login'
                            ? (language === 'en' ? 'Sign in to the Union Admin Dashboard' : 'ইউনিয়ন অ্যাডমিন ড্যাশবোর্ডে সাইন ইন করুন')
                            : (language === 'en' ? `Enter the code sent to ${emailFor2FA}` : `${emailFor2FA} এ পাঠানো কোডটি লিখুন`)}
                    </p>
                </div>

                {/* Error/Message Banner */}
                {error && (
                    <div className="mb-6 p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg animate-in slide-in-from-top-2">
                        {error}
                    </div>
                )}
                {message && !error && (
                    <div className="mb-6 p-3 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg animate-in slide-in-from-top-2">
                        {message}
                    </div>
                )}

                {/* LoginForm */}
                {step === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{language === 'en' ? 'Username' : 'ইউজারনেম'}</label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder={language === 'en' ? 'Enter your username' : 'আপনার ইউজারনেম লিখুন'}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{language === 'en' ? 'Password' : 'পাসওয়ার্ড'}</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors mt-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : t.auth.loginButton}
                        </button>


                    </form>
                )}

                {/* OTP Form */}
                {step === 'otp' && (
                    <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2 flex flex-col items-center">
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="flex h-14 w-48 text-center text-2xl tracking-[0.5em] font-mono rounded-lg border-2 border-border bg-background px-3 py-2 focus:border-primary focus:ring-0 outline-none transition-all"
                                placeholder="000000"
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">{language === 'en' ? 'Type the 6-digit code' : '৬-সংখ্যার কোডটি লিখুন'}</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : (language === 'en' ? 'Verify & Login' : 'যাচাই করে লগইন')}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('login')}
                            className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                            {language === 'en' ? 'Back to Login' : 'লগইনে ফিরে যান'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
