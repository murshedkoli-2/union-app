import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-dashboard';

async function testConnection() {
    try {
        console.log('Connecting to MongoDB at', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully!');

        const CitizenSchema = new mongoose.Schema({
            name: { type: String, required: true },
            fatherName: { type: String, required: true },
            motherName: { type: String, required: true },
            nid: { type: String, required: true, unique: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            dob: { type: Date, required: true },
            createdAt: { type: Date, default: Date.now },
        });

        const Citizen = mongoose.models.Citizen || mongoose.model('Citizen', CitizenSchema);

        console.log('Creating test citizen...');
        const testCitizen = await Citizen.create({
            name: 'Test Script Citizen',
            fatherName: 'Test Father',
            motherName: 'Test Mother',
            nid: 'TEST-' + Date.now(),
            phone: '01700000000',
            address: 'Test Address',
            dob: new Date('2000-01-01'),
        });
        console.log('Citizen created:', testCitizen._id);

        console.log('Fetching citizens...');
        const citizens = await Citizen.find().limit(1);
        console.log('Fetched:', citizens.length);

        console.log('Cleaning up...');
        await Citizen.deleteOne({ _id: testCitizen._id });
        console.log('Cleanup done.');

        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testConnection();
