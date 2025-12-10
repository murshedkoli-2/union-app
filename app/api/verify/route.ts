import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import '@/models/Citizen';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const certNo = searchParams.get('certNo');

        if (!certNo) {
            return NextResponse.json({ error: 'Certificate Number is required' }, { status: 400 });
        }

        const certificate = await Certificate.findOne({ certificateNumber: certNo }).populate('citizenId');

        if (!certificate) {
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        return NextResponse.json(certificate);
    } catch (error) {
        console.error('Verify API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
