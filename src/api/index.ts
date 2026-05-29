import { User, LoginResponse, ModelInput } from '../data/materialsData';

// Vercel/Vite sẽ tìm biến VITE_API_URL trong cấu hình Environment Variables
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3099';
const API_URL = `${BASE_URL}/api`;
console.log('DEBUG: API_URL is', API_URL);

export const api = {
    // User APIs
    getUsers: async (): Promise<User[]> => {
        const response = await fetch(`${API_URL}/users`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
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

    // Model APIs
    getModels: async (): Promise<any[]> => {
        const response = await fetch(`${API_URL}/models`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch models');
        return data;
    },

    getModel: async (id: string | number): Promise<any> => {
        const response = await fetch(`${API_URL}/models/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch model');
        return data;
    },

    saveModel: async (modelData: ModelInput): Promise<{ id: number; message: string }> => {
        const response = await fetch(`${API_URL}/models`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modelData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to save model');
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'AI search failed');
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
        const response = await fetch(`${API_URL}/school/summary?schoolId=${schoolId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch school summary');
        return data;
    },

    getMembershipRequests: async (schoolId: string): Promise<any[]> => {
        const response = await fetch(`${API_URL}/school/requests?schoolId=${schoolId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch membership requests');
        return data;
    },

    approveRequests: async (requestIds: string[], schoolId: string): Promise<{ message: string }> => {
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
        const response = await fetch(`${API_URL}/schools`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch schools');
        return data;
    },

    createSchool: async (schoolData: { name: string; schoolCode: string; teacherQuota: number; studentQuota: number; schoolYear: string; tiet: string }): Promise<any> => {
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
        const response = await fetch(`${API_URL}/schools/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete school');
        return data;
    }
};

