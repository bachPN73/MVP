import { Check, Zap, Crown, CheckCircle2, Globe2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Plan {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    icon: LucideIcon;
    color: string;
    bg: string;
    border: string;
    gradient: string;
    buttonVariant: "primary" | "secondary" | "outline" | "ghost";
    featured?: boolean;
    featureFlags: string[];
}

export const plans: Plan[] = [
    {
        id: "free",
        name: "Miễn phí",
        price: "0",
        period: "VND",
        description: "Hạn chế truy cập vào nội dung mẫu",
        features: [
            "Tải xuống các mô hình mẫu được chọn (có giới hạn)",
            "Xem các đồ họa thông tin (infographic) & mô hình 3D bản demo",
            "Trải nghiệm Trình tạo bài giảng bằng AI",
        ],
        icon: CheckCircle2,
        color: "text-slate-500",
        bg: "bg-slate-500/10",
        border: "border-slate-200/60",
        gradient: "from-slate-400 to-slate-500",
        buttonVariant: "outline",
        featureFlags: ["demo_models", "demo_infographics", "ai_basic"],
    },
    {
        id: "basic",
        name: "Cơ bản",
        price: "249.000",
        period: "VND / 3 tháng",
        description: "Truy cập toàn bộ đồ họa thông tin cho một môn học",
        features: [
            "Tải xuống các mô hình 3D cơ bản",
            "Tích hợp các mô hình 3D đa chủ đề",
            "Sử dụng nội dung trong lớp học",
            "Cập nhật nội dung miễn phí trong thời gian đăng ký",
            "Thư viện bài tập & bài kiểm tra",
            "Hỗ trợ kỹ thuật qua email",
        ],
        icon: Zap,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-200/60",
        gradient: "from-blue-500 to-cyan-500",
        buttonVariant: "primary",
        featureFlags: ["basic_models", "multi_subject_3d", "classroom_use", "exercises", "email_support"],
    },
    {
        id: "combo",
        name: "Gói Combo",
        price: "400.000",
        period: "VND / 3 tháng",
        description: "Kết hợp học liệu số và mô hình thực tế",
        features: [
            "Truy cập đầy đủ tính năng gói Cơ bản",
            "Kèm in 01 mô hình 3D thực tế",
            "Giúp bài giảng trực quan và sinh động hơn",
        ],
        icon: Globe2,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        border: "border-orange-200/60",
        gradient: "from-orange-500 to-amber-500",
        buttonVariant: "primary",
        featureFlags: ["basic_models", "multi_subject_3d", "classroom_use", "exercises", "email_support", "physical_3d_print"],
    },
    {
        id: "pro",
        name: "Chuyên nghiệp",
        price: "499.000",
        period: "VND / 3 tháng",
        description: "Bao gồm tất cả quyền lợi gói Cơ bản",
        features: [
            "Truy cập toàn bộ thư viện Đồ họa thông tin & 3D cho 3 môn học",
            "Đề xuất AI nâng cao & gợi ý bài giảng",
            "Tải xuống tệp kỹ thuật số không giới hạn",
            "Ưu tiên hỗ trợ kỹ thuật",
        ],
        icon: Crown,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        border: "border-violet-300/60",
        gradient: "from-violet-500 to-purple-600",
        featured: true,
        buttonVariant: "primary",
        featureFlags: ["all_models", "ai_advanced", "unlimited_downloads", "priority_support"],
    },
    {
        id: "school",
        name: "Trường học",
        price: "9.000.000",
        period: "VND / 3 tháng",
        description: "Quyền quản lý cho nhiều giáo viên (25–30 giáo viên)",
        features: [
            "Tạo bài giảng bằng AI",
            "Thư viện đồ họa thông tin cho 3 môn học",
            "Truy cập toàn bộ tất cả các mô hình 3D",
            "Quản lý tài khoản nhóm & quyền truy cập",
            "Báo cáo sử dụng",
            "Phân tích hiệu suất theo lớp/giáo viên",
        ],
        icon: Check,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-200/60",
        gradient: "from-emerald-500 to-teal-500",
        buttonVariant: "secondary",
        featureFlags: ["all_models", "ai_advanced", "unlimited_downloads", "group_management", "analytics", "priority_support"],
    },
];

export function getPlanById(id: string): Plan | undefined {
    return plans.find(p => p.id === id);
}

export function hasPlanFeature(planId: string, flag: string): boolean {
    const plan = getPlanById(planId);
    return plan?.featureFlags.includes(flag) ?? false;
}
