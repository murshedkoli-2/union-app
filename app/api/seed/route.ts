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
                nameBn: "জন ডো",
                fatherName: "Richard Doe",
                fatherNameBn: "রিচার্ড ডো",
                motherName: "Mary Doe",
                motherNameBn: "মেরি ডো",
                nid: "1234567890",
                phone: "01711122233",
                address: {
                    village: "Test Village",
                    postOffice: "Test PO",
                    ward: "1",
                    district: "Dhaka",
                    upazila: "Savar",
                    union: "Aminbazar"
                },
                dob: new Date("1990-01-01"),
                gender: "Male"
            },
            {
                name: "Jane Smith",
                nameBn: "জেন স্মিথ",
                fatherName: "Robert Smith",
                fatherNameBn: "রবার্ট স্মিথ",
                motherName: "Linda Smith",
                motherNameBn: "লিন্ডা স্মিথ",
                nid: "0987654321",
                phone: "01811122233",
                address: {
                    village: "Another Village",
                    postOffice: "Another PO",
                    ward: "2",
                    district: "Chittagong",
                    upazila: "Hathazari",
                    union: "Fatehabad"
                },
                dob: new Date("1992-05-15"),
                gender: "Female"
            },
            {
                name: "Alice Johnson",
                nameBn: "অ্যালিস জনসন",
                fatherName: "David Johnson",
                fatherNameBn: "ডেভিড জনসন",
                motherName: "Sarah Johnson",
                motherNameBn: "সারাহ জনসন",
                nid: "1122334455",
                phone: "01911122233",
                address: {
                    village: "New Village",
                    postOffice: "New PO",
                    ward: "3",
                    district: "Sylhet",
                    upazila: "Sadar",
                    union: "Khadimnagar"
                },
                dob: new Date("1985-08-20"),
                gender: "Female"
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
