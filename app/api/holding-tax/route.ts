import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import HoldingTax from '@/models/HoldingTax';
import Citizen from '@/models/Citizen';
import NotificationModel from '@/models/Notification';

// GET: Fetch tax history (with pagination/filters)
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const citizenId = searchParams.get('citizenId');
        const financialYear = searchParams.get('financialYear');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        let query: any = {};

        if (citizenId) query.citizenId = citizenId;
        if (financialYear) query.financialYear = financialYear;

        // If search is provided, we need to first find citizens matching the name, then find their taxes
        // OR populate citizen and filter (less efficient but okay for smaller datasets)
        // For now, let's assuming efficient search via citizenId is preferred from UI autocomplete

        const taxes = await HoldingTax.find(query)
            .sort({ paidAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('citizenId', 'name nid');

        const total = await HoldingTax.countDocuments(query);

        return NextResponse.json({
            data: taxes,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Fetch Holding Tax Error:', error);
        return NextResponse.json({ error: 'Failed to fetch tax records' }, { status: 500 });
    }
}

// POST: Pay Tax
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { citizenId, financialYear, amount, collectedBy } = body;

        if (!citizenId || !financialYear || amount === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if already paid
        const existing = await HoldingTax.findOne({ citizenId, financialYear });
        if (existing) {
            return NextResponse.json({ error: 'Tax already paid for this financial year' }, { status: 409 });
        }

        const today = new Date();
        const receiptNumber = `TAX-${today.getFullYear()}${today.getMonth() + 1}-${Math.floor(Math.random() * 10000)}`;

        const newTax = await HoldingTax.create({
            citizenId,
            financialYear,
            amount,
            receiptNumber,
            collectedBy,
            paidAt: today
        });

        // Optional: Update Citizen cache if implemented later

        try {
            await NotificationModel.create({
                title: 'Tax Collected',
                message: `Holding Tax collected from citizen for FY ${financialYear}. Amount: ৳${amount}`,
                type: 'success',
                link: `/admin/citizens/${citizenId}`
            });
        } catch (nErr) {
            console.error('Notification error:', nErr);
        }

        // Create Transaction for Revenue
        try {
            const Transaction = (await import('@/models/Transaction')).default;
            await Transaction.create({
                source: 'HoldingTax',
                sourceId: newTax._id,
                amount: amount,
                description: `Holding Tax Payment FY ${financialYear}`,
                citizenId: citizenId
            });
        } catch (err) {
            console.error('Failed to log transaction:', err);
        }

        return NextResponse.json(newTax, { status: 201 });

    } catch (error) {
        console.error('Pay Tax Error:', error);
        return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }
}
