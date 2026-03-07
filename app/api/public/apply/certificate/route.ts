import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Certificate from '@/models/Certificate';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Enforce Pending Status
        const certificateData = {
            ...body,
            status: 'Pending',
            issueDate: new Date(),
            isPaid: false,
            feePaid: 0
        };

        const created = await Certificate.create(certificateData);
        return NextResponse.json(created, { status: 201 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to submit application', details: message }, { status: 500 });
    }
}
