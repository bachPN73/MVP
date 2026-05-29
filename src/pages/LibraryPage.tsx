import { Layout } from '../layout/MainLayout';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Filter, BookOpen, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
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

    return (
        <Layout>
            <div className="p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-black mb-2 text-slate-900 dark:text-white font-heading">Thư viện học liệu</h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
                        Hiện có {allMaterials.length} mô hình 3D và infographic về Khoa học Tự nhiên
                    </p>
                </div>

                {/* Search and Filters - Sleek Sticky Bar */}
                <div className="sticky top-14 md:top-0 z-30 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all">
                    {/* Compact Search and Filters Container */}
                    <div className="flex-1 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        {/* Search Input */}
                        <div className="relative w-full md:max-w-xs lg:max-w-sm shrink-0">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm học liệu..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all h-[38px]"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => handleSearchChange('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 transition-colors cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Inline Dropdowns */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Subject Select */}
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value as Material['subject'] | 'all')}
                                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer h-[38px] transition-all"
                            >
                                <option value="all">Tất cả môn</option>
                                <option value="physics">Vật lý</option>
                                <option value="chemistry">Hóa học</option>
                                <option value="biology">Sinh học</option>
                            </select>

                            {/* Type Select */}
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value as Material['type'] | 'all')}
                                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer h-[38px] transition-all"
                            >
                                <option value="all">Tất cả loại</option>
                                <option value="3d-model">Mô hình 3D</option>
                                <option value="infographic">Infographic</option>
                            </select>

                            {/* Grade Select */}
                            <select
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer h-[38px] transition-all"
                            >
                                <option value="all">Tất cả lớp</option>
                                <option value="10">Lớp 10</option>
                                <option value="11">Lớp 11</option>
                                <option value="12">Lớp 12</option>
                            </select>

                            {/* Clear Filters Button (only shows when filters are active) */}
                            {(selectedSubject !== 'all' || selectedType !== 'all' || selectedGrade !== 'all' || searchQuery !== '') && (
                                <button
                                    onClick={() => {
                                        setSelectedSubject('all');
                                        setSelectedType('all');
                                        setSelectedGrade('all');
                                        handleSearchChange('');
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all h-[38px] cursor-pointer"
                                    title="Xóa tất cả bộ lọc"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Xóa lọc</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results count (Compact on the right or line-ending) */}
                    <div className="text-right whitespace-nowrap hidden lg:block">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1.5">Tìm thấy:</span>
                        <span className="text-sm font-extrabold text-primary bg-primary/10 dark:bg-primary/20 px-2.5 py-1.5 rounded-lg">{filteredMaterials.length} kết quả</span>
                    </div>
                </div>

                {/* Mobile results count */}
                <div className="mb-4 lg:hidden flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Tìm thấy <span className="font-extrabold text-slate-900 dark:text-white">{filteredMaterials.length}</span> kết quả
                    </p>
                </div>

                {/* Materials grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 font-semibold animate-pulse">Đang tải danh sách học liệu...</p>
                    </div>
                ) : filteredMaterials.length > 0 ? (
                    <div ref={gridRef}>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                            {paginatedMaterials.map((material) => (
                                <div
                                    key={material.id}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden hover:shadow-xl hover:dark:shadow-indigo-950/10 transition-all hover:-translate-y-1 relative group"
                                >
                                    {/* Delete button for admin - only for DB models */}
                                    {isAdmin && material.id.startsWith('db-') && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setDeleteTarget(material);
                                            }}
                                            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 p-1.5 sm:p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg cursor-pointer"
                                            title="Xóa học liệu"
                                        >
                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    )}

                                    <Link
                                        to={`/material/${material.id}`}
                                        className="block flex-1 flex flex-col"
                                    >
                                        <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden shrink-0">
                                            {material.thumbnail && material.thumbnail !== '3d-placeholder' ? (
                                                <img loading="lazy" decoding="async" src={material.thumbnail} alt={material.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <BookOpen className="w-8 h-8 sm:w-16 sm:h-16 text-primary/30" />
                                            )}
                                        </div>
                                        <div className="p-3 sm:p-5 flex-1 flex flex-col">
                                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 w-full">
                                                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-primary/10 text-primary font-bold whitespace-nowrap">
                                                    {getSubjectName(material.subject)}
                                                </span>
                                                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-secondary/10 text-secondary font-bold whitespace-nowrap">
                                                    {material.type === '3d-model' ? '3D' : 'INFO'}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-bold ml-auto select-none">
                                                    {formatRelativeTime(material.createdAt)}
                                                </span>
                                            </div>
                                            <h3 className="font-black mb-1 sm:mb-2 text-sm sm:text-base line-clamp-2 leading-snug text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-heading">{material.title}</h3>
                                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 sm:mb-3 flex-1">
                                                {material.description}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-auto">
                                                {(Array.isArray(material.tags) ? material.tags : []).slice(0, 2).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 truncate max-w-[80px] sm:max-w-[120px] font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10 pt-6">
                            {/* Items per page selector */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Hiển thị mỗi trang:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(parseInt(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full text-xs font-black text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary h-10 transition-all hover:border-slate-350 dark:hover:border-white/25 shadow-sm hover:shadow-md"
                                >
                                    <option value={20}>20 học liệu</option>
                                    <option value={50}>50 học liệu</option>
                                    <option value={100}>100 học liệu</option>
                                </select>
                                <span className="text-xs text-slate-550 dark:text-slate-400 ml-2 font-black bg-slate-100/50 dark:bg-slate-900/40 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 h-10 flex items-center shadow-sm select-none">
                                    (Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredMaterials.length)} trong {filteredMaterials.length})
                                </span>
                            </div>

                            {/* Circular Page Numbers with Ellipses */}
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-white/10 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-white/5 hover:scale-105 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:scale-100 text-slate-500 dark:text-slate-400 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                        title="Trang trước"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    {getPageNumbers(currentPage, totalPages).map((page, index) => {
                                        if (page === '...') {
                                            return (
                                                <div
                                                    key={`ellipsis-${index}`}
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-600 font-black text-sm select-none"
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
                                                className={`w-10 h-10 rounded-full text-xs font-black transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${
                                                    currentPage === pageNumber
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/25 border-2 border-primary'
                                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 shadow-sm hover:shadow-md'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-white/10 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-white/5 hover:scale-105 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:scale-100 text-slate-500 dark:text-slate-400 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                        title="Trang sau"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100 font-heading">Không tìm thấy kết quả</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                        </p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-red-600 dark:text-red-400 font-heading">Xác nhận xóa</h3>
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 dark:text-slate-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium">
                            Bạn có chắc chắn muốn xóa học liệu này không?
                        </p>
                        <p className="font-bold mb-6 text-slate-800 dark:text-slate-100">"{deleteTarget.title}"</p>

                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3 mb-6">
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
        </Layout>
    );
}
