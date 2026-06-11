import { AdminLayout } from '../../layout/AdminLayout';
import { Box, Plus, Search, Filter, Upload, X, Loader2, CheckCircle2, AlertCircle, ImagePlus, Trash2, Calendar, Sparkles, Pencil } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { api, BASE_URL } from '../../api';
import Button from '../../components/Button';
import { materials as mockMaterials } from '../../data/materialsData';

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
        subtitle: { label: "Tiêu đề phụ (Subtitle)", placeholder: "Tế bào nhân thực · Sinh vật tự dưỡng" },
        category: { label: "Nhóm phân loại (Category)", placeholder: "Tế bào thực vật" },
        size: { label: "Kích thước thực tế (Size)", placeholder: "10 – 100 micromét" },
        location: { label: "Phân bố chính (Location)", placeholder: "Nhân tế bào, ty thể, lục lạp" },
        visibleInLM: { label: "Khả năng quan sát", placeholder: "Kính hiển vi điện tử / Kính hiển vi quang học" },
        featuresText: { label: "Chi tiết cấu trúc (Mỗi dòng dạng 'Tên: Mô tả')", placeholder: "Vách tế bào: Cellulose bảo vệ\nNhân tế bào: Nơi chứa vật chất di truyền" },
        funFact: { label: "Sự thật thú vị (Fun Fact)", placeholder: "Nếu kéo thẳng toàn bộ DNA trong một tế bào..." }
    },
    chemistry: {
        subjectName: "hóa học",
        subtitle: { label: "Cấu trúc liên kết / Công thức", placeholder: "H2O · Liên kết cộng hóa trị phân cực" },
        category: { label: "Phân loại hợp chất (Category)", placeholder: "Oxit axit / Hợp chất vô cơ / Axit amin" },
        size: { label: "Thông số phân tử / Khối lượng (Size)", placeholder: "18.015 g/mol · Góc liên kết 104.5°" },
        location: { label: "Trạng thái tự nhiên & Phân bố", placeholder: "Dạng lỏng, rắn, khí · Chiếm 70% bề mặt Trái Đất" },
        visibleInLM: { label: "Phương pháp nhận biết / Phản ứng đặc trưng", placeholder: "Dùng đồng(II) sunfat khan (chuyển xanh) / Quỳ tím hóa đỏ" },
        featuresText: { label: "Liên kết & Thành phần (Mỗi dòng dạng 'Tên: Mô tả')", placeholder: "Nguyên tử Oxi: Độ âm điện lớn, mang phần điện tích âm\nLiên kết Hydro: Giúp nước có nhiệt độ sôi cao bất thường" },
        funFact: { label: "Hiện tượng thú vị / Ứng dụng thực tế", placeholder: "Nước là chất duy nhất giãn nở khi đóng băng từ lỏng sang rắn!" }
    },
    physics: {
        subjectName: "vật lý",
        subtitle: { label: "Định luật & Lĩnh vực", placeholder: "Vật lý thiên văn · Định luật vạn vật hấp dẫn" },
        category: { label: "Phân loại đại lượng / Phân môn", placeholder: "Cơ học cổ điển / Cơ học lượng tử / Vũ trụ học" },
        size: { label: "Thông số kỹ thuật / Đại lượng vật lý", placeholder: "Bán kính: 6,371 km · Khối lượng: 5.97e24 kg" },
        location: { label: "Phạm vi áp dụng / Môi trường hoạt động", placeholder: "Quy mô vĩ mô · Toàn vũ trụ / Điều kiện tiêu chuẩn" },
        visibleInLM: { label: "Thiết bị đo lường / Công thức cốt lõi", placeholder: "F = G * (m1 * m2) / r^2" },
        featuresText: { label: "Các thông số cấu thành (Mỗi dòng dạng 'Tên: Mô tả')", placeholder: "Lực hấp dẫn: Lực hút giữa mọi vật có khối lượng\nQuỹ đạo: Đường đi cong của một thiên thể quanh thiên thể khác" },
        funFact: { label: "Hiện tượng thực tế / Sự thật kỳ thú", placeholder: "Trọng lực ở Mặt Trăng chỉ bằng khoảng 1/6 so với trên Trái Đất!" }
    }
};

export default function AdminMaterialsPage() {
    const [materials, setMaterials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [editingModelId, setEditingModelId] = useState<number | null>(null);
    const [relatedSearch, setRelatedSearch] = useState('');

    const handleEdit = (model: any) => {
        setEditingModelId(model.id);
        
        // Map features back to text format "Name: Detail"
        const featuresText = model.features 
            ? model.features.map((f: any) => `${f.name}: ${f.detail}`).join('\n') 
            : '';
            
        // Map tags back to comma separated string
        const tags = model.tags ? model.tags.join(', ') : '';

        setFormData({
            title: model.title || "",
            description: model.description || "",
            subject: model.subject || "physics",
            grade: model.grade || 10,
            tags: tags,
            type: model.type || "3d-model",
            subtitle: model.subtitle || "",
            category: model.category || "",
            size: model.size || "",
            location: model.location || "",
            visibleInLM: model.visibleInLM || "",
            featuresText: featuresText,
            funFact: model.funFact || "",
            source: model.source || "",
            relatedMaterials: model.relatedMaterials || []
        });
        
        setRelatedSearch('');
        
        // If there's an existing thumbnail, show preview
        if (model.thumbnail) {
            setThumbnailPreview(model.thumbnail.startsWith('http') ? model.thumbnail : `${BASE_URL}${model.thumbnail}`);
        } else {
            setThumbnailPreview(null);
        }
        
        setFile(null); // File uploads are optional when editing
        setThumbnailFile(null);
        setShowUploadForm(true);
        
        // Show premium fields if any are present
        const hasPremiumFields = model.subtitle || model.category || model.size || model.location || model.visibleInLM || model.funFact || featuresText;
        setShowPremiumFields(!!hasPremiumFields);
        setStatus({ type: null, message: "" });
    };

    // Upload Form State
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
        tags: "",
        type: "3d-model",
        // Premium biology fields
        subtitle: "",
        category: "",
        size: "",
        location: "",
        visibleInLM: "",
        featuresText: "", // multi-line structures format: "Tên: Mô tả"
        funFact: "",
        source: "",
        relatedMaterials: [] as string[]
    });

    const allAvailableRelated = useMemo(() => {
        const dbFormatted = materials.map((m: any) => ({
            id: `db-${m.id}`,
            title: m.title,
            subject: m.subject,
            type: m.type || '3d-model',
            grade: m.grade || 10,
            thumbnail: m.thumbnail,
        }));
        
        const combined = [
            ...mockMaterials.map(m => ({
                id: m.id,
                title: m.title,
                subject: m.subject,
                type: m.type,
                grade: m.grade,
                thumbnail: m.thumbnail,
            })), 
            ...dbFormatted
        ];
        
        const currentId = editingModelId ? `db-${editingModelId}` : null;
        return combined.filter(m => m.id !== currentId);
    }, [materials, editingModelId]);

    const filteredAvailableRelated = useMemo(() => {
        const query = relatedSearch.toLowerCase().trim();
        if (!query) return allAvailableRelated;
        return allAvailableRelated.filter(m => 
            m.title.toLowerCase().includes(query) || 
            m.subject.toLowerCase().includes(query)
        );
    }, [allAvailableRelated, relatedSearch]);

    const config = SUBJECT_CONFIGS[formData.subject as keyof typeof SUBJECT_CONFIGS] || SUBJECT_CONFIGS.physics;

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        try {
            const data = await api.getModels();
            setMaterials(data);
        } catch (error) {
            console.error("Failed to load materials", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number, title: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa học liệu "${title}" (ID: ${id}) không?\nHành động này không thể hoàn tác.`)) {
            try {
                const result = await api.deleteModel(id);
                // Update state immediately for responsive UI
                setMaterials(prev => prev.filter(m => m.id !== id));
                setStatus({ type: 'success', message: 'Đã xóa học liệu thành công.' });
                setTimeout(() => setStatus({ type: null, message: "" }), 3000);
            } catch (error: any) {
                console.error("Failed to delete material", error);
                alert(`Lỗi khi xóa: ${error.message}`);
                setStatus({ type: 'error', message: 'Xóa thất bại: ' + error.message });
            }
        }
    };

    const filteredMaterials = materials.filter(model =>
        model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Upload Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
            
            if (formData.type === '3d-model') {
                const allowedExts = ['glb', 'gltf', 'fbx', 'zip'];
                if (!allowedExts.includes(ext)) {
                    setStatus({ type: 'error', message: "Vui lòng chọn tệp định dạng .glb, .gltf, .fbx hoặc .zip" });
                    return;
                }
            } else if (formData.type === 'infographic') {
                const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
                if (!allowedExts.includes(ext)) {
                    setStatus({ type: 'error', message: "Vui lòng chọn tệp định dạng ảnh (.jpg, .png, .webp) hoặc .pdf" });
                    return;
                }
            }

            if (selectedFile.size > 100 * 1024 * 1024) {
                setStatus({ type: 'error', message: "Kích thước tệp không được vượt quá 100MB" });
                return;
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

            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
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

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // If not editing, model file is required
        if (!editingModelId && !file) {
            setStatus({ type: 'error', message: formData.type === '3d-model' ? "Vui lòng chọn tệp mô hình 3D" : "Vui lòng chọn tệp Infographic" });
            return;
        }

        setIsUploading(true);
        setStatus({ type: null, message: "" });

        try {
            let fileUrl = null;
            if (file) {
                const uploadRes = await api.uploadModelFile(file);
                fileUrl = uploadRes.file_url;
            } else if (editingModelId) {
                // Keep the old file URL
                const existing = materials.find(m => m.id === editingModelId);
                fileUrl = existing?.file_url;
            }

            let thumbnailUrl = null;
            if (thumbnailFile) {
                const thumbRes = await api.uploadThumbnail(thumbnailFile);
                thumbnailUrl = thumbRes.thumbnail_url;
            } else if (editingModelId) {
                // Keep the old thumbnail (if any)
                const existing = materials.find(m => m.id === editingModelId);
                thumbnailUrl = existing?.thumbnail;
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

            const modelData = {
                ...formData,
                file_url: fileUrl,
                thumbnail: thumbnailUrl,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ""),
                features: features,
            };

            if (editingModelId) {
                await api.updateModel(editingModelId, modelData);
                setStatus({ type: 'success', message: "Cập nhật học liệu thành công!" });
            } else {
                await api.saveModel(modelData);
                setStatus({ type: 'success', message: "Tải lên học liệu thành công!" });
            }

            // Reload list and close form after short delay
            setTimeout(() => {
                setShowUploadForm(false);
                setEditingModelId(null);
                setStatus({ type: null, message: "" });
                setFile(null);
                removeThumbnail();
                setRelatedSearch('');
                setFormData({
                    title: "",
                    description: "",
                    subject: "physics",
                    grade: 10,
                    tags: "",
                    type: "3d-model",
                    subtitle: "",
                    category: "",
                    size: "",
                    location: "",
                    visibleInLM: "",
                    featuresText: "",
                    funFact: "",
                    source: "",
                    relatedMaterials: []
                });
                loadMaterials();
            }, 1500);
        } catch (err: any) {
            setStatus({ type: 'error', message: "Có lỗi xảy ra: " + err.message });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 animate-fadeIn">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-3">
                        <Box className="w-6 h-6 text-indigo-500" /> Quản Lý Học Liệu
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-sans font-semibold mt-1">
                        Danh sách mô hình 3D và tài nguyên infographic ({materials.length} mục)
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Tìm học liệu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full md:w-56 font-sans transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer font-sans transition-colors">
                        <Filter className="w-3.5 h-3.5" /> <span>Lọc</span>
                    </button>
                    <button
                        onClick={() => {
                            if (showUploadForm) {
                                setEditingModelId(null);
                                setFile(null);
                                removeThumbnail();
                                setRelatedSearch('');
                                setFormData({
                                    title: "",
                                    description: "",
                                    subject: "physics",
                                    grade: 10,
                                    tags: "",
                                    type: "3d-model",
                                    subtitle: "",
                                    category: "",
                                    size: "",
                                    location: "",
                                    visibleInLM: "",
                                    featuresText: "",
                                    funFact: "",
                                    source: "",
                                    relatedMaterials: []
                                });
                            }
                            setShowUploadForm(!showUploadForm);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10 cursor-pointer font-sans"
                    >
                        {showUploadForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{showUploadForm ? "Đóng" : "Tải Lên Học Liệu"}</span>
                    </button>
                </div>
            </div>

            {/* Global Status Message (for delete actions) */}
            {status.type && !showUploadForm && (
                <div className={`mb-6 flex items-center gap-3 p-4 rounded-xl border font-sans font-bold text-xs uppercase tracking-wide animate-fadeIn ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200/20 text-rose-700 dark:text-rose-400'}`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <p className="font-semibold text-xs">{status.message}</p>
                </div>
            )}

            {/* Upload Form Section */}
            {showUploadForm && (
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-6 md:p-8 mb-8 animate-slideDown backdrop-blur-xl relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-t-2xl" />
                    
                    <h2 className="text-lg font-bold mb-6 text-slate-900 dark:text-white font-heading">
                        {editingModelId ? `Chỉnh sửa học liệu: ${materials.find(m => m.id === editingModelId)?.title || ''}` : "Tải lên học liệu mới"}
                    </h2>
                    <form onSubmit={handleUploadSubmit} className="space-y-5">
                        {/* Type Selector */}
                        <div className="flex flex-col gap-2 font-sans">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Loại học liệu</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, type: '3d-model' });
                                        setFile(null);
                                    }}
                                    className={`py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider cursor-pointer ${formData.type === '3d-model' ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400' : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600 hover:border-slate-200 dark:hover:border-white/10'}`}
                                >
                                    <Box className="w-4 h-4" />
                                    Mô hình 3D
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, type: 'infographic' });
                                        setFile(null);
                                    }}
                                    className={`py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider cursor-pointer ${formData.type === 'infographic' ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400' : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600 hover:border-slate-200 dark:hover:border-white/10'}`}
                                >
                                    <ImagePlus className="w-4 h-4" />
                                    Infographic
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-5">
                                {/* File Upload Area */}
                                <div className="bg-slate-50/50 dark:bg-slate-950/20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors relative group cursor-pointer">
                                    <input
                                        type="file"
                                        accept={formData.type === '3d-model' ? '.glb,.gltf,.fbx,.zip' : '.jpg,.jpeg,.png,.webp,.pdf'}
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center py-4">
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/20 dark:border-indigo-900/20 rounded-xl flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-sm font-bold mb-1 text-slate-800 dark:text-slate-100 truncate max-w-full font-sans">
                                            {file ? file.name : (formData.type === '3d-model' ? "Chọn tệp mô hình 3D" : "Chọn tệp Infographic")}
                                        </h3>
                                        <p className="text-slate-400 dark:text-slate-500 text-[11px] font-semibold leading-relaxed">
                                            {formData.type === '3d-model' 
                                                ? "Hỗ trợ .glb, .gltf, .fbx, .zip (Max 100MB)" 
                                                : "Hỗ trợ .jpg, .png, .webp, .pdf (Max 100MB)"}
                                        </p>
                                    </div>
                                </div>

                                {/* Thumbnail Upload Area */}
                                <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3.5 block font-sans">Ảnh đại diện (Thumbnail)</label>
                                    <div className="flex items-center gap-4">
                                        {thumbnailPreview ? (
                                            <div className="relative group shrink-0">
                                                <img src={thumbnailPreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm" />
                                                <button type="button" onClick={removeThumbnail} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative w-20 h-20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                                                <input type="file" accept=".jpg,.png,.webp" onChange={handleThumbnailChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                <ImagePlus className="w-5 h-5 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 text-[11px] text-slate-400 dark:text-slate-500 font-sans leading-relaxed font-semibold">
                                            <p className="text-slate-600 dark:text-slate-400">Hiển thị chính ở trang thư viện.</p>
                                            <p>Hỗ trợ: .jpg, .png, .webp (Max 5MB)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-1.5 font-sans">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tiêu đề</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Cấu tạo tế bào học..." 
                                        className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full" 
                                        value={formData.title} 
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 font-sans">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Môn học</label>
                                        <select 
                                            className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full" 
                                            value={formData.subject} 
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        >
                                            <option value="physics">Vật lý</option>
                                            <option value="chemistry">Hóa học</option>
                                            <option value="biology">Sinh học</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Lớp</label>
                                        <select 
                                            className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full" 
                                            value={formData.grade} 
                                            onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                                        >
                                            <option value={10}>Lớp 10</option>
                                            <option value={11}>Lớp 11</option>
                                            <option value={12}>Lớp 12</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 font-sans">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Mô tả học liệu</label>
                                    <textarea 
                                        required 
                                        rows={3} 
                                        placeholder="Nhập giới thiệu tóm tắt..." 
                                        className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none w-full" 
                                        value={formData.description} 
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 font-sans">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Từ khóa (Tags - cách nhau bằng dấu phẩy)</label>
                                    <input 
                                        type="text" 
                                        placeholder="tế bào, sinh học, bào quan..." 
                                        className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full" 
                                        value={formData.tags} 
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })} 
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 font-sans">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Nguồn học liệu (Nguồn gốc / Tác giả)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ví dụ: Sketchfab, Mozaik 3D, Tự thiết kế..." 
                                        className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full" 
                                        value={formData.source} 
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value })} 
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 font-sans">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        Học liệu liên quan ({formData.relatedMaterials.length} đã chọn)
                                    </label>
                                    <div className="border border-slate-200 dark:border-white/10 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-2">
                                        <div className="relative shrink-0">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm học liệu để liên kết..."
                                                value={relatedSearch}
                                                onChange={(e) => setRelatedSearch(e.target.value)}
                                                className="w-full pl-8 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-955 dark:text-white"
                                            />
                                        </div>
                                        <div className="max-h-[150px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 pr-1">
                                            {filteredAvailableRelated.map(m => {
                                                const isSelected = formData.relatedMaterials.includes(m.id);
                                                return (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => {
                                                            setFormData(prev => {
                                                                const current = [...prev.relatedMaterials];
                                                                const index = current.indexOf(m.id);
                                                                if (index > -1) {
                                                                    current.splice(index, 1);
                                                                } else {
                                                                    current.push(m.id);
                                                                }
                                                                return { ...prev, relatedMaterials: current };
                                                            });
                                                        }}
                                                        className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-lg cursor-pointer transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}}
                                                            className="w-3.5 h-3.5 text-indigo-600 rounded cursor-pointer pointer-events-none"
                                                        />
                                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{m.title}</span>
                                                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 ml-auto shrink-0 uppercase tracking-wider">{m.subject === 'biology' ? 'Sinh' : m.subject === 'chemistry' ? 'Hóa' : 'Lý'} · Lớp {m.grade}</span>
                                                    </div>
                                                );
                                            })}
                                            {filteredAvailableRelated.length === 0 && (
                                                <div className="text-center py-4 text-slate-400 text-xs">Không tìm thấy học liệu phù hợp.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Collapsible Premium Details */}
                                <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-4 font-sans">
                                    <button
                                        type="button"
                                        onClick={() => setShowPremiumFields(!showPremiumFields)}
                                        className="flex items-center justify-between w-full py-2 text-left font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 cursor-pointer"
                                    >
                                        <span>{showPremiumFields ? `▼ Thu gọn ${config.subjectName} nâng cao (Premium)` : `▶ Thêm chi tiết ${config.subjectName} nâng cao (Premium)`}</span>
                                    </button>

                                    {showPremiumFields && (
                                        <div className="mt-4 space-y-4 border-l-2 border-indigo-500/30 pl-4 animate-fadeIn">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{config.subtitle.label}</label>
                                                <input
                                                    type="text"
                                                    placeholder={config.subtitle.placeholder}
                                                    className="p-2.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none w-full"
                                                    value={formData.subtitle}
                                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{config.category.label}</label>
                                                    <input
                                                        type="text"
                                                        placeholder={config.category.placeholder}
                                                        className="p-2.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none w-full"
                                                        value={formData.category}
                                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{config.size.label}</label>
                                                    <input
                                                        type="text"
                                                        placeholder={config.size.placeholder}
                                                        className="p-2.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none w-full"
                                                        value={formData.size}
                                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{config.location.label}</label>
                                                    <input
                                                        type="text"
                                                        placeholder={config.location.placeholder}
                                                        className="p-2.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none w-full"
                                                        value={formData.location}
                                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{config.visibleInLM.label}</label>
                                                    <input
                                                        type="text"
                                                        placeholder={config.visibleInLM.placeholder}
                                                        className="p-2.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none w-full"
                                                        value={formData.visibleInLM}
                                                        onChange={(e) => setFormData({ ...formData, visibleInLM: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{config.featuresText.label}</label>
                                                <textarea
                                                    rows={4}
                                                    placeholder={config.featuresText.placeholder}
                                                    className="p-2.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold font-mono text-slate-900 dark:text-white focus:outline-none resize-none w-full"
                                                    value={formData.featuresText}
                                                    onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{config.funFact.label}</label>
                                                <input
                                                    type="text"
                                                    placeholder={config.funFact.placeholder}
                                                    className="p-2.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none w-full"
                                                    value={formData.funFact}
                                                    onChange={(e) => setFormData({ ...formData, funFact: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {status.type && (
                            <div className={`flex items-center gap-3 p-4 rounded-xl border font-sans font-bold text-xs uppercase tracking-wide animate-fadeIn ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200/20 text-rose-700 dark:text-rose-400'}`}>
                                {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                <p className="font-semibold text-xs">{status.message}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-6 font-sans">
                            {editingModelId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUploadForm(false);
                                        setEditingModelId(null);
                                        setFile(null);
                                        removeThumbnail();
                                        setRelatedSearch('');
                                        setFormData({
                                            title: "",
                                            description: "",
                                            subject: "physics",
                                            grade: 10,
                                            tags: "",
                                            type: "3d-model",
                                            subtitle: "",
                                            category: "",
                                            size: "",
                                            location: "",
                                            visibleInLM: "",
                                            featuresText: "",
                                            funFact: "",
                                            source: "",
                                            relatedMaterials: []
                                        });
                                    }}
                                    className="px-6 py-3 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                                >
                                    Hủy
                                </button>
                            )}
                            <Button 
                                type="submit" 
                                variant="gradient"
                                disabled={isUploading} 
                                className="px-8 py-3 text-xs uppercase tracking-widest font-bold"
                            >
                                {isUploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang thiết lập...</> : (editingModelId ? "Cập nhật học liệu" : "Lưu Học Liệu")}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Materials List */}
            <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-white/10 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] animate-fadeIn">
                {/* Desktop view table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-200/60 dark:border-white/10">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mô Hình / Học liệu</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Môn Học</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Lớp</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ngày Tải Lên</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold text-slate-700 dark:text-slate-200 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex justify-center items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                                            <span className="text-xs uppercase tracking-widest font-bold">Đang tải học liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMaterials.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        Không tìm thấy học liệu nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredMaterials.map((model) => (
                                    <tr key={model.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                {model.thumbnail ? (
                                                    <img src={model.thumbnail.startsWith('http') ? model.thumbnail : `${BASE_URL}${model.thumbnail}`} alt={model.title} className="w-12 h-12 rounded-xl object-cover border border-slate-200/50 dark:border-white/10 shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950/40 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-white/5 shrink-0">
                                                        <Box className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white line-clamp-1 font-heading text-sm">
                                                        {model.title}
                                                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${model.type === 'infographic' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/10' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/10'}`}>
                                                            {model.type === 'infographic' ? 'INFO' : '3D'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold line-clamp-1 w-64 mt-0.5">{model.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border ${
                                                model.subject === 'physics' 
                                                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/10 text-indigo-600 dark:text-indigo-400' 
                                                    : model.subject === 'chemistry' 
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/10 text-emerald-600 dark:text-emerald-400' 
                                                        : 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/10 text-purple-600 dark:text-purple-400'
                                            }`}>
                                                {model.subject === 'physics' ? 'Vật lý' : model.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-bold text-slate-900 dark:text-white">Lớp {model.grade}</td>
                                        <td className="px-6 py-5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                                                {model.created_at ? new Date(model.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right flex justify-end gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleEdit(model);
                                                }}
                                                className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 cursor-pointer"
                                                title="Sửa học liệu"
                                            >
                                                <Pencil className="w-4.5 h-4.5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDelete(model.id, model.title);
                                                }}
                                                className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                                                title="Xóa học liệu"
                                            >
                                                <Trash2 className="w-4.5 h-4.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Card Grid (2 Columns) */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="py-12 text-center text-slate-400 flex justify-center items-center gap-3 font-sans font-bold text-xs uppercase tracking-widest">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                            <span>Đang tải...</span>
                        </div>
                    ) : filteredMaterials.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs font-bold uppercase bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/10 font-sans">
                            Không có học liệu nào.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 font-sans">
                            {filteredMaterials.map((model) => (
                                <div key={model.id} className="bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col relative group">
                                    <div className="aspect-square bg-slate-50 dark:bg-slate-950/40 rounded-xl overflow-hidden mb-2.5 relative border border-slate-100 dark:border-white/5">
                                        {model.thumbnail ? (
                                            <img src={model.thumbnail.startsWith('http') ? model.thumbnail : `${BASE_URL}${model.thumbnail}`} alt={model.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                                <Box className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div className="absolute top-1.5 right-1.5 flex gap-1 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleEdit(model);
                                                }}
                                                className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md cursor-pointer transition-colors"
                                                title="Sửa"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDelete(model.id, model.title);
                                                }}
                                                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md cursor-pointer transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1 flex-1 flex flex-col justify-between">
                                        <div>
                                            <span className={`text-[8px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                                                model.subject === 'physics' 
                                                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/10 text-indigo-600 dark:text-indigo-400' 
                                                    : model.subject === 'chemistry' 
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/10 text-emerald-600 dark:text-emerald-400' 
                                                        : 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/10 text-purple-600 dark:text-purple-400'
                                            }`}>
                                                {model.subject === 'physics' ? 'Vật lý' : model.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}
                                            </span>
                                            
                                            <h3 className="font-extrabold text-slate-900 dark:text-white text-xs line-clamp-2 leading-snug mt-1.5 font-heading">
                                                {model.title}
                                            </h3>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-2.5">
                                            <span>Lớp {model.grade}</span>
                                            <span className={`px-1 rounded text-[7px] font-black ${model.type === 'infographic' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'}`}>
                                                {model.type === 'infographic' ? 'INFO' : '3D'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
