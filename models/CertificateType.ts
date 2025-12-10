import mongoose from 'mongoose';

const CertificateTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    nameBn: {
        type: String,
        required: true,
        trim: true
    },
    bodyTextEn: {
        type: String,
        required: false
    },
    bodyTextBn: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    fee: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Delete existing model if it exists to prevent overwrite errors in dev
if (mongoose.models && mongoose.models.CertificateType) {
    delete mongoose.models.CertificateType;
}

export default mongoose.model('CertificateType', CertificateTypeSchema);
