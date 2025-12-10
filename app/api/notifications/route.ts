import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        // Fetch unread first, then read, sorted by date
        const notifications = await Notification.find({})
            .sort({ read: 1, createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({ read: false });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const notification = await Notification.create(body);
        return NextResponse.json(notification, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, readAll } = body;

        if (readAll) {
            await Notification.updateMany({ read: false }, { $set: { read: true } });
            return NextResponse.json({ message: 'All marked as read' });
        }

        if (id) {
            const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
            return NextResponse.json(notification);
        }

        return NextResponse.json({ error: 'ID or readAll required' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
