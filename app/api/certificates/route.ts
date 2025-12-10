import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import Citizen from '@/models/Citizen';
import { isDbConnectionError, mockCertificates } from '@/lib/mockData';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const citizenId = searchParams.get('citizenId');
        const status = searchParams.get('status');

        const query: any = {};
        if (citizenId) {
            query.citizenId = citizenId;
        }
        if (status && status !== 'All') {
            query.status = status;
        }

        const certificates = await Certificate.find(query)
            .populate('citizenId', 'name nameBn nid fatherName fatherNameBn motherName motherNameBn address dateOfBirth')
            .sort({ createdAt: -1 });
        return NextResponse.json(certificates);
    } catch (error: unknown) {
        if (!isDbConnectionError(error)) {
            console.error('Error fetching certificates:', error);
        }

        if (isDbConnectionError(error)) {
            console.warn('Certificates API: DB unavailable. Returning mock data.');
            return NextResponse.json(mockCertificates);
        }

        return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Generate Custom 17-digit Certificate Number
        // Generate Custom 17-digit Certificate Number
        let prefix = '';
        if (body.citizenId) {
            const citizen = await Citizen.findById(body.citizenId);
            if (!citizen) {
                return NextResponse.json({ error: 'Citizen not found' }, { status: 404 });
            }
            const dobYear = new Date(citizen.dob).getFullYear().toString();
            prefix = `${dobYear}12194`;
        } else {
            // Non-citizen: use current year or different logic
            const currentYear = new Date().getFullYear().toString();
            prefix = `${currentYear}99999`; // Different prefix to distinguish
        }

        // Generate remaining digits to ensure total length is 17
        // Prefix length is 9
        // Need 17 - 9 = 8 random digits
        let randomSuffix = '';
        for (let i = 0; i < 8; i++) {
            randomSuffix += Math.floor(Math.random() * 10).toString();
        }

        const certificateNumber = prefix + randomSuffix;

        const certificate = await Certificate.create({
            ...body,
            feePaid: body.feePaid || 0,
            isPaid: body.isPaid || false,
            certificateNumber
        });

        // Create Transaction for Revenue
        if (body.feePaid > 0) {
            try {
                const Transaction = (await import('@/models/Transaction')).default;
                await Transaction.create({
                    source: 'Certificate',
                    sourceId: (certificate as any)._id,
                    amount: body.feePaid,
                    description: `Certificate Issue Fee: ${body.type}`,
                    citizenId: body.citizenId
                });
            } catch (err) {
                console.error('Failed to log transaction:', err);
            }
        }

        return NextResponse.json(certificate, { status: 201 });
    } catch (error: unknown) {
        if (!isDbConnectionError(error)) {
            console.error('Error creating certificate:', error);
        }

        if (isDbConnectionError(error)) {
            return NextResponse.json(
                { error: 'Database is unavailable. Please start MongoDB before creating certificates.' },
                { status: 503 }
            );
        }

        return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 });
    }
}
