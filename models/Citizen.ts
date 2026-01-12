import mongoose from 'mongoose';

const CitizenSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameBn: { type: String, required: true },
    fatherName: { type: String, required: true },
    fatherNameBn: { type: String, required: true },
    motherName: { type: String, required: true },
    motherNameBn: { type: String, required: true },
    nid: { type: String, required: true, unique: true },
    holdingNumber: { type: String, required: false },
    phone: { type: String, required: true },
    address: {
        village: { type: String, required: true },
        villageBn: { type: String, required: true },
        postOffice: { type: String, required: true },
        postOfficeBn: { type: String, required: true },
        ward: { type: String, required: true },
        district: { type: String, required: true, default: 'Brahmanbaria' },
        districtBn: { type: String, required: true, default: 'ব্রাহ্মণবাড়িয়া' },
        upazila: { type: String, required: true, default: 'Sarail' },
        upazilaBn: { type: String, required: true, default: 'সরাইল' },
        union: { type: String, required: true, default: 'Kalikaccha' },
        unionBn: { type: String, required: true, default: 'কালিকচ্ছ' }
    },
    dob: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    createdAt: { type: Date, default: Date.now },
});

// Force model recompilation if it already exists (useful for development with Next.js hot reload)
if (mongoose.models && mongoose.models.Citizen) {
    delete mongoose.models.Citizen;
}

export default mongoose.model('Citizen', CitizenSchema);
