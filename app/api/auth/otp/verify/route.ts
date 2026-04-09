import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VerifyToken from '@/models/VerifyToken';
import User from '@/models/User';
import { getAuthSession } from '@/lib/server/auth/session';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify OTP
        const record = await VerifyToken.findOne({ email, token: otp });

        if (!record) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        if (record.expiresAt < new Date()) {
            return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
        }

        // OTP Valid! Update User Email
        // Ensure email isn't taken by *another* user (trivial check)
        const existingUser = await User.findOne({ email, _id: { $ne: session.id } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already in use by another account' }, { status: 409 });
        }

        await User.findByIdAndUpdate(session.id, { email: email });

        // Clean up used token
        await VerifyToken.deleteOne({ _id: record._id });

        return NextResponse.json({ message: 'Email verified and updated successfully' });

    } catch (error) {
        console.error('OTP Verify error:', error);
        return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
    }
}
