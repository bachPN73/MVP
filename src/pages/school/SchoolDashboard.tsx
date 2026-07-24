import { Layout } from '../../layout/MainLayout';
import { useState, useEffect } from 'react';
import { api } from '../../api';
import { QRCodeSVG } from 'qrcode.react';
import { 
    School, 
    Users, 
    UserCheck, 
    UserX, 
    AlertTriangle, 
    Copy, 
    Check, 
    RefreshCw, 
    Settings, 
    ToggleLeft, 
    ToggleRight, 
    ChevronRight, 
    Sparkles, 
    ShieldAlert,
    QrCode,
    X,
    Calendar,
    Clock
} from 'lucide-react';

interface SchoolData {
    _id: string;
    name: string;
    schoolCode: string;
    isInviteCodeEnabled: boolean;
    teacherQuota: number;
    studentQuota: number;
    teacherSeatsUsed: number;
    studentSeatsUsed: number;
    schoolYear?: string;
    tiet?: string;
}

interface MembershipRequest {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    requestedRole: 'teacher' | 'student';
    requestedClass: string;
    status: string;
    createdAt: string;
}

export default function SchoolDashboard() {
    const [school, setSchool] = useState<SchoolData | null>(null);
    const [requests, setRequests] = useState<MembershipRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    // Config states
    const [newInviteCode, setNewInviteCode] = useState('');
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Active members state
    const [members, setMembers] = useState<any[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);

    // Advanced Config Modal state
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configForm, setConfigForm] = useState({
        name: '',
        schoolCode: '',
        schoolYear: '',
        tiet: ''
    });

    const joinUrl = school ? `${window.location.origin}/join-school?code=${school.schoolCode}` : '';

    const handleCopyLink = () => {
        if (!joinUrl) return;
        navigator.clipboard.writeText(joinUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const fetchSchoolData = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const stored = localStorage.getItem('edu_tech_user');
            if (!stored) {
                setErrorMsg('Vui lòng đăng nhập lại.');
                setLoading(false);
                return;
            }
            const user = JSON.parse(stored);
            const schoolId = user.schoolId;
            if (!schoolId) {
                setErrorMsg('Tài khoản của bạn chưa liên kết với trường học nào.');
                setLoading(false);
                return;
            }

            // Fetch school details
            const schoolDetail = await api.getSchoolSummary(schoolId);
            setSchool(schoolDetail);
            setNewInviteCode(schoolDetail.schoolCode);
            setConfigForm({
                name: schoolDetail.name || '',
                schoolCode: schoolDetail.schoolCode || '',
                schoolYear: schoolDetail.schoolYear || '',
                tiet: schoolDetail.tiet || ''
            });

            // Fetch pending requests
            const pendingRequests = await api.getMembershipRequests(schoolId);
            setRequests(pendingRequests);

            // Fetch current school members
            await fetchMembers(schoolId);
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'Lỗi khi tải thông tin trường học.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async (schoolId: string) => {
        setMembersLoading(true);
        try {
            const list = await api.getSchoolMembers(schoolId);
            setMembers(list);
        } catch (err: any) {
            console.error('Error fetching members:', err);
        } finally {
            setMembersLoading(false);
        }
    };

    const handleKickMember = async (memberId: string, memberName: string) => {
        if (!school) return;
        if (!window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${memberName}" khỏi trường không? Gói dịch vụ của họ sẽ được khôi phục về trạng thái trước khi tham gia.`)) return;
        
        setActionLoading(true);
        setErrorMsg('');
        try {
            const res = await api.kickSchoolMembers([memberId], school._id);
            setSuccessMsg(res.message || 'Đã xóa thành viên thành công.');
            await fetchSchoolData();
        } catch (err: any) {
            setErrorMsg(err.message || 'Xóa thành viên thất bại.');
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        fetchSchoolData();
    }, []);

    // Quick alerts timeout
    useEffect(() => {
        if (successMsg) {
            const t = setTimeout(() => setSuccessMsg(''), 5000);
            return () => clearTimeout(t);
        }
    }, [successMsg]);

    useEffect(() => {
        if (errorMsg) {
            const t = setTimeout(() => setErrorMsg(''), 6000);
            return () => clearTimeout(t);
        }
    }, [errorMsg]);

    const handleCopyCode = () => {
        if (!school) return;
        navigator.clipboard.writeText(school.schoolCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleToggleInvite = async () => {
        if (!school) return;
        setActionLoading(true);
        setErrorMsg('');
        try {
            const res = await api.updateSchoolConfig(school._id, {
                isInviteCodeEnabled: !school.isInviteCodeEnabled
            });
            setSchool(res.school);
            setSuccessMsg('Đã cập nhật tính năng mã mời!');
        } catch (err: any) {
            setErrorMsg(err.message || 'Cập nhật cấu hình thất bại.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!school) return;
        if (!configForm.name.trim()) {
            setErrorMsg('Tên trường không được để trống.');
            return;
        }
        if (!configForm.schoolCode.trim()) {
            setErrorMsg('Mã mời không được để trống.');
            return;
        }
        setActionLoading(true);
        setErrorMsg('');
        try {
            const res = await api.updateSchoolConfig(school._id, {
                name: configForm.name.trim(),
                schoolCode: configForm.schoolCode.trim().toUpperCase(),
                schoolYear: configForm.schoolYear.trim(),
                tiet: configForm.tiet.trim()
            });
            setSchool(res.school);
            setIsConfigModalOpen(false);
            setSuccessMsg('Cập nhật cấu hình trường học thành công!');
            setConfigForm({
                name: res.school.name || '',
                schoolCode: res.school.schoolCode || '',
                schoolYear: res.school.schoolYear || '',
                tiet: res.school.tiet || ''
            });
        } catch (err: any) {
            setErrorMsg(err.message || 'Cập nhật cấu hình thất bại.');
        } finally {
            setActionLoading(false);
        }
    };

    // Selection helper
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(requests.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(x => x !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Calculate selected roles to prevent quota exceeding
    const selectedRequests = requests.filter(r => selectedIds.includes(r.id));
    const selectedTeachersCount = selectedRequests.filter(r => r.requestedRole === 'teacher').length;
    const selectedStudentsCount = selectedRequests.filter(r => r.requestedRole === 'student').length;

    const remainingTeachers = school ? (school.teacherQuota - school.teacherSeatsUsed) : 0;
    const remainingStudents = school ? (school.studentQuota - school.studentSeatsUsed) : 0;

    const isExceedingTeacherQuota = selectedTeachersCount > remainingTeachers;
    const isExceedingStudentQuota = selectedStudentsCount > remainingStudents;
    const isExceedingAny = isExceedingTeacherQuota || isExceedingStudentQuota;

    const handleApproveSelected = async () => {
        if (!school || selectedIds.length === 0 || isExceedingAny) return;
        setActionLoading(true);
        setErrorMsg('');
        try {
            const res = await api.approveRequests(selectedIds, school._id);
            setSuccessMsg(res.message || 'Đã phê duyệt thành viên!');
            setSelectedIds([]);
            await fetchSchoolData(); // Refresh metrics
        } catch (err: any) {
            setErrorMsg(err.message || 'Phê duyệt thất bại.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectSelected = async () => {
        if (!school || selectedIds.length === 0) return;
        if (!window.confirm(`Bạn có chắc chắn muốn từ chối ${selectedIds.length} yêu cầu tham gia này không?`)) return;
        setActionLoading(true);
        setErrorMsg('');
        try {
            const res = await api.rejectRequests(selectedIds);
            setSuccessMsg(res.message || 'Đã từ chối các yêu cầu.');
            setSelectedIds([]);
            await fetchSchoolData();
        } catch (err: any) {
            setErrorMsg(err.message || 'Từ chối thất bại.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Layout>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-800 dark:text-slate-100">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                <School className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                                    {school ? school.name : 'Đang tải thông tin...'}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wider uppercase mt-0.5">
                                    Cổng Quản Trị Thành Viên Gói Trường Học
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchSchoolData}
                            disabled={loading || actionLoading}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-white/80 dark:hover:text-white p-3 rounded-2xl border border-slate-200 dark:border-white/10 transition-all flex items-center justify-center disabled:opacity-50"
                            title="Làm mới dữ liệu"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Notifications Alert Banner */}
                {successMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3 text-emerald-400 animate-in slide-in-from-top-2 duration-300">
                        <Sparkles className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-bold">{successMsg}</span>
                    </div>
                )}

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3 text-red-400 animate-in slide-in-from-top-2 duration-300">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-bold">{errorMsg}</span>
                    </div>
                )}

                {/* Quota limit warning banner */}
                {school && (school.teacherSeatsUsed >= school.teacherQuota || school.studentSeatsUsed >= school.studentQuota) && (
                    <div className="bg-gradient-to-r from-red-950/80 via-red-900/60 to-orange-950/80 border border-red-500/30 backdrop-blur-xl rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_35px_rgba(239,68,68,0.15)] animate-pulse-slow">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-red-200">ĐÃ ĐẠT GIỚI HẠN THÀNH VIÊN</h3>
                                <p className="text-sm text-red-300/80 mt-1 max-w-xl">
                                    Số lượng Giáo viên hoặc Học sinh đã dùng đạt 100% giới hạn quota đăng ký của gói. Hãy liên hệ với Bộ phận Kinh doanh của Edu Tech để nâng cấp quota của bạn.
                                </p>
                            </div>
                        </div>
                        <a 
                            href="mailto:netangedutech@gmail.com?subject=Yêu%20cầu%20nâng%20cấp%20Quota%20Trường%20học"
                            className="bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-lg shadow-red-500/20 active:scale-95 transition-all text-center shrink-0"
                        >
                            Liên hệ nâng cấp
                        </a>
                    </div>
                )}

                {school && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* Invite Code display */}
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none backdrop-blur-md transition-all">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mã mời tham gia</h3>
                                    <span className={`text-[0.625rem] px-2 py-0.5 rounded-full font-black uppercase tracking-wider
                                        ${school.isInviteCodeEnabled ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-550 dark:text-red-400 border border-red-500/30'}`}>
                                        {school.isInviteCodeEnabled ? 'Đang hoạt động' : 'Tạm khóa'}
                                    </span>
                                </div>
                                
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-3.5 px-4 rounded-2xl shadow-inner">
                                        <span className="text-2xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-indigo-650 dark:from-emerald-400 dark:to-indigo-400">{school.schoolCode}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <button
                                            onClick={handleToggleInvite}
                                            disabled={actionLoading}
                                            className={`flex-1 py-2 px-3 rounded-xl border text-[0.625rem] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50
                                                ${school.isInviteCodeEnabled 
                                                    ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20' 
                                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'}`}
                                        >
                                            {school.isInviteCodeEnabled ? 'Khóa mã' : 'Mở mã'}
                                        </button>
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={() => {
                                                    setConfigForm({
                                                        name: school.name || '',
                                                        schoolCode: school.schoolCode || '',
                                                        schoolYear: school.schoolYear || '',
                                                        tiet: school.tiet || ''
                                                    });
                                                    setIsConfigModalOpen(true);
                                                }}
                                                className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 dark:hover:text-white rounded-xl border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
                                                title="Cấu hình trường"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setShowQrModal(true)}
                                                className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 dark:hover:text-white rounded-xl border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
                                                title="Xem mã QR"
                                            >
                                                <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            </button>
                                            <button
                                                onClick={handleCopyCode}
                                                className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 dark:hover:text-white rounded-xl border border-slate-200 dark:border-white/5 transition-all relative cursor-pointer"
                                                title="Sao chép"
                                            >
                                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 font-medium italic mt-2">
                                Gửi mã mời này cho giáo viên và học sinh để họ nhập tại mục "Tham gia tổ chức".
                            </p>
                        </div>

                        {/* Quota Gauge - Teachers */}
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none backdrop-blur-md transition-all">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tài khoản Giáo viên</h3>
                                    <Users className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{school.teacherSeatsUsed}</span>
                                    <span className="text-slate-500 text-sm">người trong trường</span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-slate-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden mt-4 border border-slate-200 dark:border-white/5">
                                    <div 
                                        className={`h-full transition-all duration-500 rounded-full
                                            ${(school.teacherSeatsUsed / school.teacherQuota) >= 1 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 
                                              (school.teacherSeatsUsed / school.teacherQuota) >= 0.8 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                                              'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                                        style={{ width: `${Math.min(100, (school.teacherSeatsUsed / school.teacherQuota) * 100)}%` }}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-[0.6875rem] text-slate-500 dark:text-slate-400 mt-4">
                                <span>Còn trống: {remainingTeachers} chỗ</span>
                                <span className="font-bold text-slate-700 dark:text-white/60">Tỷ lệ: {Math.round((school.teacherSeatsUsed / school.teacherQuota) * 100)}%</span>
                            </div>
                        </div>

                        {/* Quota Gauge - Students */}
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none backdrop-blur-md transition-all">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tài khoản Học sinh</h3>
                                    <Users className="w-4.5 h-4.5 text-teal-500 dark:text-teal-400" />
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{school.studentSeatsUsed}</span>
                                    <span className="text-slate-500 text-sm">người trong trường</span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-slate-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden mt-4 border border-slate-200 dark:border-white/5">
                                    <div 
                                        className={`h-full transition-all duration-500 rounded-full
                                            ${(school.studentSeatsUsed / school.studentQuota) >= 1 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 
                                              (school.studentSeatsUsed / school.studentQuota) >= 0.8 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                                              'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                                        style={{ width: `${Math.min(100, (school.studentSeatsUsed / school.studentQuota) * 100)}%` }}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-[0.6875rem] text-slate-500 dark:text-slate-400 mt-4">
                                <span>Còn trống: {remainingStudents} chỗ</span>
                                <span className="font-bold text-slate-700 dark:text-white/60">Tỷ lệ: {Math.round((school.studentSeatsUsed / school.studentQuota) * 100)}%</span>
                            </div>
                        </div>

                        {/* Academic & Periods Info Card */}
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none backdrop-blur-md transition-all">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Niên khóa & Tiết học</h3>
                                    <button
                                        onClick={() => {
                                            setConfigForm({
                                                name: school.name || '',
                                                schoolCode: school.schoolCode || '',
                                                schoolYear: school.schoolYear || '',
                                                tiet: school.tiet || ''
                                            });
                                            setIsConfigModalOpen(true);
                                        }}
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 dark:hover:text-white rounded-xl transition-all"
                                        title="Chỉnh sửa thông tin"
                                    >
                                        <Settings className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                    </button>
                                </div>
                                
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-3 rounded-2xl">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-[0.625rem] text-slate-500 uppercase tracking-wider font-bold">Niên khóa</div>
                                            <div className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
                                                {school.schoolYear || 'Chưa thiết lập'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-3 rounded-2xl">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-[0.625rem] text-slate-555 uppercase tracking-wider font-bold">Tiết học / Học phần</div>
                                            <div className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
                                                {school.tiet || 'Chưa thiết lập'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 font-medium italic mt-2">
                                Thông tin niên khóa hiện tại và phân bổ số tiết học định mức của trường.
                            </p>
                        </div>

                    </div>
                )}

                {/* Membership Requests Section */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none overflow-hidden backdrop-blur-md transition-all">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30 dark:bg-white/[0.01]">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                Danh sách Đăng ký Chờ duyệt
                                <span className="bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-500/20">
                                    {requests.length} yêu cầu
                                </span>
                            </h2>
                            <p className="text-xs text-slate-555 dark:text-slate-400 font-medium mt-1">
                                Duyệt ứng viên gia nhập trường bằng Mã mời thành viên.
                            </p>
                        </div>

                        {/* Bulk Action Buttons */}
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2 animate-in fade-in duration-300">
                                <button
                                    onClick={handleApproveSelected}
                                    disabled={actionLoading || isExceedingAny}
                                    className={`flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl active:scale-95 transition-all
                                        ${isExceedingAny 
                                            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-500/50 cursor-not-allowed' 
                                            : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/10'}`}
                                >
                                    <UserCheck className="w-4 h-4" />
                                    Duyệt {selectedIds.length} mục
                                </button>
                                <button
                                    onClick={handleRejectSelected}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 dark:text-red-400 font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl active:scale-95 transition-all"
                                >
                                    <UserX className="w-4 h-4" />
                                    Từ chối
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Exceeding Warning Info */}
                    {selectedIds.length > 0 && isExceedingAny && (
                        <div className="bg-red-500/15 border-b border-red-500/30 px-6 py-3 flex items-center gap-3 text-red-500 dark:text-red-400 animate-in slide-in-from-top-2 duration-300">
                            <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                            <span className="text-xs font-black">
                                VƯỢT QUÁ GIỚI HẠN QUOTA TRỐNG: 
                                {isExceedingTeacherQuota && ` Cần duyệt ${selectedTeachersCount} Giáo viên (chỉ trống ${remainingTeachers})`}
                                {isExceedingStudentQuota && ` Cần duyệt ${selectedStudentsCount} Học sinh (chỉ trống ${remainingStudents})`}
                                . Vui lòng bỏ bớt tích chọn để phê duyệt.
                            </span>
                        </div>
                    )}

                    {/* Table / List */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-4">
                                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm font-semibold tracking-wider font-mono uppercase text-indigo-600 dark:text-indigo-400/80">Đang tải yêu cầu...</span>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="p-16 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-slate-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">Hộp chờ duyệt trống</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                                    Hiện tại chưa có yêu cầu xin gia nhập trường học nào ở trạng thái chờ duyệt.
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/[0.01] dark:bg-white/[0.005]">
                                        <th className="p-4 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedIds.length === requests.length}
                                                className="w-4.5 h-4.5 rounded border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                            />
                                        </th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Ứng viên</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Vai trò</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Lớp học</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Ngày đăng ký</th>
                                        <th className="p-4 text-right text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {requests.map((r) => {
                                        const isSelected = selectedIds.includes(r.id);
                                        return (
                                            <tr 
                                                key={r.id}
                                                className={`hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-indigo-600/5' : ''}`}
                                            >
                                                <td className="p-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectOne(r.id)}
                                                        className="w-4.5 h-4.5 rounded border-slate-350 dark:border-white/10 bg-white dark:bg-white/5 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 dark:text-white text-sm">{r.userName}</span>
                                                        <span className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{r.userEmail}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-[0.625rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border
                                                        ${r.requestedRole === 'teacher' 
                                                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400' 
                                                            : 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400'}`}>
                                                        {r.requestedRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-slate-775 dark:text-slate-300 font-mono text-sm font-semibold">
                                                        {r.requestedClass || '—'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                                                        {new Date(r.createdAt).toLocaleDateString('vi-VN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            day: '2-digit',
                                                            month: '2-digit'
                                                        })}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={async () => {
                                                                setErrorMsg('');
                                                                try {
                                                                    const isTeacher = r.requestedRole === 'teacher';
                                                                    const currentQuotaFull = isTeacher 
                                                                        ? school!.teacherSeatsUsed >= school!.teacherQuota
                                                                        : school!.studentSeatsUsed >= school!.studentQuota;
                                                                    
                                                                    if (currentQuotaFull) {
                                                                        setErrorMsg('Không thể phê duyệt: Vượt quá quota tối đa cho vai trò này.');
                                                                        return;
                                                                    }
                                                                    setActionLoading(true);
                                                                    const res = await api.approveRequests([r.id], school!._id);
                                                                    setSuccessMsg(res.message);
                                                                    await fetchSchoolData();
                                                                } catch (err: any) {
                                                                    setErrorMsg(err.message || 'Lỗi phê duyệt.');
                                                                } finally {
                                                                    setActionLoading(false);
                                                                }
                                                            }}
                                                            disabled={actionLoading}
                                                            className="p-2 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all"
                                                            title="Duyệt"
                                                        >
                                                            <UserCheck className="w-4.5 h-4.5" />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (!window.confirm(`Từ chối yêu cầu từ ${r.userName}?`)) return;
                                                                setErrorMsg('');
                                                                setActionLoading(true);
                                                                try {
                                                                    await api.rejectRequests([r.id]);
                                                                    setSuccessMsg('Đã từ chối yêu cầu.');
                                                                    await fetchSchoolData();
                                                                } catch (err: any) {
                                                                    setErrorMsg(err.message || 'Lỗi từ chối.');
                                                                } finally {
                                                                    setActionLoading(false);
                                                                }
                                                            }}
                                                            disabled={actionLoading}
                                                            className="p-2 hover:bg-red-500/15 text-red-500 dark:text-red-400 rounded-xl transition-all"
                                                            title="Từ chối"
                                                        >
                                                            <UserX className="w-4.5 h-4.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* School Active Members Section */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none overflow-hidden backdrop-blur-md transition-all">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30 dark:bg-white/[0.01]">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                Danh sách Thành viên Hiện tại
                                <span className="bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/20">
                                    {members.length} thành viên
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                Quản lý danh sách giáo viên và học sinh đã gia nhập và đang sử dụng bản quyền của trường.
                            </p>
                        </div>
                    </div>

                    {/* Table / List */}
                    <div className="overflow-x-auto">
                        {membersLoading ? (
                            <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-4">
                                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm font-semibold tracking-wider font-mono uppercase text-indigo-600 dark:text-indigo-400/80">Đang tải danh sách...</span>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="p-16 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-slate-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">Chưa có thành viên nào</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                                    Trường học hiện chưa có thành viên nào hoạt động.
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/[0.01] dark:bg-white/[0.005]">
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Họ và tên</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Vai trò</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Lớp học</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Gói hiện tại</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Gói cũ</th>
                                        <th className="p-4 text-right text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {members.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{m.name}</span>
                                                    <span className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{m.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[0.625rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border
                                                    ${m.role === 'teacher' 
                                                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400' 
                                                        : m.role === 'school-admin'
                                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                                        : 'bg-teal-500/10 border-teal-500/20 text-teal-650 dark:text-teal-400'}`}>
                                                    {m.role === 'teacher' ? 'Giáo viên' : m.role === 'school-admin' ? 'Quản trị viên' : 'Học sinh'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-slate-700 dark:text-slate-300 font-mono text-sm font-semibold">
                                                    {m.className || '—'}
                                                </span>
                                            </td>
                                            <td className="p-4 capitalize text-xs font-semibold text-slate-700 dark:text-slate-350">
                                                {m.plan}
                                            </td>
                                            <td className="p-4 capitalize text-xs font-semibold text-slate-500">
                                                {m.previousPlan || 'free'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleKickMember(m.id, m.name)}
                                                    className="px-3 py-1.5 hover:bg-red-500 hover:text-white text-red-500 dark:text-red-400 border border-red-500/20 hover:border-transparent rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                                >
                                                    Mời ra
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                </div>

            </div>

            {/* Premium QR Code Modal */}
            {showQrModal && school && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-200 relative shadow-2xl">
                        
                        {/* Close button */}
                        <button
                            onClick={() => setShowQrModal(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Mã QR tham gia trường</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Trường: <span className="font-bold text-slate-800 dark:text-slate-200">{school.name}</span></p>
                            </div>
                        </div>

                        {/* QR Image Frame */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-white/5 inline-block mx-auto">
                            <div className="bg-white p-3 rounded-xl shadow-inner relative group flex items-center justify-center min-w-[13.5rem] min-h-[13.5rem]">
                                {joinUrl ? (
                                    <QRCodeSVG 
                                        value={joinUrl} 
                                        size={192}
                                        className="mx-auto" 
                                        level="H"
                                        includeMargin={false}
                                    />
                                ) : (
                                    <div className="w-48 h-48 animate-pulse bg-slate-100 rounded-lg"></div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-mono">
                                <span className="truncate text-slate-500 dark:text-slate-400 max-w-[12.5rem]">{joinUrl}</span>
                                <button
                                    onClick={handleCopyLink}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 dark:hover:text-white rounded-lg transition-all shrink-0 ml-2"
                                    title="Sao chép liên kết"
                                >
                                    {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 italic leading-relaxed">
                                Học sinh/Giáo viên chỉ cần quét mã này bằng điện thoại để tự động điền mã mời <strong className="text-indigo-600 dark:text-indigo-400 font-mono font-black">{school.schoolCode}</strong> và nộp đơn xin vào.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced School Configuration Modal */}
            {isConfigModalOpen && school && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-200 relative shadow-2xl text-left">
                        
                        {/* Close button */}
                        <button
                            onClick={() => setIsConfigModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Cấu hình Trường học</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Điều chỉnh thông tin hoạt động và niên khóa</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveConfig} className="space-y-4 pt-2">
                            {/* School Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tên trường học</label>
                                <input
                                    type="text"
                                    required
                                    value={configForm.name}
                                    onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                                    placeholder="Tên trường học..."
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-800 dark:text-white font-semibold text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>

                            {/* Invite Code */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mã mời tham gia</label>
                                <input
                                    type="text"
                                    required
                                    value={configForm.schoolCode}
                                    onChange={(e) => setConfigForm({ ...configForm, schoolCode: e.target.value.toUpperCase() })}
                                    placeholder="MÃ MỚI TRƯỜNG..."
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-800 dark:text-white font-mono font-bold text-sm uppercase focus:outline-none focus:border-indigo-500 transition-colors"
                                    maxLength={20}
                                />
                            </div>

                            {/* School Year */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Niên khóa</label>
                                <input
                                    type="text"
                                    value={configForm.schoolYear}
                                    onChange={(e) => setConfigForm({ ...configForm, schoolYear: e.target.value })}
                                    placeholder="Ví dụ: 2025 - 2026"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-800 dark:text-white font-semibold text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>

                            {/* Tiet/Periods */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiết học / Học phần</label>
                                <input
                                    type="text"
                                    value={configForm.tiet}
                                    onChange={(e) => setConfigForm({ ...configForm, tiet: e.target.value })}
                                    placeholder="Ví dụ: Học kỳ II - 45 tiết"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-800 dark:text-white font-semibold text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsConfigModalOpen(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-2xl transition-all text-center"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-center"
                                >
                                    {actionLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
