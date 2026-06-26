# Nhật ký thay đổi theo ngày (Changelog by Date) - EduTech Web App

Tài liệu này tổng hợp toàn bộ lịch sử cập nhật của dự án EduTech được chia theo từng ngày làm việc thực tế và chi tiết các công việc đã triển khai.

## Ngày 26/06/2026 - Tối ưu hóa Responsive Landing Page & Đồng bộ hệ thống tag
- **Tối ưu Landing Page:** Thay thế font-size cứng (`clamp` px) sang đơn vị `rem` và các class Tailwind responsive, kích hoạt fluid scaling tự động thu nhỏ ~29% ở độ phân giải 1366x768.
- **Chuẩn hóa Git Tags:** Đổi tên toàn bộ 15 tags lịch sử từ định dạng ngày tháng sang định dạng phiên bản SemVer (`v0.1.0` -> `v0.15.0`) và đồng bộ hóa lên GitHub.

---

## Ngày 25/06/2026 - Tối ưu hóa giao diện di động & Hệ thống co giãn chữ linh hoạt
- **Fluid Scaling toàn hệ thống:** Áp dụng công nghệ CSS fluid scaling giúp co giãn tự động cho text và layouts trên mọi thiết bị. ([43712bc](https://github.com/bachPN73/MVP/commit/43712bc))
- **Redesign Dashboard di động:** Thiết kế lại toàn bộ Bảng điều khiển tối ưu hiển thị trên màn hình nhỏ. ([43712bc](https://github.com/bachPN73/MVP/commit/43712bc))
- **Sửa lỗi đè layout & nhấp nháy Sidebar:** Khắc phục lỗi chồng chéo layout màn hình nhỏ và sửa hiện tượng nháy Sidebar khi chuyển route. ([ea34942](https://github.com/bachPN73/MVP/commit/ea34942))
- **Mở rộng giao diện:** Thay nền trong suốt cho Dashboard, mở rộng container các trang Dashboard, Guide, và JoinSchool. ([66e70f4](https://github.com/bachPN73/MVP/commit/66e70f4))
- **Dọn dẹp scrollbars:** Loại bỏ thanh cuộn không cần thiết và tối ưu bộ lọc thư viện. ([66e70f4](https://github.com/bachPN73/MVP/commit/66e70f4))

---

## Ngày 24/06/2026 - Tối ưu mã nguồn & Khắc phục lỗ hổng bảo mật
- **Dọn dẹp tài nguyên tĩnh:** Xóa các model demo không còn sử dụng (H2O, Solar System) và code thừa. ([99a91d2](https://github.com/bachPN73/MVP/commit/99a91d2), [028d7ac](https://github.com/bachPN73/MVP/commit/028d7ac))
- **Sửa lỗi Sidebar & chuyển đổi trang:** Tối ưu hóa giao diện và khắc phục lỗi chuyển đổi route. ([907d0a5](https://github.com/bachPN73/MVP/commit/907d0a5), [689722c](https://github.com/bachPN73/MVP/commit/689722c))
- **Vá lỗi bảo mật hệ thống:** Sửa lỗi phân quyền truy cập (Broken Access Control) và xác thực session, tinh chỉnh logic URL trong PresentationMode. ([411a969](https://github.com/bachPN73/MVP/commit/411a969))

---

## Ngày 23/06/2026 - Nâng cấp Landing Page, Tích hợp Quiz & Tối ưu hóa mô hình 3D
- **Tối ưu Landing Page:** Áp dụng CSS clamp/vh giúp co giãn các thành phần khi chiều cao màn hình thấp. ([e05064a](https://github.com/bachPN73/MVP/commit/e05064a))
- **Responsive Landing Page Hero:** Căn chỉnh logo, tinh chỉnh padding và cỡ chữ Hero section trên mobile. ([e703a82](https://github.com/bachPN73/MVP/commit/e703a82), [6b5faf9](https://github.com/bachPN73/MVP/commit/6b5faf9), [74627d5](https://github.com/bachPN73/MVP/commit/74627d5))
- **Luồng thanh toán an toàn:** Link bảng giá công khai chuyển hướng về `/login` thay vì đi thẳng tới thanh toán. ([cf6678f](https://github.com/bachPN73/MVP/commit/cf6678f), [c039822](https://github.com/bachPN73/MVP/commit/c039822))
- **Rút gọn trang Hướng dẫn:** Chỉ tập trung vào việc hướng dẫn Đăng ký và Đăng nhập. ([6c8815c](https://github.com/bachPN73/MVP/commit/6c8815c))
- **Nâng cấp hiệu năng tải trang:** Thay thế mô hình 3D trên Landing Page bằng video nhẹ hơn. ([32611a4](https://github.com/bachPN73/MVP/commit/32611a4))
- **Lazy Loading 3D:** Tích hợp Lazy Loading và Intersection Observer giúp tối ưu hóa thời gian tải của các mô hình 3D. ([9273187](https://github.com/bachPN73/MVP/commit/9273187))
- **Cấu hình hệ thống:** Bổ sung cấu hình Agent, tài nguyên ảnh tĩnh. Thay liên hệ Zalo sang Facebook ở trang Thanh toán. ([86da87a](https://github.com/bachPN73/MVP/commit/86da87a), [e8ffcc7](https://github.com/bachPN73/MVP/commit/e8ffcc7))
- **Thiết lập giao diện mặc định:** Đặt giao diện sáng làm mặc định và sửa lỗi import AppSidebar, làm nổi bật khung đổi theme. ([e8a30e0](https://github.com/bachPN73/MVP/commit/e8a30e0), [d05707d](https://github.com/bachPN73/MVP/commit/d05707d))
- **Nâng cấp DNA 3D:** Cập nhật hiển thị DNA 3D, tối ưu hóa giao diện tương tác và tốc độ tải. ([d4352ad](https://github.com/bachPN73/MVP/commit/d4352ad))
- **Tích hợp Quiz Panel:** Thiết kế lại QuizPanel với phong cách Glassmorphism nổi, cấu hình tính năng quản lý Quiz cho tài liệu. ([30b621d](https://github.com/bachPN73/MVP/commit/30b621d), [7c591d1](https://github.com/bachPN73/MVP/commit/7c591d1), [f749c0c](https://github.com/bachPN73/MVP/commit/f749c0c))

---

## Ngày 22/06/2026 - Tái cấu trúc Dashboard UI
- **Redesign Dashboard:** Thiết kế lại giao diện Dashboard (Hero banner mới, thẻ môn học, lối tắt thao tác nhanh, carousel tài liệu). ([7a8db90](https://github.com/bachPN73/MVP/commit/7a8db90))
- **Sửa text hướng dẫn 3D:** Cập nhật thông báo tương tác 3D và xóa bỏ các overlay trùng lặp. ([b3383d8](https://github.com/bachPN73/MVP/commit/b3383d8))

---

## Ngày 19/06/2026 - Cải tiến tương tác mô hình 3D & Tìm kiếm AI
- **Cải thiện hướng dẫn di chuyển 3D:** Thêm chỉ dẫn chuột phải để di chuyển (pan góc nhìn). ([15a8c82](https://github.com/bachPN73/MVP/commit/15a8c82))
- **Tinh chỉnh thanh trạng thái:** Loại bỏ ID tài liệu và khôi phục text trợ giúp ở thanh trạng thái dưới cùng. ([f0d83e1](https://github.com/bachPN73/MVP/commit/f0d83e1), [c2e1587](https://github.com/bachPN73/MVP/commit/c2e1587), [f7dcaa8](https://github.com/bachPN73/MVP/commit/f7dcaa8))
- **Tối ưu hóa Tìm kiếm AI:** Đơn giản hóa UI tìm kiếm, tinh chỉnh prompt của mô hình Gemini tối ưu cho môn Sinh học. ([aaa4bbe](https://github.com/bachPN73/MVP/commit/aaa4bbe))

---

## Ngày 13/06/2026 - Cập nhật Favicon & Thương hiệu
- **Cập nhật logo:** Zoom to logo hệ thống và cập nhật favicon mới. ([a3de4ca](https://github.com/bachPN73/MVP/commit/a3de4ca))

---

## Ngày 12/06/2026 - Quản lý Gói dịch vụ, Email Khôi phục Mật khẩu & Quản trị Trường học
- **Đồng nhất gói dịch vụ:** Thống nhất các gói dịch vụ Basic, Pro, Combo, School; khôi phục gói Combo Pro + In 3D trên cả client và server. ([c99c59d](https://github.com/bachPN73/MVP/commit/c99c59d), [6e27429](https://github.com/bachPN73/MVP/commit/6e27429))
- **Mẫu email khôi phục mật khẩu:** Thiết kế lại template email khôi phục với giao diện premium, thêm nội dung plain text dự phòng. ([9c55da7](https://github.com/bachPN73/MVP/commit/9c55da7), [c4d3e1c](https://github.com/bachPN73/MVP/commit/c4d3e1c))
- **Đổi tên trang chủ:** Đổi tên Trang chủ thành **Tổng quan** và cập nhật cấu hình SEO/Favicon. ([16fe2d4](https://github.com/bachPN73/MVP/commit/16fe2d4))
- **Quản lý giới hạn Quota:** Cho phép Admin trường học tự chỉnh sửa quota của Giáo viên và Học sinh. ([ff03192](https://github.com/bachPN73/MVP/commit/ff03192))
- **Quota giáo viên:** Tăng giới hạn quota mặc định của giáo viên từ 5 lên 30 trong Dashboard. ([c5acf6f](https://github.com/bachPN73/MVP/commit/c5acf6f))
- **Tối ưu hóa Light Mode:** Chỉnh sửa Light Mode sang tông ấm kem/warm stone giúp giảm chói mắt và hài hòa hơn. ([0f9bd19](https://github.com/bachPN73/MVP/commit/0f9bd19))
- **Sửa các lỗi nhỏ:** Sửa lỗi quét QR code, luồng tham gia trường học (join flow). ([8407553](https://github.com/bachPN73/MVP/commit/8407553), [569e181](https://github.com/bachPN73/MVP/commit/569e181))

---

## Ngày 11/06/2026 - Quản lý Kho lưu trữ (Vault), Email SMTP & Tối ưu hóa chung
- **Nút Lưu kho tạm thời:** Di chuyển nút Lưu kho xuống thanh metadata bar phía dưới và đặt tên tiếng Việt. ([4978ac1](https://github.com/bachPN73/MVP/commit/4978ac1))
- **Dọn dẹp cơ sở dữ liệu:** Xóa dữ liệu seed thử nghiệm trường học mẫu trong server.js. ([7b19429](https://github.com/bachPN73/MVP/commit/7b19429))
- **Bổ sung thư viện icon:** Sửa lỗi thiếu các import biểu tượng Archive, Folder, Plus, Trash2, X trong MaterialDetail.tsx. ([3589a3b](https://github.com/bachPN73/MVP/commit/3589a3b), [baa1e31](https://github.com/bachPN73/MVP/commit/baa1e31))
- **Quyền truy cập Vault:** Cho phép tài khoản Admin bỏ qua khóa Premium để xem thử tài liệu trong Vault. ([6eea945](https://github.com/bachPN73/MVP/commit/6eea945))
- **Cập nhật nút CTA:** Đổi nút kêu gọi hành động (CTA) trên LandingPage thành "Đăng kí/ Bắt đầu". ([cc5ae13](https://github.com/bachPN73/MVP/commit/cc5ae13))
- **Tích hợp thanh toán & chủ đề:** Cập nhật trang JoinSchool, màu sắc giao diện và trang thanh toán. ([a7fa6d3](https://github.com/bachPN73/MVP/commit/a7fa6d3))
- **Cảnh báo Spam email:** Thêm thông tin cảnh báo gửi spam vào trang đổi mật khẩu và trang quên mật khẩu. ([5c31c2f](https://github.com/bachPN73/MVP/commit/5c31c2f), [6090bda](https://github.com/bachPN73/MVP/commit/6090bda))
- **Cấu hình Email SMTP & Resend:** Tích hợp dịch vụ Resend API để gửi thư khôi phục, đổi cổng SMTP sang 587 và ép kết nối IPv4 để hoạt động ổn định trên máy chủ Render. Cập nhật CORS và transport settings. ([7d31530](https://github.com/bachPN73/MVP/commit/7d31530), [33cb111](https://github.com/bachPN73/MVP/commit/33cb111), [bfe22ac](https://github.com/bachPN73/MVP/commit/bfe22ac), [92518d2](https://github.com/bachPN73/MVP/commit/92518d2), [1fbaf54](https://github.com/bachPN73/MVP/commit/1fbaf54))
- **Dọn dẹp tài nguyên ảnh:** Cập nhật logo mới, xóa ảnh và mô hình 3D thừa, thêm logo.png vào thư mục public. ([7697e83](https://github.com/bachPN73/MVP/commit/7697e83), [f8196e6](https://github.com/bachPN73/MVP/commit/f8196e6))
- **Tài liệu cấu hình:** Cập nhật tài liệu hướng dẫn Google OAuth & SMTP. ([1a6be14](https://github.com/bachPN73/MVP/commit/1a6be14))

---

## Ngày 09/06/2026 - Phát hành Phiên bản 2.0 & Tái cấu trúc
- **Phát hành Phiên bản 2.0:** Ghi nhận phiên bản v2.0 của web. ([969c27a](https://github.com/bachPN73/MVP/commit/969c27a))
- **Refactor code structure:** Tái cấu trúc lại thư mục dự án để dễ đọc, dễ bảo trì hơn. ([8fbb301](https://github.com/bachPN73/MVP/commit/8fbb301))

---

## Ngày 08/06/2026 - Tối ưu hóa UI/UX & Tương tác 3D
- **Tính năng giới thiệu:** Tối ưu hóa UI/UX, cải thiện hiệu năng 3D viewer, bỏ qua khóa premium cho admin và thêm trang giới thiệu intro. ([5945b8c](https://github.com/bachPN73/MVP/commit/5945b8c))

---

## Ngày 06/06/2026 - Nâng cấp Sidebar, Bảng giá & Tích hợp dịch vụ Email
- **Mobile Sidebar & So sánh gói:** Tối ưu hóa sidebar di động dạng kéo rút, lưới bảng giá responsive và bảng so sánh chi tiết dạng thu gọn. ([6f219a9](https://github.com/bachPN73/MVP/commit/6f219a9))
- **Cải thiện độ tương phản:** Sửa lỗi chữ bị mờ bằng cách thay thế mã màu không hợp lệ (`rose-650` sang `rose-700`) và tăng tương phản khi hiển thị sáng. ([806bd3d](https://github.com/bachPN73/MVP/commit/806bd3d))
- **Sidebar thích ứng Theme:** Thay đổi giao diện Sidebar tự động thích ứng với nền sáng/tối. ([0c70287](https://github.com/bachPN73/MVP/commit/0c70287))
- **Sửa tiêu đề & logo:** Tăng kích thước tối đa logo Dashboard lên 240px và sửa lỗi hiển thị tiêu đề "Không gian tương tác". ([3ea6e23](https://github.com/bachPN73/MVP/commit/3ea6e23), [d240682](https://github.com/bachPN73/MVP/commit/d240682))
- **Banner chúc thi tốt:** Thay thế ảnh mặc định bằng logo EduTech trên Dashboard và thay đổi sidebar phải thành màu gradient đỏ-vàng may mắn đi kèm banner chúc thi tốt. ([1d3ea62](https://github.com/bachPN73/MVP/commit/1d3ea62))
- **Nền tảng Landing Page & AI:** Tối ưu hiển thị font tiếng Việt, thiết kế lại trang chủ và chân trang, đổi tên Find with AI thành AI tìm kiếm, cấu hình ban đầu cho Google Login & email. ([b4337f7](https://github.com/bachPN73/MVP/commit/b4337f7))
- **Phân quyền tài liệu & Chống spam AI:** Chia tài liệu theo các gói đăng ký, giới hạn lượt tìm kiếm AI và chống spam, bổ sung chú giải (legend) trong thư viện. ([c06bc32](https://github.com/bachPN73/MVP/commit/c06bc32))

---

## Ngày 05/06/2026 - Tích hợp Google Analytics & Hệ thống thanh toán SePay
- **Google Analytics (GA4):** Tích hợp Google Analytics mã G-VCXY5EZNZH giúp theo dõi hành vi và lượng truy cập trang thực tế. ([6bc4910](https://github.com/bachPN73/MVP/commit/6bc4910), [85d1594](https://github.com/bachPN73/MVP/commit/85d1594))
- **Kho lưu trữ Pro 24h:** Khóa chức năng tải tài nguyên, triển khai tính năng lưu trữ Pro thời hạn 24h. ([2083942](https://github.com/bachPN73/MVP/commit/2083942))
- **Phân quyền Admin:** Tách biệt vai trò Admin trường học thành `school-admin` và giới hạn quyền truy cập trang quản trị cho Admin hệ thống. ([c130267](https://github.com/bachPN73/MVP/commit/c130267), [003a58f](https://github.com/bachPN73/MVP/commit/003a58f))
- **Liên kết trực tiếp:** Sửa lỗi giao diện liên kết tài khoản trường học cho quản trị viên trường học. ([cf7b3c8](https://github.com/bachPN73/MVP/commit/cf7b3c8))
- **Nút đóng Thanh toán & Gói Free:** Tạo nút đóng trang khi thanh toán thành công, giới hạn tính năng cho các tài khoản dùng thử miễn phí. ([8a57f7e](https://github.com/bachPN73/MVP/commit/8a57f7e))
- **Hiển thị nhãn gói cước:** Hiển thị nhãn loại tài khoản (Plan Badge), hỗ trợ 7 ngày dùng thử miễn phí và ẩn các gói cước thấp hơn khi đã mua gói cao hơn. ([8b7ec8b](https://github.com/bachPN73/MVP/commit/8b7ec8b))
- **Tích hợp SePay & Cổng VietQR:** Đồng bộ hóa cổng thanh toán tự động SePay, hiển thị mã VietQR chính xác và chặn thanh toán trùng lặp. ([4145398](https://github.com/bachPN73/MVP/commit/4145398), [e0322d4](https://github.com/bachPN73/MVP/commit/e0322d4))
- **Sao lưu dữ liệu local:** Tạo bộ lưu trữ dự phòng tại local khi file tải lên vượt quá 48MB hoặc kết nối cơ sở dữ liệu Supabase bị lỗi. ([f10ebe4](https://github.com/bachPN73/MVP/commit/f10ebe4))
- **Sửa môi trường 3D:** Thay đổi bộ preset môi trường mặc định từ neutral sang city để hiển thị chân thực hơn. ([aa9f9c5](https://github.com/bachPN73/MVP/commit/aa9f9c5))
- **Hỗ trợ toán học LaTeX & Upload 100MB:** Hỗ trợ render công thức Toán dạng LaTeX, nâng giới hạn upload lên 100MB và tối ưu hiển thị mô hình 3D. ([9dfe6ed](https://github.com/bachPN73/MVP/commit/9dfe6ed))
- **Layout Infographic linh hoạt:** Cập nhật layout infographic co giãn tự động theo màn hình ngang/dọc và thay đổi màu nền 3D theo theme sáng/tối. ([43bb372](https://github.com/bachPN73/MVP/commit/43bb372))
- **Cập nhật giá cả:** Thay đổi các gói giá và chi tiết giá trên trang thanh toán. ([d084932](https://github.com/bachPN73/MVP/commit/d084932))
- **Trang Admin bài học:** Cập nhật trang quản lý bài học và trang quản lý thanh toán phía Admin. ([304bd53](https://github.com/bachPN73/MVP/commit/304bd53))

---

## Ngày 29/05/2026 - Tích hợp Font chữ hệ thống & Di chuyển Kiến trúc
- **Plus Jakarta Sans:** Đồng bộ toàn bộ trang web sử dụng chung 1 font chữ Plus Jakarta Sans. ([72820ef](https://github.com/bachPN73/MVP/commit/72820ef))
- **Sửa đè Sidebar:** Sửa lỗi khoảng cách hiển thị đè của thanh Sidebar. ([65c5d2a](https://github.com/bachPN73/MVP/commit/65c5d2a))
- **Di chuyển kiến trúc MVP:** Chuẩn bị repository, dọn dẹp API và chuyển đổi hệ thống sang cấu trúc mã nguồn tái cấu trúc hiện đại (Hỗ trợ cổng trường học, chuyển đổi theme sáng/tối và tích hợp DB). Kích hoạt Vercel build. ([47eaa19](https://github.com/bachPN73/MVP/commit/47eaa19), [8f96578](https://github.com/bachPN73/MVP/commit/8f96578), [15203f7](https://github.com/bachPN73/MVP/commit/15203f7), [baef9a0](https://github.com/bachPN73/MVP/commit/baef9a0))

---

## Ngày 14/03/2026 - Cập nhật lớn mã nguồn & Sửa lỗi hiển thị
- **Đại cập nhật mã nguồn:** Đẩy mã nguồn cập nhật hệ thống, sửa lỗi hiển thị hình ảnh, sửa lỗi không xem được và điều chỉnh lỗi timeout. ([6491b75](https://github.com/bachPN73/MVP/commit/6491b75), [db91b9a](https://github.com/bachPN73/MVP/commit/db91b9a), [0f3c525](https://github.com/bachPN73/MVP/commit/0f3c525), [1dbdb8c](https://github.com/bachPN73/MVP/commit/1dbdb8c), [dec2e82](https://github.com/bachPN73/MVP/commit/dec2e82), [fbb9f49](https://github.com/bachPN73/MVP/commit/fbb9f49))
- **Sửa lỗi hiển thị chi tiết:** Khắc phục lỗi hiển thị metadata phần dưới, lỗi 2 commit gần nhất, sửa hiển thị Infographic. ([018a0f7](https://github.com/bachPN73/MVP/commit/018a0f7), [8800218](https://github.com/bachPN73/MVP/commit/8800218), [c377fa9](https://github.com/bachPN73/MVP/commit/c377fa9))
- **Hỗ trợ tệp FBX:** Thêm hỗ trợ tải lên và hiển thị mô hình 3D định dạng tệp .fbx. ([8c71f3d](https://github.com/bachPN73/MVP/commit/8c71f3d))
- **Điều hướng bảng giá & Auth:** Cập nhật điều hướng bảng giá, thêm cửa sổ Auth Modal đăng nhập nhanh và dọn dẹp Dashboard. ([06516b5](https://github.com/bachPN73/MVP/commit/06516b5))

---

## Ngày 13/03/2026 - Khởi tạo dự án
- **Cập nhật tiêu đề:** Cập nhật tiêu đề trang web, định nghĩa luồng trải nghiệm người dùng. ([cd6364b](https://github.com/bachPN73/MVP/commit/cd6364b), [c0a9011](https://github.com/bachPN73/MVP/commit/c0a9011))
- **Khắc phục đường dẫn ảnh:** Chuyển ảnh nền hero bị lỗi sang thư mục public. ([1a19f10](https://github.com/bachPN73/MVP/commit/1a19f10))
- **Landing Page Media:** Thay thế video bằng ảnh tĩnh trên Landing Page. ([8ecace9](https://github.com/bachPN73/MVP/commit/8ecace9))
- **Cấu hình triển khai Render:** Bind server backend chạy cổng 0.0.0.0, thêm thư viện `pg` và khôi phục hàm upload ảnh thumbnail bị thiếu. ([5d154d4](https://github.com/bachPN73/MVP/commit/5d154d4), [eedf3aa](https://github.com/bachPN73/MVP/commit/eedf3aa), [0a3a6a0](https://github.com/bachPN73/MVP/commit/0a3a6a0))
- **Initial commit:** Thực hiện đẩy mã nguồn cơ bản đầu tiên lên Git (Tích hợp tính năng Infographic và cơ sở dữ liệu PostgreSQL). ([5ce03ac](https://github.com/bachPN73/MVP/commit/5ce03ac))
