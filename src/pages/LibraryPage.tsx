import { Layout } from '../layout/MainLayout';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Filter, BookOpen, Trash2, X, ChevronLeft, ChevronRight, ChevronDown, Layers, Atom, FlaskConical, Sprout, Sparkles, Box, PlayCircle, GraduationCap, Plus, Edit3, Save, Loader2, CheckSquare, Edit } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { materials as mockMaterials, getSubjectName, Material, formatRelativeTime } from '../data/materialsData';
import { api, BASE_URL } from '../api';

export default function Library() {
    const [searchParams] = useSearchParams();
    const initialSubject = searchParams.get('subject') as Material['subject'] | null;

    const [allMaterials, setAllMaterials] = useState<Material[]>(mockMaterials);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce search input - only filter after 300ms of no typing
    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => setDebouncedSearch(value), 300);
    }, []);
    const [selectedSubject, setSelectedSubject] = useState<Material['subject'] | 'all'>(initialSubject || 'all');
    const [selectedType, setSelectedType] = useState<Material['type'] | 'all'>('all');
    const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const [viewMode, setViewMode] = useState<'all' | 'lessons'>('all');
    const [lessons, setLessons] = useState<any[]>([]);
    const [isLessonsLoading, setIsLessonsLoading] = useState(false);

    const fetchLessons = async () => {
        setIsLessonsLoading(true);
        try {
            const filters: any = {};
            if (selectedSubject !== 'all') filters.subject = selectedSubject;
            if (selectedGrade !== 'all') filters.grade = selectedGrade;
            const data = await api.getLessons(filters);
            setLessons(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách bài học:", error);
        } finally {
            setIsLessonsLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'lessons') {
            fetchLessons();
        }
    }, [viewMode, selectedSubject, selectedGrade]);

    const gridRef = useRef<HTMLDivElement>(null);

    // Reset to page 1 when filters or search change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedSubject, selectedType, selectedGrade]);

    // Cuộn mượt mà lên đầu lưới học liệu khi chuyển trang
    useEffect(() => {
        if (gridRef.current) {
            const yOffset = -70; // Tránh bị che khuất bởi sticky search bar
            const element = gridRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, [currentPage, itemsPerPage]);

    // Admin delete state
    const [isAdmin, setIsAdmin] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Admin Lesson Modal States
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [lessonEditMode, setLessonEditMode] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [lessonFormData, setLessonFormData] = useState({
        title: '',
        description: '',
        subject: 'physics',
        grade: 10,
        chapter: '',
        materials: [] as string[],
        order: 0
    });
    const [formMaterialSearch, setFormMaterialSearch] = useState('');
    const [isSavingLesson, setIsSavingLesson] = useState(false);
    const [lessonDeleteTarget, setLessonDeleteTarget] = useState<any | null>(null);
    const [isDeletingLesson, setIsDeletingLesson] = useState(false);
    const [isCustomChapter, setIsCustomChapter] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<any | null>(null);

    // Existing chapters for currently selected subject & grade in form
    const existingChapters = useMemo(() => {
        const matchingLessons = lessons.filter(l => 
            l.subject === lessonFormData.subject && 
            Number(l.grade) === Number(lessonFormData.grade)
        );
        const chapters = matchingLessons.map(l => l.chapter).filter(Boolean);
        return Array.from(new Set(chapters));
    }, [lessons, lessonFormData.subject, lessonFormData.grade]);

    // Filtered materials inside form (only database materials, matching form subject/grade, and matching search)
    const availableFormMaterials = useMemo(() => {
        return allMaterials.filter(m => {
            if (!m.id.startsWith('db-')) return false;
            
            const matchesSubject = m.subject === lessonFormData.subject;
            const matchesGrade = Number(m.grade) === Number(lessonFormData.grade);
            const matchesSearch = !formMaterialSearch || 
                m.title.toLowerCase().includes(formMaterialSearch.toLowerCase()) ||
                (m.description && m.description.toLowerCase().includes(formMaterialSearch.toLowerCase()));
            
            return matchesSubject && matchesGrade && matchesSearch;
        });
    }, [allMaterials, lessonFormData.subject, lessonFormData.grade, formMaterialSearch]);

    // Handle Create Lesson button click
    const handleCreateLesson = () => {
        const defaultSub = selectedSubject === 'all' ? 'physics' : selectedSubject;
        const defaultGrade = selectedGrade === 'all' ? 10 : Number(selectedGrade);
        const matchingLessons = lessons.filter(l => 
            l.subject === defaultSub && 
            Number(l.grade) === Number(defaultGrade)
        );
        const uniqueChapters = Array.from(new Set(matchingLessons.map(l => l.chapter).filter(Boolean)));

        setLessonFormData({
            title: '',
            description: '',
            subject: defaultSub,
            grade: defaultGrade,
            chapter: uniqueChapters[0] || '',
            materials: [],
            order: lessons.length + 1
        });
        setIsCustomChapter(uniqueChapters.length === 0);
        setLessonEditMode(false);
        setEditingLessonId(null);
        setShowLessonForm(true);
        setFormMaterialSearch('');
    };

    // Handle Edit Lesson button click
    const handleEditLesson = (lesson: any) => {
        const sub = lesson.subject || 'physics';
        const gr = lesson.grade || 10;
        const matchingLessons = lessons.filter(l => 
            l.subject === sub && 
            Number(l.grade) === Number(gr)
        );
        const uniqueChapters = Array.from(new Set(matchingLessons.map(l => l.chapter).filter(Boolean)));
        const isExisting = uniqueChapters.includes(lesson.chapter);

        setLessonFormData({
            title: lesson.title,
            description: lesson.description || '',
            subject: sub,
            grade: gr,
            chapter: lesson.chapter || '',
            materials: lesson.materials ? lesson.materials.map((m: any) => m._id || m.id) : [],
            order: lesson.order || 0
        });
        setIsCustomChapter(!isExisting || !lesson.chapter);
        setEditingLessonId(lesson.id || lesson._id);
        setLessonEditMode(true);
        setShowLessonForm(true);
        setFormMaterialSearch('');
    };

    // Handle Toggle Material in Lesson List
    const handleToggleMaterialInLesson = (materialId: string) => {
        const cleanId = materialId.replace('db-', '');
        setLessonFormData(prev => {
            const current = [...prev.materials];
            const index = current.indexOf(cleanId);
            if (index > -1) {
                current.splice(index, 1);
            } else {
                current.push(cleanId);
            }
            return { ...prev, materials: current };
        });
    };

    // Toggle all filtered materials in form
    const handleToggleAllFilteredMaterials = (filteredIds: string[]) => {
        setLessonFormData(prev => {
            const current = [...prev.materials];
            const cleanFilteredIds = filteredIds.map(id => id.replace('db-', ''));
            const allSelected = cleanFilteredIds.every(id => current.includes(id));
            
            let updated;
            if (allSelected) {
                updated = current.filter(id => !cleanFilteredIds.includes(id));
            } else {
                const missing = cleanFilteredIds.filter(id => !current.includes(id));
                updated = [...current, ...missing];
            }
            return { ...prev, materials: updated };
        });
    };

    // Handle Submit Lesson Form
    const handleLessonFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lessonFormData.title.trim()) {
            alert('Vui lòng nhập tiêu đề bài học.');
            return;
        }

        setIsSavingLesson(true);
        try {
            if (lessonEditMode && editingLessonId) {
                await api.updateLesson(editingLessonId, lessonFormData);
            } else {
                await api.createLesson(lessonFormData);
            }
            
            // Reload and close form
            await fetchLessons();
            setShowLessonForm(false);
            setEditingLessonId(null);
        } catch (error: any) {
            console.error("Lỗi khi lưu bài học:", error);
            alert("Lưu bài học thất bại: " + error.message);
        } finally {
            setIsSavingLesson(false);
        }
    };

    // Handle Delete Lesson
    const handleDeleteLesson = async () => {
        if (!lessonDeleteTarget) return;
        const targetId = lessonDeleteTarget.id || lessonDeleteTarget._id;
        setIsDeletingLesson(true);
        try {
            await api.deleteLesson(targetId);
            // Refresh lessons
            await fetchLessons();
            setLessonDeleteTarget(null);
        } catch (error: any) {
            console.error("Lỗi khi xóa bài học:", error);
            alert("Xóa bài học thất bại: " + error.message);
        } finally {
            setIsDeletingLesson(false);
        }
    };

    // Check admin role from localStorage
    useEffect(() => {
        try {
            const userData = localStorage.getItem('edu_tech_user');
            if (userData) {
                const user = JSON.parse(userData);
                setIsAdmin(user.role === 'admin');
            }
        } catch {
            setIsAdmin(false);
        }
    }, []);

    const fetchModels = async () => {
        try {
            const dbModels = await api.getModels();

            const formattedModels: Material[] = dbModels.map((m: any) => ({
                id: `db-${m.id}`,
                title: m.title,
                subject: m.subject,
                type: m.type || '3d-model',
                description: m.description,
                thumbnail: m.thumbnail 
                    ? (m.thumbnail.startsWith('http') ? m.thumbnail : `${BASE_URL}${m.thumbnail}`)
                    : '3d-placeholder',
                tags: m.tags || [],
                grade: m.grade || 10,
                file_url: m.file_url 
                    ? (m.file_url.startsWith('http') ? m.file_url : `${BASE_URL}${m.file_url}`)
                    : '',
                createdAt: m.createdAt || m.created_at
            }));

            setAllMaterials([...mockMaterials, ...formattedModels]);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách mô hình:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    // Handle delete
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const dbId = deleteTarget.id.replace('db-', '');
            await api.deleteModel(dbId);
            // Remove from local state
            setAllMaterials(prev => prev.filter(m => m.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (error) {
            console.error("Lỗi khi xóa học liệu:", error);
            alert("Không thể xóa học liệu. Vui lòng thử lại.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter materials with useMemo to avoid re-computation on every render
    const filteredMaterials = useMemo(() => {
        const query = debouncedSearch.toLowerCase();
        return allMaterials.filter((material) => {
            const matchesSearch = !query ||
                material.title.toLowerCase().includes(query) ||
                material.description.toLowerCase().includes(query) ||
                (Array.isArray(material.tags) && material.tags.some(tag => tag.toLowerCase().includes(query)));

            const matchesSubject = selectedSubject === 'all' || material.subject === selectedSubject;
            const matchesType = selectedType === 'all' || material.type === selectedType;
            const matchesGrade = selectedGrade === 'all' || String(material.grade) === String(selectedGrade);

            return matchesSearch && matchesSubject && matchesType && matchesGrade;
        });
    }, [allMaterials, debouncedSearch, selectedSubject, selectedType, selectedGrade]);

    // Subject counts for quick stats
    const subjectCounts = useMemo(() => ({
        physics: allMaterials.filter(m => m.subject === 'physics').length,
        chemistry: allMaterials.filter(m => m.subject === 'chemistry').length,
        biology: allMaterials.filter(m => m.subject === 'biology').length,
    }), [allMaterials]);

    // Calculate pagination boundaries
    const totalItems = filteredMaterials.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMaterials = useMemo(() => {
        return filteredMaterials.slice(startIndex, endIndex);
    }, [filteredMaterials, startIndex, endIndex]);

    // Smart pagination array generator (ellipse pagination matching manga site layout)
    const getPageNumbers = useCallback((current: number, total: number) => {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        
        const pages: (number | string)[] = [];
        
        if (current <= 3) {
            pages.push(1, 2, 3, 4, '...', total);
        } else if (current >= total - 2) {
            pages.push(1, '...', total - 3, total - 2, total - 1, total);
        } else {
            pages.push(1, '...', current - 1, current, current + 1, '...', total);
        }
        
        return pages;
    }, []);

    // Group lessons by subject, then by chapter
    const groupedLessons = useMemo(() => {
        const groups: Record<string, Record<string, any[]>> = {};
        lessons.forEach(lesson => {
            const subject = lesson.subject || "physics";
            const chapterName = lesson.chapter || "Chương khác / Chưa phân loại";
            if (!groups[subject]) {
                groups[subject] = {};
            }
            if (!groups[subject][chapterName]) {
                groups[subject][chapterName] = [];
            }
            groups[subject][chapterName].push(lesson);
        });
        return groups;
    }, [lessons]);

    // Subject badge styling helper
    const getSubjectStyle = (subject: string) => {
        switch (subject) {
            case 'physics':
                return {
                    badge: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white',
                    glow: 'hover-glow-physics',
                    icon: Atom,
                    lightBg: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
                    border: 'border-blue-200/50 dark:border-blue-500/20'
                };
            case 'chemistry':
                return {
                    badge: 'bg-gradient-to-r from-emerald-500 to-green-400 text-white',
                    glow: 'hover-glow-chemistry',
                    icon: FlaskConical,
                    lightBg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
                    border: 'border-emerald-200/50 dark:border-emerald-500/20'
                };
            default:
                return {
                    badge: 'bg-gradient-to-r from-rose-500 to-orange-400 text-white',
                    glow: 'hover-glow-biology',
                    icon: Sprout,
                    lightBg: 'from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20',
                    border: 'border-rose-200/50 dark:border-rose-500/20'
                };
        }
    };

    return (
        <Layout>
            <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* ===== Hero Header — Compact Gradient Banner ===== */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-50/90 via-white/95 to-purple-50/80 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/30 border border-slate-200/60 dark:border-white/[0.06] shadow-md mb-6">
                    {/* Decorative floating orbs */}
                    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl pointer-events-none animate-float-subtle"></div>
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-purple-400/10 dark:bg-purple-500/10 blur-2xl pointer-events-none"></div>
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

                    <div className="relative z-10 p-5 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                                <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-heading">
                                    Thư viện học liệu
                                </h1>
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                    {allMaterials.length} mô hình 3D & infographic · Khoa học Tự nhiên
                                </p>
                            </div>
                        </div>

                        {/* Quick subject stats */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200/50 dark:from-blue-950/30 dark:to-cyan-950/30 dark:text-cyan-300 dark:border-cyan-500/20 shadow-xs">
                                <Atom className="w-3 h-3" /> {subjectCounts.physics} Vật lý
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200/50 dark:from-emerald-950/30 dark:to-teal-950/30 dark:text-emerald-300 dark:border-emerald-500/20 shadow-xs">
                                <FlaskConical className="w-3 h-3" /> {subjectCounts.chemistry} Hóa học
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700 border border-rose-200/50 dark:from-rose-950/30 dark:to-orange-950/30 dark:text-rose-300 dark:border-rose-500/20 shadow-xs">
                                <Sprout className="w-3 h-3" /> {subjectCounts.biology} Sinh học
                            </span>
                        </div>
                    </div>
                </div>

                {/* ===== Pill-Style Tabs ===== */}
                <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="inline-flex bg-slate-100/80 dark:bg-white/[0.04] rounded-2xl p-1.5 border border-slate-200/40 dark:border-white/[0.04]">
                        <button
                            onClick={() => { setViewMode('all'); setSelectedLesson(null); }}
                            className={`flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 text-xs md:text-sm font-extrabold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
                                viewMode === 'all' 
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 pill-tab-active' 
                                    : 'text-slate-550 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" /> Tất cả học liệu
                        </button>
                        <button
                            onClick={() => { setViewMode('lessons'); setSelectedLesson(null); }}
                            className={`flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 text-xs md:text-sm font-extrabold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
                                viewMode === 'lessons' 
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 pill-tab-active' 
                                    : 'text-slate-550 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <GraduationCap className="w-3.5 h-3.5" /> Theo bài học
                        </button>
                    </div>

                    {isAdmin && viewMode === 'lessons' && (
                        <button
                            onClick={handleCreateLesson}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer font-sans"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tạo bài học</span>
                        </button>
                    )}
                </div>

                {/* ===== Search & Filter Bar — Premium Glassmorphism Card ===== */}
                <div className="sticky top-14 md:top-0 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6">
                    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-md p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Search and Filters Container */}
                        <div className="flex-1 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                            {/* Search Input */}
                            <div className="relative w-full md:max-w-xs lg:max-w-sm shrink-0">
                                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm học liệu..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 dark:focus:border-indigo-500/40 text-sm font-medium transition-all h-[44px]"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => handleSearchChange('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 transition-colors cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Filter Dropdowns */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Subject Select */}
                                <div className="relative">
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value as Material['subject'] | 'all')}
                                        className="appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer h-[44px] transition-all"
                                    >
                                        <option value="all">📚 Tất cả môn</option>
                                        <option value="physics">⚛️ Vật lý</option>
                                        <option value="chemistry">🧪 Hóa học</option>
                                        <option value="biology">🌱 Sinh học</option>
                                    </select>
                                    <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                                </div>

                                {/* Type Select */}
                                <div className="relative">
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value as Material['type'] | 'all')}
                                        className="appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer h-[44px] transition-all"
                                    >
                                        <option value="all">📦 Tất cả loại</option>
                                        <option value="3d-model">🧊 Mô hình 3D</option>
                                        <option value="infographic">📊 Infographic</option>
                                    </select>
                                    <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                                </div>

                                {/* Grade Select */}
                                <div className="relative">
                                    <select
                                        value={selectedGrade}
                                        onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                        className="appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer h-[44px] transition-all"
                                    >
                                        <option value="all">🎓 Tất cả lớp</option>
                                        <option value="10">Lớp 10</option>
                                        <option value="11">Lớp 11</option>
                                        <option value="12">Lớp 12</option>
                                    </select>
                                    <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                                </div>

                                {/* Clear Filters Button */}
                                {(selectedSubject !== 'all' || selectedType !== 'all' || selectedGrade !== 'all' || searchQuery !== '') && (
                                    <button
                                        onClick={() => {
                                            setSelectedSubject('all');
                                            setSelectedType('all');
                                            setSelectedGrade('all');
                                            handleSearchChange('');
                                        }}
                                        className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all h-[44px] cursor-pointer border border-red-200/50 dark:border-red-500/15"
                                        title="Xóa tất cả bộ lọc"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Xóa lọc</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results count badge */}
                        <div className="text-right whitespace-nowrap hidden lg:flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kết quả:</span>
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-100/50 dark:border-indigo-500/15">{filteredMaterials.length}</span>
                        </div>
                    </div>
                </div>

                {/* Mobile results count */}
                <div className="mb-4 lg:hidden flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Tìm thấy <span className="font-extrabold text-slate-900 dark:text-white">{viewMode === 'lessons' ? lessons.length : filteredMaterials.length}</span> kết quả
                    </p>
                </div>

                {/* ===== View Mode Content ===== */}
                {viewMode === 'lessons' ? (
                    isLessonsLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-14 h-14 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-500 dark:border-t-indigo-400 rounded-full animate-spin mb-5" />
                            <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse text-sm">Đang tải danh sách bài học...</p>
                        </div>
                    ) : selectedLesson ? (
                        /* Selected Lesson Detail View - Shows Flat Grid of Lesson's Materials */
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Header / Breadcrumb */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setSelectedLesson(null)}
                                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 w-max cursor-pointer border border-slate-200/50 dark:border-white/5 font-sans"
                                >
                                    ← Quay lại danh sách bài học
                                </button>
                                
                                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/[0.06] rounded-2xl p-5 md:p-6 shadow-sm">
                                    <div className="text-[10px] sm:text-xs font-black text-indigo-550 uppercase tracking-widest font-mono mb-1">
                                        {selectedLesson.chapter || "Chương khác / Chưa phân loại"}
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-heading leading-snug">
                                        {selectedLesson.title}
                                    </h2>
                                    {selectedLesson.description && (
                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1.5 leading-relaxed max-w-4xl">
                                            {selectedLesson.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Materials Flat Grid inside Lesson */}
                            {selectedLesson.materials && selectedLesson.materials.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                                    {selectedLesson.materials.map((material: any) => {
                                        const mId = material.id || material._id;
                                        const formattedId = mId.startsWith('db-') ? mId : `db-${mId}`;
                                        const subjectStyle = getSubjectStyle(material.subject || selectedLesson.subject);
                                        return (
                                            <div
                                                key={mId}
                                                className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/[0.06] rounded-2xl flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 relative group ${subjectStyle.glow}`}
                                            >
                                                {/* Delete button for admin - only for DB models */}
                                                {isAdmin && formattedId.startsWith('db-') && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setDeleteTarget(material);
                                                        }}
                                                        className="absolute top-2.5 right-2.5 z-20 p-1.5 sm:p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg cursor-pointer"
                                                        title="Xóa học liệu"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                <Link
                                                    to={`/material/${formattedId}`}
                                                    className="block flex-1 flex flex-col"
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center overflow-hidden shrink-0 relative library-card-shimmer">
                                                        {material.thumbnail && material.thumbnail !== '3d-placeholder' ? (
                                                            <img 
                                                                loading="lazy" 
                                                                decoding="async" 
                                                                src={material.thumbnail.startsWith('http') ? material.thumbnail : `${BASE_URL}${material.thumbnail}`} 
                                                                alt={material.title} 
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 group-hover:scale-105 transition-transform duration-500">
                                                                <Box className="w-10 h-10 text-indigo-200 dark:text-indigo-800" />
                                                            </div>
                                                        )}
                                                        {/* Gradient overlay at bottom for better badge visibility */}
                                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

                                                        {/* Floating type & subject badges */}
                                                        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black shadow-sm uppercase tracking-wider leading-none ${subjectStyle.badge}`}>
                                                                {getSubjectName(material.subject || selectedLesson.subject)}
                                                            </span>
                                                            <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md rounded-lg text-[9px] font-black text-slate-700 dark:text-slate-300 shadow-sm uppercase tracking-wider leading-none">
                                                                {material.type === '3d-model' ? '3D' : 'INFO'}
                                                            </span>
                                                        </div>

                                                        {/* Play overlay */}
                                                        <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]">
                                                            <PlayCircle className="w-11 h-11 text-white drop-shadow-md" strokeWidth={1.5} />
                                                        </div>
                                                    </div>

                                                    {/* Card body */}
                                                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
                                                        <div>
                                                            <h3 className="font-black mb-1 sm:mb-1.5 text-sm sm:text-base line-clamp-2 leading-snug text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-heading">{material.title}</h3>
                                                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed">
                                                                {material.description}
                                                            </p>
                                                        </div>

                                                        {/* Footer */}
                                                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-3">
                                                            <span className="flex items-center gap-1 uppercase tracking-wider">
                                                                <GraduationCap className="w-3 h-3" /> Khối {material.grade || selectedLesson.grade}
                                                            </span>
                                                            <span>{formatRelativeTime(material.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/[0.06] rounded-2xl">
                                    <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                                    <h3 className="text-base font-black mb-1 text-slate-800 dark:text-slate-100">Bài học chưa liên kết học liệu</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Bài học này hiện tại chưa có mô hình 3D hay Infographic nào.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : Object.keys(groupedLessons).length > 0 ? (
                        /* Flat Subject / Chapter / Lesson List Mode */
                        <div className="space-y-10 animate-in fade-in duration-300">
                            {Object.entries(groupedLessons).map(([subject, subjectChapters]) => (
                                <div key={subject} className="space-y-6">
                                    {/* Subject Title — Premium Divider Header */}
                                    <div className="flex items-center gap-3 pb-2.5 border-b border-slate-200 dark:border-white/10">
                                        <div className="w-2.5 h-6 rounded bg-gradient-to-b from-indigo-500 to-purple-650"></div>
                                        <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading">
                                            Môn {getSubjectName(subject as any)}
                                        </h2>
                                    </div>

                                    {/* Chapters under Subject */}
                                    <div className="space-y-6 pl-1 md:pl-2">
                                        {Object.entries(subjectChapters).map(([chapter, chapterLessons]) => (
                                            <div key={chapter} className="space-y-3">
                                                {/* Chapter Title — Enhanced & Compact */}
                                                <div className="flex items-center gap-3 bg-indigo-50/40 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 border-l-4 border-l-indigo-650 rounded-xl px-4 py-2.5">
                                                    <Layers className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                    <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white uppercase tracking-wider font-heading flex-1">{chapter}</h3>
                                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-100/70 text-indigo-750 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-500/15 shrink-0">
                                                        {chapterLessons.length} bài
                                                    </span>
                                                </div>

                                                {/* Lessons Grid under Chapter */}
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pl-1">
                                                    {chapterLessons.map((lesson) => {
                                                        const lessonId = lesson._id || lesson.id;
                                                        return (
                                                            <div 
                                                                key={lessonId} 
                                                                onClick={() => setSelectedLesson(lesson)}
                                                                className="bg-white dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/[0.06] rounded-xl p-3.5 hover:border-indigo-550 hover:shadow-md transition-all flex flex-col justify-between gap-2.5 cursor-pointer min-h-[100px] group"
                                                            >
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <div className="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                                            <GraduationCap className="w-4 h-4" />
                                                                        </div>
                                                                        <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-bold font-sans border border-indigo-100/50 dark:border-indigo-500/15">
                                                                            {lesson.materials ? lesson.materials.length : 0} học liệu
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white font-heading leading-snug group-hover:text-indigo-600 group-hover:dark:text-indigo-400 transition-colors line-clamp-2">{lesson.title}</h4>
                                                                    {lesson.description && (
                                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 leading-relaxed">{lesson.description}</p>
                                                                    )}
                                                                </div>
                                                                {isAdmin && (
                                                                    <div className="flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-white/5 pt-1.5 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                                                        <button onClick={() => handleEditLesson(lesson)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                                                                        <button onClick={() => setLessonDeleteTarget(lesson)} className="p-1 hover:bg-red-55/50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State — Lessons */
                        <div className="text-center py-20 animate-in fade-in duration-300 font-sans">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 flex items-center justify-center mx-auto mb-5 border border-indigo-100/50 dark:border-indigo-500/10">
                                <GraduationCap className="w-10 h-10 text-indigo-300 dark:text-indigo-700 animate-float-subtle" />
                            </div>
                            <h3 className="text-xl font-black mb-2 text-slate-800 dark:text-slate-100 font-heading">Chưa có bài học nào</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
                                Giáo trình bài học cho Môn học và Lớp này đang được cập nhật. Hãy thử chọn môn học hoặc lớp khác.
                            </p>
                        </div>
                    )
                ) : (
                    // ===== Flat Grid View =====
                    isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-14 h-14 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-500 dark:border-t-indigo-400 rounded-full animate-spin mb-5" />
                            <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse text-sm">Đang tải danh sách học liệu...</p>
                        </div>
                    ) : filteredMaterials.length > 0 ? (
                        <div ref={gridRef}>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                                {paginatedMaterials.map((material) => {
                                    const subjectStyle = getSubjectStyle(material.subject);
                                    return (
                                        <div
                                            key={material.id}
                                            className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/[0.06] rounded-2xl flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 relative group ${subjectStyle.glow}`}
                                        >
                                            {/* Delete button for admin - only for DB models */}
                                            {isAdmin && material.id.startsWith('db-') && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setDeleteTarget(material);
                                                    }}
                                                    className="absolute top-2.5 right-2.5 z-20 p-1.5 sm:p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg cursor-pointer"
                                                    title="Xóa học liệu"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}

                                            <Link
                                                to={`/material/${material.id}`}
                                                className="block flex-1 flex flex-col"
                                            >
                                                {/* Thumbnail */}
                                                <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center overflow-hidden shrink-0 relative library-card-shimmer">
                                                    {material.thumbnail && material.thumbnail !== '3d-placeholder' ? (
                                                        <img loading="lazy" decoding="async" src={material.thumbnail} alt={material.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 group-hover:scale-105 transition-transform duration-500">
                                                            <Box className="w-10 h-10 text-indigo-200 dark:text-indigo-800" />
                                                        </div>
                                                    )}
                                                    {/* Gradient overlay at bottom for better badge visibility */}
                                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

                                                    {/* Floating type & subject badges */}
                                                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black shadow-sm uppercase tracking-wider leading-none ${subjectStyle.badge}`}>
                                                            {getSubjectName(material.subject)}
                                                        </span>
                                                        <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md rounded-lg text-[9px] font-black text-slate-700 dark:text-slate-300 shadow-sm uppercase tracking-wider leading-none">
                                                            {material.type === '3d-model' ? '3D' : 'INFO'}
                                                        </span>
                                                    </div>

                                                    {/* Play overlay */}
                                                    <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]">
                                                        <PlayCircle className="w-11 h-11 text-white drop-shadow-md" strokeWidth={1.5} />
                                                    </div>
                                                </div>

                                                {/* Card body */}
                                                <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
                                                    <div>
                                                        <h3 className="font-black mb-1 sm:mb-1.5 text-sm sm:text-base line-clamp-2 leading-snug text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-heading">{material.title}</h3>
                                                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed">
                                                            {material.description}
                                                        </p>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-3">
                                                        <span className="flex items-center gap-1 uppercase tracking-wider">
                                                            <GraduationCap className="w-3 h-3" /> Khối {material.grade}
                                                        </span>
                                                        <span>{formatRelativeTime(material.createdAt)}</span>
                                                    </div>

                                                    {/* Tags */}
                                                    {Array.isArray(material.tags) && material.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {material.tags.slice(0, 2).map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 truncate max-w-[90px] sm:max-w-[120px] font-medium border border-slate-100/50 dark:border-white/[0.04]"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ===== Pagination Controls — Premium ===== */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-1.5 border-t border-slate-200/60 dark:border-white/[0.06] pt-6">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="w-10 h-10 flex items-center justify-center border border-slate-200/80 dark:border-white/10 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:scale-105 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:scale-100 text-slate-500 dark:text-slate-400 transition-all cursor-pointer shadow-xs"
                                        title="Trang trước"
                                    >
                                        <ChevronLeft className="w-4.5 h-4.5" />
                                    </button>

                                    {getPageNumbers(currentPage, totalPages).map((page, index) => {
                                        if (page === '...') {
                                            return (
                                                <div
                                                    key={`ellipsis-${index}`}
                                                    className="w-10 h-10 flex items-center justify-center border border-slate-200/80 dark:border-white/10 rounded-xl bg-white dark:bg-slate-900 text-slate-550 dark:text-slate-400 font-bold text-xs select-none shadow-xs"
                                                >
                                                    ...
                                                </div>
                                            );
                                        }

                                        const pageNumber = page as number;
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => setCurrentPage(pageNumber)}
                                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${
                                                    currentPage === pageNumber
                                                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/10 border border-[#3b82f6]/20'
                                                        : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-705 dark:text-slate-300 shadow-xs'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="w-10 h-10 flex items-center justify-center border border-slate-200/80 dark:border-white/10 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:scale-105 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:scale-100 text-slate-500 dark:text-slate-400 transition-all cursor-pointer shadow-xs"
                                        title="Trang sau"
                                    >
                                        <ChevronRight className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Empty State — No Results */
                        <div className="text-center py-20 animate-in fade-in duration-300">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center mx-auto mb-5 border border-slate-200/50 dark:border-white/[0.06]">
                                <Search className="w-10 h-10 text-slate-300 dark:text-slate-700 animate-float-subtle" />
                            </div>
                            <h3 className="text-xl font-black mb-2 text-slate-800 dark:text-slate-100 font-heading">Không tìm thấy kết quả</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
                                Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác để khám phá thêm học liệu.
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedSubject('all');
                                    setSelectedType('all');
                                    setSelectedGrade('all');
                                    handleSearchChange('');
                                }}
                                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-100/50 dark:border-indigo-500/15 cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4" /> Xóa bộ lọc & khám phá
                            </button>
                        </div>
                    )
                )}
            </div>

            {/* ===== Delete Confirmation Dialog ===== */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/[0.06] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-red-600 dark:text-red-400 font-heading">Xác nhận xóa</h3>
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400 dark:text-slate-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium">
                            Bạn có chắc chắn muốn xóa học liệu này không?
                        </p>
                        <p className="font-bold mb-6 text-slate-800 dark:text-slate-100">"{deleteTarget.title}"</p>

                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/50 rounded-xl p-3 mb-6">
                            <p className="text-sm text-red-600 dark:text-red-400 font-semibold leading-relaxed">
                                ⚠️ Hành động này không thể hoàn tác. File mô hình 3D sẽ bị xóa vĩnh viễn.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors font-bold text-xs cursor-pointer"
                                disabled={isDeleting}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-bold text-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Đang xóa...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Xóa
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Lesson Form Modal ===== */}
            {showLessonForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/[0.06] rounded-3xl p-6 md:p-8 max-w-4xl w-full my-8 shadow-2xl animate-in fade-in zoom-in duration-200 relative">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl" />
                        
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white font-heading">
                                {lessonEditMode ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
                            </h3>
                            <button
                                onClick={() => setShowLessonForm(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400 dark:text-slate-500 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleLessonFormSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                {/* Column 1: Details */}
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5 font-sans">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tiêu đề bài học</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: Bài 1: Sự rơi tự do..."
                                            className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                                            value={lessonFormData.title}
                                            onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 font-sans">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Môn học</label>
                                            <select
                                                className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full cursor-pointer"
                                                value={lessonFormData.subject}
                                                onChange={(e) => {
                                                    const newSub = e.target.value;
                                                    const matchingLessons = lessons.filter(l => 
                                                        l.subject === newSub && 
                                                        Number(l.grade) === Number(lessonFormData.grade)
                                                    );
                                                    const uniqueChapters = Array.from(new Set(matchingLessons.map(l => l.chapter).filter(Boolean)));
                                                    setLessonFormData({ 
                                                        ...lessonFormData, 
                                                        subject: newSub, 
                                                        chapter: uniqueChapters[0] || '',
                                                        materials: [] 
                                                    });
                                                    setIsCustomChapter(uniqueChapters.length === 0);
                                                }}
                                            >
                                                <option value="physics">⚛️ Vật lý</option>
                                                <option value="chemistry">🧪 Hóa học</option>
                                                <option value="biology">🌱 Sinh học</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Lớp</label>
                                            <select
                                                className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full cursor-pointer"
                                                value={lessonFormData.grade}
                                                onChange={(e) => {
                                                    const newGrade = Number(e.target.value);
                                                    const matchingLessons = lessons.filter(l => 
                                                        l.subject === lessonFormData.subject && 
                                                        Number(l.grade) === newGrade
                                                    );
                                                    const uniqueChapters = Array.from(new Set(matchingLessons.map(l => l.chapter).filter(Boolean)));
                                                    setLessonFormData({ 
                                                        ...lessonFormData, 
                                                        grade: newGrade, 
                                                        chapter: uniqueChapters[0] || '',
                                                        materials: [] 
                                                    });
                                                    setIsCustomChapter(uniqueChapters.length === 0);
                                                }}
                                            >
                                                <option value={10}>Lớp 10</option>
                                                <option value={11}>Lớp 11</option>
                                                <option value={12}>Lớp 12</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 font-sans">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Chương / Chuyên đề</label>
                                            {existingChapters.length > 0 ? (
                                                <div className="space-y-2">
                                                    <select
                                                        className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full cursor-pointer"
                                                        value={isCustomChapter ? '__NEW__' : lessonFormData.chapter}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === '__NEW__') {
                                                                setIsCustomChapter(true);
                                                                setLessonFormData({ ...lessonFormData, chapter: '' });
                                                            } else {
                                                                setIsCustomChapter(false);
                                                                setLessonFormData({ ...lessonFormData, chapter: val });
                                                            }
                                                        }}
                                                    >
                                                        {existingChapters.map((ch, idx) => (
                                                            <option key={idx} value={ch}>
                                                                📂 {ch}
                                                            </option>
                                                        ))}
                                                        <option value="__NEW__">➕ Tạo chương mới...</option>
                                                    </select>
                                                    {isCustomChapter && (
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Nhập tên chương mới..."
                                                            className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-indigo-550 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                                                            value={lessonFormData.chapter}
                                                            onChange={(e) => setLessonFormData({ ...lessonFormData, chapter: e.target.value })}
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Chương 1: Cơ học..."
                                                    className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                                                    value={lessonFormData.chapter}
                                                    onChange={(e) => {
                                                        setIsCustomChapter(true);
                                                        setLessonFormData({ ...lessonFormData, chapter: e.target.value });
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Thứ tự (Order)</label>
                                            <input
                                                type="number"
                                                placeholder="1"
                                                className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                                                value={lessonFormData.order}
                                                onChange={(e) => setLessonFormData({ ...lessonFormData, order: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5 font-sans">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Mô tả bài học</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Nhập giới thiệu hoặc nội dung bài học..."
                                            className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none w-full"
                                            value={lessonFormData.description}
                                            onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Column 2: Material Select */}
                                <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-white/5 p-5 flex flex-col h-[340px]">
                                    <div className="mb-3 shrink-0">
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-sans">Liên kết học liệu ({lessonFormData.materials.length} mục đã chọn)</label>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Hiển thị học liệu thuộc cùng Môn & Lớp</p>
                                    </div>

                                    {/* Material Search Input */}
                                    <div className="relative mb-3 shrink-0">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm học liệu..."
                                            value={formMaterialSearch}
                                            onChange={(e) => setFormMaterialSearch(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                        />
                                    </div>

                                    {/* Toggle All Filtered */}
                                    {availableFormMaterials.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleToggleAllFilteredMaterials(availableFormMaterials.map(m => m.id))}
                                            className="mb-2 self-start flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors cursor-pointer"
                                        >
                                            <CheckSquare className="w-3.5 h-3.5" />
                                            <span>Chọn tất cả hiển thị ({availableFormMaterials.length})</span>
                                        </button>
                                    )}

                                    {/* Scrollable checklist */}
                                    <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 custom-scrollbar">
                                        {availableFormMaterials.length > 0 ? (
                                            availableFormMaterials.map(m => {
                                                const dbId = m.id;
                                                const cleanId = dbId.replace('db-', '');
                                                const isSelected = lessonFormData.materials.includes(cleanId);
                                                return (
                                                    <div
                                                        key={dbId}
                                                        onClick={() => handleToggleMaterialInLesson(dbId)}
                                                        className={`p-2 rounded-xl border flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/30 ${isSelected ? 'border-indigo-500/80 bg-indigo-500/5' : 'border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/40'}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}} // division click handles it
                                                            className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-white/10 rounded cursor-pointer pointer-events-none"
                                                        />
                                                        
                                                        {m.thumbnail && m.thumbnail !== '3d-placeholder' ? (
                                                            <img 
                                                                src={m.thumbnail} 
                                                                alt={m.title} 
                                                                className="w-8 h-8 object-cover rounded-lg shrink-0 border border-slate-200/50 dark:border-white/10" 
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/5 text-slate-450">
                                                                <Layers className="w-3.5 h-3.5" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">{m.title}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                                <Layers className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-1.5" />
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Không có học liệu tương thích</p>
                                                <p className="text-[9px] text-slate-450 mt-1 leading-relaxed">
                                                    Đảm bảo đã tải lên mô hình 3D thuộc Môn & Lớp tương ứng trước.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-slate-150 dark:border-white/5 pt-5 gap-3 font-sans">
                                <button
                                    type="button"
                                    onClick={() => setShowLessonForm(false)}
                                    className="px-5 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingLesson}
                                    className="px-8 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-750 text-white rounded-xl text-xs uppercase tracking-widest font-black transition-all hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    {isSavingLesson ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Đang lưu...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Lưu bài học</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Lesson Delete Confirmation Dialog ===== */}
            {lessonDeleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/[0.06] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-red-600 dark:text-red-400 font-heading">Xác nhận xóa bài học</h3>
                            <button
                                onClick={() => setLessonDeleteTarget(null)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400 dark:text-slate-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium">
                            Bạn có chắc chắn muốn xóa bài học này không? Các học liệu liên kết sẽ không bị xóa.
                        </p>
                        <p className="font-bold mb-6 text-slate-800 dark:text-slate-100">"{lessonDeleteTarget.title}"</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setLessonDeleteTarget(null)}
                                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors font-bold text-xs cursor-pointer"
                                disabled={isDeletingLesson}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteLesson}
                                disabled={isDeletingLesson}
                                className="flex-1 px-4 py-2.5 bg-red-650 hover:bg-red-750 text-white rounded-xl transition-all font-bold text-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isDeletingLesson ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Đang xóa...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Xóa
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
