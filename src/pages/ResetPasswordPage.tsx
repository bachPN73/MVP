import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import ThemeToggle from '../components/ThemeToggle';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const emailFromUrl = searchParams.get('email') || '';

    const [formData, setFormData] = useState({
        email: emailFromUrl,
        token: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);

    // Auto redirect after success
    useEffect(() => {
        if (!isSuccess) return;
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isSuccess, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email) {
            setError('Vui lòng nhập email');
            return;
        }
        if (!formData.token || formData.token.length !== 6) {
            setError('Mã xác nhận phải có 6 chữ số');
            return;
        }
        if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsLoading(true);
        try {
            await api.resetPassword(formData.email, formData.token, formData.newPassword);
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Đã có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Limit token to 6 digits
        if (name === 'token' && value.length > 6) return;
        if (name === 'token' && value && !/^\d+$/.test(value)) return;

        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
                {/* Theme Toggle Button */}
                <div className="absolute top-6 right-6 z-50">
                    <ThemeToggle variant="glass" />
                </div>

                {/* Ambient Background Glows */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] dark:opacity-5 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none text-center animate-in fade-in zoom-in duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 rounded-full mb-6 shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-500">
                            <ShieldCheck className="w-10 h-10 text-white animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-black mb-3 text-emerald-600 dark:text-emerald-400 tracking-tight font-heading">Thành công!</h1>
                        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-6 leading-relaxed">
                            Mật khẩu của bạn đã được đổi thành công.<br />
                            Giờ đây bạn có thể đăng nhập bằng mật khẩu mới.
                        </p>
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-5 mb-6">
                            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                                Tự động chuyển đến trang đăng nhập sau <span className="font-extrabold text-white text-sm bg-emerald-600 dark:bg-emerald-800 px-2 py-0.5 rounded-md">{countdown}</span> giây...
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="w-full py-3.5 px-6 bg-gradient-to-r from-primary via-indigo-600 to-blue-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                            <span>Đăng nhập ngay</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            {/* Theme Toggle Button */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle variant="glass" />
            </div>

            {/* Ambient Background Glows */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] dark:opacity-5 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <Link
                    to="/forgot-password"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3 py-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/5 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </Link>

                <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/20">
                            <KeyRound className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-black mb-2 tracking-tight text-slate-900 dark:text-white font-heading">Đặt lại mật khẩu</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Nhập mã xác nhận và mật khẩu mới của bạn
                        </p>
                    </div>

                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-3 animate-in fade-in duration-500 text-left">
                        <div className="text-sm">
                            <p className="font-bold text-amber-800 dark:text-amber-300">
                                ⚠️ TÌM MÃ KHÔI PHỤC Ở ĐÂU?
                            </p>
                            <p className="text-amber-700 dark:text-amber-400/80 mt-1 font-medium leading-relaxed">
                                Nếu không thấy email trong Hộp thư đến, mã khôi phục rất có thể đã bị lọc vào mục <strong className="font-bold text-red-600 dark:text-red-400 uppercase">Spam (Thư rác)</strong>. Vui lòng kiểm tra kỹ!
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-2xl text-sm font-semibold text-center animate-in fade-in duration-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="reset-email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="reset-email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-600 dark:focus:border-indigo-500 text-sm text-slate-950 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Reset code (6 digits) */}
                        <div>
                            <label htmlFor="reset-token" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                Mã xác nhận (6 chữ số)
                            </label>
                            <input
                                type="text"
                                id="reset-token"
                                name="token"
                                value={formData.token}
                                onChange={handleChange}
                                placeholder="000000"
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-600 dark:focus:border-indigo-500 text-center text-xl font-mono tracking-[0.4em] text-slate-950 dark:text-white transition-all h-[2.875rem]"
                                disabled={isLoading}
                                maxLength={6}
                                autoFocus
                            />
                        </div>

                        {/* New password */}
                        <div>
                            <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                Mật khẩu mới
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="new-password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Tối thiểu 6 ký tự"
                                    className="w-full pl-11 pr-11 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-600 dark:focus:border-indigo-500 text-sm text-slate-950 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                Xác nhận mật khẩu mới
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirm-password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu mới"
                                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-600 dark:focus:border-indigo-500 text-sm text-slate-950 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-6 bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-500/10 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md mt-4"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <span>Đổi mật khẩu</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800/80 pt-6">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Nhớ mật khẩu?{' '}
                            <Link to="/login" className="text-primary hover:underline font-bold">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
