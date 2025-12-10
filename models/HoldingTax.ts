import mongoose from 'mongoose';

const HoldingTaxSchema = new mongoose.Schema({
    citizenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Citizen',
        required: true
    },
    financialYear: {
        type: String,
        required: true, // e.g., "2024-2025"
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    paidAt: {
        type: Date,
        default: Date.now
    },
    receiptNumber: {
        type: String,
        unique: true
    },
    collectedBy: {
        type: String, // Optional: Admin username or ID
        required: false
    }
});

// Prevent duplicate payments for same year/citizen
HoldingTaxSchema.index({ citizenId: 1, financialYear: 1 }, { unique: true });

if (mongoose.models && mongoose.models.HoldingTax) {
    delete mongoose.models.HoldingTax;
}

export default mongoose.model('HoldingTax', HoldingTaxSchema);
