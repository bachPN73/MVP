import { Layout } from "../layout/MainLayout";
import { useState, useEffect } from "react";
import { Upload, CheckCircle2, AlertCircle, ArrowLeft, Loader2, ImagePlus, X, ChevronDown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import { api } from "../api";

const SUBJECT_CONFIGS: Record<string, {
    subjectName: string;
    subtitle: { label: string; placeholder: string };
    category: { label: string; placeholder: string };
    size: { label: string; placeholder: string };
    location: { label: string; placeholder: string };
    visibleInLM: { label: string; placeholder: string };
    featuresText: { label: string; placeholder: string };
    funFact: { label: string; placeholder: string };
}> = {
    biology: {
        subjectName: "sinh học",
        subtitle: { label: "Phụ đề mô hình (Subtitle)", placeholder: "Ví dụ: Tế bào nhân thực · Sinh vật tự dưỡng" },
        category: { label: "Phân nhóm (Category)", placeholder: "Ví dụ: Tế bào nhân thực" },
        size: { label: "Kích thước thực tế (Size)", placeholder: "Ví dụ: 10 – 100 micromét" },
        location: { label: "Vị trí phân bố (Location)", placeholder: "Ví dụ: Nhân tế bào, ty thể, lục lạp" },
        visibleInLM: { label: "Khả năng quan sát (Microscope)", placeholder: "Ví dụ: Chỉ có thể quan sát dưới kính hiển vi điện tử." },
        featuresText: { label: "Cấu trúc chính (Mỗi dòng 1 cấu trúc dạng 'Tên: Mô tả')", placeholder: "Ví dụ:\nVách tế bào: Cấu tạo từ cellulose giúp bảo vệ\nLục lạp: Nơi thực hiện quang hợp" },
        funFact: { label: "Sự thật thú vị (Fun Fact)", placeholder: "Ví dụ: Nếu kéo thẳng toàn bộ DNA trong một tế bào, nó sẽ dài khoảng 2 mét." }
    },
    chemistry: {
        subjectName: "hóa học",
        subtitle: { label: "Cấu trúc liên kết / Công thức", placeholder: "Ví dụ: H2O · Liên kết cộng hóa trị phân cực" },
        category: { label: "Phân loại hợp chất (Category)", placeholder: "Ví dụ: Oxit axit / Hợp chất vô cơ / Axit amin" },
        size: { label: "Thông số phân tử / Khối lượng (Size)", placeholder: "Ví dụ: 18.015 g/mol · Góc liên kết 104.5°" },
        location: { label: "Trạng thái tự nhiên & Phân bố", placeholder: "Ví dụ: Dạng lỏng, rắn, khí · Chiếm 70% bề mặt Trái Đất" },
        visibleInLM: { label: "Phương pháp nhận biết / Phản ứng đặc trưng", placeholder: "Ví dụ: Dùng đồng(II) sunfat khan (chuyển xanh) / Quỳ tím hóa đỏ" },
        featuresText: { label: "Liên kết & Thành phần (Mỗi dòng dạng 'Tên: Mô tả')", placeholder: "Ví dụ:\nNguyên tử Oxi: Độ âm điện lớn, mang phần điện tích âm\nLiên kết Hydro: Giúp nước có nhiệt độ sôi cao bất thường" },
        funFact: { label: "Hiện tượng thú vị / Ứng dụng thực tế", placeholder: "Ví dụ: Nước là chất duy nhất giãn nở khi đóng băng từ lỏng sang rắn!" }
    },
    physics: {
        subjectName: "vật lý",
        subtitle: { label: "Định luật & Lĩnh vực", placeholder: "Ví dụ: Vật lý thiên văn · Định luật vạn vật hấp dẫn" },
        category: { label: "Phân loại đại lượng / Phân môn", placeholder: "Ví dụ: Cơ học cổ điển / Cơ học lượng tử / Vũ trụ học" },
        size: { label: "Thông số kỹ thuật / Đại lượng vật lý", placeholder: "Ví dụ: Bán kính: 6,371 km · Khối lượng: 5.97e24 kg" },
        location: { label: "Phạm vi áp dụng / Môi trường hoạt động", placeholder: "Ví dụ: Quy mô vĩ mô · Toàn vũ trụ / Điều kiện tiêu chuẩn" },
        visibleInLM: { label: "Thiết bị đo lường / Công thức cốt lõi", placeholder: "Ví dụ: F = G * (m1 * m2) / r^2" },
        featuresText: { label: "Các thông số cấu thành (Mỗi dòng dạng 'Tên: Mô tả')", placeholder: "Ví dụ:\nLực hấp dẫn: Lực hút giữa mọi vật có khối lượng\nQuỹ đạo: Đường đi cong của một thiên thể quanh thiên thể khác" },
        funFact: { label: "Hiện tượng thực tế / Sự thật kỳ thú", placeholder: "Ví dụ: Trọng lực ở Mặt Trăng chỉ bằng khoảng 1/6 so với trên Trái Đất!" }
    }
};

export default function UploadModelPage() {
    const navigate = useNavigate();

    // Check admin role from localStorage
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        try {
            const userData = localStorage.getItem('edu_tech_user');
            if (userData) {
                const user = JSON.parse(userData);
                if (user.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    navigate('/dashboard');
                }
            } else {
                navigate('/login');
            }
        } catch {
            navigate('/login');
        } finally {
            setIsCheckingAuth(false);
        }
    }, [navigate]);

    const [file, setFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });
    const [showPremiumFields, setShowPremiumFields] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject: "physics",
        grade: 10,
        type: "3d-model",
        tags: "",
        // Premium fields
        subtitle: "",
        category: "",
        size: "",
        location: "",
        visibleInLM: "",
        featuresText: "", // multi-line structures format: "Tên: Mô tả"
        funFact: ""
    });

    const config = SUBJECT_CONFIGS[formData.subject as keyof typeof SUBJECT_CONFIGS] || SUBJECT_CONFIGS.physics;

    if (isCheckingAuth) return null;
    if (!isAdmin) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const ext = selectedFile.name.split('.').pop()?.toLowerCase();
            
            if (formData.type === '3d-model') {
                const allowed = ['glb', 'gltf', 'fbx'];
                if (!allowed.includes(ext || '')) {
                    setStatus({ type: 'error', message: "Mô hình 3D hỗ trợ định dạng .glb, .gltf, .fbx" });
                    return;
                }
            } else {
                const allowed = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
                if (!allowed.includes(ext || '')) {
                    setStatus({ type: 'error', message: "Infographic hỗ trợ định dạng ảnh (.jpg, .png...) hoặc .pdf" });
                    return;
                }
            }
            
            setFile(selectedFile);
            setStatus({ type: null, message: "" });
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setStatus({ type: 'error', message: "Ảnh đại diện chỉ hỗ trợ .jpg, .png, .webp" });
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                setStatus({ type: 'error', message: "Ảnh đại diện không được vượt quá 5MB" });
                return;
            }

            // Revoke old object URL to prevent memory leak
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }

            setThumbnailFile(selectedFile);
            setThumbnailPreview(URL.createObjectURL(selectedFile));
            setStatus({ type: null, message: "" });
        }
    };

    const removeThumbnail = () => {
        setThumbnailFile(null);
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
            setThumbnailPreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setStatus({ type: 'error', message: "Vui lòng chọn tệp mô hình 3D" });
            return;
        }

        setIsUploading(true);
        setStatus({ type: null, message: "" });

        try {
            // 1. Upload model file to get URL
            const uploadRes = await api.uploadModelFile(file);

            // 2. Upload thumbnail if provided
            let thumbnailUrl = null;
            if (thumbnailFile) {
                const thumbRes = await api.uploadThumbnail(thumbnailFile);
                thumbnailUrl = thumbRes.thumbnail_url;
            }

            // Parse features multi-line text into array of { name, detail }
            const features = formData.featuresText
                .split('\n')
                .map(line => {
                    const parts = line.split(':');
                    if (parts.length >= 2) {
                        return {
                            name: parts[0].trim(),
                            detail: parts.slice(1).join(':').trim()
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            // 3. Save metadata to database
            const modelData = {
                ...formData,
                file_url: uploadRes.file_url,
                thumbnail: thumbnailUrl,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ""),
                features: features,
            };

            await api.saveModel(modelData);

            setStatus({ type: 'success', message: "Tải lên và lưu thông tin thành công!" });
            setTimeout(() => navigate('/library'), 2000);
        } catch (err: any) {
            setStatus({ type: 'error', message: "Có lỗi xảy ra: " + err.message });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Layout>
            <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-semibold group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Quay lại thư viện</span>
                </button>

                {/* Title */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
                        Đăng tải học liệu mới
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base font-sans">
                        Hệ thống tải lên mô hình 3D sinh học, infographic giảng dạy trực quan.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload Area */}
                    <div className="relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-8 md:p-12 text-center hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all duration-300 group cursor-pointer">
                        <input
                            type="file"
                            accept={formData.type === '3d-model' ? '.glb,.gltf,.fbx' : '.jpg,.jpeg,.png,.webp,.pdf'}
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 shadow-sm border border-indigo-100/30 dark:border-indigo-900/30">
                                <Upload className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold font-heading mb-2 text-slate-950 dark:text-white">
                                {file ? file.name : "Kéo thả hoặc nhấp để chọn tệp"}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                {formData.type === '3d-model' 
                                    ? 'Định dạng được hỗ trợ: .glb, .gltf, .fbx (Tối đa 50MB)' 
                                    : 'Định dạng được hỗ trợ: .jpg, .png, .webp, .pdf (Tối đa 50MB)'}
                            </p>
                        </div>
                    </div>

                    {/* Thumbnail Upload Area */}
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm backdrop-blur-md transition-all duration-300">
                        <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-3 block">Ảnh đại diện học liệu</label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            {thumbnailPreview ? (
                                <div className="relative group shrink-0">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail preview"
                                        className="w-32 h-32 object-cover rounded-2xl border border-indigo-500/30 shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeThumbnail}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative w-32 h-32 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all duration-300 cursor-pointer shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={handleThumbnailChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <ImagePlus className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-1.5" />
                                    <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Chọn ảnh</span>
                                </div>
                            )}
                            <div className="flex-1 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">Ảnh bìa hiển thị trong bộ sưu tập.</p>
                                <p>Hỗ trợ tệp định dạng <span className="font-bold text-slate-700 dark:text-slate-200">.jpg, .png, .webp</span>.</p>
                                <p>Dung lượng tệp tối đa: <span className="font-bold text-slate-700 dark:text-slate-200">5MB</span>.</p>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Fields */}
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-5 transition-all duration-300">
                        
                        {/* Material Type Toggle */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Loại học liệu</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, type: '3d-model' });
                                        setFile(null); // Clear file when type changes
                                    }}
                                    className={`flex-1 py-3 px-4 rounded-xl border font-bold transition-all text-sm md:text-base text-center cursor-pointer ${formData.type === '3d-model'
                                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/30 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                                        }`}
                                >
                                    Mô hình 3D (.fbx, .glb)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, type: 'infographic' });
                                        setFile(null); // Clear file when type changes
                                    }}
                                    className={`flex-1 py-3 px-4 rounded-xl border font-bold transition-all text-sm md:text-base text-center cursor-pointer ${formData.type === 'infographic'
                                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/30 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                                        }`}
                                >
                                    Infographic (Ảnh, PDF)
                                </button>
                            </div>
                        </div>

                        {/* Title input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Tiêu đề học liệu</label>
                            <input
                                type="text"
                                required
                                placeholder="Ví dụ: Cấu tạo nguyên tử Hydro"
                                className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all text-sm font-medium"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Description input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Mô tả nội dung</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Mô tả nội dung học thuật chi tiết và các tương tác chính của mô hình..."
                                className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-slate-900 dark:text-white transition-all text-sm font-sans"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Dropdowns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Môn học</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all text-sm font-medium appearance-none cursor-pointer"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    >
                                        <option value="physics">Vật lý</option>
                                        <option value="chemistry">Hóa học</option>
                                        <option value="biology">Sinh học</option>
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Lớp học</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all text-sm font-medium appearance-none cursor-pointer"
                                        value={formData.grade}
                                        onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                                    >
                                        <option value={10}>Lớp 10</option>
                                        <option value={11}>Lớp 11</option>
                                        <option value={12}>Lớp 12</option>
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Từ khóa (phân cách bằng dấu phẩy)</label>
                            <input
                                type="text"
                                placeholder="Ví dụ: nguyên tử, cấu tạo, vật lý lượng tử..."
                                className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all text-sm"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>

                        {/* Collapsible Premium Details */}
                        <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
                            <button
                                type="button"
                                onClick={() => setShowPremiumFields(!showPremiumFields)}
                                className="flex items-center justify-between w-full py-2 text-left font-bold text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer group"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                    {showPremiumFields ? `Ẩn thông tin ${config.subjectName} nâng cao (Premium)` : `Thêm thông tin ${config.subjectName} nâng cao (Premium)`}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-indigo-500 transition-transform duration-300 ${showPremiumFields ? 'rotate-180' : ''}`} />
                            </button>

                            {showPremiumFields && (
                                <div className="mt-4 space-y-4 border-l-2 border-indigo-500/20 pl-4 animate-fadeIn">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">{config.subtitle.label}</label>
                                        <input
                                            type="text"
                                            placeholder={config.subtitle.placeholder}
                                            className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                                            value={formData.subtitle}
                                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">{config.category.label}</label>
                                            <input
                                                type="text"
                                                placeholder={config.category.placeholder}
                                                className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">{config.size.label}</label>
                                            <input
                                                type="text"
                                                placeholder={config.size.placeholder}
                                                className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                                                value={formData.size}
                                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">{config.location.label}</label>
                                            <input
                                                type="text"
                                                placeholder={config.location.placeholder}
                                                className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">{config.visibleInLM.label}</label>
                                            <input
                                                type="text"
                                                placeholder={config.visibleInLM.placeholder}
                                                className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                                                value={formData.visibleInLM}
                                                onChange={(e) => setFormData({ ...formData, visibleInLM: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">{config.featuresText.label}</label>
                                        <textarea
                                            rows={5}
                                            placeholder={config.featuresText.placeholder}
                                            className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white text-sm font-mono resize-none"
                                            value={formData.featuresText}
                                            onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">{config.funFact.label}</label>
                                        <input
                                            type="text"
                                            placeholder={config.funFact.placeholder}
                                            className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                                            value={formData.funFact}
                                            onChange={(e) => setFormData({ ...formData, funFact: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Messages */}
                    {status.type && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl border ${status.type === 'success' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-red-50 dark:bg-red-950/30 border-red-200/60 dark:border-red-800/30 text-red-600 dark:text-red-400'
                            }`}>
                            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                            <p className="font-semibold text-sm">{status.message}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full py-3.5 text-base font-extrabold font-heading bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Đang đăng tải và đồng bộ đám mây...
                            </span>
                        ) : (
                            "Lưu và đăng tải học liệu"
                        )}
                    </Button>
                </form>
            </div>
        </Layout>
    );
}
