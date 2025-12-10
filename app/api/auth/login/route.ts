import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import VerifyToken from '@/models/VerifyToken';
import { sendEmail } from '@/lib/email';
import Settings from '@/models/Settings';
import { getOtpEmailHtml } from '@/lib/email-templates';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { username, password } = await request.json();

        // 1. Initial Setup check (unchanged)
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            if (username === 'admin' && password === 'admin123') {
                await User.create({ username: 'admin', password: 'admin123', role: 'admin' });
            }
        }

        // 2. Validate Credentials
        const user = await User.findOne({ username, password });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. 2FA Logic
        // If user has email, enforce 2FA
        if (user.email) {
            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Clean up old tokens for this email
            await VerifyToken.deleteMany({ email: user.email });

            await VerifyToken.create({
                email: user.email,
                token: otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            });

            // Fetch Site Name
            const settings = await Settings.findOne().lean();
            const siteName = settings?.siteName || 'Admin Dashboard';

            // Send Email
            await sendEmail({
                to: user.email,
                subject: `Login Verification - ${siteName}`,
                html: getOtpEmailHtml(otp, siteName, 'login')
            });

            // Return state telling frontend to switch to OTP mode
            return NextResponse.json({
                requireOtp: true,
                email: user.email,
                message: 'Please check your email for the verification code.'
            });
        }

        // 4. No Email? Legacy Login (Set Cookie immediately)
        const response = NextResponse.json({ success: true, user: { username: user.username, role: user.role } });
        const oneDay = 24 * 60 * 60 * 1000;
        const cookieStore = await cookies();
        cookieStore.set('auth_token', JSON.stringify({ id: user._id, role: user.role }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: oneDay,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
