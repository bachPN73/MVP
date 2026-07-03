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

## [v0.17.0] - 2026-07-03 (d159f8d...e8900cd)

> **Mục tiêu:** Tăng tốc độ tải mô hình 3D, tối ưu hóa bộ nhớ tránh giật lag, ngăn ngừa lỗi treo ứng dụng đồ họa và hoàn thiện giao diện cho màn hình nhỏ.

### Added
- Tối ưu hóa kích thước mô hình 3D: Nén và giảm dung lượng các file mô hình lên đến 75% (Ví dụ: bài học phân bào DNA Kỳ sau giảm từ 223MB xuống còn 59MB), giúp học sinh tải học liệu nhanh hơn gấp nhiều lần (e8900cd).
- Bổ sung mô hình phân bào DNA Kỳ giữa và Kỳ sau đã qua xử lý nén tối ưu.
- Khắc phục sự cố đồ họa: Tự động phát hiện và ngăn lỗi làm đơ hoặc đóng ứng dụng đột ngột khi thiết bị gặp sự cố xử lý đồ họa 3D (dd77e51, d159f8d).
- Bổ sung trang thông báo lỗi thân thiện khi hệ thống gặp sự cố kết nối hoặc lỗi đường truyền (dd77e51).
- Bổ sung thanh điều chỉnh độ sáng trực quan ở bên trái mô hình 3D để học sinh dễ dàng học tập theo nhu cầu ánh sáng cá nhân (123d0a8).

### Changed
- Cải tiến giao diện: Điều chỉnh kích thước chữ và thanh công cụ để hiển thị hoàn hảo trên các màn hình máy tính cỡ nhỏ (độ phân giải 1366x768) (36e9f66).
- Tăng độ tương phản màu sắc, cỡ chữ hiển thị tại trang Tìm kiếm AI và Tham gia Trường học để dễ đọc hơn (1c7bfce).

### Performance & UX
- Tiết kiệm RAM và bộ nhớ đồ họa: Tự động giải phóng hoàn toàn tài nguyên đồ họa của thiết bị ngay sau khi đóng mô hình 3D, tránh máy bị nóng hoặc lag khi học tập lâu (8c97cf7).
- Cải thiện tốc độ tải trang: Chuyển trang mượt mà hơn, loại bỏ hoàn toàn hiện tượng nhấp nháy hoặc màn hình trắng lúc chuyển bài học (922764d).
- Công nghệ lưu trữ thông minh: Tự động lưu mô hình 3D đã xem vào trình duyệt, giúp các lần học tiếp theo mở lên ngay lập tức mà không cần tải lại (922764d).
- Tăng cỡ chữ nội dung chi tiết bài học lên 13px giúp học sinh dễ dàng theo dõi bài học (80b3502).
- Tối ưu hóa bố cục trang chi tiết học liệu trực quan hơn (46bb4da).

### Fixed
- Sửa lỗi mất bộ lọc: Tự động giữ nguyên vị trí trang, các lựa chọn môn học và kết quả tìm kiếm khi học sinh quay lại trang Thư viện (6c065a4).

---

## [v0.16.0] - 2026-06-26 (134cbc3)

> **Mục tiêu:** Tối ưu hóa toàn diện khả năng hiển thị (Responsive) trên màn hình nhỏ (1366x768) và thiết bị di động.

### Changed
- Tối ưu hóa bố cục các thẻ tính năng (feature cards), thiết kế bảng quiz và các hướng dẫn tương tác cho người dùng (2b18a68).
- Tăng kích thước chữ tiêu đề hero và các hộp tính năng trên Landing Page riêng cho màn hình 1366x768 (8ad7588, 134cbc3).
- Tối ưu hóa LandingPage feature boxes styling cho các độ phân giải màn hình có chiều cao thấp (4364946).
- Cải thiện góc xoay, ánh sáng mô hình 3D và tăng kích thước chữ hướng dẫn bên sidebar (ba1c4c5).

---

## [v0.15.0] - 2026-06-26 (43712bc)

> **Mục tiêu:** Đồng bộ các tính năng responsive mobile dashboard và fluid scaling toàn hệ thống.

### Added
- Tích hợp cơ chế **fluid scaling** toàn hệ thống: Font chữ và layout tự động co giãn linh hoạt theo kích thước màn hình thay vì bị vỡ hoặc tràn ra ngoài (43712bc).

### Changed
- Thiết kế lại trang Dashboard trên **di động**: Chuyển sidebar thành menu drawer thu gọn, sắp xếp lại các nút thao tác nhanh thành dạng lưới 2 cột (43712bc).

---

## [v0.14.0] - 2026-06-26 (99a91d2)

> **Mục tiêu:** Xóa bỏ dữ liệu mock không cần thiết và cải thiện độ nhấp nháy route.

### Changed
- Thay nền Dashboard từ màu đặc sang **nền trong suốt** để hòa hợp với ảnh nền hệ thống, mở rộng khung chứa nội dung của Dashboard, trang Hướng dẫn và trang Tham gia Trường học, tối ưu bộ lọc Thư viện, ẩn thanh cuộn mặc định của trình duyệt để tối ưu thẩm mỹ (66e70f4).

### Removed
- Xóa các mô hình demo H2O và Hệ Mặt Trời không còn sử dụng (99a91d2).

### Fixed
- Sửa lỗi các phần tử giao diện **chồng đè lên nhau** (layout overlap) khi màn hình nhỏ hơn 1400px (ea34942).
- Sửa lỗi Sidebar bị **nhấp nháy** (flash) trong quá trình chuyển đổi giữa các trang (route transition) (ea34942).

---

## [v0.13.0] - 2026-06-23 (e05064a...907d0a5)

> **Mục tiêu:** Giảm tải tài nguyên CPU/GPU và tăng tốc độ tải trang ban đầu.

### Changed
- Áp dụng cơ chế co giãn linh hoạt (fluid scaling) bằng `clamp()` và `vh` cho font chữ và các khối tính năng trên LandingPage khi hiển thị trên các màn hình có chiều cao thấp (e05064a).
- Tối ưu hóa thiết kế responsive cho màn hình di động tại Hero section của LandingPage (e703a82).
- Tinh chỉnh UI Hero section trên LandingPage: Căn lề lại logo, điều chỉnh padding và giảm kích thước tiêu đề EduTech cùng tagline cho cân đối hơn (6b5faf9, 74627d5).
- Tối ưu hóa UI và sửa lỗi chớp giao diện khi chuyển route (907d0a5).
- Nâng cấp UI: sidebar layout, responsive behavior, colors, và page transitions (689722c).

---

## [v0.12.0] - 2026-06-23 (7a8db90...30b621d)

> **Mục tiêu:** Tích hợp hệ thống trắc nghiệm tương tác trực tiếp bên cạnh mô hình 3D.

### Added
- **Tính năng Quiz tương tác** (`QuizPanel`): Học sinh làm bài trắc nghiệm ngay bên cạnh mô hình 3D mà không cần chuyển trang. Chấm điểm tức thì, đổi màu xanh/đỏ khi chọn đáp án, hiển thị giải thích chi tiết sau mỗi câu (f749c0c).
- **Quản lý Quiz cho Admin** trong `AdminMaterialsPage`: Cho phép thêm, sửa, xóa câu hỏi trắc nghiệm trực tiếp khi tạo/sửa học liệu (7c591d1).
- Tạo mới các component tái sử dụng cho Dashboard: `WelcomeBanner`, `ProgressCards`, `QuickLinks`, `SchoolAdminPanel` (7a8db90).

### Changed
- **Thiết kế QuizPanel** theo phong cách **Glassmorphism** (kính mờ): Bảng quiz nổi dạng floating card rộng 360px ở góc phải, có thể đóng/mở mượt mà bằng hiệu ứng trượt (`translateX`) và thay đổi opacity (30b621d).
- Tái cấu trúc mã nguồn `Dashboard.tsx`: Chia nhỏ từ file ~700 dòng thành các component con độc lập (7a8db90).

---

## [v0.11.0] - 2026-06-22 (15a8c82...b3383d8)

> **Mục tiêu:** Tối ưu hóa UI hướng dẫn tương tác và status bar.

### Changed
- Tối ưu hóa và dọn dẹp hướng dẫn tương tác 3D: Thêm hướng dẫn click chuột phải để dịch chuyển góc nhìn (pan) (15a8c82, b3383d8).
- Lược bỏ thông tin material ID hiển thị trên status bar phía dưới (f0d83e1).
- Khôi phục help text tương tác ở dưới đáy và gỡ bỏ title nổi góc trên bên trái (c2e1587).
- Gỡ bỏ các text overlay hướng dẫn trực tiếp trên màn hình xem 3D (f7dcaa8).

---

## [v0.10.0] - 2026-06-13 (a3de4ca...569e181)

> **Mục tiêu:** Chuẩn hóa logo favicons và SEO.

### Added
- Bổ sung favicon mới và cập nhật cấu hình SEO cho trường học và dashboard (569e181).

### Changed
- Phóng to logo hệ thống và cập nhật favicon logo mới (a3de4ca).
- Đổi tên trang "Trang chủ" thành **"Tổng quan"** trong Sidebar và cập nhật SEO meta tags tương ứng (16fe2d4).

---

## [v0.9.0] - 2026-06-12 (c99c59d...6e27429)

> **Mục tiêu:** Tích hợp dịch vụ email, quota trường học và nâng cấp gói dịch vụ.

### Added
- Tích hợp dịch vụ gửi **Email khôi phục mật khẩu** qua Resend API và thiết kế email HTML cao cấp với fallback Plain-Text (c4d3e1c, 9c55da7).
- Cho phép Admin trường học tự chỉnh sửa quota giáo viên và học sinh trực tiếp (ff03192).
- Nâng quota giáo viên mặc định từ 5 lên **30** (c5acf6f).

### Changed
- Thống nhất các gói dịch vụ trên cả Client và Server: **Cơ Bản, Nâng Cao (Pro), Combo Pro + 3D, Nhà Trường** (6e27429, c99c59d).
- Tối ưu hóa **Light Mode** sang tông màu ấm kem/stone, giảm độ chói (0f9bd19).

---

## [v0.8.0] - 2026-06-11 (4978ac1...7b19429)

> **Mục tiêu:** Hỗ trợ đăng nhập bằng Google, vault tạm thời cho tài khoản Free.

### Added
- Tích hợp **Đăng nhập bằng Google** (Google OAuth 2.0).
- Tính năng **Lưu kho tạm thời (Pro Vault)**: Học sinh có thể lưu học liệu vào kho cá nhân trong 24 giờ (giới hạn đối với tài khoản Free) (4978ac1).

### Removed
- Xóa dữ liệu seed trường học mẫu thử nghiệm khỏi `server.js` (7b19429).

### Fixed
- Sửa lỗi rendering QR code thanh toán và luồng tham gia trường học (join flow) (8407553).

---i hạn quyền truy cập trang quản trị (`/admin/*`) chỉ dành cho `admin` hệ thống (411a969).

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

## [v0.7.0] - 2026-06-05 (4a0a842)

> **Mục tiêu:** Đo lường hành vi người dùng thực tế và chuẩn hóa bộ nhận diện thương hiệu.

### Added
- Bổ sung công cụ đo lường lượt xem trang và tương tác của người dùng trên hệ thống.
- Cập nhật logo mới của EduTech đồng bộ trên toàn bộ nền tảng.
- Thêm tài liệu hướng dẫn kỹ thuật cho lập trình viên (Google OAuth và cấu hình email).

### Removed
- Xóa các hình ảnh và mô hình 3D cũ không sử dụng để giải phóng dung lượng hệ thống.

---

## [v0.6.0] - 2026-06-05 (c0780f8)

> **Mục tiêu:** Tự động hóa quy trình thanh toán và nâng cấp gói cước tự động.

### Added
- Tích hợp thanh toán quét mã QR (VietQR) tự động: Hệ thống tự động nhận diện giao dịch thành công và nâng cấp tài khoản Pro ngay lập tức mà không cần duyệt thủ công.
- Tích hợp cơ chế ngăn chặn thanh toán trùng lặp khi đang xử lý giao dịch.
- Tính năng Lưu kho tạm thời (Pro Vault): Học sinh tài khoản miễn phí có thể lưu và xem học liệu Pro trong vòng 24 giờ.
- Hiển thị nhãn gói cước tương ứng (Miễn phí, Pro, Trường học) trên giao diện người dùng.
- Tặng 7 ngày dùng thử miễn phí đầy đủ tính năng Pro cho tài khoản đăng ký mới.
- Tự động sao lưu dữ liệu dự phòng lên bộ nhớ cục bộ nếu dịch vụ đám mây gặp sự cố.

### Changed
- Đồng bộ các gói cước trên bảng giá và trang thanh toán; tự động ẩn các gói cước thấp khi đã đăng ký gói cao hơn.

### Removed
- Gỡ bỏ tính năng tải xuống tài nguyên để bảo vệ bản quyền nội dung học liệu.

### Security
- Phân tách quyền quản trị hệ thống và quyền quản lý trường học rõ ràng để bảo mật thông tin tốt hơn.

---

## [v0.5.0] - 2026-05-29 (ef30f03)

> **Mục tiêu:** Nâng cấp toàn diện giao diện và cấu trúc hệ thống, hỗ trợ cổng trường học và đa giao diện.

### Added
- Nâng cấp và cải tiến toàn bộ hệ thống lên cấu trúc hiện đại giúp trang web chạy nhanh và mượt mà hơn.
- Bổ sung tính năng chuyển đổi giao diện Sáng / Tối linh hoạt.
- Phân hệ Cổng trường học: Hỗ trợ các trường đăng ký tài khoản tổ chức và tự cấp phát tài khoản cho giáo viên, học sinh.
- Tích hợp cơ sở dữ liệu bền vững để lưu trữ an toàn thông tin bài học và tài khoản.
- Hiển thị công thức toán học và vật lý (LaTeX) rõ nét trên trang học liệu.
- Nâng giới hạn tải lên học liệu cho quản trị viên lên 100MB.
- Hỗ trợ hiển thị thêm định dạng mô hình 3D phổ biến (`.fbx`).
- Bố cục thông tin (Infographic) tự động điều chỉnh dọc/ngang linh hoạt theo thiết bị.
- Đồng bộ font chữ tiếng Việt Plus Jakarta Sans dễ đọc và hiện đại hơn.

### Fixed
- Khắc phục lỗi góc nhìn mô hình 3D không hiển thị đúng và lỗi menu đè lên nội dung bài học.

---

## [v0.1.0] - 2026-03-13 (c26e852)

> **Mục tiêu:** Phát hành phiên bản thử nghiệm đầu tiên với các tính năng cơ bản.

### Added
- Ra mắt trang web EduTech học tập tương tác mô hình 3D.
- Thiết lập hệ thống cơ sở dữ liệu lưu thông tin tài liệu và người dùng.
- Tích hợp trang giới thiệu, hướng dẫn sử dụng cơ bản và bảng giá.
- Xây dựng luồng đăng ký và đăng nhập tài khoản cho học sinh.
- Hỗ trợ tải lên và hiển thị mô hình 3D cơ bản.
- Khắc phục các lỗi hiển thị hình ảnh giới thiệu và lỗi treo kết nối máy chủ ban đầu.

### Security
- Thiết lập bảo mật cơ bản ngăn chặn người dùng chưa đăng nhập truy cập trái phép vào các nội dung bị khóa.
