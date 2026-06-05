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
        name: "Miễn phí (Free)",
        price: "0",
        period: "VND / 7 ngày",
        description: "Giáo viên/ học sinh mới trải nghiệm",
        features: [
            "Truy cập một phần infographic mẫu",
            "Xem mô hình 3D demo",
            "Sử dụng AI Lesson Builder giới hạn",
            "Tải tối đa 2 tài nguyên/tháng",
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
        id: "demo",
        name: "Thử nghiệm (Demo)",
        price: "10.000",
        period: "VND / ngày",
        description: "Gói dùng để thanh toán demo trải nghiệm SePay",
        features: [
            "Đầy đủ tính năng trải nghiệm",
            "Xem toàn bộ mô hình 3D",
            "Mở khóa toàn bộ infographic",
            "Trải nghiệm thanh toán 10k tự động",
        ],
        icon: Zap,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        border: "border-rose-200/60",
        gradient: "from-rose-500 to-pink-500",
        buttonVariant: "primary",
        featureFlags: ["all_models", "ai_advanced", "unlimited_downloads"],
    },
    {
        id: "basic",
        name: "Cơ bản (Basic)",
        price: "59.000",
        period: "VND / tháng",
        description: "Giáo viên cá nhân/học sinh",
        features: [
            "Toàn bộ infographic của 1 môn",
            "Mô hình 3D cơ bản",
            "Cập nhật nội dung thường xuyên",
            "Hỗ trợ qua email",
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
        name: "Combo Pro + In 3D",
        price: "189.000",
        period: "VND / tháng",
        description: "Bao gồm in 1 mô hình 3D (<= 150 g)",
        features: [
            "Toàn bộ quyền lợi gói Pro",
            "Kho mô hình 3D nâng cao",
            "Bộ infographic chuyên đề nâng cao",
            "Mô phỏng thí nghiệm",
            "Hỗ trợ ưu tiên",
            "In một mô hình 3D thực tế",
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
        name: "Chuyên nghiệp (Pro)",
        price: "99.000",
        period: "VND / tháng",
        description: "Giáo viên sử dụng thường xuyên",
        features: [
            "Toàn bộ quyền lợi gói Basic",
            "Infographic toàn bộ môn khoa học tự nhiên",
            "Mô hình 3D đầy đủ",
            "Tải tài nguyên không giới hạn",
            "Hỗ trợ qua email",
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
        name: "Trường học (School)",
        price: "1.500.000",
        period: "VND / tháng",
        description: "Trường THPT & Tổ bộ môn",
        features: [
            "30 tài khoản giáo viên",
            "Toàn bộ infographic",
            "Toàn bộ mô hình 3D",
            "AI hỗ trợ xây dựng bài giảng",
            "Báo cáo sử dụng",
            "Quản lý tài khoản tập trung",
            "Hỗ trợ triển khai",
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
