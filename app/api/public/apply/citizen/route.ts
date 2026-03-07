import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Citizen from '@/models/Citizen';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // 1. Force status to pending for public applications
        const citizenData = {
            ...body,
            status: 'pending'
        };

        const created = await Citizen.create(citizenData);
        // Mongoose sometimes returns array or object depending on version/mock, handling both safe
        const citizen = Array.isArray(created) ? created[0] : created;

        return NextResponse.json(citizen, { status: 201 });

    } catch (error: unknown) {
        const dbError = error as { code?: number; message?: string };
        if (dbError.code === 11000) {
            return NextResponse.json({ error: 'Citizen with this NID already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to submit application', details: dbError.message || 'Unknown error' }, { status: 500 });
    }
}
