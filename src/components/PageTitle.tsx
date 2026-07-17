import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { trackPageView } from '../utils/analytics';

const routeTitles: Record<string, string> = {
    '/': 'Trang chủ - Edu Tech',
    '/login': 'Đăng nhập - Edu Tech',
    '/register': 'Đăng ký - Edu Tech',
    '/forgot-password': 'Quên mật khẩu - Edu Tech',
    '/reset-password': 'Đặt lại mật khẩu - Edu Tech',
    '/guide': 'Hướng dẫn - Edu Tech',
    '/intro-deck': 'Giới thiệu - Edu Tech',
    '/pricing': 'Bảng giá - Edu Tech',
    '/dashboard': 'Bảng điều khiển - Edu Tech',
    '/library': 'Thư viện - Edu Tech',
    '/find-ai': 'Tìm kiếm AI - Edu Tech',
    '/guide-app': 'Hướng dẫn - Edu Tech',
    '/profile': 'Hồ sơ - Edu Tech',
    '/pricing-app': 'Bảng giá - Edu Tech',
    '/admin/dashboard': 'Admin Dashboard - Edu Tech',
    '/admin/materials': 'Quản lý học liệu - Edu Tech',
    '/admin/lessons': 'Quản lý bài học - Edu Tech',
    '/admin/users': 'Quản lý người dùng - Edu Tech',
    '/admin/schools': 'Quản lý trường học - Edu Tech',
    '/admin/payments': 'Quản lý thanh toán - Edu Tech',
    '/admin/ai-config': 'Cấu hình AI - Edu Tech',
    '/school/dashboard': 'Trường học - Edu Tech',
    '/join-school': 'Tham gia trường học - Edu Tech',
    '/vault': 'Kho lưu trữ - Edu Tech',
};

export default function PageTitle() {
    const location = useLocation();
    
    useEffect(() => {
        let newTitle = 'Edu Tech - Học liệu 3D trực quan';
        // Handle dynamic routes like /material/:id
        if (location.pathname.startsWith('/material/')) {
            newTitle = 'Chi tiết học liệu - Edu Tech';
        } else if (location.pathname.startsWith('/presentation/')) {
            newTitle = 'Trình chiếu - Edu Tech';
        } else if (location.pathname.startsWith('/payment/')) {
            newTitle = 'Thanh toán - Edu Tech';
        } else {
            newTitle = routeTitles[location.pathname] || 'Edu Tech - Học liệu 3D trực quan';
        }
        
        document.title = newTitle;
        
        // Track page view AFTER title has been updated
        trackPageView(location.pathname + location.search, newTitle);
    }, [location]);
    
    return null;
}
