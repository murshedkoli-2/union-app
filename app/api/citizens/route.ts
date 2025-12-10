import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Citizen from '@/models/Citizen';
import NotificationModel from '@/models/Notification';
import { isDbConnectionError, mockCitizens } from '@/lib/mockData';

export async function GET(request: Request) {
    try {
        console.log("API /citizens GET: Attempting to connect to DB...");
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query: any = {};
        if (status && status !== 'All') {
            query.status = status;
        }

        console.log("API /citizens GET: DB connected. Fetching citizens with query:", query);
        const citizens = await Citizen.find(query).sort({ createdAt: -1 });
        console.log("API /citizens GET: Citizens fetched:", citizens.length);
        return NextResponse.json(citizens);
    } catch (error: unknown) {
        if (!isDbConnectionError(error)) {
            console.error('API /citizens GET: Error fetching citizens:', error);
        }

        if (isDbConnectionError(error)) {
            console.warn('API /citizens GET: DB unavailable. Returning mock citizens.');
            return NextResponse.json(mockCitizens);
        }

        return NextResponse.json({ error: 'Failed to fetch citizens' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        console.log("API /citizens POST: Attempting to connect to DB...");
        await dbConnect();
        console.log("API /citizens POST: DB connected. Creating citizen...");
        const body = await request.json();
        const created = await Citizen.create(body);
        const citizen = Array.isArray(created) ? created[0] : created;
        console.log("API /citizens POST: Citizen created:", citizen?._id);

        // Create Notification
        try {
            await NotificationModel.create({
                title: 'New Citizen Registered',
                message: `Citizen ${citizen.name} has been registered successfully.`,
                type: 'info',
                link: `/admin/citizens/${citizen._id}`
            });
        } catch (err) {
            console.error('Failed to create notification', err);
        }

        return NextResponse.json(citizen, { status: 201 });
    } catch (error: unknown) {
        if (!isDbConnectionError(error)) {
            console.error('API /citizens POST: Error creating citizen:', error);
        }

        if (isDbConnectionError(error)) {
            return NextResponse.json(
                { error: 'Database is unavailable. Please start MongoDB before creating citizens.' },
                { status: 503 }
            );
        }

        const err = error as { code?: number; message?: string };

        if (err?.code === 11000) {
            return NextResponse.json({ error: 'Citizen with this NID already exists' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Failed to create citizen', details: err?.message }, { status: 500 });
    }
}
