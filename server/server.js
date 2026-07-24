import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3');
import path from 'path';
import fs from 'fs';
import multer from 'multer';
// import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import compression from 'compression';
import { exec } from 'child_process';

import mongoose from 'mongoose';

const compress3DModel = (tempPath, outputPath) => {
    return new Promise((resolve, reject) => {
        const cmd = `node "${path.resolve(__dirname, '../draco_compress.cjs')}" "${tempPath}" "${outputPath}"`;
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error('[DRACO COMPRESSION ERROR]', err, stderr);
                reject(err);
            } else {
                console.log('[DRACO COMPRESSION SUCCESS]', stdout);
                resolve(true);
            }
        });
    });
};
import { User, Material, ResetToken, School, MembershipRequest, Payment, Lesson, SystemConfig } from './mongo_models.js';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3099;

// Database connection (MongoDB)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edu_tech_mvp';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('[SUCCESS] Đã kết nối với MongoDB Atlas thành công.'))
    .catch(err => console.error('[ERROR] Không thể kết nối MongoDB:', err.message));

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET || 'edu-material';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
    console.log('[SUCCESS] Đã khởi tạo Supabase Client.');
} else {
    console.warn('[WARNING] Thiếu cấu hình Supabase. Tính năng upload sẽ không hoạt động.');
}

/* SQLite connection - KEEPING COMMENTED FOR REFERENCE
const DATA_DIR = process.env.DATA_DIR || (fs.existsSync('/app/data') ? '/app/data' : path.resolve(__dirname));
const dbPath = process.env.DB_PATH || path.resolve(DATA_DIR, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('[ERROR] Không thể kết nối SQLite:', err.message);
    else console.log('[SUCCESS] Đã kết nối với SQLite database tại:', dbPath);
});

// Helper functions for Promise-based SQLite queries
const queryAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});
const queryRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this); });
});
const queryGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});
*/
const DATA_DIR = process.env.DATA_DIR || (fs.existsSync('/app/data') ? '/app/data' : path.resolve(__dirname));

// Multer Storage Configuration - Using Memory instead of Disk for Supabase
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.glb', '.gltf', '.fbx', '.pdf', '.zip', '.jpg', '.jpeg', '.png', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Hỗ trợ định dạng .glb, .gltf, .fbx, .pdf, .zip, .jpg, .png, .webp'));
        }
    },
    limits: { fileSize: 100 * 1024 * 1024 }
});

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL, 
            'http://127.0.0.1:5173', 
            'http://localhost:5173',
            'https://www.edutechvn.me',
            'https://edutechvn.me',
            /\.vercel\.app$/ // Allow Vercel preview deployments
        ];
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(ao => ao instanceof RegExp && ao.test(origin))) {
            callback(null, true);
        } else {
            console.log('[CORS] Blocked origin:', origin);
            callback(null, true); // Still allowing for now to avoid breaking changes, but logged
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        const log = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
        fs.appendFile(path.resolve(DATA_DIR, 'server_debug.log'), log, () => {});
    }
    next();
});

app.get('/api/ping', (req, res) => res.json({ status: 'ok', time: Date.now() }));

// Session validation middleware — only populates req.user, never rejects.
// Session enforcement (single-device check) is handled ONLY in /api/check-session route.
app.use(async (req, res, next) => {
    const sessionToken = req.headers['x-session-token'];
    let rawUserId = req.headers['x-user-id'];

    // Handle duplicate headers: Express may return array or comma-separated string
    if (Array.isArray(rawUserId)) rawUserId = rawUserId[0];
    if (typeof rawUserId === 'string' && rawUserId.includes(',')) {
        rawUserId = rawUserId.split(',')[0].trim();
    }
    const userId = rawUserId;

    // Validate ObjectId format before querying (24-char hex string)
    if (userId && /^[a-fA-F0-9]{24}$/.test(userId)) {
        try {
            const user = await User.findById(userId);
            if (user) {
                // Attach user to request for downstream use.
                // Do NOT reject here — /api/check-session is the single source of truth
                // for session enforcement. Rejecting here causes false-positive logouts
                // due to race conditions and request ordering.
                req.user = user;
                req.sessionTokenValid = (!user.sessionToken || user.sessionToken === sessionToken);
            }
        } catch (err) {
            // Silent fail — invalid session should not crash the request
            console.warn('[MIDDLEWARE SESSION WARN]', err.message);
        }
    }
    next();
});


// Auth middlewares
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục' });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'school-admin') {
        console.log(`[requireAdmin] FORBIDDEN: user ${req.user._id} has role '${req.user.role}'`);
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Bạn không có quyền thực hiện hành động này' });
    }
    next();
};

// Endpoint to check session status
app.get('/api/check-session', async (req, res) => {
    const sessionToken = req.headers['x-session-token'];
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing User ID' });
    }
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
        
        if (user.sessionToken && user.sessionToken !== sessionToken) {
            return res.status(401).json({ error: 'SESSION_INVALID', message: 'Tài khoản đã đăng nhập ở thiết bị khác' });
        }
        
        res.json({ valid: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/u_remove/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    console.log(`[USER DELETION] Request to remove ID: ${id}`);
    try {
        const user = await User.findById(id);
        
        if (!user) {
            console.log(`[USER DELETION] User ID ${id} not found`);
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        
        if (user.role === 'admin' || user.role === 'school-admin') {
            console.log(`[USER DELETION] Cannot delete admin user ID: ${id}`);
            return res.status(403).json({ error: 'Không thể xóa tài khoản Admin' });
        }

        await User.findByIdAndDelete(id);
        console.log(`[USER DELETION] Successfully deleted user ID: ${id}`);
        res.json({ message: 'Xóa người dùng thành công' });
    } catch (err) {
        console.error('[USER DELETION ERROR] Lỗi khi xóa người dùng:', err.message);
        res.status(500).json({ error: 'Lỗi hệ thống khi xóa người dùng: ' + err.message });
    }
});

// Alias for standard REST API
app.delete('/api/users/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    console.log(`[REST API] DELETE /api/users/${id}`);
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        if (user.role === 'admin' || user.role === 'school-admin') return res.status(403).json({ error: 'Không thể xóa tài khoản Admin' });
        await User.findByIdAndDelete(id);
        res.json({ message: 'Xóa người dùng thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Static files
app.use('/models', express.static(path.resolve(DATA_DIR, 'models'), { maxAge: '7d', immutable: true }));
app.use('/thumbnails', express.static(path.resolve(DATA_DIR, 'thumbnails'), { maxAge: '7d', immutable: true }));

// Note: Frontend is deployed separately on Vercel, so we don't need to serve dist here.
// However, we keep the static access for uploaded models and thumbnails.

// Initialize Database (Seed Admin)
async function initDb() {
    try {
        console.log('[INFO] Đang kiểm tra tài khoản admin...');

        // Seed Admin User
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@mvp.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123';
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(adminPassword, salt);

        const admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            await User.create({
                name: 'Admin MVP',
                email: adminEmail,
                role: 'admin',
                plan: 'pro',
                password: hash
            });
            console.log('[INFO] Đã tự động tạo tài khoản admin mặc định.');
        } else {
            await User.updateOne({ email: adminEmail }, { password: hash, role: 'admin', plan: 'pro' });
        }

        // Seed default AI limits config
        const defaultAILimits = { free: 3, basic: 20, pro: 50, combo: 50, school: 100 };
        const existingAIConfig = await SystemConfig.findOne({ key: 'ai_limits' });
        if (!existingAIConfig) {
            await SystemConfig.create({ key: 'ai_limits', value: defaultAILimits });
            console.log('[INFO] Đã tạo cấu hình AI limits mặc định.');
        }

        // School seeding removed as requested by admin to create manually

    } catch (err) {
        console.error('[ERROR] Lỗi khởi tạo MongoDB:', err.message);
    }
}

// Start database initialization
initDb();

// Helper: generate random 6-digit reset code
function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// API Endpoints
app.get('/api/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password').lean();
        // Map _id to id for frontend compatibility
        const formattedUsers = users.map(u => ({
            ...u,
            id: u._id.toString()
        }));
        res.json(formattedUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { name, email, role, plan } = req.body;
    
    if (role || plan) {
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'school-admin')) {
            return res.status(403).json({ error: 'FORBIDDEN', message: 'Chỉ Admin mới có thể thay đổi quyền hoặc gói' });
        }
    }
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (plan) updateData.plan = plan;

        // Smart sync for School Package
        const targetPlan = plan || user.plan;
        const targetRole = role || user.role || 'student';

        // 1. Upgrading to 'school' plan (No automatic default school assignment - user must link via invite code manually)
        if (plan === 'school' && user.plan !== 'school') {
            // schoolId is left null until the user explicitly links/joins a school via invite code
        }
        // 2. Downgrading from 'school' plan
        else if (plan && plan !== 'school' && user.plan === 'school') {
            if (user.schoolId) {
                const school = await School.findById(user.schoolId);
                if (school) {
                    if (user.role === 'teacher') {
                        school.teacherSeatsUsed = Math.max(0, school.teacherSeatsUsed - 1);
                    } else {
                        school.studentSeatsUsed = Math.max(0, school.studentSeatsUsed - 1);
                    }
                    await school.save();
                }
            }
            updateData.schoolId = null;
            updateData.className = '';
        }
        // 3. Changing role while already on 'school' plan
        else if (targetPlan === 'school' && role && role !== user.role && user.schoolId) {
            const school = await School.findById(user.schoolId);
            if (school) {
                if (user.role === 'teacher' && role === 'student') {
                    school.teacherSeatsUsed = Math.max(0, school.teacherSeatsUsed - 1);
                    school.studentSeatsUsed += 1;
                } else if (user.role === 'student' && role === 'teacher') {
                    school.studentSeatsUsed = Math.max(0, school.studentSeatsUsed - 1);
                    school.teacherSeatsUsed += 1;
                }
                await school.save();
            }
        }

        await User.findByIdAndUpdate(id, updateData);
        res.json({ message: 'Cập nhật người dùng thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    const { name, email, role, plan, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email đã được sử dụng' });

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);

        const newUser = await User.create({
            name, email, role: role || 'student', plan: plan || 'free', password: hashPassword
        });
        res.json({ id: newUser._id, message: 'Đăng ký thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Initialize Google OAuth Client
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

app.post('/api/auth/google', async (req, res) => {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Thiếu thông tin xác thực Google' });
    if (!googleClient) return res.status(500).json({ error: 'Chưa cấu hình Google Client ID trên Server' });

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) return res.status(400).json({ error: 'Token Google không hợp lệ' });

        const email = payload.email;
        let user = await User.findOne({ email });

        if (!user) {
            const salt = bcrypt.genSaltSync(10);
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashPassword = bcrypt.hashSync(randomPassword, salt);
            user = await User.create({
                name: payload.name || 'Người dùng Google',
                email: email,
                role: 'student',
                plan: 'free',
                password: hashPassword
            });
            console.log('[AUTH] New user registered via Google:', email);
        }

        let sessionToken = crypto.randomUUID();
        user.sessionToken = sessionToken;
        await user.save();

        res.json({
            message: 'Đăng nhập Google thành công',
            session_token: sessionToken,
            user_id: user._id,
            user_name: user.name,
            user_role: user.role,
            user_plan: user.plan
        });
    } catch (err) {
        console.error('[AUTH ERROR] Google login failed:', err);
        res.status(500).json({ error: 'Xác thực Google thất bại: ' + err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Mật khẩu không chính xác' });

        let sessionToken = crypto.randomUUID();
        user.sessionToken = sessionToken;
        await user.save();

        const userProfile = user.toObject();
        delete userProfile.password;
        userProfile.id = userProfile._id.toString();
        userProfile.sessionToken = sessionToken;
        
        res.json({ message: 'Đăng nhập thành công', user: userProfile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.all('/api/users*', (req, res, next) => {
    console.log(`[DEBUG] Request to ${req.path} with method ${req.method}`);
    next();
});


app.get('/api/models', async (req, res) => {
    try {
        // Tối ưu hóa: Chỉ select các trường cần thiết cho việc hiển thị danh sách (Dashboard, Library).
        // Loại bỏ các trường nặng như features, quiz có thể chứa base64 lớn gây lag web.
        const models = await Material.find({})
            .select('-features -quiz -whereItOccurs -relatedMaterials -funFact')
            .lean();
        const formatted = models.map(m => ({
            ...m,
            id: m._id.toString()
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/models/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const model = await Material.findById(id).lean();
        if (!model) return res.status(404).json({ error: 'Không tìm thấy học liệu' });
        const formatted = {
            ...model,
            id: model._id.toString()
        };
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/models', requireAdmin, async (req, res) => {
    const { 
        title, description, file_url, thumbnail, subject, grade, tags, type,
        subtitle, category, size, location, visibleInLM, features, funFact, whereItOccurs, source,
        relatedMaterials, quiz
    } = req.body;
    let tagsArray = Array.isArray(tags) ? tags : [];
    if (typeof tags === 'string') {
        try { tagsArray = JSON.parse(tags); } catch (e) { tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean); }
    }

    let featuresArray = Array.isArray(features) ? features : [];
    if (typeof features === 'string') {
        try { featuresArray = JSON.parse(features); } catch (e) {}
    }

    let relatedMaterialsArray = Array.isArray(relatedMaterials) ? relatedMaterials : [];
    if (typeof relatedMaterials === 'string') {
        try { relatedMaterialsArray = JSON.parse(relatedMaterials); } catch (e) { relatedMaterialsArray = relatedMaterials.split(',').map(r => r.trim()).filter(Boolean); }
    }

    let quizArray = Array.isArray(quiz) ? quiz : [];
    if (typeof quiz === 'string') {
        try { quizArray = JSON.parse(quiz); } catch (e) {}
    }

    try {
        const newModel = await Material.create({
            title, description, file_url, thumbnail: thumbnail || null, subject, grade, type: type || '3d-model', tags: tagsArray,
            subtitle, category, size, location, visibleInLM, features: featuresArray, funFact, whereItOccurs, source,
            relatedMaterials: relatedMaterialsArray, quiz: quizArray
        });
        res.json({ id: newModel._id, message: 'Lưu học liệu thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/models/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { 
        title, description, file_url, thumbnail, subject, grade, tags, type,
        subtitle, category, size, location, visibleInLM, features, funFact, whereItOccurs, source,
        relatedMaterials, requiredPlan, quiz
    } = req.body;

    let tagsArray = tags;
    if (tags !== undefined && !Array.isArray(tags)) {
        if (typeof tags === 'string') {
            try { tagsArray = JSON.parse(tags); } catch (e) { tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean); }
        }
    }

    let featuresArray = features;
    if (features !== undefined && !Array.isArray(features)) {
        if (typeof features === 'string') {
            try { featuresArray = JSON.parse(features); } catch (e) {}
        }
    }

    let relatedMaterialsArray = relatedMaterials;
    if (relatedMaterials !== undefined && !Array.isArray(relatedMaterials)) {
        if (typeof relatedMaterials === 'string') {
            try { relatedMaterialsArray = JSON.parse(relatedMaterials); } catch (e) { relatedMaterialsArray = relatedMaterials.split(',').map(r => r.trim()).filter(Boolean); }
        }
    }

    let quizArray = quiz;
    if (quiz !== undefined && !Array.isArray(quiz)) {
        if (typeof quiz === 'string') {
            try { quizArray = JSON.parse(quiz); } catch (e) {}
        }
    }

    try {
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (file_url !== undefined) updateData.file_url = file_url;
        if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
        if (subject !== undefined) updateData.subject = subject;
        if (grade !== undefined) updateData.grade = Number(grade);
        if (type !== undefined) updateData.type = type;
        if (tagsArray !== undefined) updateData.tags = tagsArray;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (category !== undefined) updateData.category = category;
        if (size !== undefined) updateData.size = size;
        if (location !== undefined) updateData.location = location;
        if (visibleInLM !== undefined) updateData.visibleInLM = visibleInLM;
        if (featuresArray !== undefined) updateData.features = featuresArray;
        if (funFact !== undefined) updateData.funFact = funFact;
        if (whereItOccurs !== undefined) updateData.whereItOccurs = whereItOccurs;
        if (source !== undefined) updateData.source = source;
        if (relatedMaterialsArray !== undefined) updateData.relatedMaterials = relatedMaterialsArray;
        if (quizArray !== undefined) updateData.quiz = quizArray;
        // requiredPlan: null means no restriction, string means minimum plan required
        if (requiredPlan !== undefined) updateData.requiredPlan = requiredPlan === '' ? null : requiredPlan;

        const updated = await Material.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: 'Không tìm thấy học liệu' });
        res.json({ message: 'Cập nhật học liệu thành công!', model: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/upload', requireAdmin, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Không có tệp nào được tải lên' });

    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        const fileBaseName = `${uniqueSuffix}${fileExt}`;
        const modelsDir = path.resolve(DATA_DIR, 'models');
        if (!fs.existsSync(modelsDir)) {
            fs.mkdirSync(modelsDir, { recursive: true });
        }

        const is3DModel = fileExt === '.glb' || fileExt === '.gltf';
        let finalBuffer = req.file.buffer;

        // Nếu là mô hình 3D, tiến hành nén Draco tự động
        if (is3DModel) {
            const tempPath = path.join(modelsDir, `temp_${fileBaseName}`);
            const outputPath = path.join(modelsDir, fileBaseName);
            
            // Ghi file tạm
            fs.writeFileSync(tempPath, req.file.buffer);
            
            try {
                console.log(`[DRACO] Khởi chạy nén mô hình 3D: ${req.file.originalname}`);
                await compress3DModel(tempPath, outputPath);
                
                // Đọc file đã nén thành buffer mới
                finalBuffer = fs.readFileSync(outputPath);
                
                // Xoá file tạm
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                
                // Nếu không dùng Supabase, file nén đã ở đúng localPath (outputPath).
                // Ta chỉ cần trả về url local.
                if (!supabase) {
                    const host = req.get('host');
                    const protocol = req.protocol;
                    const publicUrl = `${protocol}://${host}/models/${fileBaseName}`;
                    return res.json({ file_url: publicUrl, message: 'Tải lên và nén Draco cục bộ thành công' });
                }
            } catch (compressErr) {
                console.warn(`[DRACO WARNING] Nén Draco thất bại. Sử dụng file gốc. Lỗi: ${compressErr.message}`);
                // Fallback: Xoá file tạm nếu có, và dùng buffer gốc
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                
                // Nếu không dùng Supabase, ta ghi lại file gốc
                if (!supabase) {
                    fs.writeFileSync(outputPath, req.file.buffer);
                    const host = req.get('host');
                    const protocol = req.protocol;
                    const publicUrl = `${protocol}://${host}/models/${fileBaseName}`;
                    return res.json({ file_url: publicUrl, message: 'Tải lên cục bộ thành công (Nén Draco thất bại, dùng file gốc)' });
                }
            }
        } else {
            // Không phải file 3D, nếu không dùng Supabase thì ghi file trực tiếp xuống ổ đĩa
            if (!supabase) {
                const localPath = path.join(modelsDir, fileBaseName);
                fs.writeFileSync(localPath, req.file.buffer);
                const host = req.get('host');
                const protocol = req.protocol;
                const publicUrl = `${protocol}://${host}/models/${fileBaseName}`;
                return res.json({ file_url: publicUrl, message: 'Tải lên máy cục bộ thành công' });
            }
        }

        // Tải lên Supabase (cho cả file 3D nén/gốc hoặc file thường)
        const fileName = `models/${fileBaseName}`;
        const { data, error } = await supabase.storage
            .from(supabaseBucket)
            .upload(fileName, finalBuffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (error) throw error;

        // Xoá file nén local nếu dùng Supabase và đã nén thành công
        if (is3DModel && supabase) {
            const outputPath = path.join(modelsDir, fileBaseName);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }

        const { data: { publicUrl } } = supabase.storage
            .from(supabaseBucket)
            .getPublicUrl(fileName);

        res.json({ file_url: publicUrl, message: 'Tải lên Supabase thành công' });
    } catch (err) {
        console.error('[UPLOAD ERROR]', err.message);
        res.status(500).json({ error: 'Lỗi khi tải file lên: ' + err.message });
    }
});

app.post('/api/upload-thumbnail', requireAdmin, upload.single('thumbnail'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Không có ảnh nào được tải lên' });

    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = path.extname(req.file.originalname);
        const fileBaseName = `${uniqueSuffix}${fileExt}`;

        if (!supabase) {
            // Local Fallback
            const thumbnailsDir = path.resolve(DATA_DIR, 'thumbnails');
            if (!fs.existsSync(thumbnailsDir)) {
                fs.mkdirSync(thumbnailsDir, { recursive: true });
            }
            const localPath = path.join(thumbnailsDir, fileBaseName);
            fs.writeFileSync(localPath, req.file.buffer);
            console.log(`[LOCAL UPLOAD] Saved thumbnail locally at: ${localPath}`);
            
            const host = req.get('host');
            const protocol = req.protocol;
            const publicUrl = `${protocol}://${host}/thumbnails/${fileBaseName}`;
            
            return res.json({ thumbnail_url: publicUrl, message: 'Tải ảnh đại diện lên máy cục bộ thành công (Không có Supabase)' });
        }

        const fileName = `thumbnails/${fileBaseName}`;
        const { data, error } = await supabase.storage
            .from(supabaseBucket)
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(supabaseBucket)
            .getPublicUrl(fileName);

        res.json({ thumbnail_url: publicUrl, message: 'Tải ảnh đại diện lên Supabase thành công' });
    } catch (err) {
        console.error('[THUMBNAIL UPLOAD ERROR]', err.message);
        res.status(500).json({ error: 'Lỗi khi tải ảnh lên: ' + err.message });
    }
});

app.delete('/api/models/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    console.log(`[MODEL DELETION] Request to remove ID: ${id}`);
    try {
        const model = await Material.findById(id);
        
        if (!model) {
            console.log(`[MODEL DELETION] Model ID ${id} not found`);
            return res.status(404).json({ error: 'Không tìm thấy học liệu' });
        }

        // Cleanup Supabase Files
        const cleanupSupabase = async (url) => {
            if (!url || !supabase) return;
            try {
                // Extract path from public URL
                // Example URL: https://xyz.supabase.co/storage/v1/object/public/edu-material/models/123.glb
                if (url.includes(supabaseBucket)) {
                    const pathParts = url.split(`${supabaseBucket}/`);
                    if (pathParts.length > 1) {
                        const filePath = pathParts[1];
                        console.log(`[SUPABASE CLEANUP] Deleting: ${filePath}`);
                        await supabase.storage.from(supabaseBucket).remove([filePath]);
                    }
                }
            } catch (e) {
                console.error(`[SUPABASE CLEANUP ERROR] Lỗi khi xóa file Supabase:`, e.message);
            }
        };

        // Standard cleanup for local files (backward compatibility)
        const cleanupLocal = (fileUrl) => {
            if (!fileUrl) return;
            try {
                if (!fileUrl.startsWith('http')) {
                    const relativePath = fileUrl.replace(/^\/models\//, '').replace(/^\/thumbnails\//, '');
                    let fullPath;
                    if (fileUrl.startsWith('/models/')) fullPath = path.resolve(DATA_DIR, 'models', relativePath);
                    else if (fileUrl.startsWith('/thumbnails/')) fullPath = path.resolve(DATA_DIR, 'thumbnails', relativePath);

                    if (fullPath && fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            } catch (e) {}
        };

        if (model.file_url?.startsWith('http')) await cleanupSupabase(model.file_url);
        else cleanupLocal(model.file_url);

        if (model.thumbnail?.startsWith('http')) await cleanupSupabase(model.thumbnail);
        else cleanupLocal(model.thumbnail);

        await Material.findByIdAndDelete(id);
        console.log(`[MODEL DELETION] Successfully deleted model ID: ${id}`);
        res.json({ message: 'Xóa học liệu thành công' });
    } catch (err) {
        console.error('[MODEL DELETION ERROR] Lỗi khi xóa học liệu:', err.message);
        res.status(500).json({ error: 'Lỗi hệ thống khi xóa học liệu: ' + err.message });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email là bắt buộc' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'Email không tồn tại trong hệ thống' });

        const resetCode = generateResetCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await ResetToken.deleteMany({ email });
        await ResetToken.create({ email, token: resetCode, expires_at: expiresAt });

        const emailSubject = 'Mã khôi phục mật khẩu - Edu Tech';
        const emailText = `Xin chào ${user.name},\n\nChúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại Edu Tech. Vui lòng sử dụng mã xác nhận dưới đây để hoàn tất:\n\nMã xác nhận của bạn: ${resetCode}\n\nMã này có hiệu lực trong vòng 15 phút. Vì lý do bảo mật, vui lòng không chia sẻ mã này với bất kỳ ai.\n\nNếu bạn không yêu cầu thay đổi này, bạn có thể an tâm bỏ qua email này.\n\nCảm ơn bạn đã đồng hành cùng Edu Tech!\nTrân trọng,\nĐội ngũ hỗ trợ Edu Tech.`;
        const emailHtml = `<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 580px; margin: 0 auto; padding: 30px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; color: #1e293b; line-height: 1.6;">
  <!-- Header / Logo -->
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;">
      Edu Tech
    </div>
  </div>
  
  <!-- Content Body -->
  <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
    <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; font-weight: 700; color: #0f172a;">Xin chào ${user.name},</h2>
    <p style="margin-bottom: 24px; font-size: 15px; color: #475569;">Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại <strong>Edu Tech</strong>. Vui lòng sử dụng mã xác minh dưới đây để tiếp tục:</p>
    
    <!-- Code Box -->
    <div style="text-align: center; background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 1px dashed #cbd5e1;">
      <span style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600; margin-bottom: 8px;">Mã xác nhận của bạn</span>
      <div style="font-size: 32px; font-weight: 800; color: #2563eb; letter-spacing: 6px; font-family: monospace;">${resetCode}</div>
    </div>
    
    <p style="font-size: 13px; color: #ef4444; margin-bottom: 24px; font-weight: 500; text-align: center;">
      ⚠️ Mã xác nhận này có hiệu lực trong vòng 15 phút. Vì lý do bảo mật, vui lòng không chia sẻ mã này cho bất kỳ ai.
    </p>
    
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    
    <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
      Nếu bạn không gửi yêu cầu này, bạn có thể an tâm bỏ qua email.
    </p>
  </div>
  
  <!-- Footer -->
  <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
    <p style="margin: 0 0 8px 0;">Cảm ơn bạn đã đồng hành cùng Edu Tech!</p>
    <p style="margin: 0;">Trân trọng, Đội ngũ hỗ trợ Edu Tech.</p>
  </div>
</div>`;

        if (process.env.RESEND_API_KEY) {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: process.env.EMAIL_FROM || 'Hệ thống Học tập <noreply@edutechvn.me>',
                    to: email,
                    subject: emailSubject,
                    text: emailText,
                    html: emailHtml
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[AUTH] Resend API error:', errorData);
                throw new Error('Resend API failed: ' + JSON.stringify(errorData));
            }
            console.log(`[AUTH] Reset code sent via Resend API to ${email}`);
        } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // false for port 587 (STARTTLS)
                family: 4, // Force IPv4
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: emailSubject,
                text: emailText,
                html: emailHtml
            });
            console.log(`[AUTH] Reset code sent via SMTP to ${email}`);
        } else {
            console.log(`[DEMO] Chưa cấu hình Resend API hoặc SMTP! Mã reset cho ${email}: ${resetCode}`);
        }

        res.json({
            message: 'Mã xác nhận đã được gửi. Vui lòng kiểm tra hộp thư email của bạn.',
            user_name: user.name
        });
    } catch (err) {
        console.error('[AUTH] Forgot password error:', err);
        res.status(500).json({ error: 'Lỗi gửi email: Vui lòng kiểm tra lại cấu hình Email.' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });

    try {
        const resetRow = await ResetToken.findOne({ email, token });
        if (!resetRow) return res.status(400).json({ error: 'Mã xác nhận không hợp lệ' });
        if (Date.now() > resetRow.expires_at.getTime()) {
            await ResetToken.findByIdAndDelete(resetRow._id);
            return res.status(400).json({ error: 'Mã xác nhận đã hết hạn' });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);

        await User.updateOne({ email }, { password: hash });
        await ResetToken.deleteMany({ email });

        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ADMIN: AI CONFIG & PLAN PERMISSIONS API
// ==========================================

// Helper: get current AI limits from DB (with in-memory cache for performance)
let aiLimitsCache = null;
let aiLimitsCacheTime = 0;
const AI_LIMITS_CACHE_TTL = 60 * 1000; // 1 minute

async function getAILimits() {
    const now = Date.now();
    if (aiLimitsCache && now - aiLimitsCacheTime < AI_LIMITS_CACHE_TTL) {
        return aiLimitsCache;
    }
    const defaults = { free: 3, basic: 20, pro: 50, combo: 50, school: 100 };
    const config = await SystemConfig.findOne({ key: 'ai_limits' });
    aiLimitsCache = config ? { ...defaults, ...config.value } : defaults;
    aiLimitsCacheTime = now;
    return aiLimitsCache;
}

// GET /api/admin/ai-config — Lấy config giới hạn AI theo gói
app.get('/api/admin/ai-config', async (req, res) => {
    try {
        const limits = await getAILimits();
        res.json({ limits });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/ai-config — Admin cập nhật config giới hạn AI
app.put('/api/admin/ai-config', requireAdmin, async (req, res) => {
    try {

        const { limits } = req.body;
        if (!limits || typeof limits !== 'object') {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }

        // Validate: all values must be numbers (-1 = unlimited)
        for (const [plan, val] of Object.entries(limits)) {
            if (typeof val !== 'number' || (!Number.isInteger(val)) || val < -1) {
                return res.status(400).json({ error: `Giá trị không hợp lệ cho gói "${plan}": phải là số nguyên >= -1` });
            }
        }

        await SystemConfig.findOneAndUpdate(
            { key: 'ai_limits' },
            { value: limits },
            { upsert: true, new: true }
        );

        // Invalidate cache
        aiLimitsCache = null;
        aiLimitsCacheTime = 0;

        console.log('[ADMIN] AI limits updated:', limits);
        res.json({ message: 'Cập nhật cấu hình AI thành công', limits });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// AI SEARCH ENDPOINT (with server-side rate limiting)
// ==========================================

// In-memory rate-limit store: Map<key, { date: string, count: number }>
// key = userId (authenticated) or ip (guest)
// date = 'YYYY-MM-DD' in Asia/Ho_Chi_Minh timezone — resets at 00:00 daily
const aiRateLimitStore = new Map();

function getVNDateString() {
    return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }); // 'YYYY-MM-DD'
}

function checkAndIncrementAIUsage(key, limit) {
    const today = getVNDateString();
    const entry = aiRateLimitStore.get(key);

    if (!entry || entry.date !== today) {
        // New day — reset counter
        aiRateLimitStore.set(key, { date: today, count: 1 });
        return { allowed: true, count: 1, limit };
    }

    if (limit !== -1 && entry.count >= limit) {
        return { allowed: false, count: entry.count, limit };
    }

    entry.count += 1;
    aiRateLimitStore.set(key, entry);
    return { allowed: true, count: entry.count, limit };
}

function getAIUsageCount(key) {
    const today = getVNDateString();
    const entry = aiRateLimitStore.get(key);
    if (!entry || entry.date !== today) return 0;
    return entry.count;
}

// Cleanup old entries every hour
setInterval(() => {
    const today = getVNDateString();
    for (const [key, entry] of aiRateLimitStore.entries()) {
        if (entry.date !== today) aiRateLimitStore.delete(key);
    }
}, 60 * 60 * 1000);

const aiSearchCache = new Map();
app.post('/api/ai-search', async (req, res) => {
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ error: 'Vui lòng nhập nội dung tìm kiếm' });

    try {
        // --- Server-side rate limiting ---
        let rawUserId = req.headers['x-user-id'];
        // Handle duplicate headers (comma-separated or array)
        if (Array.isArray(rawUserId)) rawUserId = rawUserId[0];
        if (typeof rawUserId === 'string' && rawUserId.includes(',')) rawUserId = rawUserId.split(',')[0].trim();
        const userId = (rawUserId && /^[a-fA-F0-9]{24}$/.test(rawUserId)) ? rawUserId : null;

        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
        const rateLimitKey = userId || `ip:${clientIp}`;

        // Get user plan
        let userPlan = 'free';
        if (userId) {
            try {
                const user = await User.findById(userId).select('plan role');
                if (user) {
                    // Admin and school-admin have no limits
                    if (user.role === 'admin' || user.role === 'school-admin') {
                        userPlan = 'unlimited';
                    } else {
                        userPlan = (user.plan || 'free').toLowerCase();
                    }
                }
            } catch (e) {
                console.warn('[AI Rate Limit] Could not fetch user:', e.message);
            }
        }


        const limits = await getAILimits();
        const planLimit = userPlan === 'unlimited' ? -1 : (limits[userPlan] ?? limits['free'] ?? 3);
        const usageResult = checkAndIncrementAIUsage(rateLimitKey, planLimit);

        if (!usageResult.allowed) {
            return res.status(429).json({
                error: 'RATE_LIMIT_EXCEEDED',
                message: `Bạn đã dùng hết ${usageResult.limit} lượt AI hôm nay. Hạn mức sẽ được đặt lại lúc 00:00.`,
                count: usageResult.count,
                limit: usageResult.limit,
                plan: userPlan
            });
        }
        // --- End rate limiting ---

        const cacheKey = query.toLowerCase().trim();
        if (aiSearchCache.has(cacheKey)) return res.json(aiSearchCache.get(cacheKey));

        const models = await Material.find({});
        const formattedModels = models.map(m => ({
            ...m.toObject(),
            id: m._id.toString()
        }));

        if (formattedModels.length === 0) {
            return res.json({ results: [], ai_insight: 'Thư viện trống.', keywords: [], predicted_subject: null });
        }

        let aiAnalysis = null;
        const apiKey = process.env.GEMINI_API_KEY;

        if (apiKey && apiKey !== 'YOUR_API_KEY_HERE' && apiKey !== 'YOUR_NEW_API_KEY_HERE') {
            const genAI = new GoogleGenerativeAI(apiKey);
            const modelSummary = models.map(m => `ID:${m.id} | Title:${m.title} | Subject:${m.subject} | Description:${m.description || ''} | Tags:${JSON.stringify(m.tags)}`).join('\n');

            const prompt = `You are a search query assistant for an educational 3D models and materials library.
Analyze the user search query in Vietnamese/English, understand the intent, extract/expand search terms, predict the subject, and match relevant models from the database.

User Search Query: "${query}"

Available Library Models:
${modelSummary}

Instructions:
1. "keywords": Extract key concepts from the query. Expand with synonyms, standard Vietnamese spelling, accents/non-accents, and English translations.
   SPECIAL BIOLOGY OPTIMIZATION: If the query is related to biology, cell biology, genetics, ecosystems, botany, zoology, physiology, human organs/anatomy, or medicine:
   - Perform deep synonym expansion. Map general terms to specific biological concepts and English terms.
   - Example: "quang hợp" -> ["photosynthesis", "chloroplast", "thực vật", "quang tự dưỡng", "lục lạp", "quá trình quang hợp"]; "tế bào" -> ["cell", "tế bào thực vật", "tế bào động vật", "bào quan", "organelle", "ti thể", "mitochondria", "nhân tế bào", "nucleus"]; "gen" or "di truyền" -> ["gene", "dna", "di truyền", "xoắn kép", "nhiễm sắc thể", "chromosome"]; "tuần hoàn" or "tim" -> ["circulatory", "heart", "hệ tuần hoàn", "máu", "tế bào bạch cầu", "white blood cell", "cơ tim"].
2. "predicted_subject": Infer the subject. MUST be exactly one of: "physics", "chemistry", "biology", or null. For any biology-related query (including anatomy, physiology, genetics, ecology, and botany), ensure it is classified as "biology".
3. "intent": A brief, professional search intent summary in Vietnamese.
4. "matched_ids": Select IDs of the library models that match the query or expanded concepts. Order them by relevance (highest match first). Only include models that actually fit the search intent.

Return strictly a valid JSON object matching this schema (do not output any markdown formatting, only the JSON block):
{
  "keywords": ["keyword1", "keyword2"],
  "predicted_subject": "physics" | "chemistry" | "biology" | null,
  "intent": "Ý định tìm kiếm bằng tiếng Việt",
  "matched_ids": ["id1", "id2"]
}`;

            const fallbackModels = [
                'gemini-2.5-flash',
                'gemini-2.0-flash',
                'gemini-1.5-flash',
                'gemini-1.5-pro'
            ];

            for (const modelName of fallbackModels) {
                try {
                    console.log(`[AI Search] Trying model: ${modelName}`);
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent(prompt);
                    const responseText = result.response.text().trim();
                    let cleanJson = responseText.replace(/```json\n?/, '').replace(/\n?```/, '');
                    aiAnalysis = JSON.parse(cleanJson);
                    console.log(`[AI Search] Success with model: ${modelName}`);
                    break;
                } catch (e) {
                    console.error(`[AI Search] Model ${modelName} failed:`, e.message);
                }
            }
        }

        const searchTerms = query.toLowerCase().split(/[\s,]+/).filter(t => t.length > 1);
        const aiKeywords = Array.isArray(aiAnalysis?.keywords)
            ? aiAnalysis.keywords.filter(k => typeof k === 'string').map(k => k.toLowerCase())
            : [];
        const allKeywords = [...new Set([...searchTerms, ...aiKeywords])];
        const predictedSubject = typeof aiAnalysis?.predicted_subject === 'string' ? aiAnalysis.predicted_subject : null;
        const aiMatchedIds = Array.isArray(aiAnalysis?.matched_ids)
            ? aiAnalysis.matched_ids.map(id => String(id))
            : [];

        const scoredModels = formattedModels.map(m => {
            let score = 0;
            const titleLower = (m.title || '').toLowerCase();
            const tags = Array.isArray(m.tags) ? m.tags : [];
            const tagsLower = tags.map(t => t.toLowerCase());

            const aiIndex = aiMatchedIds.indexOf(m.id);
            if (aiIndex !== -1) score += 30 * (aiMatchedIds.length - aiIndex);
            if (predictedSubject && m.subject === predictedSubject) score += 20;

            for (const kw of allKeywords) {
                if (tagsLower.some(t => t.includes(kw))) score += 15;
                if (titleLower.includes(kw)) score += 10;
            }
            return { ...m, score };
        });

        const rankedResults = scoredModels.filter(m => m.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
        const responseData = {
            results: rankedResults,
            ai_insight: aiAnalysis?.intent || `Tìm kiếm: ${allKeywords.join(', ')}`,
            keywords: allKeywords,
            predicted_subject: predictedSubject
        };

        aiSearchCache.set(cacheKey, responseData);
        setTimeout(() => aiSearchCache.delete(cacheKey), 5 * 60 * 1000);
        res.json(responseData);

    } catch (error) {
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
});

// ==========================================
// LESSONS API ENDPOINTS
// ==========================================

// Get all lessons (supports filtering by subject and grade)
app.get('/api/lessons', async (req, res) => {
    const { subject, grade } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (grade) query.grade = Number(grade);

    try {
        const lessons = await Lesson.find(query)
            .populate('materials')
            .sort({ chapter: 1, order: 1, createdAt: -1 });

        const formatted = lessons.map(l => ({
            ...l.toObject(),
            id: l._id.toString()
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single lesson by ID
app.get('/api/lessons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const lesson = await Lesson.findById(id).populate('materials');
        if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' });
        const formatted = lesson.toObject();
        formatted.id = lesson._id.toString();
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new lesson
app.post('/api/lessons', async (req, res) => {
    const { title, description, subject, grade, chapter, materials, order } = req.body;
    try {
        const newLesson = await Lesson.create({
            title,
            description: description || '',
            subject,
            grade: Number(grade),
            chapter: chapter || '',
            materials: materials || [],
            order: Number(order || 0)
        });
        res.json({ id: newLesson._id, message: 'Tạo bài học thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a lesson (supports bulk adding/modifying the materials array)
app.put('/api/lessons/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, subject, grade, chapter, materials, order } = req.body;
    try {
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (subject !== undefined) updateData.subject = subject;
        if (grade !== undefined) updateData.grade = Number(grade);
        if (chapter !== undefined) updateData.chapter = chapter;
        if (materials !== undefined) updateData.materials = materials;
        if (order !== undefined) updateData.order = Number(order);

        const updated = await Lesson.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: 'Không tìm thấy bài học' });
        res.json({ message: 'Cập nhật bài học thành công!', lesson: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a lesson
app.delete('/api/lessons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Lesson.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Không tìm thấy bài học' });
        res.json({ message: 'Xóa bài học thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// SCHOOL PORTAL API ENDPOINTS
// ==========================================

app.post('/api/school/join', async (req, res) => {
    const { schoolCode, requestedRole, requestedClass, userId } = req.body;
    if (!schoolCode || !requestedRole || !userId) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (mã trường, vai trò, userId)' });
    }

    try {
        const school = await School.findOne({ schoolCode: schoolCode.trim().toUpperCase() });
        if (!school) {
            return res.status(404).json({ error: 'Mã mời trường học không tồn tại' });
        }

        if (!school.isInviteCodeEnabled) {
            return res.status(400).json({ error: 'Tính năng gia nhập bằng mã tạm thời bị tắt bởi trường học' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        if (user.schoolId) {
            return res.status(400).json({ error: 'Tài khoản của bạn đã được liên kết với một trường học' });
        }

        // IF THE USER IS A SCHOOL ADMIN (plan === 'school' && role === 'school-admin'), link immediately!
        if (user.role === 'school-admin' && user.plan === 'school') {
            user.schoolId = school._id;
            await user.save();
            return res.json({ 
                message: 'Liên kết Quản trị viên Trường học thành công!', 
                success: true,
                user: {
                    ...user.toObject(),
                    id: user._id.toString()
                }
            });
        }

        const existingRequest = await MembershipRequest.findOne({ userId, status: 'pending' });
        if (existingRequest) {
            return res.status(400).json({ error: 'Bạn đã gửi một yêu cầu tham gia và đang chờ duyệt' });
        }

        await MembershipRequest.create({
            schoolId: school._id,
            userId,
            requestedRole,
            requestedClass: requestedClass || '',
            status: 'pending'
        });

        res.json({ message: 'Gửi yêu cầu tham gia thành công! Vui lòng chờ Ban giám hiệu phê duyệt.' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

app.get('/api/school/summary', async (req, res) => {
    const { schoolId } = req.query;
    if (!schoolId) {
        return res.status(400).json({ error: 'Thiếu mã trường học (schoolId)' });
    }

    try {
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ error: 'Không tìm thấy trường học' });
        }

        res.json(school);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

app.get('/api/school/requests', async (req, res) => {
    const { schoolId } = req.query;
    if (!schoolId) {
        return res.status(400).json({ error: 'Thiếu mã trường học (schoolId)' });
    }

    try {
        const requests = await MembershipRequest.find({ schoolId, status: 'pending' })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        const formattedRequests = requests.map(r => ({
            id: r._id.toString(),
            userId: r.userId?._id?.toString() || '',
            userName: r.userId?.name || 'Chưa cập nhật',
            userEmail: r.userId?.email || '',
            requestedRole: r.requestedRole,
            requestedClass: r.requestedClass,
            status: r.status,
            createdAt: r.createdAt
        }));

        res.json(formattedRequests);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

app.post('/api/school/requests/approve', async (req, res) => {
    const { requestIds, schoolId } = req.body;
    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0 || !schoolId) {
        return res.status(400).json({ error: 'Thiếu thông tin phê duyệt' });
    }

    try {
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ error: 'Không tìm thấy trường học' });
        }

        const requests = await MembershipRequest.find({
            _id: { $in: requestIds },
            schoolId,
            status: 'pending'
        });

        if (requests.length === 0) {
            return res.status(400).json({ error: 'Không tìm thấy yêu cầu chờ duyệt nào phù hợp' });
        }

        let teachersToApprove = 0;
        let studentsToApprove = 0;
        requests.forEach(r => {
            if (r.requestedRole === 'teacher') teachersToApprove++;
            else if (r.requestedRole === 'student') studentsToApprove++;
        });

        const remainingTeacherSeats = school.teacherQuota - school.teacherSeatsUsed;
        const remainingStudentSeats = school.studentQuota - school.studentSeatsUsed;

        if (teachersToApprove > remainingTeacherSeats || studentsToApprove > remainingStudentSeats) {
            return res.status(400).json({
                error: `Không thể phê duyệt! Vượt quá giới hạn quota khả dụng. GV cần duyệt: ${teachersToApprove} (còn trống ${remainingTeacherSeats} chỗ), HS cần duyệt: ${studentsToApprove} (còn trống ${remainingStudentSeats} chỗ)`
            });
        }

        for (const reqObj of requests) {
            const user = await User.findById(reqObj.userId);
            if (user) {
                user.schoolId = school._id;
                user.className = reqObj.requestedClass || '';
                user.role = reqObj.requestedRole;
                // Save previous plan before overriding to pro, default to free if missing
                user.previousPlan = user.plan || 'free';
                user.plan = 'pro';
                await user.save();
            }

            if (reqObj.requestedRole === 'teacher') {
                school.teacherSeatsUsed += 1;
            } else if (reqObj.requestedRole === 'student') {
                school.studentSeatsUsed += 1;
            }

            reqObj.status = 'approved';
            await reqObj.save();
        }

        await school.save();
        res.json({ message: `Đã phê duyệt thành công ${requests.length} thành viên vào trường học!` });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

app.post('/api/school/requests/reject', async (req, res) => {
    const { requestIds } = req.body;
    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
        return res.status(400).json({ error: 'Thiếu danh sách yêu cầu cần từ chối' });
    }

    try {
        await MembershipRequest.updateMany(
            { _id: { $in: requestIds }, status: 'pending' },
            { $set: { status: 'rejected' } }
        );

        res.json({ message: `Đã từ chối thành công ${requestIds.length} yêu cầu tham gia.` });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

app.get('/api/school/members', async (req, res) => {
    const { schoolId } = req.query;
    if (!schoolId) {
        return res.status(400).json({ error: 'Thiếu mã trường học (schoolId)' });
    }

    try {
        // Cast schoolId string to ObjectId explicitly for reliable matching
        let schoolObjId;
        try {
            schoolObjId = new mongoose.Types.ObjectId(schoolId);
        } catch {
            return res.status(400).json({ error: 'schoolId không hợp lệ' });
        }

        // Include all members with this schoolId: teacher, student, school-admin
        // (role: 'admin' is excluded as they are global admins, not school-specific)
        const members = await User.find({
            schoolId: schoolObjId,
            role: { $in: ['teacher', 'student', 'school-admin'] }
        })
            .select('name email role className plan previousPlan createdAt')
            .sort({ createdAt: -1 });

        const formattedMembers = members.map(m => ({
            id: m._id.toString(),
            name: m.name || 'Chưa cập nhật',
            email: m.email,
            role: m.role,
            className: m.className || '—',
            plan: m.plan,
            previousPlan: m.previousPlan,
            joinedAt: m.createdAt
        }));

        res.json(formattedMembers);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

app.post('/api/school/members/kick', async (req, res) => {
    const { memberIds, schoolId } = req.body;
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0 || !schoolId) {
        return res.status(400).json({ error: 'Thiếu thông tin người dùng cần xóa' });
    }

    try {
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ error: 'Không tìm thấy trường học' });
        }

        const members = await User.find({
            _id: { $in: memberIds },
            schoolId,
            role: { $in: ['teacher', 'student'] }
        });

        if (members.length === 0) {
            return res.status(400).json({ error: 'Không tìm thấy thành viên hợp lệ' });
        }

        let teachersRemoved = 0;
        let studentsRemoved = 0;

        for (const user of members) {
            if (user.role === 'teacher') teachersRemoved++;
            else if (user.role === 'student') studentsRemoved++;

            user.schoolId = null;
            user.className = '';
            // Revert plan
            user.plan = user.previousPlan || 'free';
            user.role = 'student'; // reset role to default student
            await user.save();
        }

        school.teacherSeatsUsed = Math.max(0, school.teacherSeatsUsed - teachersRemoved);
        school.studentSeatsUsed = Math.max(0, school.studentSeatsUsed - studentsRemoved);
        await school.save();

        res.json({ message: `Đã xóa thành công ${members.length} thành viên khỏi trường học.` });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});


// POST /api/school/members/leave - User self-leaves from school
app.post('/api/school/members/leave', async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'Thiếu userId' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        if (!user.schoolId) {
            return res.status(400).json({ error: 'Người dùng chưa tham gia trường học nào' });
        }

        const school = await School.findById(user.schoolId);
        if (school) {
            if (user.role === 'teacher') {
                school.teacherSeatsUsed = Math.max(0, school.teacherSeatsUsed - 1);
            } else if (user.role === 'student') {
                school.studentSeatsUsed = Math.max(0, school.studentSeatsUsed - 1);
            }
            await school.save();
        }

        // Revert user's plan and reset school-related fields
        const previousPlan = user.previousPlan || 'free';
        user.plan = previousPlan;
        user.role = 'student';
        user.schoolId = null;
        user.className = '';
        await user.save();

        // Also cancel any pending membership requests for this user
        await MembershipRequest.deleteMany({ userId, status: 'pending' });

        res.json({
            message: 'Đã rời khỏi trường học thành công.',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan,
                schoolId: null,
                className: ''
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});


app.put('/api/school/config', async (req, res) => {
    const { schoolId, isInviteCodeEnabled, schoolCode, name, schoolYear, tiet } = req.body;
    if (!schoolId) {
        return res.status(400).json({ error: 'Thiếu mã trường học (schoolId)' });
    }

    try {
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ error: 'Không tìm thấy trường học' });
        }

        if (typeof isInviteCodeEnabled === 'boolean') {
            school.isInviteCodeEnabled = isInviteCodeEnabled;
        }

        if (name && name.trim()) {
            school.name = name.trim();
        }

        if (schoolYear !== undefined) {
            school.schoolYear = schoolYear.trim();
        }

        if (tiet !== undefined) {
            school.tiet = tiet.trim();
        }

        if (schoolCode && schoolCode.trim()) {
            const trimmedCode = schoolCode.trim().toUpperCase();
            const existingSchool = await School.findOne({ schoolCode: trimmedCode, _id: { $ne: schoolId } });
            if (existingSchool) {
                return res.status(400).json({ error: 'Mã mời này đã được sử dụng bởi trường học khác' });
            }
            school.schoolCode = trimmedCode;
        }

        await school.save();
        res.json({ message: 'Cập nhật cấu hình trường học thành công!', school });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

// GET /api/schools - Get all schools
app.get('/api/schools', async (req, res) => {
    try {
        const schools = await School.find({}).sort({ createdAt: -1 });
        const formatted = schools.map(s => ({
            ...s.toObject(),
            id: s._id.toString()
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

// POST /api/schools - Create a new school
app.post('/api/schools', async (req, res) => {
    const { name, schoolCode, teacherQuota, studentQuota, schoolYear, tiet } = req.body;
    if (!name || !schoolCode) {
        return res.status(400).json({ error: 'Thiếu tên trường học hoặc mã mời' });
    }

    try {
        const codeUpper = schoolCode.trim().toUpperCase();
        const existing = await School.findOne({ schoolCode: codeUpper });
        if (existing) {
            return res.status(400).json({ error: 'Mã mời trường học này đã được sử dụng' });
        }

        const newSchool = await School.create({
            name: name.trim(),
            schoolCode: codeUpper,
            teacherQuota: Number(teacherQuota) || 30,
            studentQuota: Number(studentQuota) || 10,
            schoolYear: (schoolYear || '').trim(),
            tiet: (tiet || '').trim(),
            teacherSeatsUsed: 0,
            studentSeatsUsed: 0,
            isInviteCodeEnabled: true
        });

        res.json({ id: newSchool._id, school: newSchool, message: 'Thêm trường học mới thành công!' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

// PUT /api/schools/:id - Update school info
app.put('/api/schools/:id', async (req, res) => {
    const { id } = req.params;
    const { name, schoolCode, teacherQuota, studentQuota, schoolYear, tiet } = req.body;

    try {
        const school = await School.findById(id);
        if (!school) {
            return res.status(404).json({ error: 'Không tìm thấy trường học' });
        }

        if (name) school.name = name.trim();
        if (schoolYear !== undefined) school.schoolYear = schoolYear.trim();
        if (tiet !== undefined) school.tiet = tiet.trim();
        if (teacherQuota !== undefined) school.teacherQuota = Number(teacherQuota);
        if (studentQuota !== undefined) school.studentQuota = Number(studentQuota);

        if (schoolCode && schoolCode.trim()) {
            const codeUpper = schoolCode.trim().toUpperCase();
            if (codeUpper !== school.schoolCode) {
                const existing = await School.findOne({ schoolCode: codeUpper, _id: { $ne: id } });
                if (existing) {
                    return res.status(400).json({ error: 'Mã mời này đã được sử dụng bởi trường học khác' });
                }
                school.schoolCode = codeUpper;
            }
        }

        await school.save();
        res.json({ message: 'Cập nhật trường học thành công!', school });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

// DELETE /api/schools/:id - Delete school and unlink members
app.delete('/api/schools/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const school = await School.findById(id);
        if (!school) {
            return res.status(404).json({ error: 'Không tìm thấy trường học' });
        }

        await User.updateMany({ schoolId: id }, { schoolId: null, className: '', plan: 'free' });
        await MembershipRequest.deleteMany({ schoolId: id });

        await School.findByIdAndDelete(id);
        res.json({ message: 'Xóa trường học thành công!' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

// ==========================================
// PAYMENT AND BANK TRANSFER API ENDPOINTS
// ==========================================

// Function to automatically reject pending payments older than 30 minutes
async function checkAndExpirePayments() {
    try {
        const expiryTime = new Date(Date.now() - 30 * 60 * 1000);
        const result = await Payment.updateMany(
            { status: 'pending', createdAt: { $lt: expiryTime } },
            { $set: { status: 'rejected' } }
        );
        if (result.modifiedCount > 0) {
            console.log(`[PAYMENT AUTO-EXPIRY] Marked ${result.modifiedCount} pending payments as rejected (older than 30 mins).`);
        }
    } catch (err) {
        console.error('[PAYMENT AUTO-EXPIRY ERROR] Failed to auto-expire payments:', err.message);
    }
}

// Start background periodic check every 1 minute
setInterval(checkAndExpirePayments, 60 * 1000);
// Run once immediately on startup/reload
checkAndExpirePayments();

// POST /api/payments - Create or retrieve a payment intent
app.post('/api/payments', async (req, res) => {
    const { userId, planId, amount } = req.body;
    if (!userId || !planId || amount === undefined) {
        return res.status(400).json({ error: 'Thiếu thông tin người dùng, gói hoặc số tiền' });
    }

    try {
        await checkAndExpirePayments();
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        // Check if there is already a pending payment for the same plan & user
        const existingPayment = await Payment.findOne({ userId, planId, status: 'pending' });
        if (existingPayment) {
            return res.json(existingPayment);
        }

        // Generate a highly unique and distinct payment code
        // Format: EDUPAY + PLAN_NAME (uppercase) + LAST_6_CHARS_OF_USER_ID + RANDOM_3_DIGITS
        const shortUserId = userId.toString().substring(userId.toString().length - 6).toUpperCase();
        const rand = Math.floor(100 + Math.random() * 900);
        const planCode = planId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const paymentCode = `EDUPAY${planCode}${shortUserId}${rand}`;

        const bankName = process.env.PAYMENT_BANK_ID || 'TPB';
        const accountNumber = process.env.PAYMENT_ACCOUNT_NO || '00000801691';
        const accountName = process.env.PAYMENT_ACCOUNT_NAME || 'PHAM NGOC BACH';

        const payment = await Payment.create({
            userId,
            planId,
            amount: Number(amount),
            paymentCode,
            status: 'pending',
            bankName,
            accountNumber,
            accountName
        });

        res.json(payment);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống khi tạo thanh toán: ' + err.message });
    }
});

// GET /api/payments - Get all payments (Admin audit)
app.get('/api/payments', async (req, res) => {
    try {
        await checkAndExpirePayments();
        const payments = await Payment.find({})
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        const formatted = payments.map(p => {
            const pObj = p.toObject();
            return {
                ...pObj,
                id: pObj._id.toString(),
                userId: pObj.userId?._id?.toString() || '',
                userName: pObj.userId?.name || 'Không xác định',
                userEmail: pObj.userId?.email || ''
            };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống lấy danh sách thanh toán: ' + err.message });
    }
});

// GET /api/payments/user/:userId - Get payments of a specific user
app.get('/api/payments/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await checkAndExpirePayments();
        const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
        const formatted = payments.map(p => ({
            ...p.toObject(),
            id: p._id.toString()
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

// GET /api/payments/check/:paymentCode - Quick status check by payment code (for frontend polling)
app.get('/api/payments/check/:paymentCode', async (req, res) => {
    const { paymentCode } = req.params;
    if (!paymentCode) {
        return res.status(400).json({ error: 'Thiếu mã giao dịch' });
    }

    try {
        await checkAndExpirePayments();
        const payment = await Payment.findOne({ paymentCode: paymentCode.toUpperCase() });
        if (!payment) {
            return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
        }
        res.json({
            id: payment._id.toString(),
            status: payment.status,
            planId: payment.planId,
            amount: payment.amount,
            paymentCode: payment.paymentCode,
            createdAt: payment.createdAt
        });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống: ' + err.message });
    }
});

app.post('/api/payments/:id/approve', async (req, res) => {
    const { id } = req.params;
    try {
        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ error: 'Không tìm thấy thông tin giao dịch' });
        }

        if (payment.status === 'approved') {
            return res.status(400).json({ error: 'Giao dịch này đã được phê duyệt trước đó' });
        }

        // 1. Update payment status
        payment.status = 'approved';
        await payment.save();

        // 2. Activate user plan & upgrade role to school-admin if school plan
        const updateFields = { plan: payment.planId };
        if (payment.planId === 'school') {
            updateFields.role = 'school-admin';
        }
        await User.findByIdAndUpdate(payment.userId, updateFields);

        res.json({ message: 'Phê duyệt giao dịch và kích hoạt tài khoản thành công!' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống phê duyệt: ' + err.message });
    }
});

// POST /api/payments/:id/reject - Reject a payment
app.post('/api/payments/:id/reject', async (req, res) => {
    const { id } = req.params;
    try {
        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ error: 'Không tìm thấy thông tin giao dịch' });
        }

        payment.status = 'rejected';
        await payment.save();

        res.json({ message: 'Đã từ chối giao dịch thành công!' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi hệ thống từ chối giao dịch: ' + err.message });
    }
});

// POST /api/webhooks/payment - Instant payment automatic check (SePay / Casso compatible)
app.post('/api/webhooks/payment', async (req, res) => {
    console.log('[PAYMENT WEBHOOK] Received payload:', JSON.stringify(req.body));

    // ── SePay Webhook Signature Verification ──────────────────────────────────
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret !== 'your-sepay-webhook-secret-here') {
        // SePay sends the secret in the Authorization header as: "Apikey <secret>"
        const authHeader = req.headers['authorization'] || '';
        const tokenHeader = req.headers['x-webhook-token'] || req.headers['x-sepay-token'] || '';
        const providedSecret = authHeader.startsWith('Apikey ') 
            ? authHeader.replace('Apikey ', '').trim() 
            : tokenHeader.trim();
        
        if (providedSecret !== webhookSecret) {
            console.warn('[PAYMENT WEBHOOK] Invalid secret token. Possible spoofed request.');
            return res.status(401).json({ error: 'Unauthorized: Invalid webhook secret' });
        }
        console.log('[PAYMENT WEBHOOK] Secret token verified OK.');
    }
    
    try {
        let paymentCode = '';
        let amountPaid = 0;

        // SePay body format parser (standard fields)
        if (req.body.content !== undefined && req.body.transferAmount !== undefined) {
            paymentCode = req.body.content || '';
            amountPaid = Number(req.body.transferAmount);
            console.log(`[PAYMENT WEBHOOK] SePay format detected. Content: "${paymentCode}", Amount: ${amountPaid}`);
        }
        // Casso body format parser
        else if (req.body.data && Array.isArray(req.body.data) && req.body.data.length > 0) {
            const tx = req.body.data[0];
            paymentCode = tx.description || tx.memo || '';
            amountPaid = Number(tx.amount);
            console.log(`[PAYMENT WEBHOOK] Casso format detected. Description: "${paymentCode}", Amount: ${amountPaid}`);
        }
        // Custom fallbacks
        else {
            paymentCode = req.body.code || req.body.memo || req.body.description || req.body.content || '';
            amountPaid = Number(req.body.amount || 0);
            console.log(`[PAYMENT WEBHOOK] Generic format. Code: "${paymentCode}", Amount: ${amountPaid}`);
        }

        if (!paymentCode) {
            return res.status(400).json({ error: 'Không tìm thấy mã nội dung chuyển khoản trong webhook body' });
        }

        // Use regex to isolate our pattern: EDUPAY + PLAN + USERID_SHORT + RAND
        const match = paymentCode.match(/EDUPAY[A-Z0-9]+/i);
        if (!match) {
            console.warn(`[PAYMENT WEBHOOK] No EDUPAY code found in content: "${paymentCode}"`);
            return res.status(400).json({ error: 'Nội dung chuyển khoản không khớp cú pháp EDUPAY' });
        }
        
        const cleanCode = match[0].toUpperCase();
        console.log(`[PAYMENT WEBHOOK] Extracted paymentCode: ${cleanCode}, Amount: ${amountPaid}`);

        const payment = await Payment.findOne({ paymentCode: cleanCode, status: 'pending' });
        if (!payment) {
            console.log(`[PAYMENT WEBHOOK] Payment code ${cleanCode} not found in pending status.`);
            return res.status(404).json({ error: 'Không tìm thấy giao dịch thanh toán chờ duyệt tương ứng' });
        }

        // Validate amount — allow slight over-payment (rounding, fees), block underpayment
        if (amountPaid < payment.amount) {
            console.warn(`[PAYMENT WEBHOOK] Insufficient amount. Expected: ${payment.amount}, Paid: ${amountPaid}`);
            return res.status(400).json({ error: `Số tiền chuyển khoản không đủ. Yêu cầu: ${payment.amount}, Nhận được: ${amountPaid}` });
        }

        // Approve transaction automatically
        payment.status = 'approved';
        await payment.save();

        // Kích hoạt gói dịch vụ cho User và nâng cấp vai trò lên school-admin nếu mua gói trường học
        const updateFields = { plan: payment.planId };
        if (payment.planId === 'school') {
            updateFields.role = 'school-admin';
        }
        await User.findByIdAndUpdate(payment.userId, updateFields);
        console.log(`[PAYMENT WEBHOOK SUCCESS] Auto-approved payment ${cleanCode} → User ${payment.userId} → Plan ${payment.planId}`);

        res.json({ 
            success: true, 
            message: `Tự động phê duyệt giao dịch và kích hoạt tài khoản gói ${payment.planId} thành công!`,
            paymentCode: cleanCode,
            planId: payment.planId
        });
    } catch (err) {
        console.error('[PAYMENT WEBHOOK ERROR]', err.message);
        res.status(500).json({ error: 'Lỗi máy chủ khi xử lý Webhook thanh toán: ' + err.message });
    }
});

app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

app.get('*', (req, res) => {
    res.json({ message: 'Edu Tech MVP API is running. Please use the frontend at ' + (process.env.FRONTEND_URL || 'Vercel URL') });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err);
    res.status(err.status || 500).json({ 
        error: err.message || 'Lỗi hệ thống',
        code: err.code || 'INTERNAL_ERROR'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SUCCESS] Backend Server (MongoDB + Supabase) running on port ${PORT}`);
});
