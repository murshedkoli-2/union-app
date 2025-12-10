import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VerifyToken from '@/models/VerifyToken';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/email';
import Settings from '@/models/Settings';
import { getOtpEmailHtml } from '@/lib/email-templates';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { email } = await request.json();

        // Basic validation
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const authCookie = cookieStore.get('auth_token');
        if (!authCookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB (overwrite existing for this email if any, conceptually we just create new)
        // Better: delete old ones for this email first
        await VerifyToken.deleteMany({ email });

        await VerifyToken.create({
            email,
            token: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10m
        });

        // Fetch Site Name
        const settings = await Settings.findOne().lean();
        const siteName = settings?.siteName || 'Admin Dashboard';

        // Send Real Email
        await sendEmail({
            to: email,
            subject: `Verification Code - ${siteName}`,
            html: getOtpEmailHtml(otp, siteName, 'verification')
        });

        return NextResponse.json({ message: 'OTP sent successfully' });

    } catch (error) {
        console.error('OTP Send error:', error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
