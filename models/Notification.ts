import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    read: { type: Boolean, default: false },
    link: { type: String }, // Optional link to navigate to
    createdAt: { type: Date, default: Date.now },
});

if (mongoose.models && mongoose.models.Notification) {
    delete mongoose.models.Notification;
}

export default mongoose.model('Notification', NotificationSchema);
