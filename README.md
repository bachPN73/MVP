# Hướng dẫn Cấu hình Đăng nhập Google & Khôi phục mật khẩu qua Email

Tài liệu này hướng dẫn cách cấu hình các thông số cần thiết trong file `.env` để kích hoạt tính năng **Đăng nhập bằng Google** và **Khôi phục mật khẩu qua Email** hoạt động thực tế trên máy chạy (Local) hoặc khi đã deploy lên máy chủ (Production).

---

## 1. Cấu hình Đăng nhập bằng Google (Google OAuth 2.0)

Để nút **Đăng nhập / Đăng ký bằng Google** trên trang Login & Register hoạt động:

1. **Truy cập Google Cloud Console**:
   - Đăng nhập vào [Google Cloud Console](https://console.cloud.google.com/).
   - Chọn hoặc **Tạo một dự án mới** (Create a new project).

2. **Cấu hình màn hình đồng ý (OAuth Consent Screen)**:
   - Vào menu **APIs & Services** -> **OAuth consent screen**.
   - Chọn **User Type** là **External** và nhấn *Create*.
   - Điền các thông tin bắt buộc: *App name* (ví dụ: `EduTech`), *User support email*, *Developer contact information*. Sau đó nhấn *Save and Continue* cho tới hết.

3. **Tạo thông tin xác thực (Credentials)**:
   - Vào mục **Credentials** (Thông tin xác thực) -> Bấm **Create Credentials** -> Chọn **OAuth client ID**.
   - Chọn **Application type** là **Web application**.
   - Ở mục **Authorized JavaScript origins**, nhấn *Add URI* và thêm:
     - `http://localhost:5173` (Để chạy thử dưới máy local).
     - URL trang web của bạn (Khi đã deploy public).
   - Ở mục **Authorized redirect URIs**, thêm các địa chỉ tương tự.
   - Nhấn **Create**. Một hộp thoại sẽ hiện lên chứa **Your Client ID**.

4. **Cập nhật File `.env`**:
   - Copy chuỗi **Client ID** đó.
   - Mở file `.env` trong thư mục `MVP` của bạn, điền vào 2 biến sau:
     ```env
     GOOGLE_CLIENT_ID=chuỗi_client_id_của_bạn.apps.googleusercontent.com
     VITE_GOOGLE_CLIENT_ID=chuỗi_client_id_của_bạn.apps.googleusercontent.com
     ```

---

## 2. Cấu hình Khôi phục mật khẩu qua Email (Gmail SMTP)

Để hệ thống gửi email mã OTP xác thực khôi phục mật khẩu về email thật của người dùng thay vì chỉ hiển thị trong terminal (Demo):

1. **Chuẩn bị Gmail phát**:
   - Đăng nhập vào tài khoản Gmail bạn muốn dùng để gửi mail tự động.
   - Bật tính năng **[Xác minh 2 bước (2-Step Verification)](https://myaccount.google.com/security)** cho tài khoản đó (bắt buộc).

2. **Tạo Mật khẩu ứng dụng (App Password)**:
   - Truy cập vào trang quản lý **[Mật khẩu ứng dụng của Google](https://myaccount.google.com/apppasswords)**.
   - Đặt tên cho mật khẩu ứng dụng mới (Ví dụ: `EduTech Mailer`).
   - Nhấn **Tạo**. Một đoạn mã bảo mật gồm **16 ký tự** sẽ hiện lên (ví dụ: `abcd efgh ijkl mnop`). Hãy sao chép mã này.

3. **Cập nhật File `.env`**:
   - Mở file `.env` trong thư mục `MVP` của bạn, cấu hình các biến gửi email:
     ```env
     EMAIL_USER=email_phát_của_bạn@gmail.com
     EMAIL_PASS=16_ký_tự_mã_bảo_mật_không_dấu_cách
     ```

---

> [!IMPORTANT]
> **Khởi động lại Server**: Sau khi lưu các thay đổi trong file `.env`, bạn bắt buộc phải tắt đi và chạy lại Server (`npm run dev` cho frontend và chạy lại server backend) để hệ thống nhận diện cấu hình mới.
