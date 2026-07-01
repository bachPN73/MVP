export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'student' | 'teacher';
    plan: 'free' | 'premium' | 'school';
}

export interface LoginResponse {
    message: string;
    user: User;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
}

export interface Material {
    id: string;
    title: string;
    subject: 'physics' | 'chemistry' | 'biology';
    type: '3d-model' | 'infographic';
    description: string;
    thumbnail: string;
    tags: string[];
    grade: number;
    file_url?: string;
    createdAt?: string; // ISO String timestamp for relative time
    // New fields from LearningCell for detailed info panel
    subtitle?: string;
    category?: string;
    size?: string;
    location?: string;
    visibleInLM?: string;
    features?: { name: string; detail: string }[];
    funFact?: string;
    whereItOccurs?: {
        text: string;
        habitat: string;
    };
    relatedMaterials?: string[];
    quiz?: QuizQuestion[];
    requiredPlan?: string | null;
    source?: string;
}

export interface ModelInput {
    title: string;
    description: string;
    subject: string;
    grade: number;
    tags: string[] | string;
    file_url: string;
    thumbnail: string | null;
    relatedMaterials?: string[];
    source?: string;
    quiz?: QuizQuestion[];
}

export const materials: Material[] = [];

export const getSubjectName = (subject: Material['subject']): string => {
    const names: Record<Material['subject'], string> = {
        physics: 'Vật lý',
        chemistry: 'Hóa học',
        biology: 'Sinh học',
    };
    return names[subject];
};

export const getTypeName = (type: Material['type']): string => {
    const names: Record<Material['type'], string> = {
        '3d-model': 'Mô hình 3D',
        'infographic': 'Infographic',
    };
    return names[type];
};

export const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return 'vừa xong';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'vừa xong';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} phút trước`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} giờ trước`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} ngày trước`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} tháng trước`;
        }

        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} năm trước`;
    } catch (e) {
        return 'vừa xong';
    }
};
