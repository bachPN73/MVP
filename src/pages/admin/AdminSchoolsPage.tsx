import { AdminLayout } from '../../layout/AdminLayout';
import { School, Search, Plus, Trash2, Save, X, Edit2, Key, Users, BookOpen, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api';

interface SchoolData {
    id: string;
    name: string;
    schoolCode: string;
    isInviteCodeEnabled: boolean;
    teacherQuota: number;
    studentQuota: number;
    teacherSeatsUsed: number;
    studentSeatsUsed: number;
    schoolYear: string;
    tiet: string;
}

export default function AdminSchoolsPage() {
    const [schools, setSchools] = useState<SchoolData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal & Form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchool, setEditingSchool] = useState<SchoolData | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        schoolCode: '',
        teacherQuota: 5,
        studentQuota: 10,
        schoolYear: '',
        tiet: ''
    });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadSchools();
    }, []);

    const loadSchools = async () => {
        setIsLoading(true);
        try {
            const data = await api.getSchools();
            setSchools(data);
        } catch (error) {
            console.error("Failed to load schools", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditingSchool(null);
        setFormData({
            name: '',
            schoolCode: '',
            teacherQuota: 5,
            studentQuota: 10,
            schoolYear: '2025 - 2026',
            tiet: 'Học kỳ I - 35 tiết'
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (school: SchoolData) => {
        setEditingSchool(school);
        setFormData({
            name: school.name,
            schoolCode: school.schoolCode,
            teacherQuota: school.teacherQuota,
            studentQuota: school.studentQuota,
            schoolYear: school.schoolYear || '',
            tiet: school.tiet || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSchool(null);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.schoolCode.trim()) {
            alert('Tên trường và Mã mời là bắt buộc!');
            return;
        }

        setActionLoading(true);
        try {
            if (editingSchool) {
                // Update
                await api.updateSchool(editingSchool.id, formData);
                alert('Cập nhật trường học thành công!');
            } else {
                // Create
                await api.createSchool(formData);
                alert('Thêm trường học mới thành công!');
            }
            handleCloseModal();
            loadSchools();
        } catch (error: any) {
            alert(`Lỗi: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClick = async (school: SchoolData) => {
        if (window.confirm(`Bạn có chắc muốn xóa trường học "${school.name}"? Tất cả giáo viên và học sinh liên kết với trường này sẽ bị gỡ liên kết và chuyển về gói Free.`)) {
            try {
                await api.deleteSchool(school.id);
                alert('Xóa trường học thành công!');
                loadSchools();
            } catch (error: any) {
                alert(`Lỗi khi xóa: ${error.message}`);
            }
        }
    };

    const filteredSchools = schools.filter(s =>
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.schoolCode || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 animate-fadeIn">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-3">
                        <School className="w-6.5 h-6.5 text-indigo-500" /> Quản Lý Trường Học
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-sans font-semibold mt-1">
                        Thêm mới, cấu hình niên khóa, quản lý số lượng giáo viên, học sinh cho từng đơn vị liên kết ({schools.length} trường học)
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Tìm trường học..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full md:w-56 font-sans transition-all"
                        />
                    </div>
                    <button 
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 cursor-pointer font-sans transition-all"
                    >
                        <Plus className="w-4 h-4" /> <span>Thêm Trường Học</span>
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-transparent md:bg-white md:dark:bg-slate-900/60 md:border md:border-slate-200 md:dark:border-white/10 md:rounded-2xl overflow-hidden md:shadow-sm backdrop-blur-xl animate-fadeIn">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-white/10">
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trường học / Mã mời</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Niên khóa</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tiết học</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Giáo viên Quota</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Học sinh Quota</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold text-slate-700 dark:text-slate-200 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-bold uppercase tracking-widest">Đang tải danh sách...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSchools.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        Không tìm thấy trường học nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredSchools.map((school) => (
                                    <tr key={school.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 text-white flex items-center justify-center font-bold text-base font-heading shadow-md shadow-indigo-500/10 shrink-0">
                                                    <School className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-900 dark:text-white font-heading text-sm">{school.name}</div>
                                                    <div className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md font-bold uppercase">
                                                        Mã mời: {school.schoolCode}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 dark:text-white text-xs font-medium">
                                            {school.schoolYear || <span className="text-slate-400 italic">Chưa thiết lập</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 dark:text-white text-xs font-medium">
                                            {school.tiet || <span className="text-slate-400 italic">Chưa thiết lập</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-slate-900 dark:text-white font-extrabold">{school.teacherSeatsUsed} / {school.teacherQuota}</span>
                                                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-teal-500 rounded-full" 
                                                        style={{ width: `${Math.min(100, (school.teacherSeatsUsed / school.teacherQuota) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-slate-900 dark:text-white font-extrabold">{school.studentSeatsUsed} / {school.studentQuota}</span>
                                                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-indigo-500 rounded-full" 
                                                        style={{ width: `${Math.min(100, (school.studentSeatsUsed / school.studentQuota) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-slate-400 dark:text-slate-500">
                                                <button
                                                    onClick={() => handleOpenEdit(school)}
                                                    className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-transparent dark:hover:border-indigo-500/20 transition-all cursor-pointer"
                                                    title="Chỉnh sửa trường học"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(school)}
                                                    className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 cursor-pointer border border-transparent dark:hover:border-rose-500/20 transition-all"
                                                    title="Xóa trường học"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Grid */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="py-12 text-center text-slate-400 flex justify-center items-center gap-3 font-sans font-bold text-xs uppercase tracking-widest">
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang tải...</span>
                        </div>
                    ) : filteredSchools.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs font-bold uppercase bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/10 font-sans">
                            Không tìm thấy trường học nào.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                            {filteredSchools.map((school) => (
                                <div key={school.id} className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between relative group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-md shrink-0">
                                            <School className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm font-heading">{school.name}</h3>
                                            <span className="inline-block mt-0.5 text-[9px] font-bold font-mono px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded">
                                                CODE: {school.schoolCode}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        <div className="flex justify-between">
                                            <span>Niên khóa:</span>
                                            <span className="text-slate-900 dark:text-white font-bold">{school.schoolYear || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tiết học:</span>
                                            <span className="text-slate-900 dark:text-white font-bold">{school.tiet || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Giáo viên:</span>
                                            <span className="text-slate-900 dark:text-white font-bold">{school.teacherSeatsUsed} / {school.teacherQuota}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Học sinh:</span>
                                            <span className="text-slate-900 dark:text-white font-bold">{school.studentSeatsUsed} / {school.studentQuota}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-white/5 pt-3">
                                        <button 
                                            onClick={() => handleOpenEdit(school)}
                                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                                        >
                                            Chỉnh sửa
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(school)}
                                            className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900 transition-all"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
                            <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2 font-heading">
                                <School className="w-5 h-5 text-indigo-500" />
                                {editingSchool ? 'Cập Nhật Trường Học' : 'Thêm Trường Học Mới'}
                            </h2>
                            <button onClick={handleCloseModal} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleFormSubmit}>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tên trường học</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ví dụ: THPT Nguyễn Du, THPT Lê Quý Đôn..."
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Mã mời trường học (School Code)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ví dụ: NGUYENDU2026, LEQUYDON25"
                                        value={formData.schoolCode}
                                        onChange={(e) => setFormData({...formData, schoolCode: e.target.value.toUpperCase()})}
                                        className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 text-sm font-mono tracking-wider font-semibold uppercase"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Niên khóa</label>
                                        <input
                                            type="text"
                                            placeholder="Ví dụ: 2025 - 2026"
                                            value={formData.schoolYear}
                                            onChange={(e) => setFormData({...formData, schoolYear: e.target.value})}
                                            className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tiết học</label>
                                        <input
                                            type="text"
                                            placeholder="Ví dụ: Học kỳ I - 35 tiết"
                                            value={formData.tiet}
                                            onChange={(e) => setFormData({...formData, tiet: e.target.value})}
                                            className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Giới hạn Giáo viên (Teacher Quota)</label>
                                        <input
                                            type="number"
                                            required
                                            min={1}
                                            value={formData.teacherQuota}
                                            onChange={(e) => setFormData({...formData, teacherQuota: parseInt(e.target.value) || 0})}
                                            className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Giới hạn Học sinh (Student Quota)</label>
                                        <input
                                            type="number"
                                            required
                                            min={1}
                                            value={formData.studentQuota}
                                            onChange={(e) => setFormData({...formData, studentQuota: parseInt(e.target.value) || 0})}
                                            className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                    disabled={actionLoading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center gap-1.5"
                                >
                                    {actionLoading ? 'Đang lưu...' : (
                                        <>
                                            <Save className="w-3.5 h-3.5" />
                                            <span>Lưu thay đổi</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
