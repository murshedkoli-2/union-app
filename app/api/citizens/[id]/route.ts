import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Citizen from '@/models/Citizen';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const citizen = await Citizen.findById(id);
        if (!citizen) {
            return NextResponse.json({ error: 'Citizen not found' }, { status: 404 });
        }
        return NextResponse.json(citizen);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch citizen' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const updatedCitizen = await Citizen.findByIdAndUpdate(id, body, { new: true });

        if (!updatedCitizen) {
            return NextResponse.json({ error: 'Citizen not found' }, { status: 404 });
        }

        return NextResponse.json(updatedCitizen);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update citizen' }, { status: 500 });
    }
}
