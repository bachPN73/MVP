import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../api';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('registered') === 'true') {
            setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập vào tài khoản mới của bạn.');
            // Clear URL param without refreshing
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (params.get('session_expired') === 'true') {
            setErrors({ form: 'Tài khoản của bạn đã được đăng nhập ở thiết bị khác. Vui lòng đăng nhập lại.' });
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location]);

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        setErrors({});
        setSuccessMessage(null);
        try {
            const result = await api.loginWithGoogle(credentialResponse.credential);
            const userData = {
                id: result.user_id,
                email: '', 
                name: result.user_name,
                role: result.user_role,
                plan: result.user_plan,
                sessionToken: result.session_token
            };
            localStorage.setItem('edu_tech_user', JSON.stringify(userData));
            navigate('/dashboard');
        } catch (error: any) {
            setErrors({ form: error.message || 'Đăng nhập Google thất bại.' });
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!formData.email) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});
        setSuccessMessage(null);

        try {
            const result = await api.login({ email: formData.email, password: formData.password });

            const userData = {
                id: result.user.id || result.user._id,
                email: formData.email,
                name: result.user.name || 'Người dùng',
                role: result.user.role || 'student',
                plan: result.user.plan || 'free',
                schoolId: result.user.schoolId || null,
                className: result.user.className || '',
                sessionToken: result.user.sessionToken || null
            };

            localStorage.setItem('edu_tech_user', JSON.stringify(userData));
            navigate('/dashboard');
        } catch (error: any) {
            setErrors({ form: error.message || 'Đã có lỗi xảy ra. Hãy thử lại.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row transition-colors duration-300">
            {/* Left Panel: Form Section (Clean, modern light layout) */}
            <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-gradient-to-br from-slate-100 via-slate-50/50 to-slate-100 dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-900/60 text-slate-900 dark:text-slate-100">
                {/* Back Link at the top */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-all px-3 py-1.5 rounded-xl hover:bg-slate-100/60 dark:hover:bg-white/5"
                    >
                        ← Quay lại trang chủ
                    </Link>
                    <div className="flex items-center gap-3">
                        <ThemeToggle variant="glass" />
                        <div className="lg:hidden flex items-center gap-1.5">
                            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-md">
                                <BookOpen className="w-4.5 h-4.5 text-white" />
                            </div>
                            <span className="font-black text-slate-900 dark:text-white text-base">Edu Tech</span>
                        </div>
                    </div>
                </div>

                {/* Form Wrapper - Styled as a beautiful floating high-contrast card */}
                <div className="w-full max-w-[420px] mx-auto my-auto py-10 px-6 sm:px-10 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] shadow-[0_15px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-500">
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400 shadow-sm">
                            <BookOpen className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black font-heading mb-2 text-slate-900 dark:text-white tracking-tight">Đăng nhập</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                            Chào mừng trở lại! Hãy đăng nhập để tiếp tục khám phá.
                        </p>
                    </div>

                            {successMessage && (
                                <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    <p className="text-sm font-bold leading-relaxed">{successMessage}</p>
                                </div>
                            )}

                            {errors.form && (
                                <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 rounded-2xl text-sm font-bold text-center animate-in fade-in duration-300">
                                    {errors.form}
                                </div>
                            )}

                            {/* Login form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email field */}
                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                        Địa chỉ Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="example@email.com"
                                            className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-600 dark:focus:border-indigo-500 text-sm text-slate-950 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-600 transition-all ${
                                                errors.email ? 'border-red-400 ring-red-100 dark:ring-red-900/30' : 'border-slate-300 dark:border-white/10'
                                            }`}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs text-red-600 mt-1.5 font-bold">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password field */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                            Mật khẩu
                                        </label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline font-bold"
                                        >
                                            Quên mật khẩu?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className={`w-full pl-11 pr-11 py-3 bg-white dark:bg-slate-950 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-600 dark:focus:border-indigo-500 text-sm text-slate-950 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-600 transition-all ${
                                                errors.password ? 'border-red-400 ring-red-100 dark:ring-red-900/30' : 'border-slate-300 dark:border-white/10'
                                            }`}
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4.5 h-4.5" />
                                            ) : (
                                                <Eye className="w-4.5 h-4.5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-red-600 mt-1.5 font-bold">{errors.password}</p>
                                    )}
                                </div>

                                {/* Remember me */}
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                                        <input
                                            type="checkbox"
                                            className="w-4.5 h-4.5 rounded-lg border-slate-300 dark:border-white/10 text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">Ghi nhớ đăng nhập</span>
                                    </label>
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 text-white rounded-2xl font-black hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md mt-6"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4.5 h-4.5 border-2.5 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Đang đăng nhập...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Đăng nhập</span>
                                            <ArrowRight className="w-4.5 h-4.5" />
                                        </>
                                    )}
                                </button>
                             </form>

                             {/* Divider */}
                             <div className="relative my-6">
                                 <div className="absolute inset-0 flex items-center">
                                     <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                                 </div>
                                 <div className="relative flex justify-center text-xs uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                                     <span className="px-4 bg-white dark:bg-slate-900">hoặc</span>
                                 </div>
                             </div>

                             {/* Google Login */}
                             <div className="flex justify-center mb-6">
                                 <GoogleLogin
                                     onSuccess={handleGoogleSuccess}
                                     onError={() => {
                                         setErrors({ form: 'Lỗi khi đăng nhập bằng Google. Vui lòng thử lại.' });
                                     }}
                                     theme="outline"
                                     size="large"
                                     text="signin_with"
                                     shape="rectangular"
                                 />
                             </div>

                             {/* Sign up link */}
                             <div className="text-center">
                                 <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                                     Chưa có tài khoản?{' '}
                                     <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline font-extrabold">
                                         Đăng ký ngay
                                     </Link>
                                 </p>
                             </div>
                </div>

                {/* Footer text */}
                <div className="text-center text-xs text-slate-500 dark:text-slate-500 font-bold mt-auto pt-6">
                    © {new Date().getFullYear()} Edu Tech. Tất cả quyền được bảo lưu.
                </div>
            </div>

            {/* Right Panel: Showcase (Premium science visual panel) */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] bg-gradient-to-br from-[#0a1128] via-[#050b1a] to-[#0d1b3e] relative flex-col justify-between p-12 xl:p-16 text-white overflow-hidden border-l border-white/5">
                {/* Orbital pattern overlay */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Brand Logo header */}
                <div className="flex items-center gap-3 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-indigo-950/30">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight leading-none bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Edu Tech</h2>
                        <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest mt-1 block font-mono">Học liệu số 3D</span>
                    </div>
                </div>

                {/* Beautiful animated vector illustration container */}
                <div className="my-auto py-10 text-center relative z-10 flex flex-col items-center">
                    <div className="relative mb-8 group">
                        <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full blur-2xl opacity-20 group-hover:opacity-45 transition-opacity duration-1000"></div>
                        {/* Interactive Orbital SVG */}
                        <svg className="w-64 h-64 text-white relative z-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Nucleus */}
                            <circle cx="100" cy="100" r="16" fill="url(#nucleus-glow)" className="animate-pulse" />
                            
                            {/* Orbit 1 */}
                            <ellipse cx="100" cy="100" rx="80" ry="24" stroke="url(#orbit-grad)" strokeWidth="1.5" transform="rotate(30 100 100)" strokeDasharray="6,4" />
                            <circle cx="100" cy="20" r="6" fill="#6366f1">
                                <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="8s" repeatCount="indefinite" />
                            </circle>

                            {/* Orbit 2 */}
                            <ellipse cx="100" cy="100" rx="80" ry="24" stroke="url(#orbit-grad)" strokeWidth="1.5" transform="rotate(150 100 100)" strokeDasharray="6,4" />
                            <circle cx="100" cy="20" r="6" fill="#06b6d4">
                                <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="10s" repeatCount="indefinite" />
                            </circle>

                            {/* Orbit 3 */}
                            <ellipse cx="100" cy="100" rx="80" ry="24" stroke="url(#orbit-grad)" strokeWidth="1.5" transform="rotate(90 100 100)" strokeDasharray="6,4" />
                            <circle cx="100" cy="20" r="6" fill="#3b82f6">
                                <animateTransform attributeName="transform" type="rotate" from="180 100 100" to="540 100 100" dur="9s" repeatCount="indefinite" />
                            </circle>

                            <defs>
                                <radialGradient id="nucleus-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" transform="translate(100 100) rotate(90) scale(16)">
                                    <stop stopColor="#a855f7" />
                                    <stop offset="1" stopColor="#6366f1" stopOpacity="0.2" />
                                </radialGradient>
                                <linearGradient id="orbit-grad" x1="20" y1="100" x2="180" y2="100" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#6366f1" stopOpacity="0.8" />
                                    <stop offset="0.5" stopColor="#3b82f6" stopOpacity="0.3" />
                                    <stop offset="1" stopColor="#06b6d4" stopOpacity="0.8" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h3 className="text-2xl font-black mb-3 tracking-tight bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">Thế giới trực quan 3D & AI</h3>
                    <p className="text-slate-300 text-sm max-w-[380px] mx-auto leading-relaxed font-medium">
                        Khám phá và tương tác trực tiếp với các mô hình cấu trúc phân tử sinh học, hóa học và định luật vật lý sống động nhất.
                    </p>
                </div>

                {/* Footer stats / slogan */}
                <div className="flex items-center justify-between border-t border-white/10 pt-6 relative z-10 font-mono text-[11px] tracking-wider text-slate-400">
                    <div className="flex items-center gap-1.5 font-bold">
                        <span>HỌC TẬP THỜI ĐẠI SỐ</span>
                    </div>
                    <div className="flex gap-4 font-extrabold text-indigo-400">
                        <span>VẬT LÝ</span>
                        <span>•</span>
                        <span>HÓA HỌC</span>
                        <span>•</span>
                        <span>SINH HỌC</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
