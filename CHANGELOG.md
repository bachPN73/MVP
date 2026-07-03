# Nhật ký Thay đổi (Changelog)

Tất cả các thay đổi đáng chú ý của dự án **EduTech** sẽ được ghi lại trong tệp này.

Định dạng dựa trên tiêu chuẩn [Keep a Changelog](https://keepachangelog.com/vi/1.0.0/)
và dự án này tuân thủ [Semantic Versioning](https://semver.org/lang/vi/).

> **Quy tắc phân loại nhãn:**
> - `Added` — Tính năng mới hoàn toàn.
> - `Changed` — Thay đổi đối với tính năng đã có sẵn.
> - `Deprecated` — Tính năng sắp bị xóa trong tương lai.
> - `Removed` — Tính năng đã bị xóa hoàn toàn.
> - `Fixed` — Sửa lỗi.
> - `Security` — Vá lỗ hổng bảo mật.

## [v2.6.0] - 2026-07-03 (d159f8d...1c7bfce)

> **Mục tiêu:** Tích hợp công cụ nén mô hình Draco, tối ưu hóa giải phóng bộ nhớ GPU (WebGL context disposal), bảo vệ route bằng WebGLErrorBoundary và hoàn thiện UI cho các thiết bị màn hình nhỏ.

### Added
- Tích hợp công cụ nén mô hình 3D `draco_compress.cjs` sử dụng thư viện `@gltf-transform` và bộ giải mã Draco, giúp giảm dung lượng mô hình 3D cực lớn (giảm đến 75% kích thước file `.glb`, ví dụ file Kỳ sau từ 223MB xuống còn 59MB).
- Bổ sung mô hình phân bào DNA Kỳ giữa và Kỳ sau đã qua xử lý nén Draco (`giam_phan_1_ky_giua_draco.glb`, `giam_phan_1_ky_sau_draco.glb`).
- Tích hợp `WebGLErrorBoundary` bao bọc trình xem 3D, ngăn chặn việc crash ứng dụng khi có lỗi WebGL hoặc mất ngữ cảnh GPU đột ngột (dd77e51, d159f8d).
- Xây dựng trang báo lỗi toàn cục `ErrorPage` thân thiện với người dùng khi hệ thống gặp sự cố không thể tự phục hồi ở cấp độ routing (dd77e51).

### Changed
- Điều chỉnh kích thước font chữ và thanh điều hướng (navbar) trên Landing Page để hiển thị hoàn hảo trên độ phân giải màn hình 1366x768 (36e9f66).
- Tinh chỉnh màu sắc, độ tương phản và font size của các trang Tìm kiếm AI và Tham gia Trường học nhằm tăng tính dễ đọc (1c7bfce).

### Performance
- Triển khai cơ chế hủy (dispose) WebGL renderer context cùng toàn bộ geometries/materials của GLTF khi component `ModelViewer` unmount, khắc phục triệt để tình trạng rò rỉ bộ nhớ GPU (GPU memory leak) khi người dùng chuyển trang nhiều lần (8c97cf7).

---

## [v2.5.2] - 2026-07-01 (922764d...80b3502)

> **Mục tiêu:** Tối ưu hóa hiệu năng, giảm thời gian tải trang (FCP/LCP) và xóa bỏ tình trạng nháy màn hình (flickering) khi điều hướng.

### Added
- Tích hợp **Native Code Splitting** (`lazy` prop của `createBrowserRouter` React Router v7), loại bỏ hoàn toàn `<Suspense>` bọc ngoài page để giữ giao diện mượt mà, không bị giật chớp trắng khi chuyển trang (922764d).
- Tích hợp **Cache API** của trình duyệt trong `fetchWithProgress` giúp lưu trữ vĩnh viễn mô hình 3D dung lượng lớn dưới Local, tải lại tức thì ở những lần sau (922764d).
- Áp dụng cơ chế **Preload Font** (`<link rel="preconnect" />`) trong `index.html` và gỡ bỏ `@import` render-blocking trong CSS (922764d).

### Changed
- Tái cấu trúc `ModelViewer.tsx`: Đưa `<Suspense>` vào sâu bên trong `<Canvas>` để bảo toàn WebGL Context, ngăn lỗi chớp đen khi mô hình đang tải (922764d).
- Sử dụng `useMemo` bọc `<Canvas>` nhằm cô lập quá trình Re-render của thanh Progress bar ra khỏi Engine 3D, duy trì FPS ổn định (922764d).
- Tích hợp sự kiện `onMouseEnter` để kích hoạt tải ngầm (pre-import) Chunk file 3D Viewer trước khi người dùng thực sự click vào học liệu (922764d).
- Kích hoạt `loading="lazy"` và `decoding="async"` cho toàn bộ ảnh trên hệ thống để tiết kiệm băng thông và RAM lúc khởi động (922764d).
- Tăng cỡ chữ nội dung chi tiết bài học lên 13px để cải thiện độ dễ đọc (80b3502).
- Tối ưu hóa bố cục trang chi tiết học liệu và loại bỏ các dữ liệu mẫu không cần thiết (46bb4da).

---

## [v2.5.1] - 2026-06-27 (6c065a4)

> **Mục tiêu:** Cải thiện trải nghiệm người dùng (UX) khi điều hướng quay lại trang Thư viện học liệu.

### Fixed
- Sửa lỗi tự động đưa người dùng về trang 1 của Thư viện sau khi xem chi tiết học liệu: Tích hợp `sessionStorage` giúp lưu giữ và tự động phục hồi trang hiện tại (`currentPage`) cùng các bộ lọc (`subject`, `type`, `grade`, `searchQuery`) (6c065a4).

---

## [v2.5.0] - 2026-06-27 (123d0a8)

> **Mục tiêu:** Bổ sung tính năng tương tác hỗ trợ học sinh điều chỉnh độ sáng trực quan của mô hình 3D.

### Added
- Tích hợp thanh điều chỉnh độ sáng (brightness slider) dạng cột dọc nhỏ đặt ở bên trái mô hình 3D, hỗ trợ học sinh tinh chỉnh ánh sáng mô hình từ 20% đến 200% với mốc trung bình 100% là độ sáng mặc định (123d0a8).

---

## [v2.4.0] - 2026-06-27 (66e70f4...2b18a68)

> **Mục tiêu:** Tối ưu hóa toàn diện khả năng hiển thị (Responsive) trên màn hình nhỏ (1366x768) và thiết bị di động.

### Added
- Tích hợp cơ chế **fluid scaling** toàn hệ thống: Font chữ và layout tự động co giãn linh hoạt theo kích thước màn hình thay vì bị vỡ hoặc tràn ra ngoài (43712bc).
- Tối ưu Landing Page riêng cho màn hình 1366x768: Tăng kích thước chữ tiêu đề hero và các hộp tính năng để đọc rõ ràng hơn (8ad7588, 4364946).

### Changed
- Thiết kế lại trang Dashboard trên **di động**: Chuyển sidebar thành menu drawer thu gọn, sắp xếp lại các nút thao tác nhanh thành dạng lưới 2 cột (43712bc).
- Thay nền Dashboard từ màu đặc sang **nền trong suốt** để hòa hợp với ảnh nền hệ thống (66e70f4).
- Mở rộng khung chứa nội dung của Dashboard, trang Hướng dẫn và trang Tham gia Trường học (66e70f4).
- Cải thiện góc xoay, ánh sáng mô hình 3D và tăng kích thước chữ hướng dẫn bên sidebar (ba1c4c5).
- Tối ưu bộ lọc Thư viện, ẩn thanh cuộn mặc định của trình duyệt để tối ưu thẩm mỹ (66e70f4).
- Tối ưu hóa bố cục các thẻ tính năng (feature cards), thiết kế bảng quiz và các hướng dẫn tương tác cho người dùng (2b18a68).

### Fixed
- Sửa lỗi các phần tử giao diện **chồng đè lên nhau** (layout overlap) khi màn hình nhỏ hơn 1400px (ea34942).
- Sửa lỗi Sidebar bị **nhấp nháy** (flash) trong quá trình chuyển đổi giữa các trang (route transition) (ea34942).

---

## [v2.3.2] - 2026-06-23 (6c8815c...99a91d2)

> **Mục tiêu:** Giảm tải tài nguyên CPU/GPU và tăng tốc độ tải trang ban đầu.

### Added
- Tích hợp `IntersectionObserver` vào `ModelViewer`: Canvas 3D tự động chuyển sang chế độ **"ngủ đông"** (`frameloop="demand"`) khi người dùng cuộn khỏi vùng nhìn thấy, giúp tiết kiệm tài nguyên đáng kể (9273187).
- Triển khai **Code Splitting** toàn diện: Toàn bộ các trang (Landing, Dashboard, Library, Admin...) được chuyển sang `React.lazy()` + `Suspense` để tải chậm (lazy load), giảm ~60% dung lượng bundle JavaScript tải về ban đầu (9273187).
- Bổ sung cấu hình **Agent AI** (GEMINI.md) và các tài nguyên ảnh tĩnh mới cho hệ thống (86da87a).
- Thay thế mô hình 3D bằng video trên LandingPage nhằm giảm tải tài nguyên CPU/GPU và tối ưu hiệu năng tải trang (32611a4).

### Changed
- Nút hỗ trợ kỹ thuật trên trang Thanh toán: Thay liên kết **Zalo cá nhân** bằng **Fanpage Facebook** chính thức (e8ffcc7).
- Khung Theme Switcher trong Sidebar: Thay đổi màu viền và nền sang tông **Indigo** nổi bật hơn trên cả giao diện Sáng và Tối (d05707d).
- Đặt chế độ **Giao diện Sáng (Light Mode)** làm mặc định cho tất cả người dùng truy cập lần đầu (thay vì tự động theo hệ điều hành) (e8a30e0).
- Rút gọn trang Hướng dẫn sử dụng, lược bỏ nội dung phụ để tập trung vào quy trình Đăng ký và Đăng nhập (6c8815c).
- Tinh chỉnh UI Hero section trên LandingPage: Căn lề lại logo, điều chỉnh padding và giảm kích thước tiêu đề EduTech cùng tagline cho cân đối hơn (6b5faf9, 74627d5).
- Tối ưu hóa thiết kế responsive cho màn hình di động tại Hero section của LandingPage (e703a82).
- Áp dụng cơ chế co giãn linh hoạt (fluid scaling) bằng `clamp()` và `vh` cho font chữ và các khối tính năng trên LandingPage khi hiển thị trên các màn hình có chiều cao thấp (e05064a).

### Fixed
- Sửa lỗi crash app do thiếu import `ThemeToggle` trong `AppSidebar.tsx` (e8a30e0).
- Sửa lỗi trang Bảng giá công khai luôn tự động điều hướng về `/login` thay vì cho phép đi tiếp vào trang thanh toán khi người dùng đã xác thực (cf6678f).
- Sửa link các nút chọn gói cước trên bảng giá điều hướng đúng đến trang đăng nhập nếu người dùng chưa đăng nhập (c039822).

---

## [v2.3.0] - 2026-06-23 (d4352ad...30b621d)

> **Mục tiêu:** Tích hợp hệ thống trắc nghiệm tương tác trực tiếp bên cạnh mô hình 3D.

### Added
- **Tính năng Quiz tương tác** (`QuizPanel`): Học sinh làm bài trắc nghiệm ngay bên cạnh mô hình 3D mà không cần chuyển trang. Chấm điểm tức thì, đổi màu xanh/đỏ khi chọn đáp án, hiển thị giải thích chi tiết sau mỗi câu (f749c0c).
- **Báo cáo kết quả tổng quan** cuối bài trắc nghiệm: Hiển thị phần trăm chính xác, số câu đúng/sai và xếp hạng năng lực.
- **Quản lý Quiz cho Admin** trong `AdminMaterialsPage`: Cho phép thêm, sửa, xóa câu hỏi trắc nghiệm trực tiếp khi tạo/sửa học liệu (7c591d1).
- Cập nhật **MongoDB Schema** bổ sung trường `quiz[]` để lưu trữ dữ liệu trắc nghiệm.
- Thêm tệp mô hình DNA 3D (`dna.glb`) chất lượng cao (d4352ad).
- Tạo mới các component tái sử dụng cho Dashboard: `WelcomeBanner`, `ProgressCards`, `QuickLinks`, `SchoolAdminPanel` (7a8db90).

### Changed
- **Thiết kế QuizPanel** theo phong cách **Glassmorphism** (kính mờ): Bảng quiz nổi dạng floating card rộng 360px ở góc phải, có thể đóng/mở mượt mà bằng hiệu ứng trượt (`translateX`) và thay đổi opacity (30b621d).
- Tái cấu trúc mã nguồn `Dashboard.tsx`: Chia nhỏ từ file ~700 dòng thành các component con độc lập (7a8db90).

---

## [v2.2.0] - 2026-06-22 (7b19429...b3383d8)

> **Mục tiêu:** Redesign trang Tổng quan và bổ sung tính năng Kho lưu trữ học liệu Premium.

### Added
- **Thiết kế lại Dashboard** với: Banner chào mừng cá nhân hóa, thẻ môn học phân loại (Sinh học, Hóa học, Vật lý), các nút thao tác nhanh và danh sách học liệu vừa xem dạng carousel trượt ngang (7a8db90).
- Tính năng **Lưu kho tạm thời (Pro Vault)**: Học sinh có thể lưu học liệu vào kho cá nhân trong 24 giờ (giới hạn đối với tài khoản Free) (4978ac1).

### Changed
- Di chuyển nút "Lưu kho tạm thời" vào thanh metadata bar phía dưới của trang học liệu (4978ac1).
- Tối ưu hóa và dọn dẹp hướng dẫn tương tác 3D: Thêm hướng dẫn click chuột phải để dịch chuyển góc nhìn (pan) (15a8c82, b3383d8).

### Removed
- Xóa dữ liệu seed trường học mẫu thử nghiệm khỏi `server.js` (7b19429).
- Xóa các mô hình demo H2O và Hệ Mặt Trời không còn sử dụng (99a91d2).

### Fixed
- Sửa lỗi crash `ReferenceError` do thiếu import `Archive`, `Folder`, `Plus`, `Trash2`, `X` trong `MaterialDetail.tsx`.
- Sửa lỗi Admin bị khóa bởi cơ chế Premium Lock khi xem học liệu trong Vault.
- Sửa lỗi giao diện và luồng xử lý khi chuyển đổi giữa các trang (route transition flickering) (907d0a5).

---

## [v2.1.0] - 2026-06-06 đến 2026-06-13 (411a969...aaa4bbe)

> **Mục tiêu:** Tích hợp các dịch vụ nền tảng (OAuth Google, SMTP) và tái thiết kế giao diện chuyên nghiệp.

### Added
- Tích hợp **Đăng nhập bằng Google** (Google OAuth 2.0).
- Tích hợp dịch vụ gửi **Email khôi phục mật khẩu** qua Resend API (c4d3e1c, 9c55da7).
- Thiết kế mẫu email HTML sang trọng và phương án fallback Plain-Text dự phòng (c4d3e1c, 9c55da7).
- Hỗ trợ **7 ngày dùng thử miễn phí** đầy đủ tính năng Pro cho tài khoản mới đăng ký.
- Cho phép Admin trường học **tự chỉnh sửa quota** giáo viên và học sinh trực tiếp trên Dashboard (ff03192).
- Thêm hộp thông báo **cảnh báo thư rác** vào trang Quên mật khẩu và Đặt lại mật khẩu.
- Tích hợp **Google Analytics 4 (GA4)** với mã `G-VCXY5EZNZH`, tự động theo dõi lượt xem trang khi người dùng chuyển route.
- Bổ sung favicon mới và cập nhật cấu hình SEO (a3de4ca).

### Changed
- Thiết kế lại toàn bộ trang **Landing Page**: Tối ưu font tiếng Việt, layout Hero section, thiết kế chân trang mới.
- Tối ưu giao diện **Tìm kiếm AI**: Đơn giản hóa khung chat và cải tiến prompt gửi lên Gemini API cho kết quả Sinh học chính xác hơn (aaa4bbe).
- Đổi tên trang "Trang chủ" thành **"Tổng quan"** trong Sidebar và cập nhật SEO meta tags tương ứng (16fe2d4).
- Thống nhất 4 gói dịch vụ trên cả Client và Server: **Cơ Bản, Nâng Cao (Pro), Combo Pro + 3D, Nhà Trường** (6e27429, c99c59d).
- Tối ưu hóa **Light Mode** sang tông màu ấm kem/stone, giảm độ chói và hài hòa hơn (0f9bd19).
- Sidebar thích ứng tự động với chế độ Sáng/Tối (dynamic Tailwind classes).
- Đổi tên "Find with AI" thành **"AI tìm kiếm"** (16fe2d4).
- Nâng quota giáo viên mặc định từ 5 lên **30** (c5acf6f).

### Fixed
- Sửa lỗi chữ bị mờ/biến mất bằng cách thay thế mã màu Tailwind không hợp lệ (`rose-650` → `rose-700`).
- Sửa lỗi tiêu đề "Không gian tương tác" bị cắt (text clipping).
- Sửa lỗi cấu hình cổng SMTP: Chuyển sang port 587 và ép kết nối IPv4 để hoạt động ổn định trên Render.
- Sửa lỗi rendering QR code thanh toán và luồng tham gia trường học (join flow) (8407553).
- Sửa lỗi favicon không tải được.

### Security
- Tách vai trò Admin trường học thành `school-admin`, tách biệt hoàn toàn với `admin` hệ thống (411a969).
- Giới hạn quyền truy cập trang quản trị (`/admin/*`) chỉ dành cho `admin` hệ thống (411a969).

---

## [v2.0.0] - 2026-06-09 (028d7ac...74627d5)

> **Mục tiêu:** Tái cấu trúc toàn bộ mã nguồn lần đầu, chuẩn bị nền tảng cho giai đoạn phát triển tính năng nâng cao.

### Changed
- **[BREAKING]** Tái cấu trúc toàn bộ cấu trúc thư mục dự án: Tách biệt rõ ràng `src/components`, `src/layout`, `src/pages`, `src/data`.
- Chuẩn hóa tên biến, hàm và component theo tiếng Anh (camelCase, PascalCase).
- Xóa bỏ toàn bộ code thừa và các component không còn sử dụng (028d7ac).
- Áp dụng co giãn linh hoạt (clamp/vh) cho font và feature blocks trên LandingPage khi màn hình thấp (e05064a).
- Tối ưu responsive mobile cho Hero section LandingPage (e703a82).
- Tinh chỉnh layout Hero section trên LandingPage (canh lề logo, điều chỉnh padding) (6b5faf9).
- Giảm kích thước chữ EduTech và tagline trên LandingPage (74627d5).

---

## [v1.3.0] - 2026-06-05

> **Mục tiêu:** Đo lường hành vi người dùng thực tế và chuẩn hóa bộ nhận diện thương hiệu.

### Added
- Tích hợp **Google Analytics 4** theo dõi traffic và hành vi người dùng.
- Cập nhật Logo hệ thống EduTech mới trên toàn bộ nền tảng.
- Thêm tài liệu hướng dẫn cấu hình **Google OAuth** và **SMTP** cho lập trình viên.

### Removed
- Xóa các tệp ảnh và mô hình 3D cũ không còn sử dụng để giảm dung lượng repository.

---

## [v1.2.0] - 2026-06-05

> **Mục tiêu:** Tự động hóa quy trình thanh toán và nâng cấp tài khoản, không cần duyệt thủ công.

### Added
- Tích hợp **cổng thanh toán SePay** (VietQR): Khi người dùng quét mã QR chuyển khoản thành công, SePay tự động gửi Webhook về server và hệ thống tự động nâng cấp tài khoản lên gói Pro ngay lập tức.
- Cơ chế **chặn thanh toán trùng lặp** khi đang xử lý giao dịch.
- Tính năng **Kho lưu trữ Pro 24 giờ**: Học sinh tài khoản Free có thể lưu học liệu Pro và xem trong 24 giờ.
- Hiển thị **nhãn gói cước động** (Plan Badge: Free, Pro, School) trên giao diện người dùng.
- Tính năng **dùng thử miễn phí 7 ngày** khi đăng ký tài khoản mới.
- Sao lưu dữ liệu **local fallback**: Tự động lưu file vào local nếu Supabase upload bị lỗi hoặc kích thước file vượt 48MB.

### Changed
- Cập nhật và đồng bộ các gói giá dịch vụ giữa trang Bảng giá và trang Thanh toán.
- Ẩn các nút gói cước thấp hơn khi người dùng đã đăng ký gói cao hơn.

### Removed
- Gỡ chức năng **tải xuống tài nguyên** (download) để bảo vệ bản quyền nội dung.

### Security
- Phân tách vai trò quản trị: `school-admin` (quản trị trường) và `admin` (quản trị hệ thống) với quyền truy cập riêng biệt.

---

## [v1.1.0] - 2026-05-29

> **Mục tiêu:** Nâng cấp kiến trúc lên chuẩn ứng dụng hiện đại, hỗ trợ nhiều trường học và đa giao diện.

### Added
- **[MAJOR]** Di chuyển toàn bộ mã nguồn lên kiến trúc Modern Refactored với khả năng mở rộng.
- Hỗ trợ **Dark/Light Mode** toàn cục — người dùng có thể chuyển đổi giao diện bất kỳ lúc nào.
- Phân hệ **Cổng Trường học (School Portal)**: Trường học đăng ký tài khoản tổ chức, phân phối tài khoản con cho Giáo viên và Học sinh.
- Kết nối cơ sở dữ liệu **MongoDB/PostgreSQL** để lưu trữ dữ liệu người dùng bền vững.
- Hỗ trợ hiển thị công thức **LaTeX** cho môn Toán và Lý.
- Nâng giới hạn upload lên **100MB** cho tài khoản Admin.
- Hỗ trợ upload và hiển thị mô hình 3D định dạng **`.fbx`**.
- Layout **Infographic** linh hoạt tự động chuyển đổi giữa dọc/ngang và hỗ trợ chủ đề Sáng/Tối.
- Đồng bộ toàn bộ hệ thống sử dụng font chữ **Plus Jakarta Sans**.
- Trang quản lý bài học và trang quản lý thanh toán cho Admin.

### Fixed
- Sửa lỗi môi trường preset 3D không hợp lệ (`neutral` → `city`).
- Sửa lỗi Sidebar đè lên nội dung chính.

---

## [v1.0.0] - 2026-03-13

> **Mục tiêu:** Phát hành phiên bản MVP đầu tiên với tính năng xem học liệu 3D cơ bản.

### Added
- Khởi tạo dự án ứng dụng web **EduTech** — Nền tảng học liệu 3D tương tác.
- Kết nối cơ sở dữ liệu **PostgreSQL** để lưu thông tin tài liệu và người dùng.
- Tính năng **Infographic** tương tác đầu tiên.
- Hỗ trợ upload và hiển thị mô hình **3D cơ bản**.
- Trang Landing Page và luồng **Đăng ký / Đăng nhập** người dùng.
- Trang **Bảng giá** và điều hướng tới trang Đăng nhập khi chưa xác thực.
- Trang **Hướng dẫn** sử dụng.
- Triển khai backend lên **Render**: Bind server cổng `0.0.0.0`, cấu hình `pg` dependency, khôi phục hàm upload thumbnail.
- Cấu hình **Auth Modal** xuất hiện khi người dùng chưa đăng nhập cố gắng truy cập tính năng Premium.

### Fixed
- Sửa lỗi ảnh nền Hero không hiển thị do sai đường dẫn (chuyển sang thư mục `/public`).
- Sửa lỗi timeout kết nối server.
- Sửa lỗi không xem được học liệu sau upload.
- Sửa lỗi hiển thị Infographic.

### Security
- Vá lỗ hổng **Broken Access Control**: Ngăn người dùng chưa đăng nhập truy cập nội dung bị khóa.
- Bảo vệ **dữ liệu phiên làm việc (Session Auth)** của học sinh.
