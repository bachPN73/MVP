import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    role: { type: String, default: 'student' },
    plan: { type: String, default: 'free' },
    password: { type: String, required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    className: { type: String, default: '' }
}, { timestamps: true });

const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    schoolCode: { type: String, unique: true, required: true },
    isInviteCodeEnabled: { type: Boolean, default: true },
    teacherQuota: { type: Number, default: 5 },
    studentQuota: { type: Number, default: 10 },
    teacherSeatsUsed: { type: Number, default: 0 },
    studentSeatsUsed: { type: Number, default: 0 },
    schoolYear: { type: String, default: '' },
    tiet: { type: String, default: '' }
}, { timestamps: true });

const membershipRequestSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedRole: { type: String, enum: ['teacher', 'student'], required: true },
    requestedClass: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

const modelSchema = new mongoose.Schema({
    title: String,
    description: String,
    file_url: String,
    thumbnail: String,
    subject: String,
    grade: Number,
    type: { type: String, default: '3d-model' },
    tags: { type: [String], default: [] },
    // Premium details fields
    subtitle: String,
    category: String,
    size: String,
    location: String,
    visibleInLM: String,
    features: { type: [mongoose.Schema.Types.Mixed], default: [] },
    funFact: String,
    whereItOccurs: {
        text: String,
        habitat: String
    }
}, { timestamps: true });

const resetTokenSchema = new mongoose.Schema({
    email: { type: String, required: true },
    token: { type: String, required: true },
    expires_at: { type: Date, required: true }
});

export const User = mongoose.model('User', userSchema);
export const Material = mongoose.model('Material', modelSchema);
export const ResetToken = mongoose.model('ResetToken', resetTokenSchema);
export const School = mongoose.model('School', schoolSchema);
export const MembershipRequest = mongoose.model('MembershipRequest', membershipRequestSchema);

