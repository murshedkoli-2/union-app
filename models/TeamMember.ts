import mongoose, { Schema, Model } from 'mongoose';

export interface ITeamMember {
    nameEn: string;
    nameBn: string;
    designation: string; // 'chairman', 'member', 'secretary', etc.
    phone: string;
    image?: string;
    email?: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>({
    nameEn: { type: String, required: true },
    nameBn: { type: String, required: true },
    designation: { type: String, required: true },
    phone: { type: String, required: true },
    image: { type: String }, // Base64 or URL
    email: { type: String },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

if (mongoose.models && mongoose.models.TeamMember) {
    delete mongoose.models.TeamMember;
}

const TeamMember: Model<ITeamMember> = mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);

export default TeamMember;
