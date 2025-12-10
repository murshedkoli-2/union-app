import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Citizen from '@/models/Citizen';
import Certificate from '@/models/Certificate';

export async function GET() {
    try {
        await dbConnect();

        // Clear existing data
        await Citizen.deleteMany({});
        await Certificate.deleteMany({});

        // Create Citizens
        const citizens = await Citizen.create([
            {
                name: "John Doe",
                fatherName: "Richard Doe",
                motherName: "Mary Doe",
                nid: "1234567890",
                phone: "01711122233",
                address: "Dhaka",
                dob: new Date("1990-01-01")
            },
            {
                name: "Jane Smith",
                fatherName: "Robert Smith",
                motherName: "Linda Smith",
                nid: "0987654321",
                phone: "01811122233",
                address: "Chittagong",
                dob: new Date("1992-05-15")
            },
            {
                name: "Alice Johnson",
                fatherName: "David Johnson",
                motherName: "Sarah Johnson",
                nid: "1122334455",
                phone: "01911122233",
                address: "Sylhet",
                dob: new Date("1985-08-20")
            }
        ]);

        // Create Certificates
        // Past 6 months distribution
        const dates = [
            new Date(), // Current month
            new Date(new Date().setMonth(new Date().getMonth() - 1)),
            new Date(new Date().setMonth(new Date().getMonth() - 2)),
            new Date(new Date().setMonth(new Date().getMonth() - 3)),
        ];

        await Certificate.create([
            { citizenId: citizens[0]._id, type: 'Citizenship', status: 'Issued', issueDate: dates[0] },
            { citizenId: citizens[1]._id, type: 'Trade License', status: 'Issued', issueDate: dates[0] },
            { citizenId: citizens[2]._id, type: 'Birth', status: 'Pending', issueDate: dates[1] },
            { citizenId: citizens[0]._id, type: 'Character', status: 'Issued', issueDate: dates[2] },
            { citizenId: citizens[1]._id, type: 'Warish', status: 'Issued', issueDate: dates[3] },
        ]);

        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error('Seed Error:', error);
        return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }
}
