import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Citizen from '@/models/Citizen';
import HoldingTax from '@/models/HoldingTax';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const citizenId = searchParams.get('citizenId');
        const financialYear = searchParams.get('financialYear');

        if (!citizenId || !financialYear) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 1. Check direct payment first
        let taxRecord = await HoldingTax.findOne({ citizenId, financialYear }).populate('citizenId', 'name nameBn holdingNumber');

        // 2. If not paid directly, check family members (same holding number)
        if (!taxRecord) {
            const citizen = await Citizen.findById(citizenId);
            if (citizen && citizen.holdingNumber) {
                // Find all citizens with same holding number
                const familyMembers = await Citizen.find({
                    holdingNumber: citizen.holdingNumber,
                    _id: { $ne: citizenId } // Exclude self (already checked)
                }).select('_id');

                if (familyMembers.length > 0) {
                    const familyIds = familyMembers.map(m => m._id);
                    taxRecord = await HoldingTax.findOne({
                        citizenId: { $in: familyIds },
                        financialYear
                    }).populate('citizenId', 'name nameBn holdingNumber');
                }
            }
        }

        return NextResponse.json({
            paid: !!taxRecord,
            details: taxRecord ? {
                ...taxRecord.toObject(),
                paidBy: taxRecord.citizenId // This will contain the populated citizen details
            } : null
        });

    } catch (error) {
        return NextResponse.json({ error: 'Check failed' }, { status: 500 });
    }
}
