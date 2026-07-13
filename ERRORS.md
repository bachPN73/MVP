# 🐛 Error Log - mvp

> Tập hợp tất cả lỗi xảy ra trong quá trình phát triển (Auto-generated).

---

## Thống kê nhanh
- **Tổng lỗi**: 2
- **Đã sửa**: 2

---

<!-- Errors sẽ được agent tự động ghi vào đây -->

## [2026-06-25 16:34] - Lỗi Cú Pháp JSX Thiếu Thẻ Đóng ở JoinSchoolPage.tsx

- **Type**: Syntax
- **Severity**: High
- **File**: `src/pages/JoinSchoolPage.tsx:469`
- **Agent**: Antigravity
- **Root Cause**: Thẻ đóng Fragment `</>` và cấu trúc kết thúc điều kiện rẽ nhánh `else` (dấu `) : ( <>`) không được đóng khớp ở cuối file, cộng thêm một thẻ `</div>` dư thừa ở dòng 469 gây lỗi parser babel.
- **Error Message**: 
  ```
  [plugin:vite:react-babel] C:\mvp\MVP\src\pages\JoinSchoolPage.tsx: Expected corresponding JSX closing tag for <>. (469:12)
  [vite:esbuild] Transform failed with 2 errors: Unexpected closing "div" tag does not match opening fragment tag. Expected ")" but found "{"
  ```
- **Fix Applied**: Chuyển vị trí đóng Fragment `</>` và đóng nhánh điều kiện rẽ nhánh `else` (`)}`) lên ngay sau khi khối container grid kết thúc (dòng 470), đưa QR Scanner Modal ra ngoài khối điều kiện nhưng vẫn nằm trong Layout container, loại bỏ thẻ `</div>` dư thừa và làm sạch các thẻ đóng ở cuối file.
- **Prevention**: Sử dụng IDE tự động định dạng và kiểm tra thẻ đóng XML/JSX, đồng thời luôn chạy kiểm tra build trước khi commit/giao tác vụ.
- **Status**: Fixed


## [2026-07-13 17:00] - Lỗi Logic Phân Quyền Học Liệu Khi requiredPlan undefined

- **Type**: Logic
- **Severity**: High
- **File**: `src/pages/MaterialDetail.tsx:589`
- **Agent**: Back
- **Root Cause**: Trường `requiredPlan` trong cơ sở dữ liệu MongoDB đối với một số học liệu cũ hoặc mới import không được thiết lập (giá trị `undefined`). Khi đó, trang Admin hiển thị là "Không giới hạn (mọi gói)" nhưng trang chi tiết học liệu `MaterialDetail.tsx` lại không kiểm tra điều kiện `undefined` làm cho biến `isBlocked` bị gán bằng `true` với người dùng gói Free.
- **Error Message**: Học liệu bị hiển thị màn hình khóa với thông báo "Mở khóa học liệu: [Tên học liệu]" và tag "Tính Năng Trả Phí" mặc dù Admin đang cấu hình là Không giới hạn.
- **Fix Applied**: Thay đổi điều kiện kiểm tra trong `MaterialDetail.tsx` từ `requiredPlan === null || requiredPlan === 'free' || requiredPlan === ''` thành `!requiredPlan || requiredPlan === 'free'` để bao phủ cả trường hợp `undefined`.
- **Prevention**: Luôn sử dụng cú pháp kiểm tra giá trị falsy rộng hơn (ví dụ `!variable`) hoặc kiểm tra tường minh cả `undefined` khi làm việc với các trường tuỳ chọn từ cơ sở dữ liệu.
- **Status**: Fixed

---
