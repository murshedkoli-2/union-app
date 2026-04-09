import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthenticatedUser, getAuthSession } from '@/lib/server/auth/session';

export async function GET() {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json(user);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name, username } = body;

        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check uniqueness if username changes
        if (username) {
            const existing = await User.findOne({ username, _id: { $ne: session.id } });
            if (existing) {
                return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
            }
        }

        // REMOVE email from here. Email updates must go through /api/auth/otp/verify
        const updatedUser = await User.findByIdAndUpdate(
            session.id,
            { name, username }, // Only update name and username
            { new: true }
        ).select('-password');

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
