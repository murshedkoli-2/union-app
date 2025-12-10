import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: false },
    type: {
        type: String,
        required: true
    },
    issueDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Issued'],
        default: 'Pending'
    },
    feePaid: {
        type: Number,
        default: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    certificateNumber: { type: String, unique: true },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: { type: Date, default: Date.now },
});

// Auto-generate certificate number if not provided
CertificateSchema.pre('save', async function () {
    if (!this.certificateNumber) {
        // Simple generation: TYPE-TIMESTAMP-RANDOM
        const prefix = this.type.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000);
        this.certificateNumber = `${prefix}-${timestamp}-${random}`;
    }
});

if (mongoose.models && mongoose.models.Certificate) {
    delete mongoose.models.Certificate;
}

export default mongoose.model('Certificate', CertificateSchema);
