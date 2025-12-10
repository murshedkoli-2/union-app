import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Citizen from '@/models/Citizen';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { nid, dob } = await request.json();

        if (!nid || !dob) {
            return NextResponse.json({ error: 'NID and DOB are required' }, { status: 400 });
        }

        // Parse DOB string to Date object for comparison if needed, 
        // but Mongoose query might handle string if stored as date perfectly if format matches.
        // Let's rely on simple match or range.
        // Actually, DOB in database is Date. `dob` from client is "YYYY-MM-DD".
        // Exact match might be tricky due to timezones.
        // Let's match by NID only first, and then verify DOB in code to be flexible?
        // Or just range query.

        // Start of day
        const queryDate = new Date(dob);
        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const citizen = await Citizen.findOne({
            nid,
            dob: { $gte: queryDate, $lt: nextDay }
        }).select('name nid dob status');

        if (!citizen) {
            return NextResponse.json({ error: 'Citizen not found' }, { status: 404 });
        }

        if (citizen.status === 'pending') {
            return NextResponse.json({ error: 'Your registration is still pending approval' }, { status: 403 });
        }

        if (citizen.status === 'rejected') {
            return NextResponse.json({ error: 'Your registration was rejected. Please contact office.' }, { status: 403 });
        }

        return NextResponse.json(citizen);

    } catch (error) {
        console.error('Identify error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
