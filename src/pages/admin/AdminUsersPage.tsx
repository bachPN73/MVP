import { AdminLayout } from '../../layout/AdminLayout';
import { Users, Search, Filter, ShieldAlert, BadgeCheck, Trash2, Save, X, Edit2, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ role: '', plan: '' });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (user: any) => {
        setEditingId(user.id);
        setEditForm({ role: user.role, plan: user.plan });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSaveEdit = async (userId: string) => {
        try {
            await api.updateUser(userId, editForm);
            setEditingId(null);
            loadUsers();
            alert('Cập nhật người dùng thành công');
        } catch (error: any) {
            alert(`Lỗi: ${error.message}`);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 animate-fadeIn">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-3">
                        <Users className="w-6 h-6 text-indigo-500" /> Quản Lý Người Dùng
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-sans font-semibold mt-1">
                        Danh sách tài khoản và quản trị phân quyền hệ thống ({users.length} thành viên)
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Tìm người dùng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full md:w-56 font-sans transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer font-sans transition-colors">
                        <Filter className="w-3.5 h-3.5" /> <span>Lọc</span>
                    </button>
                </div>
            </div>

            <div className="bg-transparent md:bg-white md:dark:bg-slate-900/60 md:border md:border-slate-200 md:dark:border-white/10 md:rounded-2xl overflow-hidden md:shadow-sm backdrop-blur-xl animate-fadeIn">
                {/* Desktop view table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-white/10">
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">ID Tài Khoản</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Họ và Tên / Email</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vai Trò</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gói Đăng Ký</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold text-slate-700 dark:text-slate-200 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-bold uppercase tracking-widest">Đang tải danh sách...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        Không tìm thấy người dùng nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-6 py-4 text-xs font-mono text-slate-400 dark:text-slate-500">#{user.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-base font-heading shadow-md shadow-indigo-500/10 shrink-0">
                                                    {(user.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-900 dark:text-white font-heading text-sm">{user.name}</div>
                                                    <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === user.id ? (
                                                <select 
                                                    value={editForm.role}
                                                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                                    className="text-xs bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="teacher">Teacher</option>
                                                    <option value="school-admin">School Admin</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            ) : (
                                                user.role === 'school-admin' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase bg-violet-50 dark:bg-violet-950/40 border border-violet-200/10 text-violet-600 dark:text-violet-400 shadow-sm">
                                                        <Shield className="w-3.5 h-3.5" /> Quản trị Trường
                                                    </span>
                                                ) : user.role === 'admin' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase bg-rose-50 dark:bg-rose-950/40 border border-rose-200/10 text-rose-600 dark:text-rose-400 shadow-sm">
                                                        <ShieldAlert className="w-3.5 h-3.5" /> Quản trị Web
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase bg-slate-50 dark:bg-slate-950/20 border border-slate-200/10 text-slate-600 dark:text-slate-400">
                                                        {user.role || 'User'}
                                                    </span>
                                                )
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === user.id ? (
                                                <select 
                                                    value={editForm.plan}
                                                    onChange={(e) => setEditForm({...editForm, plan: e.target.value})}
                                                    className="text-xs bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                                                >
                                                    <option value="free">Free (Miễn phí)</option>
                                                    <option value="basic">Basic (Cơ bản)</option>
                                                    <option value="pro">Pro (Chuyên nghiệp)</option>
                                                    <option value="combo">Combo Pro + In 3D</option>
                                                    <option value="school">School (Trường học)</option>
                                                </select>
                                            ) : (
                                                user.plan === 'premium' || user.plan === 'pro' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/40 border border-violet-200/10 text-violet-600 dark:text-violet-400">
                                                        <BadgeCheck className="w-3.5 h-3.5" /> Pro
                                                    </span>
                                                ) : user.plan === 'basic' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 border border-blue-200/10 text-blue-600 dark:text-blue-400">
                                                        <BadgeCheck className="w-3.5 h-3.5" /> Basic
                                                    </span>
                                                ) : user.plan === 'combo' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/40 border border-orange-200/10 text-orange-600 dark:text-orange-400">
                                                        <BadgeCheck className="w-3.5 h-3.5" /> Combo
                                                    </span>
                                                ) : user.plan === 'school' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/10 text-emerald-600 dark:text-emerald-400">
                                                        <BadgeCheck className="w-3.5 h-3.5" /> School
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-950/20 border border-slate-200/10 text-slate-600 dark:text-slate-400">
                                                        Free
                                                    </span>
                                                )
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-slate-400 dark:text-slate-500">
                                                {editingId === user.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveEdit(user.id)}
                                                            className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-transparent dark:hover:border-emerald-500/20 transition-all cursor-pointer"
                                                            title="Lưu cấu hình"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-transparent dark:hover:border-white/5 transition-all cursor-pointer"
                                                            title="Hủy thao tác"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditClick(user)}
                                                            className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-transparent dark:hover:border-indigo-500/20 transition-all cursor-pointer"
                                                            title="Phân quyền tài khoản"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (user.role === 'admin') return;
                                                                
                                                                if (window.confirm(`Bạn có chắc muốn xóa người dùng ${user.name} (ID: ${user.id})?`)) {
                                                                    try {
                                                                        const res = await api.deleteUser(user.id);
                                                                        alert(`Thành công: ${res.message}`);
                                                                        loadUsers();
                                                                    } catch (err: any) {
                                                                        console.error("Delete user error:", err);
                                                                        alert(`Lỗi: ${err.message || 'Không thể xóa người dùng'}`);
                                                                    }
                                                                }
                                                            }}
                                                            className={`p-2 rounded-xl transition-all ${user.role === 'admin' ? 'opacity-20 cursor-not-allowed text-slate-300 dark:text-slate-700' : 'hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer border border-transparent dark:hover:border-rose-500/20'}`}
                                                            title={user.role === 'admin' ? "Không thể xóa Admin" : "Xóa người dùng"}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile view card grid (2 columns) */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="py-12 text-center text-slate-400 flex justify-center items-center gap-3 font-sans font-bold text-xs uppercase tracking-widest">
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang tải...</span>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs font-bold uppercase bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/10 font-sans">
                            Không tìm thấy người dùng nào.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 font-sans">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center text-center relative group">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md shadow-indigo-500/10">
                                        {(user.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-extrabold text-slate-900 dark:text-white text-xs truncate mb-0.5 font-heading">{user.name}</h3>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mb-3 font-semibold">{user.email}</div>
                                        </div>
                                        
                                        {editingId === user.id ? (
                                            <div className="flex flex-col gap-2 mt-2">
                                                <select 
                                                    value={editForm.role}
                                                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                                    className="text-[10px] bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 w-full font-semibold"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="teacher">Teacher</option>
                                                    <option value="school-admin">School Admin</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <select 
                                                    value={editForm.plan}
                                                    onChange={(e) => setEditForm({...editForm, plan: e.target.value})}
                                                    className="text-[10px] bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10 dark:border-white/10 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 w-full font-semibold"
                                                >
                                                    <option value="free">Free (Miễn phí)</option>
                                                    <option value="basic">Basic (Cơ bản)</option>
                                                    <option value="pro">Pro (Chuyên nghiệp)</option>
                                                    <option value="combo">Combo Pro + In 3D</option>
                                                    <option value="school">School (Trường học)</option>
                                                </select>
                                                <div className="flex gap-1 justify-center mt-1">
                                                    <button onClick={() => handleSaveEdit(user.id)} className="p-1.5 bg-emerald-600 text-white rounded-lg"><Save className="w-3.5 h-3.5" /></button>
                                                    <button onClick={handleCancelEdit} className="p-1.5 bg-slate-400 text-white rounded-lg"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1.5 items-center">
                                                {user.role === 'school-admin' ? (
                                                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/10 uppercase shadow-sm">QT TRƯỜNG</span>
                                                ) : user.role === 'admin' ? (
                                                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/10 uppercase shadow-sm">QT WEB</span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 border border-slate-200/10">{(user.role || 'USER').toUpperCase()}</span>
                                                )}
                                                {user.plan === 'premium' || user.plan === 'pro' ? (
                                                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/10">PRO</span>
                                                ) : user.plan === 'basic' ? (
                                                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/10">BASIC</span>
                                                ) : user.plan === 'combo' ? (
                                                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/10">COMBO</span>
                                                ) : user.plan === 'school' ? (
                                                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/10">SCHOOL</span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 border border-slate-200/10">FREE</span>
                                                )}
                                                <button 
                                                    onClick={() => handleEditClick(user)}
                                                    className="mt-1 text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                                                >
                                                    <Edit2 className="w-2.5 h-2.5" /> Sửa
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <button 
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (user.role === 'admin') return;
                                                
                                                if (window.confirm(`Xác nhận xóa người dùng ${user.name}?`)) {
                                                    try {
                                                        const res = await api.deleteUser(user.id);
                                                        alert(`Thành công: ${res.message}`);
                                                        loadUsers();
                                                    } catch (err: any) {
                                                        console.error("Delete user error:", err);
                                                        alert(`Lỗi: ${err.message}`);
                                                    }
                                                }
                                            }}
                                            className={`p-1 rounded-lg transition-colors ${user.role === 'admin' ? 'opacity-0 cursor-default' : 'text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400'}`}
                                            title={user.role === 'admin' ? "" : "Xóa người dùng"}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
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
