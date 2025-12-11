import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TeamMember from '@/models/TeamMember';
import { isDbConnectionError } from '@/lib/mockData';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        // Sort by order descending (or ascending if preferred, usually low order number = top)
        // Let's assume order 1 is top. So ascending.
        const members = await TeamMember.find({}).sort({ order: 1 });
        return NextResponse.json(members);
    } catch (error) {
        if (!isDbConnectionError(error)) {
            console.error('Team fetch error:', error);
        }
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        // Basic validation
        if (!body.nameEn || !body.nameBn || !body.designation || !body.phone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const newMember = await TeamMember.create(body);
        return NextResponse.json(newMember, { status: 201 });
    } catch (error) {
        console.error('Team create error:', error);
        return NextResponse.json(
            { error: 'Failed to create member' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        updateData.updatedAt = new Date();
        const updatedMember = await TeamMember.findByIdAndUpdate(_id, updateData, { new: true });

        return NextResponse.json(updatedMember);
    } catch (error) {
        console.error('Team update error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await TeamMember.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Team delete error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
