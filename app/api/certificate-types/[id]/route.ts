import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CertificateType from '@/models/CertificateType';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const deletedType = await CertificateType.findByIdAndDelete(id);

        if (!deletedType) {
            return NextResponse.json({ error: 'Certificate type not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Certificate type deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete certificate type' }, { status: 500 });
    }
}
