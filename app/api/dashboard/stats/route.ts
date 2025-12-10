import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Citizen from '@/models/Citizen';
import Certificate from '@/models/Certificate';
import Transaction from '@/models/Transaction';

export async function GET() {
    try {
        await dbConnect();

        // 1. Total Counts
        const totalCitizens = await Citizen.countDocuments({ status: { $ne: 'pending' } }); // Only count active/approved as "Total Citizens"
        const totalCertificates = await Certificate.countDocuments({ status: { $ne: 'Pending' } });

        const pendingCitizens = await Citizen.countDocuments({ status: 'pending' });
        const pendingCertificates = await Certificate.countDocuments({ status: 'Pending' });
        const totalPending = pendingCitizens + pendingCertificates;

        // 2. Total Revenue
        const revenueAgg = await Transaction.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // 2. Weekly Registration Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const citizensTrend = await Citizen.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days for the last 7 days
        const lineChartData = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateString = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            const found = citizensTrend.find((item: any) => item._id === dateString);
            lineChartData.push({
                name: dayName,
                value: found ? found.count : 0
            });
        }

        // 3. Monthly Certificates Trend (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const certificatesTrend = await Certificate.aggregate([
            {
                $match: {
                    issueDate: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$issueDate" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const barChartData = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const monthYear = d.toISOString().slice(0, 7); // YYYY-MM
            const monthName = d.toLocaleDateString('en-US', { month: 'short' });

            const found = certificatesTrend.find((item: any) => item._id === monthYear);
            barChartData.push({
                name: monthName,
                value: found ? found.count : 0
            });
        }

        return NextResponse.json({
            totalCitizens,
            totalCertificates,
            totalPending,
            totalRevenue,
            lineChartData,
            barChartData
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
