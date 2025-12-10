import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import VerifyToken from '@/models/VerifyToken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Missing requirements' }, { status: 400 });
        }

        // 1. Verify OTP
        const record = await VerifyToken.findOne({ email, token: otp });
        if (!record) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }
        if (record.expiresAt < new Date()) {
            return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
        }

        // 2. Find User
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 3. Set Cookie (Login Success)
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

        // Cleanup
        await VerifyToken.deleteOne({ _id: record._id });

        return response;

    } catch (error) {
        console.error('Login Verify error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
