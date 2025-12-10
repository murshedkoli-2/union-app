import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Citizen from '@/models/Citizen';
import Certificate from '@/models/Certificate';

export async function GET() {
    try {
        await dbConnect();

        // 1. Basic Counts
        const citizenCount = await Citizen.countDocuments();
        const certificateCount = await Certificate.countDocuments();
        const pendingCount = await Certificate.countDocuments({ status: 'Pending' });

        // 2. Certificates by Type
        const byType = await Certificate.aggregate([
            { $group: { _id: '$type', value: { $sum: 1 } } },
            { $project: { name: '$_id', value: 1, _id: 0 } },
            { $sort: { value: -1 } }
        ]);

        // 3. Monthly Growth (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of that month

        const monthlyGrowth = await Certificate.aggregate([
            {
                $match: {
                    issueDate: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$issueDate' },
                        year: { $year: '$issueDate' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Format monthly data for chart (e.g., "Jan", "Feb")
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedMonthly = monthlyGrowth.map(item => ({
            name: monthNames[item._id.month - 1],
            value: item.count
        }));

        const data = {
            counts: {
                citizens: citizenCount,
                certificates: certificateCount,
                pending: pendingCount
            },
            byType,
            monthlyGrowth: formattedMonthly
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error('Report API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch report data' },
            { status: 500 }
        );
    }
}
