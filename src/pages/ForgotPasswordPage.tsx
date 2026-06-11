import { useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Mail, ArrowRight, ArrowLeft, CheckCircle, Copy, Check } from 'lucide-react';
import { api } from '../api';
import ThemeToggle from '../components/ThemeToggle';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [userName, setUserName] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Vui lòng nhập email');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email không hợp lệ');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await api.forgotPassword(email);
            setResetCode(result.reset_code);
            setUserName(result.user_name);
            setIsSent(true);
        } catch (err: any) {
            setError(err.message || 'Đã có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(resetCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            {/* Theme Toggle Button */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle variant="glass" />
            </div>

            {/* Ambient Background Glows */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] dark:opacity-5 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3 py-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/5 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại đăng nhập
                </Link>

                <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/20">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black mb-2 tracking-tight text-slate-900 dark:text-white font-heading">Quên mật khẩu</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            {isSent
                                ? 'Mã xác nhận đã được tạo'
                                : 'Nhập email để nhận mã đặt lại mật khẩu'}
                        </p>
                    </div>

                    {!isSent ? (
                        <>
                            {error && (
                                <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-2xl text-sm font-semibold text-center animate-in fade-in duration-300">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="forgot-email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                        Email đăng ký
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                        <input
                                            type="email"
                                            id="forgot-email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                            placeholder="example@email.com"
                                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-600 dark:focus:border-indigo-500 text-sm text-slate-950 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                                            disabled={isLoading}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-orange-500/10 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Đang xử lý...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Gửi mã xác nhận</span>
                                            <ArrowRight className="w-4.5 h-4.5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Success message */}
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-bold text-emerald-800 dark:text-emerald-300">
                                        Xin chào {userName}!
                                    </p>
                                    <p className="text-emerald-700 dark:text-emerald-400/80 mt-1 font-medium leading-relaxed">
                                        Mã xác nhận đã được tạo thành công. Sử dụng mã bên dưới để đặt lại mật khẩu của bạn.
                                    </p>
                                </div>
                            </div>

                            {/* Mã xác nhận sẽ được gửi qua email */}
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-3">
                                <div className="text-sm">
                                    <p className="font-bold text-amber-800 dark:text-amber-300">
                                        ⚠️ LƯU Ý QUAN TRỌNG:
                                    </p>
                                    <p className="text-amber-700 dark:text-amber-400/80 mt-1 font-medium leading-relaxed">
                                        Nếu không thấy email trong Hộp thư đến, mã khôi phục rất có thể nằm trong mục <strong className="font-bold text-red-600 dark:text-red-400 uppercase">Spam (Thư rác)</strong>. Vui lòng kiểm tra kỹ!
                                    </p>
                                </div>
                            </div>

                            {/* Go to reset page */}
                            <Link
                                to={`/reset-password?email=${encodeURIComponent(email)}`}
                                className="w-full py-3.5 px-6 bg-gradient-to-r from-primary via-indigo-600 to-blue-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                                <span>Đặt lại mật khẩu</span>
                                <ArrowRight className="w-4.5 h-4.5" />
                            </Link>

                            <button
                                onClick={() => { setIsSent(false); setResetCode(''); }}
                                className="w-full text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-center cursor-pointer block pt-2"
                            >
                                Gửi lại mã xác nhận
                            </button>
                        </div>
                    )}

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
