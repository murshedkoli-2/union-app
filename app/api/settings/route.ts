import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { defaultSettings, isDbConnectionError } from '@/lib/mockData';
import { getSettings } from '@/lib/settings';

export async function GET() {
    const settings = await getSettings();
    return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();

        let settings = await Settings.findOne();

        if (settings) {
            Object.assign(settings, body);
            settings.updatedAt = new Date();
            await settings.save();
        } else {
            const newSettings = await Settings.create(body);
            return NextResponse.json({ success: true, settings: newSettings });
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        if (!isDbConnectionError(error)) {
            console.error('Settings update error:', error);
        }

        const status = isDbConnectionError(error) ? 503 : 500;
        const message = isDbConnectionError(error)
            ? 'Database is unavailable. Please start MongoDB to save settings.'
            : 'Failed to update settings';

        return NextResponse.json(
            { success: false, error: message },
            { status }
        );
    }
}
