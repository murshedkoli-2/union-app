import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import '@/models/Citizen'; // Ensure model registration

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const certificate = await Certificate.findById(id)
            .populate('citizenId');

        if (!certificate) {
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        return NextResponse.json(certificate);
    } catch (error) {
        console.error('API /certificates/[id] GET: Error fetching certificate:', error);
        return NextResponse.json({ error: 'Failed to fetch certificate' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const updatedCertificate = await Certificate.findByIdAndUpdate(id, body, { new: true })
            .populate('citizenId');

        if (!updatedCertificate) {
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        return NextResponse.json(updatedCertificate);
    } catch (error) {
        console.error('API /certificates/[id] PUT: Error updating certificate:', error);
        return NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const deletedCertificate = await Certificate.findByIdAndDelete(id);

        if (!deletedCertificate) {
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Certificate deleted successfully' });
    } catch (error) {
        console.error('API /certificates/[id] DELETE: Error deleting certificate:', error);
        return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 });
    }
}
