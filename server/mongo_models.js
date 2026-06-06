import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    role: { type: String, default: 'student' },
    plan: { type: String, default: 'free' },
    password: { type: String, required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    className: { type: String, default: '' },
    sessionToken: { type: String, default: null }
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
    // Access control: which plan is required to view this material
    // null = no restriction (everyone can view)
    // 'basic' | 'pro' | 'combo' | 'school' | 'demo' = requires that plan or higher
    requiredPlan: { type: String, default: null },
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
    },
    source: { type: String, default: '' },
    relatedMaterials: { type: [String], default: [] }
}, { timestamps: true });

const resetTokenSchema = new mongoose.Schema({
    email: { type: String, required: true },
    token: { type: String, required: true },
    expires_at: { type: Date, required: true }
});

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentCode: { type: String, unique: true, required: true }, // Mã duy nhất để đối soát
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    bankName: { type: String, default: 'TPB' },
    accountNumber: { type: String, default: '00000801691' },
    accountName: { type: String, default: 'PHAM NGOC BACH' }
}, { timestamps: true });

// SystemConfig: stores global admin-configurable settings as key-value pairs
// Key 'ai_limits' stores an object like: { free: 3, demo: 10, basic: 20, pro: 50, combo: 50, school: 100 }
// A value of -1 means unlimited.
const systemConfigSchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export const Material = mongoose.model('Material', modelSchema);
export const ResetToken = mongoose.model('ResetToken', resetTokenSchema);
export const School = mongoose.model('School', schoolSchema);
export const MembershipRequest = mongoose.model('MembershipRequest', membershipRequestSchema);
export const Payment = mongoose.model('Payment', paymentSchema);
export const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    subject: { type: String, required: true }, // 'physics', 'chemistry', 'biology'
    grade: { type: Number, required: true },   // 10, 11, 12
    chapter: { type: String, default: '' },    // E.g., "Chương 1: Động lực học"
    materials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
    order: { type: Number, default: 0 }
}, { timestamps: true });

export const Lesson = mongoose.model('Lesson', lessonSchema);


