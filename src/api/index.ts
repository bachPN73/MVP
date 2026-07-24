import { User, LoginResponse, ModelInput } from '../data/materialsData';

// Vercel/Vite sẽ tìm biến VITE_API_URL trong cấu hình Environment Variables
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3099';
const API_URL = `${BASE_URL}/api`;
console.log('DEBUG: API_URL is', API_URL);

// Helper: trả về auth headers từ localStorage (sessionToken + userId)
function getAuthHeaders(): Record<string, string> {
    try {
        const stored = localStorage.getItem('edu_tech_user');
        if (stored) {
            const user = JSON.parse(stored);
            const headers: Record<string, string> = {};
            if (user.id || user._id) headers['x-user-id'] = user.id || user._id;
            if (user.sessionToken) headers['x-session-token'] = user.sessionToken;
            return headers;
        }
    } catch (e) {}
    return {};
}

// In-memory cache for GET API requests to ensure ultra-fast sub-millisecond page transitions
const apiCache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_TTL = 15000; // 15 seconds cache

function getCachedData<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
    const entry = apiCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > ttl) {
        apiCache.delete(key);
        return null;
    }
    return entry.data as T;
}

function setCachedData(key: string, data: any): void {
    apiCache.set(key, { data, timestamp: Date.now() });
}

export function clearApiCache(keyPrefix?: string): void {
    if (!keyPrefix) {
        apiCache.clear();
        return;
    }
    for (const key of apiCache.keys()) {
        if (key.startsWith(keyPrefix)) {
            apiCache.delete(key);
        }
    }
}

export const api = {
    // User APIs
    getUsers: async (): Promise<User[]> => {
        const cacheKey = 'users_all';
        const cached = getCachedData<User[]>(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${API_URL}/users`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
        setCachedData(cacheKey, data);
        return data;
    },
    updateUser: async (id: string | number, updateData: Partial<User>): Promise<{ message: string }> => {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update user');
        return data;
    },
    deleteUser: async (id: string | number): Promise<{ message: string }> => {
        console.log(`[API] Requesting DELETE for user ${id} at ${API_URL}/users/${id}`);
        // Support both routes for safety during transition
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
        });
        
        if (response.status === 404) {
            console.log(`[API] User ${id} not found at /users/${id}, trying /u_remove/${id}`);
            const retryResponse = await fetch(`${API_URL}/u_remove/${id}`, {
                method: 'DELETE',
            });
            const data = await retryResponse.json();
            if (!retryResponse.ok) throw new Error(data.error || 'Failed to delete user');
            return data;
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete user');
        return data;
    },

    register: async (userData: Partial<User> & { password?: string }): Promise<{ id: number; message: string }> => {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Server error');
        }
        return data;
    },

    login: async (credentials: Record<string, string>): Promise<LoginResponse> => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Server error');
        }
        return data;
    },

    loginWithGoogle: async (credential: string): Promise<any> => {
        const response = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Google login error');
        }
        return data;
    },


    // Model APIs
    getModels: async (): Promise<any[]> => {
        const cacheKey = 'models_all';
        const cached = getCachedData<any[]>(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${API_URL}/models`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch models');
        setCachedData(cacheKey, data);
        return data;
    },

    getModel: async (id: string | number): Promise<any> => {
        const cacheKey = `model_${id}`;
        const cached = getCachedData<any>(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${API_URL}/models/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch model');
        setCachedData(cacheKey, data);
        return data;
    },

    saveModel: async (modelData: ModelInput): Promise<{ id: number; message: string }> => {
        clearApiCache('model');
        const response = await fetch(`${API_URL}/models`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modelData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to save model');
        return data;
    },

    updateModel: async (id: string | number, modelData: Partial<ModelInput>): Promise<{ message: string; model: any }> => {
        clearApiCache('model');
        const response = await fetch(`${API_URL}/models/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modelData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update model');
        return data;
    },

    uploadModelFile: async (file: File): Promise<{ file_url: string; message: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to upload file');
        return data;
    },

    uploadThumbnail: async (file: File): Promise<{ thumbnail_url: string; message: string }> => {
        const formData = new FormData();
        formData.append('thumbnail', file);

        const response = await fetch(`${API_URL}/upload-thumbnail`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to upload thumbnail');
        return data;
    },

    deleteModel: async (id: string | number): Promise<{ message: string }> => {
        clearApiCache('model');
        console.log(`[API] Deleting model ${id} at ${API_URL}/models/${id}`);
        const response = await fetch(`${API_URL}/models/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete model');
        return data;
    },

    // AI Search API
    aiSearch: async (query: string): Promise<{
        results: any[];
        ai_insight: string;
        keywords: string[];
        predicted_subject: string | null;
    }> => {
        const response = await fetch(`${API_URL}/ai-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ query }),
        });
        const data = await response.json();
        // 429 = rate limit — throw with special error code so UI can distinguish
        if (response.status === 429) {
            const err: any = new Error(data.message || 'Đã hết lượt AI hôm nay');
            err.code = 'RATE_LIMIT_EXCEEDED';
            err.limit = data.limit;
            err.count = data.count;
            err.plan = data.plan;
            throw err;
        }
        if (!response.ok) throw new Error(data.error || 'AI search failed');
        return data;
    },

    // Admin: AI Config APIs
    getAIConfig: async (): Promise<{ limits: Record<string, number> }> => {
        const response = await fetch(`${API_URL}/admin/ai-config`, {
            headers: { ...getAuthHeaders() },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch AI config');
        return data;
    },

    updateAIConfig: async (limits: Record<string, number>): Promise<{ message: string; limits: Record<string, number> }> => {
        const response = await fetch(`${API_URL}/admin/ai-config`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ limits }),
        });
        const data = await response.json();
        if (response.status === 401) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        if (response.status === 403) throw new Error('Bạn không có quyền thay đổi cấu hình AI. Chỉ Admin mới được phép.');
        if (!response.ok) throw new Error(data.error || data.message || 'Không thể cập nhật cấu hình AI');
        return data;
    },

    // Update a material's requiredPlan (used by admin permission page)
    updateMaterialPlan: async (id: string | number, requiredPlan: string | null): Promise<{ message: string }> => {
        const response = await fetch(`${API_URL}/models/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ requiredPlan }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update material plan');
        return data;
    },

    // Forgot Password API
    forgotPassword: async (email: string): Promise<{ message: string; reset_code: string; user_name: string }> => {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to send reset code');
        return data;
    },

    // Reset Password API
    resetPassword: async (email: string, token: string, newPassword: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token, newPassword }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to reset password');
        return data;
    },


    // Fetch a single user's latest data from server (to sync localStorage after kick)
    getUserById: async (userId: string): Promise<any> => {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            headers: { ...getAuthHeaders() },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch user');
        return data;
    },

    // School Portal APIs
    joinSchool: async (schoolCode: string, requestedRole: 'teacher' | 'student', requestedClass: string, userId: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_URL}/school/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolCode, requestedRole, requestedClass, userId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to join school');
        return data;
    },

    getSchoolSummary: async (schoolId: string): Promise<any> => {
        const cacheKey = `school_summary_${schoolId}`;
        const cached = getCachedData<any>(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${API_URL}/school/summary?schoolId=${schoolId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch school summary');
        setCachedData(cacheKey, data);
        return data;
    },

    getMembershipRequests: async (schoolId: string): Promise<any[]> => {
        const cacheKey = `school_requests_${schoolId}`;
        const cached = getCachedData<any[]>(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${API_URL}/school/requests?schoolId=${schoolId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch membership requests');
        setCachedData(cacheKey, data);
        return data;
    },

    getSchoolMembers: async (schoolId: string): Promise<any[]> => {
        const cacheKey = `school_members_${schoolId}`;
        const cached = getCachedData<any[]>(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${API_URL}/school/members?schoolId=${schoolId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch school members');
        setCachedData(cacheKey, data);
        return data;
    },

    kickSchoolMembers: async (memberIds: string[], schoolId: string): Promise<{ message: string }> => {
        clearApiCache('school');
        clearApiCache('users');
        const response = await fetch(`${API_URL}/school/members/kick`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberIds, schoolId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to kick members');
        return data;
    },

    leaveSchool: async (userId: string): Promise<{ message: string; user: any }> => {
        clearApiCache('school');
        clearApiCache('users');
        const response = await fetch(`${API_URL}/school/members/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to leave school');
        return data;
    },

    approveRequests: async (requestIds: string[], schoolId: string): Promise<{ message: string }> => {
        clearApiCache('school');
        clearApiCache('users');
        const response = await fetch(`${API_URL}/school/requests/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestIds, schoolId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to approve requests');
        return data;
    },

    rejectRequests: async (requestIds: string[]): Promise<{ message: string }> => {
        clearApiCache('school');
        const response = await fetch(`${API_URL}/school/requests/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestIds }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to reject requests');
        return data;
    },

    updateSchoolConfig: async (schoolId: string, configData: { isInviteCodeEnabled?: boolean; schoolCode?: string; name?: string; schoolYear?: string; tiet?: string }): Promise<{ message: string; school: any }> => {
        clearApiCache('school');
        const response = await fetch(`${API_URL}/school/config`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolId, ...configData }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update school configuration');
        return data;
    },

    getSchools: async (): Promise<any[]> => {
        const cacheKey = 'schools_all';
        const cached = getCachedData<any[]>(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${API_URL}/schools`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch schools');
        setCachedData(cacheKey, data);
        return data;
    },

    createSchool: async (schoolData: { name: string; schoolCode: string; teacherQuota: number; studentQuota: number; schoolYear: string; tiet: string }): Promise<any> => {
        clearApiCache('school');
        const response = await fetch(`${API_URL}/schools`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(schoolData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create school');
        return data;
    },

    updateSchool: async (id: string, schoolData: Partial<{ name: string; schoolCode: string; teacherQuota: number; studentQuota: number; schoolYear: string; tiet: string }>): Promise<any> => {
        clearApiCache('school');
        const response = await fetch(`${API_URL}/schools/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(schoolData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update school');
        return data;
    },

    deleteSchool: async (id: string): Promise<any> => {
        clearApiCache('school');
        clearApiCache('users');
        const response = await fetch(`${API_URL}/schools/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete school');
        return data;
    },

    // Payment APIs
    createPayment: async (userId: string, planId: string, amount: number): Promise<any> => {
        clearApiCache('payments');
        const response = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, planId, amount }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create payment intent');
        return data;
    },

    getPayments: async (): Promise<any[]> => {
        const cacheKey = 'payments_all';
        const cached = getCachedData<any[]>(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${API_URL}/payments`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch payments');
        setCachedData(cacheKey, data);
        return data;
    },

    getUserPayments: async (userId: string): Promise<any[]> => {
        const cacheKey = `payments_user_${userId}`;
        const cached = getCachedData<any[]>(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${API_URL}/payments/user/${userId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch user payments');
        setCachedData(cacheKey, data);
        return data;
    },

    approvePayment: async (id: string): Promise<{ message: string }> => {
        clearApiCache('payments');
        clearApiCache('users');
        const response = await fetch(`${API_URL}/payments/${id}/approve`, {
            method: 'POST',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to approve payment');
        return data;
    },

    rejectPayment: async (id: string): Promise<{ message: string }> => {
        clearApiCache('payments');
        const response = await fetch(`${API_URL}/payments/${id}/reject`, {
            method: 'POST',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to reject payment');
        return data;
    },

    // Quick status check by paymentCode (for realtime auto-polling)
    checkPaymentByCode: async (paymentCode: string): Promise<{
        id: string;
        status: 'pending' | 'approved' | 'rejected';
        planId: string;
        amount: number;
        paymentCode: string;
    }> => {
        const response = await fetch(`${API_URL}/payments/check/${encodeURIComponent(paymentCode)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to check payment status');
        return data;
    },

    // Simulate payment approval (dev/test only)
    simulatePaymentApproval: async (paymentId: string): Promise<{ message: string }> => {
        clearApiCache('payments');
        clearApiCache('users');
        const response = await fetch(`${API_URL}/payments/${paymentId}/approve`, {
            method: 'POST',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to simulate approval');
        return data;
    },

    // Lesson APIs
    getLessons: async (filters?: { subject?: string; grade?: number }): Promise<any[]> => {
        const cacheKey = `lessons_${filters?.subject || 'all'}_${filters?.grade || 'all'}`;
        const cached = getCachedData<any[]>(cacheKey);
        if (cached) return cached;

        let url = `${API_URL}/lessons`;
        const params = new URLSearchParams();
        if (filters?.subject) params.append('subject', filters.subject);
        if (filters?.grade) params.append('grade', String(filters.grade));
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch lessons');
        setCachedData(cacheKey, data);
        return data;
    },
    createLesson: async (lessonData: any): Promise<any> => {
        clearApiCache('lessons');
        const response = await fetch(`${API_URL}/lessons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create lesson');
        return data;
    },
    updateLesson: async (id: string, lessonData: any): Promise<any> => {
        clearApiCache('lessons');
        const response = await fetch(`${API_URL}/lessons/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update lesson');
        return data;
    },
    deleteLesson: async (id: string): Promise<any> => {
        clearApiCache('lessons');
        const response = await fetch(`${API_URL}/lessons/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete lesson');
        return data;
    }
};

