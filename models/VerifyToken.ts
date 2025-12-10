import mongoose from 'mongoose';

const VerifyTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Auto-delete doc after 10 mins (TTL index)
    }
});

// Force model recompilation
if (mongoose.models && mongoose.models.VerifyToken) {
    delete mongoose.models.VerifyToken;
}

export default mongoose.model('VerifyToken', VerifyTokenSchema);
