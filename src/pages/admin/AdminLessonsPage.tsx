import { AdminLayout } from '../../layout/AdminLayout';
import { BookOpen, Plus, Search, Filter, X, Loader2, CheckCircle2, AlertCircle, Trash2, Edit3, Save, Layers, CheckSquare } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { api, BASE_URL } from '../../api';
import Button from '../../components/Button';

export default function AdminLessonsPage() {
    const [lessons, setLessons] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
    const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: 'physics',
        grade: 10,
        chapter: '',
        materials: [] as string[],
        order: 0
    });

    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });
    const [isSaving, setIsSaving] = useState(false);

    // Material search in form
    const [formMaterialSearch, setFormMaterialSearch] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const lessonsData = await api.getLessons();
            const materialsData = await api.getModels();
            setLessons(lessonsData);
            setMaterials(materialsData);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (lesson: any) => {
        setFormData({
            title: lesson.title,
            description: lesson.description || '',
            subject: lesson.subject,
            grade: lesson.grade,
            chapter: lesson.chapter || '',
            materials: lesson.materials ? lesson.materials.map((m: any) => m._id || m.id) : [],
            order: lesson.order || 0
        });
        setEditingId(lesson.id || lesson._id);
        setEditMode(true);
        setShowForm(true);
        setFormMaterialSearch('');
    };

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Bạn có chắc muốn xóa bài học "${title}" không? Học liệu gốc sẽ không bị ảnh hưởng.`)) {
            try {
                await api.deleteLesson(id);
                setLessons(prev => prev.filter(l => (l.id || l._id) !== id));
                showStatus('success', 'Đã xóa bài học thành công.');
            } catch (error: any) {
                showStatus('error', 'Xóa thất bại: ' + error.message);
            }
        }
    };

    const showStatus = (type: 'success' | 'error', message: string) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: null, message: "" }), 4000);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            showStatus('error', 'Vui lòng nhập tiêu đề bài học.');
            return;
        }

        setIsSaving(true);
        try {
            if (editMode && editingId) {
                await api.updateLesson(editingId, formData);
                showStatus('success', 'Cập nhật bài học thành công!');
            } else {
                await api.createLesson(formData);
                showStatus('success', 'Tạo bài học mới thành công!');
            }

            // Reset forms and reload
            setTimeout(() => {
                setShowForm(false);
                setEditMode(false);
                setEditingId(null);
                setFormData({
                    title: '',
                    description: '',
                    subject: 'physics',
                    grade: 10,
                    chapter: '',
                    materials: [],
                    order: 0
                });
                loadData();
            }, 1000);
        } catch (error: any) {
            showStatus('error', 'Thất bại: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleMaterial = (materialId: string) => {
        setFormData(prev => {
            const current = [...prev.materials];
            const index = current.indexOf(materialId);
            if (index > -1) {
                current.splice(index, 1);
            } else {
                current.push(materialId);
            }
            return { ...prev, materials: current };
        });
    };

    const handleSelectAllFilteredMaterials = (filteredIds: string[]) => {
        setFormData(prev => {
            const current = [...prev.materials];
            // Check if all are already selected
            const allSelected = filteredIds.every(id => current.includes(id));
            
            let updated;
            if (allSelected) {
                // Remove all of these
                updated = current.filter(id => !filteredIds.includes(id));
            } else {
                // Add missing ones
                const missing = filteredIds.filter(id => !current.includes(id));
                updated = [...current, ...missing];
            }
            return { ...prev, materials: updated };
        });
    };

    // Filter lessons based on search and filters
    const filteredLessons = useMemo(() => {
        return lessons.filter(lesson => {
            const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lesson.chapter && lesson.chapter.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesSubject = selectedSubjectFilter === 'all' || lesson.subject === selectedSubjectFilter;
            const matchesGrade = selectedGradeFilter === 'all' || String(lesson.grade) === selectedGradeFilter;
            return matchesSearch && matchesSubject && matchesGrade;
        });
    }, [lessons, searchTerm, selectedSubjectFilter, selectedGradeFilter]);

    // Available materials to select inside form (filtered by selected subject and grade)
    const availableFormMaterials = useMemo(() => {
        return materials.filter(m => {
            // Convert database material _id or id for proper matching
            const matchesSubject = m.subject === formData.subject;
            const matchesGrade = Number(m.grade) === Number(formData.grade);
            const matchesSearch = !formMaterialSearch || 
                m.title.toLowerCase().includes(formMaterialSearch.toLowerCase()) ||
                (m.description && m.description.toLowerCase().includes(formMaterialSearch.toLowerCase()));
            return matchesSubject && matchesGrade && matchesSearch;
        });
    }, [materials, formData.subject, formData.grade, formMaterialSearch]);

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 animate-fadeIn">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-indigo-500" /> Quản Lý Bài Học
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-sans font-semibold mt-1">
                        Phân loại tài nguyên và hỗ trợ gán hàng loạt học liệu theo khung bài học ({lessons.length} bài)
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Tìm bài học..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full md:w-56 font-sans transition-all"
                        />
                    </div>

                    <select
                        value={selectedSubjectFilter}
                        onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                        className="px-3.5 py-2.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-all"
                    >
                        <option value="all">Tất cả môn</option>
                        <option value="physics">Vật lý</option>
                        <option value="chemistry">Hóa học</option>
                        <option value="biology">Sinh học</option>
                    </select>

                    <select
                        value={selectedGradeFilter}
                        onChange={(e) => setSelectedGradeFilter(e.target.value)}
                        className="px-3.5 py-2.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-all"
                    >
                        <option value="all">Tất cả lớp</option>
                        <option value="10">Lớp 10</option>
                        <option value="11">Lớp 11</option>
                        <option value="12">Lớp 12</option>
                    </select>

                    <button
                        onClick={() => {
                            setEditMode(false);
                            setEditingId(null);
                            setFormData({
                                title: '',
                                description: '',
                                subject: 'physics',
                                grade: 10,
                                chapter: '',
                                materials: [],
                                order: lessons.length + 1
                            });
                            setShowForm(!showForm);
                            setFormMaterialSearch('');
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10 cursor-pointer font-sans ml-auto md:ml-0"
                    >
                        {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{showForm ? "Đóng" : "Tạo Bài Học"}</span>
                    </button>
                </div>
            </div>

            {/* Global Status Message */}
            {status.type && !showForm && (
                <div className={`mb-6 flex items-center gap-3 p-4 rounded-xl border font-sans font-bold text-xs uppercase tracking-wide animate-fadeIn ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200/20 text-rose-700 dark:text-rose-400'}`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <p className="font-semibold text-xs">{status.message}</p>
                </div>
            )}

            {/* Form Section */}
            {showForm && (
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-6 md:p-8 mb-8 animate-slideDown backdrop-blur-xl relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-t-2xl" />

                    <h2 className="text-lg font-bold mb-6 text-slate-900 dark:text-white font-heading">
                        {editMode ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
                    </h2>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Column 1: Lesson Details */}
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1.5 font-sans">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tiêu đề bài học</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ví dụ: Bài 1: Sự rơi tự do..."
                                        className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 font-sans">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Môn học</label>
                                        <select
                                            className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full cursor-pointer"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value, materials: [] })}
                                        >
                                            <option value="physics">Vật lý</option>
                                            <option value="chemistry">Hóa học</option>
                                            <option value="biology">Sinh học</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Lớp</label>
                                        <select
                                            className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full cursor-pointer"
                                            value={formData.grade}
                                            onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value), materials: [] })}
                                        >
                                            <option value={10}>Lớp 10</option>
                                            <option value={11}>Lớp 11</option>
                                            <option value={12}>Lớp 12</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 font-sans">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Chương học / Chuyên đề</label>
                                        <input
                                            type="text"
                                            placeholder="Chương 1: Cơ học..."
                                            className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full"
                                            value={formData.chapter}
                                            onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Thứ tự hiển thị (Order)</label>
                                        <input
                                            type="number"
                                            placeholder="1"
                                            className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full"
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 font-sans">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Giới thiệu bài học</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Nhập nội dung giới thiệu bài học hoặc hướng dẫn..."
                                        className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none w-full"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Column 2: Bulk Assign Materials Selector */}
                            <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200 dark:border-white/5 p-5 flex flex-col h-[25rem]">
                                <div className="flex items-center justify-between mb-3.5 shrink-0">
                                    <div>
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-sans">Gán học liệu liên quan ({formData.materials.length} mục đã chọn)</label>
                                        <p className="text-[0.625rem] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Tự động đề xuất theo Môn & Lớp đã chọn ở cột bên</p>
                                    </div>
                                </div>

                                {/* Form Material Search bar */}
                                <div className="relative mb-3 shrink-0">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm học liệu trong bài..."
                                        value={formMaterialSearch}
                                        onChange={(e) => setFormMaterialSearch(e.target.value)}
                                        className="w-full pl-8 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                </div>

                                {/* Actions on select */}
                                {availableFormMaterials.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => handleSelectAllFilteredMaterials(availableFormMaterials.map(m => m.id || m._id))}
                                        className="mb-2.5 self-start flex items-center gap-1.5 text-[0.625rem] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors cursor-pointer"
                                    >
                                        <CheckSquare className="w-3.5 h-3.5" />
                                        <span>Chọn tất cả hiển thị ({availableFormMaterials.length})</span>
                                    </button>
                                )}

                                {/* Scrollable List */}
                                <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 custom-scrollbar">
                                    {availableFormMaterials.length > 0 ? (
                                        availableFormMaterials.map(m => {
                                            const dbId = m.id || m._id;
                                            const isSelected = formData.materials.includes(dbId);
                                            return (
                                                <div 
                                                    key={dbId}
                                                    onClick={() => handleToggleMaterial(dbId)}
                                                    className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/30 ${isSelected ? 'border-indigo-500/80 bg-indigo-500/5' : 'border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/40'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {}} // Swallowed, handled by div click
                                                        className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-white/10 rounded focus:ring-indigo-500 cursor-pointer pointer-events-none"
                                                    />
                                                    
                                                    {m.thumbnail && m.thumbnail !== '3d-placeholder' ? (
                                                        <img 
                                                            src={m.thumbnail.startsWith('http') ? m.thumbnail : `${BASE_URL}${m.thumbnail}`} 
                                                            alt={m.title} 
                                                            className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-200/50 dark:border-white/10" 
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/5 text-slate-400">
                                                            <Layers className="w-4 h-4" />
                                                        </div>
                                                    )}

                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{m.title}</p>
                                                        <p className="text-[0.625rem] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 truncate uppercase tracking-wider">{m.type === 'infographic' ? 'Infographic' : 'Mô hình 3D'}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                            <Layers className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">Không có học liệu phù hợp</p>
                                            <p className="text-[0.625rem] text-slate-450 dark:text-slate-500 font-medium mt-1 leading-relaxed">
                                                Vui lòng kiểm tra lại cấu hình Môn & Lớp ở cột trái hoặc tải học liệu mới cho Môn & Lớp này.
                                            </p>
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

                        <div className="flex justify-end border-t border-slate-100 dark:border-white/5 pt-6 gap-3 font-sans">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <Button
                                type="submit"
                                variant="gradient"
                                disabled={isSaving}
                                className="px-8 py-2.5 text-xs uppercase tracking-widest font-bold"
                            >
                                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang cập nhật...</> : <><Save className="w-4 h-4 mr-2" /> Lưu Bài Học</>}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lessons List table */}
            <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-white/10 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] animate-fadeIn">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-200/60 dark:border-white/10">
                                <th className="px-6 py-4 text-[0.625rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tiêu đề bài học / Chương</th>
                                <th className="px-6 py-4 text-[0.625rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Môn Học</th>
                                <th className="px-6 py-4 text-[0.625rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Lớp</th>
                                <th className="px-6 py-4 text-[0.625rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Số Học Liệu</th>
                                <th className="px-6 py-4 text-[0.625rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Thứ Tự</th>
                                <th className="px-6 py-4 text-[0.625rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold text-slate-700 dark:text-slate-200 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex justify-center items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                                            <span className="text-xs uppercase tracking-widest font-bold">Đang tải dữ liệu bài học...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLessons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        Không tìm thấy bài học nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredLessons.map((lesson) => {
                                    const lessonId = lesson.id || lesson._id;
                                    return (
                                        <tr key={lessonId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200/10">
                                                        <BookOpen className="w-4.5 h-4.5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-slate-900 dark:text-white line-clamp-1 font-heading text-sm">
                                                            {lesson.title}
                                                        </div>
                                                        {lesson.chapter && (
                                                            <div className="text-[0.625rem] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
                                                                {lesson.chapter}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[0.625rem] font-extrabold uppercase tracking-wide border ${
                                                    lesson.subject === 'physics' 
                                                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/10 text-indigo-600 dark:text-indigo-400' 
                                                        : lesson.subject === 'chemistry' 
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/10 text-emerald-600 dark:text-emerald-400' 
                                                            : 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/10 text-purple-600 dark:text-purple-400'
                                                }`}>
                                                    {lesson.subject === 'physics' ? 'Vật lý' : lesson.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-bold text-slate-900 dark:text-white">Lớp {lesson.grade}</td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-extrabold text-slate-650 bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-white/5 px-2.5 py-1 rounded-md">
                                                    {lesson.materials ? lesson.materials.length : 0} học liệu
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                {lesson.order || 0}
                                            </td>
                                            <td className="px-6 py-5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleEdit(lesson)}
                                                        className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer"
                                                        title="Sửa bài học & Gán hàng loạt"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(lessonId, lesson.title)}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                                                        title="Xóa bài học"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
