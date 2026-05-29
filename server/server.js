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

import mongoose from 'mongoose';
import { User, Material, ResetToken, School, MembershipRequest } from './mongo_models.js';
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
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL, 
            'http://127.0.0.1:5173', 
            'http://localhost:5173',
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

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
    const log = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
    fs.appendFileSync(path.resolve(DATA_DIR, 'server_debug.log'), log);
    console.log(log.trim());
    next();
});

app.get('/api/ping', (req, res) => res.json({ status: 'ok', time: Date.now() }));

app.delete('/api/u_remove/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[USER DELETION] Request to remove ID: ${id}`);
    try {
        const user = await User.findById(id);
        
        if (!user) {
            console.log(`[USER DELETION] User ID ${id} not found`);
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        
        if (user.role === 'admin') {
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
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[REST API] DELETE /api/users/${id}`);
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        if (user.role === 'admin') return res.status(403).json({ error: 'Không thể xóa tài khoản Admin' });
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
                plan: 'premium',
                password: hash
            });
            console.log('[INFO] Đã tự động tạo tài khoản admin mặc định.');
        } else {
            await User.updateOne({ email: adminEmail }, { password: hash, role: 'admin' });
        }

        // Seed School "THPT Nguyễn Du"
        let demoSchool = await School.findOne({ schoolCode: 'NGUYENDU2026' });
        if (!demoSchool) {
            demoSchool = await School.create({
                name: 'THPT Nguyễn Du',
                schoolCode: 'NGUYENDU2026',
                isInviteCodeEnabled: true,
                teacherQuota: 5,
                studentQuota: 10,
                teacherSeatsUsed: 0,
                studentSeatsUsed: 0,
                schoolYear: '2025 - 2026',
                tiet: 'Học kỳ I - 35 tiết'
            });
            console.log('[INFO] Đã tạo trường học mẫu THPT Nguyễn Du (Mã: NGUYENDU2026)');
        } else {
            if (!demoSchool.schoolYear || !demoSchool.tiet) {
                demoSchool.schoolYear = '2025 - 2026';
                demoSchool.tiet = 'Học kỳ I - 35 tiết';
                await demoSchool.save();
                console.log('[INFO] Đã cập nhật Niên khóa và Tiết học cho THPT Nguyễn Du mẫu.');
            }
        }

        // Seed School Admin
        const schoolAdminEmail = 'schooladmin@mvp.com';
        const schoolAdminPassword = 'Admin123';
        const schoolAdminHash = bcrypt.hashSync(schoolAdminPassword, salt);
        const schoolAdmin = await User.findOne({ email: schoolAdminEmail });
        if (!schoolAdmin) {
            await User.create({
                name: 'School Admin Nguyễn Du',
                email: schoolAdminEmail,
                role: 'admin',
                plan: 'school',
                password: schoolAdminHash,
                schoolId: demoSchool._id
            });
            console.log('[INFO] Đã tự động tạo tài khoản School Admin mặc định.');
        } else {
            await User.updateOne({ email: schoolAdminEmail }, { role: 'admin', plan: 'school', schoolId: demoSchool._id });
        }

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
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        // Map _id to id for frontend compatibility
        const formattedUsers = users.map(u => ({
            ...u.toObject(),
            id: u._id.toString()
        }));
        res.json(formattedUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, role, plan } = req.body;
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

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Mật khẩu không chính xác' });

        const userProfile = user.toObject();
        delete userProfile.password;
        userProfile.id = userProfile._id.toString();
        
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
        const models = await Material.find({});
        const formatted = models.map(m => ({
            ...m.toObject(),
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
        const model = await Material.findById(id);
        if (!model) return res.status(404).json({ error: 'Không tìm thấy học liệu' });
        const formatted = model.toObject();
        formatted.id = model._id.toString();
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/models', async (req, res) => {
    const { 
        title, description, file_url, thumbnail, subject, grade, tags, type,
        subtitle, category, size, location, visibleInLM, features, funFact, whereItOccurs 
    } = req.body;
    let tagsArray = Array.isArray(tags) ? tags : [];
    if (typeof tags === 'string') {
        try { tagsArray = JSON.parse(tags); } catch (e) { tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean); }
    }

    let featuresArray = Array.isArray(features) ? features : [];
    if (typeof features === 'string') {
        try { featuresArray = JSON.parse(features); } catch (e) {}
    }

    try {
        const newModel = await Material.create({
            title, description, file_url, thumbnail: thumbnail || null, subject, grade, type: type || '3d-model', tags: tagsArray,
            subtitle, category, size, location, visibleInLM, features: featuresArray, funFact, whereItOccurs
        });
        res.json({ id: newModel._id, message: 'Lưu học liệu thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Không có tệp nào được tải lên' });
    if (!supabase) return res.status(500).json({ error: 'Supabase chưa được cấu hình' });

    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileName = `models/${uniqueSuffix}${path.extname(req.file.originalname)}`;
        
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

        res.json({ file_url: publicUrl, message: 'Tải lên Supabase thành công' });
    } catch (err) {
        console.error('[SUPABASE UPLOAD ERROR]', err.message);
        res.status(500).json({ error: 'Lỗi khi tải file lên Supabase: ' + err.message });
    }
});

app.post('/api/upload-thumbnail', upload.single('thumbnail'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Không có ảnh nào được tải lên' });
    if (!supabase) return res.status(500).json({ error: 'Supabase chưa được cấu hình' });

    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileName = `thumbnails/${uniqueSuffix}${path.extname(req.file.originalname)}`;
        
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
        console.error('[SUPABASE THUMBNAIL ERROR]', err.message);
        res.status(500).json({ error: 'Lỗi khi tải ảnh lên Supabase: ' + err.message });
    }
});

app.delete('/api/models/:id', async (req, res) => {
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

        console.log(`[DEMO] Mã reset cho ${email}: ${resetCode}`);
        res.json({
            message: 'Mã xác nhận đã được tạo. Kiểm tra console/email.',
            ...(process.env.NODE_ENV !== 'production' && { reset_code: resetCode }),
            user_name: user.name
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
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

// AI SEARCH ENDPOINT
const aiSearchCache = new Map();
app.post('/api/ai-search', async (req, res) => {
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ error: 'Vui lòng nhập nội dung tìm kiếm' });

    try {
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

        if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                const modelSummary = models.map(m => `ID:${m.id} | Title:${m.title} | Subject:${m.subject} | Tags:${JSON.stringify(m.tags)}`).join('\n');

                const prompt = `User: "${query}"\nModels:\n${modelSummary}\nReturn JSON: { "keywords": [], "predicted_subject": "physics/chemistry/biology/null", "intent": "Vietnamese logic", "matched_ids": [] }`;
                const result = await model.generateContent(prompt);
                const responseText = result.response.text().trim();
                let cleanJson = responseText.replace(/```json\n?/, '').replace(/\n?```/, '');
                aiAnalysis = JSON.parse(cleanJson);
            } catch (e) {
                console.error('[AI Search] Gemini error:', e.message);
            }
        }

        const searchTerms = query.toLowerCase().split(/[\s,]+/).filter(t => t.length > 1);
        const aiKeywords = aiAnalysis?.keywords?.map(k => k.toLowerCase()) || [];
        const allKeywords = [...new Set([...searchTerms, ...aiKeywords])];
        const predictedSubject = aiAnalysis?.predicted_subject || null;
        const aiMatchedIds = aiAnalysis?.matched_ids || [];

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
            await User.findByIdAndUpdate(reqObj.userId, {
                schoolId: school._id,
                className: reqObj.requestedClass || '',
                role: reqObj.requestedRole,
                plan: 'school'
            });

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
            teacherQuota: Number(teacherQuota) || 5,
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
