import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    source: { type: String, enum: ['Certificate', 'HoldingTax'], required: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'source' }, // e.g., Certificate ID or Tax Record ID
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: false }, // Optional, as some payments might not link to a registered citizen
    createdAt: { type: Date, default: Date.now }
});

if (mongoose.models && mongoose.models.Transaction) {
    delete mongoose.models.Transaction;
}

export default mongoose.model('Transaction', TransactionSchema);
