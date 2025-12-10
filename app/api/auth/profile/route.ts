import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Identify user from cookie (simplified)
        const cookieStore = await cookies();
        const authCookie = cookieStore.get('auth_token');

        if (!authCookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const authData = JSON.parse(authCookie.value);
        const user = await User.findById(authData.id).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name, username, email } = body;

        const cookieStore = await cookies();
        const authCookie = cookieStore.get('auth_token');

        if (!authCookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const authData = JSON.parse(authCookie.value);

        // Check uniqueness if username changes
        if (username) {
            const existing = await User.findOne({ username, _id: { $ne: authData.id } });
            if (existing) {
                return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
            }
        }

        // REMOVE email from here. Email updates must go through /api/auth/otp/verify
        const updatedUser = await User.findByIdAndUpdate(
            authData.id,
            { name, username }, // Only update name and username
            { new: true }
        ).select('-password');

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
