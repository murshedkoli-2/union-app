'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
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
                    setMessage(data.message || 'Please check your email for the OTP.');
                    setStep('otp');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Something went wrong');
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
                setError(data.error || 'Invalid OTP');
            }
        } catch (err) {
            setError('Verification failed');
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
                        {step === 'login' ? 'Welcome Back' : 'Security Verification'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {step === 'login'
                            ? 'Sign in to the Union Admin Dashboard'
                            : `Enter the code sent to ${emailFor2FA}`}
                    </p>
                </div>

                {/* Error/Message Banner */}
                {error && (
                    <div className="mb-6 p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg animate-in slide-in-from-top-2">
                        {error}
                    </div>
                )}
                {message && !error && (
                    <div className="mb-6 p-3 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg animate-in slide-in-from-top-2">
                        {message}
                    </div>
                )}

                {/* LoginForm */}
                {step === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username</label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
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
                            className="w-full h-10 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors mt-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
                        </button>

                        <div className="text-center text-xs text-muted-foreground mt-4">
                            Default: admin / admin123
                        </div>
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
                            <p className="text-xs text-muted-foreground">Type the 6-digit code</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Login'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('login')}
                            className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                            Back to Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
