import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/server/auth/session';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { currentPassword, newPassword } = await request.json();

        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(session.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password (Plain text as per current implementation)
        if (user.password !== currentPassword) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        return NextResponse.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }
}
