import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CertificateType from '@/models/CertificateType';

export async function GET() {
    try {
        await dbConnect();
        // Seed default types if empty
        const count = await CertificateType.countDocuments();
        if (count === 0) {
            const defaultTypes = [
                { name: 'Citizenship', nameBn: 'নাগরিকত্ব সনদ' },
                { name: 'Character', nameBn: 'চারিত্রিক সনদ' },
                { name: 'Trade License', nameBn: 'ট্রেড লাইসেন্স' },
                { name: 'Warish', nameBn: 'ওয়ারিশ সনদ' }
            ];
            await CertificateType.insertMany(defaultTypes);
        }

        const types = await CertificateType.find().sort({ name: 1 });
        return NextResponse.json(types);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch certificate types' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        if (!body.name || !body.nameBn) {
            return NextResponse.json({ error: 'Name (En) and Name (Bn) are required' }, { status: 400 });
        }

        const newType = await CertificateType.create({
            name: body.name,
            nameBn: body.nameBn,
            bodyTextEn: body.bodyTextEn,
            bodyTextBn: body.bodyTextBn,
            fee: body.fee || 0
        });
        return NextResponse.json(newType, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Certificate type already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create certificate type' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { _id, ...updates } = body;

        if (!_id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updatedType = await CertificateType.findByIdAndUpdate(
            _id,
            { $set: updates },
            { new: true }
        );

        if (!updatedType) {
            return NextResponse.json({ error: 'Certificate type not found' }, { status: 404 });
        }

        return NextResponse.json(updatedType);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update certificate type' }, { status: 500 });
    }
}
