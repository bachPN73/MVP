import { Layout } from "../layout/MainLayout";
import { useState, useEffect } from "react";
import { User, Mail, Shield, Key, CreditCard, ChevronRight, Lock, School, Sparkles, AlertTriangle, QrCode, X } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';
import { Link, useNavigate } from "react-router";
import Button from "../components/Button";
import { api } from "../api";

export default function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        id: "",
        name: "",
        email: "",
        role: "",
        plan: "Free",
        schoolId: null,
        className: ""
    });

    // Editing basic profile info state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [profileError, setProfileError] = useState("");
    const [profileLoading, setProfileLoading] = useState(false);

    // Joining school state
    const [schoolCode, setSchoolCode] = useState("");
    const [requestedRole, setRequestedRole] = useState<'teacher' | 'student'>('student');
    const [requestedClass, setRequestedClass] = useState("");
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState("");
    const [joinError, setJoinError] = useState("");
    const [schoolName, setSchoolName] = useState("");
    const [schoolInfo, setSchoolInfo] = useState<any>(null);
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('edu_tech_user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser({
                    id: parsed.id || parsed._id || "",
                    name: parsed.name || 'Người dùng',
                    email: parsed.email || '',
                    role: parsed.role === 'teacher' ? 'Giáo viên' : parsed.role === 'admin' ? 'Quản trị Web' : parsed.role === 'school-admin' ? 'Quản trị Trường' : 'Học sinh',
                    plan: parsed.plan ? (parsed.plan.charAt(0).toUpperCase() + parsed.plan.slice(1)) : 'Free',
                    schoolId: parsed.schoolId || null,
                    className: parsed.className || ""
                });
                
                setEditName(parsed.name || "");
                setEditEmail(parsed.email || "");

                if (parsed.schoolId) {
                    api.getSchoolSummary(parsed.schoolId).then(s => {
                        if (s) {
                            setSchoolInfo(s);
                            if (s.name) setSchoolName(s.name);
                        }
                    }).catch(e => console.error(e));
                }

                // Fetch latest data from database
                api.getUsers().then((usersList: any[]) => {
                    const latest = usersList.find(u => u.email === parsed.email);
                    if (latest) {
                        const updated = {
                            id: latest.id || latest._id || "",
                            name: latest.name || 'Người dùng',
                            email: latest.email || '',
                            role: latest.role === 'teacher' ? 'Giáo viên' : latest.role === 'admin' ? 'Quản trị Web' : latest.role === 'school-admin' ? 'Quản trị Trường' : 'Học sinh',
                            plan: latest.plan ? (latest.plan.charAt(0).toUpperCase() + latest.plan.slice(1)) : 'Free',
                            schoolId: latest.schoolId || null,
                            className: latest.className || ""
                        };
                        setUser(updated);
                        setEditName(latest.name || "");
                        setEditEmail(latest.email || "");
                        
                        // Update localStorage too!
                        const storedProfile = {
                            ...parsed,
                            name: latest.name,
                            email: latest.email,
                            role: latest.role,
                            plan: latest.plan,
                            schoolId: latest.schoolId,
                            className: latest.className
                        };
                        localStorage.setItem('edu_tech_user', JSON.stringify(storedProfile));

                        if (latest.schoolId) {
                            api.getSchoolSummary(latest.schoolId).then(s => {
                                if (s) {
                                    setSchoolInfo(s);
                                    if (s.name) setSchoolName(s.name);
                                }
                            }).catch(e => console.error(e));
                        }
                    }
                }).catch(err => console.error("Error updating profile state:", err));

            } catch { /* ignore parse errors */ }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Auto-fill invite code from URL query parameters (e.g. ?join=NGUYENDU2026) and focus
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const codeParam = params.get('join') || params.get('code');
        if (codeParam) {
            setSchoolCode(codeParam.toUpperCase());
            setTimeout(() => {
                const element = document.getElementById('join-school-section');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const inputEl = element.querySelector('input');
                    if (inputEl) {
                        inputEl.focus();
                    }
                }
            }, 300);
        }
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim()) {
            setProfileError("Họ và tên không được để trống.");
            return;
        }
        if (!editEmail.trim()) {
            setProfileError("Email không được để trống.");
            return;
        }
        setProfileLoading(true);
        setProfileError("");
        try {
            await api.updateUser(user.id, {
                name: editName.trim(),
                email: editEmail.trim(),
            });
            
            setUser(prev => ({
                ...prev,
                name: editName.trim(),
                email: editEmail.trim()
            }));
            
            const stored = localStorage.getItem('edu_tech_user');
            if (stored) {
                const parsed = JSON.parse(stored);
                const updated = {
                    ...parsed,
                    name: editName.trim(),
                    email: editEmail.trim()
                };
                localStorage.setItem('edu_tech_user', JSON.stringify(updated));
            }
            
            setIsEditingProfile(false);
            setSuccessMessage("Cập nhật thông tin cá nhân thành công!");
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (err: any) {
            setProfileError(err.message || "Không thể cập nhật thông tin cá nhân.");
        } finally {
            setProfileLoading(false);
        }
    };

    const [passwordData, setPasswordData] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert("Mật khẩu mới không trùng khớp!");
            return;
        }
        setIsUpdating(true);
        // Simulate API call
        setTimeout(() => {
            setIsUpdating(false);
            setShowPasswordForm(false);
            setSuccessMessage("Đổi mật khẩu thành công!");
            setPasswordData({ current: "", new: "", confirm: "" });
            setTimeout(() => setSuccessMessage(""), 4000);
        }, 1000);
    };

    return (
        <Layout>
            <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
                {/* Title */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
                        Hồ sơ cá nhân
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base font-sans">
                        Quản lý thông tin tài khoản, gói dịch vụ và cài đặt bảo mật.
                    </p>
                </div>

                {successMessage && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200/60 dark:border-emerald-800/30 text-sm font-medium animate-fadeIn">
                        {successMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Info Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 text-center shadow-sm text-slate-900 dark:text-white backdrop-blur-md transition-all duration-300">
                            <div className="relative w-24 h-24 mx-auto mb-5 group">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-teal-400 to-emerald-500 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-600 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
                                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </div>
                            </div>
                            <h2 className="text-xl font-bold font-heading mb-1">{user.name}</h2>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-5">{user.role}</p>
                            
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold border border-indigo-100/60 dark:border-indigo-900/30">
                                <CreditCard className="w-3.5 h-3.5" />
                                Gói {user.plan}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & Forms */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white backdrop-blur-md transition-all duration-300">
                            <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-white/5 pb-4">
                                <h3 className="text-lg font-bold font-heading flex items-center gap-2.5">
                                    <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    Thông tin cơ bản
                                </h3>
                                {!isEditingProfile && (
                                    <button
                                        onClick={() => {
                                            setEditName(user.name);
                                            setEditEmail(user.email);
                                            setProfileError("");
                                            setIsEditingProfile(true);
                                        }}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline px-3 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>

                            {profileError && (
                                <div className="p-3 mb-4 bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 rounded-xl border border-red-200/60 dark:border-red-800/30 text-xs font-semibold animate-fadeIn flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span>{profileError}</span>
                                </div>
                            )}

                            {isEditingProfile ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Họ và tên</label>
                                        <input
                                            type="text"
                                            required
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Họ và tên của bạn..."
                                            className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Email</label>
                                        <input
                                            type="email"
                                            required
                                            disabled
                                            value={editEmail}
                                            placeholder="Email của bạn..."
                                            className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/10 outline-none text-slate-500 dark:text-slate-400 transition-all text-sm font-medium cursor-not-allowed opacity-80"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingProfile(false)}
                                            className="px-4.5 py-2 text-xs font-bold rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            disabled={profileLoading}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={profileLoading}
                                            className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200"
                                        >
                                            {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Họ và tên</span>
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
                                            <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                            <span className="font-semibold text-sm md:text-base">{user.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Email</span>
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
                                            <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                            <span className="font-semibold text-sm md:text-base">{user.email}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Subscription Info */}
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white backdrop-blur-md transition-all duration-300">
                            <h3 className="text-lg font-bold font-heading mb-5 flex items-center gap-2.5">
                                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <Shield className="w-4 h-4" />
                                </div>
                                Gói dịch vụ
                            </h3>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-white/10">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white font-heading">
                                        Bạn đang dùng gói {user.plan === 'School' ? 'Trường học' : user.plan}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                                        Trạng thái: <span className="text-emerald-500 font-semibold">Đang hoạt động</span>
                                    </p>
                                </div>
                                <Link to="/pricing-app" className="w-full sm:w-auto">
                                    <Button variant="outline" size="sm" className="w-full justify-center text-xs font-semibold gap-1 py-2 px-4 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm">
                                        Nâng cấp
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>




                        {/* Password Security */}
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white backdrop-blur-md transition-all duration-300">
                            <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2.5">
                                <div className="p-1.5 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-600 dark:text-amber-400">
                                    <Key className="w-4 h-4" />
                                </div>
                                Bảo mật
                            </h3>

                            {!showPasswordForm ? (
                                <button
                                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-700 dark:text-slate-300 transition-all duration-200 group text-left"
                                    onClick={() => setShowPasswordForm(true)}
                                >
                                    <span className="font-semibold text-sm font-sans flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                        Đổi mật khẩu tài khoản
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            ) : (
                                <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Mật khẩu hiện tại</label>
                                        <input
                                            type="password"
                                            required
                                            className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all text-sm"
                                            value={passwordData.current}
                                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            required
                                            className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all text-sm"
                                            value={passwordData.new}
                                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Xác nhận mật khẩu mới</label>
                                        <input
                                            type="password"
                                            required
                                            className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all text-sm"
                                            value={passwordData.confirm}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="px-4.5 py-2 text-sm font-semibold rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => setShowPasswordForm(false)}
                                            disabled={isUpdating}
                                        >
                                            Hủy
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={isUpdating}
                                            className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200"
                                        >
                                            {isUpdating ? "Đang lưu..." : "Cập nhật mật khẩu"}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Scanner Modal */}
            {showScanner && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-bold text-slate-900 dark:text-white">Quét mã QR</h3>
                            </div>
                            <button
                                onClick={() => setShowScanner(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-slate-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 aspect-square w-full relative">
                            <Scanner 
                                onScan={(result) => {
                                    if (result && result.length > 0) {
                                        try {
                                            const scannedUrl = new URL(result[0].rawValue);
                                            const joinParam = scannedUrl.searchParams.get('join') || scannedUrl.searchParams.get('code');
                                            if (joinParam) {
                                                setSchoolCode(joinParam.toUpperCase());
                                                setShowScanner(false);
                                                return;
                                            }
                                        } catch (e) {
                                            // Fallback for raw code scan
                                            if (result[0].rawValue) {
                                                setSchoolCode(result[0].rawValue.toUpperCase());
                                                setShowScanner(false);
                                            }
                                        }
                                    }
                                }} 
                                onError={(error) => console.error(error)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
