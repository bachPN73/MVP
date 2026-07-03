# Nhật ký thay đổi (Changelog)

Tất cả những thay đổi quan trọng của dự án **EduTech** sẽ được ghi lại tại đây.

Tài liệu này tuân theo chuẩn **Keep a Changelog** và **Semantic Versioning**.

---

## [2.6.0] - 22/06/2026 → 03/07/2026

### Tính năng mới

* Thêm hệ thống **Quiz tương tác** ngay bên cạnh mô hình 3D:
  * Làm bài trực tiếp.
  * Chấm điểm ngay sau khi chọn.
  * Hiển thị đáp án đúng/sai và giải thích.
* Thêm chức năng **quản lý câu hỏi Quiz** cho Admin.
* Thêm **Kho lưu trữ tạm thời (Pro Vault)** cho phép lưu học liệu trong 24 giờ.
* Thêm thanh chỉnh **độ sáng mô hình 3D**.
* Thêm cơ chế tự động co giãn giao diện để phù hợp với nhiều kích thước màn hình.
* Thêm hệ thống **tạm dừng Canvas 3D** khi người dùng không nhìn thấy để tiết kiệm CPU/GPU.
* Thêm cơ chế tải trang từng phần (**lazy load**) giúp tải nhanh hơn.
* Thêm bộ nhớ đệm (**cache**) cho mô hình 3D để tải nhanh hơn ở lần sau.
* Thêm công cụ **nén mô hình 3D bằng Draco** giúp giảm mạnh dung lượng file.
* Thêm các mô hình DNA và giảm phân đã tối ưu.
* Thêm hệ thống bắt lỗi WebGL (`WebGLErrorBoundary`) để tránh crash app.
* Thêm trang báo lỗi chung (`ErrorPage`) khi có lỗi hệ thống.

### Cải tiến

* Thiết kế lại **Dashboard** dễ nhìn và trực quan hơn.
* Thiết kế lại giao diện Quiz đẹp và hiện đại hơn.
* Chia nhỏ và sắp xếp lại code giúp dễ bảo trì hơn.
* Tối ưu giao diện cho màn hình nhỏ và điện thoại.
* Cải thiện Landing Page:
  * chữ dễ đọc hơn
  * thanh điều hướng cân đối hơn
* Cải thiện góc nhìn, ánh sáng và hướng dẫn trong mô hình 3D.
* Tối ưu tốc độ tải hình ảnh.
* Tối ưu cách tải mô hình trước khi người dùng bấm vào.
* Đặt giao diện sáng làm mặc định.
* Thay mô hình 3D ở Landing Page bằng video để giảm tải máy.

### Sửa lỗi

* Sửa lỗi nhấp nháy khi chuyển trang.
* Sửa lỗi giao diện bị chồng lên nhau trên màn hình nhỏ.
* Sửa lỗi Admin bị khóa khi xem học liệu Premium.
* Sửa lỗi thiếu import gây crash ứng dụng.
* Sửa lỗi mất trạng thái phân trang ở Thư viện.
* Sửa lỗi rò rỉ bộ nhớ GPU khi mở/đóng mô hình 3D nhiều lần.

### Đã xóa

* Xóa dữ liệu thử nghiệm không còn dùng.
* Xóa các mô hình demo cũ.

---

## [2.1.0] - 05/06/2026 → 13/06/2026

### Tính năng mới

* Thêm **Đăng nhập bằng Google**.
* Thêm chức năng **Quên mật khẩu qua Email**.
* Thêm email mẫu đẹp và email dự phòng.
* Thêm **7 ngày dùng thử miễn phí**.
* Thêm quản lý số lượng tài khoản cho Admin trường học.
* Thêm **Google Analytics** để theo dõi lượt truy cập.
* Thêm thanh toán tự động bằng **SePay (VietQR)**.
* Thêm cơ chế chống thanh toán trùng.
* Thêm lưu file dự phòng nếu upload lỗi.
* Thêm nhãn hiển thị gói tài khoản (Free, Pro, School).

### Cải tiến

* Thiết kế lại toàn bộ Landing Page.
* Cải thiện giao diện AI tìm kiếm.
* Chuẩn hóa các gói dịch vụ.
* Tối ưu giao diện sáng và tối.
* Đổi tên "Trang chủ" thành "Tổng quan".
* Tăng giới hạn tài khoản giáo viên mặc định.

### Sửa lỗi

* Sửa lỗi gửi email SMTP.
* Sửa lỗi QR thanh toán.
* Sửa lỗi favicon.
* Sửa lỗi chữ bị cắt hoặc hiển thị sai màu.

### Bảo mật

* Tách quyền giữa Admin hệ thống và Admin trường học.
* Giới hạn quyền truy cập khu vực quản trị.

### Đã xóa

* Xóa chức năng tải xuống tài liệu để bảo vệ nội dung.

---

## [2.0.0] - 09/06/2026

### Thay đổi lớn

* Tái cấu trúc toàn bộ dự án.
* Sắp xếp lại thư mục rõ ràng hơn:
  * Components
  * Layout
  * Pages
  * Data
* Chuẩn hóa cách đặt tên biến, hàm và component.
* Xóa toàn bộ code cũ không còn sử dụng.

---

## [1.1.0] - 29/05/2026

### Tính năng mới

* Nâng cấp lên kiến trúc mới dễ mở rộng hơn.
* Hỗ trợ giao diện sáng/tối.
* Thêm hệ thống quản lý trường học.
* Kết nối MongoDB và PostgreSQL.
* Hỗ trợ công thức toán bằng LaTeX.
* Hỗ trợ mô hình `.fbx`.
* Giao diện infographic linh hoạt.
* Đồng bộ font chữ toàn hệ thống.
* Thêm trang quản lý bài học và thanh toán cho Admin.

### Sửa lỗi

* Sửa lỗi môi trường hiển thị 3D.
* Sửa lỗi Sidebar che nội dung.

---

## [1.0.0] - 13/03/2026

### Phiên bản đầu tiên

* Ra mắt phiên bản đầu tiên của EduTech.
* Xây dựng nền tảng học liệu 3D tương tác.
* Kết nối cơ sở dữ liệu PostgreSQL.
* Hỗ trợ tải lên và xem mô hình 3D.
* Xây dựng Landing Page.
* Xây dựng hệ thống đăng ký/đăng nhập.
* Xây dựng bảng giá.
* Xây dựng trang hướng dẫn.
* Triển khai backend lên Render.
* Thêm cửa sổ yêu cầu đăng nhập khi truy cập nội dung Premium.

### Sửa lỗi

* Sửa lỗi ảnh nền không hiển thị.
* Sửa lỗi kết nối server.
* Sửa lỗi tải và xem học liệu.
* Sửa lỗi hiển thị infographic.

### Bảo mật

* Chặn người chưa đăng nhập truy cập nội dung bị khóa.
* Bảo vệ phiên đăng nhập của người dùng.
