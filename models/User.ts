import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'editor'],
        default: 'admin',
    },
    name: {
        type: String,
        default: 'Admin User'
    },
    email: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Force model recompilation if it already exists
if (mongoose.models && mongoose.models.User) {
    delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);
