import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import { generateMockAnalytics, isDbConnectionError } from '@/lib/mockData';

export async function GET() {
    try {
        await dbConnect();

        const analytics = await Analytics.find().sort({ date: -1 }).limit(30);

        if (!analytics || analytics.length === 0) {
            return NextResponse.json(generateMockAnalytics());
        }

        return NextResponse.json(analytics);
    } catch (error) {
        if (!isDbConnectionError(error)) {
            console.error('Analytics fetch error:', error);
        }

        return NextResponse.json(generateMockAnalytics());
    }
}
