import time
import random
import sys
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

# Đảm bảo console Windows hỗ trợ in UTF-8 nếu chạy trực tiếp
if sys.platform.startswith('win'):
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Danh sách 50 học viên cần đăng ký
USERS_DATA = [
    {"stt": 1, "name": "Lê Thị Minh Khuê", "email": "lethiminhkhue@gmail.com"},
    {"stt": 2, "name": "Trần Hoàng Bách", "email": "tranhoangbach@gmail.com"},
    {"stt": 3, "name": "Nguyễn Mỹ Linh", "email": "mylinh.nguyen98@gmail.com"},
    {"stt": 4, "name": "Phạm Văn Hùng", "email": "phamvanhung89@gmail.com"},
    {"stt": 5, "name": "Đặng Thu Thảo", "email": "dangthuthao@gmail.com"},
    {"stt": 6, "name": "Vũ Minh Trí", "email": "vuminhtri1503@gmail.com"},
    {"stt": 7, "name": "Hoàng Thanh Nhã", "email": "hoangthanhnha@gmail.com"},
    {"stt": 8, "name": "Đỗ Quốc Anh", "email": "doquocanh2000@gmail.com"},
    {"stt": 9, "name": "Ngô Bảo Trân", "email": "ngobaotran@gmail.com"},
    {"stt": 10, "name": "Bùi Tiến Dũng", "email": "buitiendung88@gmail.com"},
    {"stt": 11, "name": "Nguyễn Văn An", "email": "nguyenvanan08@gmail.com"},
    {"stt": 12, "name": "Trần Thị Bình", "email": "tranthibinh@gmail.com"},
    {"stt": 13, "name": "Lê Hoàng Cường", "email": "lehoangcuong08@gmail.com"},
    {"stt": 14, "name": "Phạm Minh Duy", "email": "phamminhduy@gmail.com"},
    {"stt": 15, "name": "Hoàng Khánh Chi", "email": "hoangkhanhchi08@gmail.com"},
    {"stt": 16, "name": "Vũ Tiến Đạt", "email": "vutiendat@gmail.com"},
    {"stt": 17, "name": "Đỗ Minh Giang", "email": "dominhgiang@gmail.com"},
    {"stt": 18, "name": "Phan Văn Hải", "email": "phanvanhai08@gmail.com"},
    {"stt": 19, "name": "Nguyễn Thị Hương", "email": "nguyenthihuong@gmail.com"},
    {"stt": 20, "name": "Đặng Hoài Nam", "email": "danghoainam@gmail.com"},
    {"stt": 21, "name": "Bùi Ngọc Mai", "email": "buingocmai@gmail.com"},
    {"stt": 22, "name": "Ngô Gia Khánh", "email": "ngogiakhanh08@gmail.com"},
    {"stt": 23, "name": "Lý Hoàng Long", "email": "lyhoanglong@gmail.com"},
    {"stt": 24, "name": "Dương Trọng Nghĩa", "email": "duongtrongnghia@gmail.com"},
    {"stt": 25, "name": "Trịnh Hồng Nhung", "email": "trinhhongnhung@gmail.com"},
    {"stt": 26, "name": "Hồ Minh Quân", "email": "hominhquan08@gmail.com"},
    {"stt": 27, "name": "Võ Văn Tài", "email": "vovantai@gmail.com"},
    {"stt": 28, "name": "Mai Thu Thảo", "email": "maithuthao@gmail.com"},
    {"stt": 29, "name": "Đinh Minh Triết", "email": "dinhminhtriet@gmail.com"},
    {"stt": 30, "name": "Lâm Quốc Uy", "email": "lamquocuy08@gmail.com"},
    {"stt": 31, "name": "Kiều Gia Bảo", "email": "kieugiabao@gmail.com"},
    {"stt": 32, "name": "Tạ Minh Đức", "email": "taminhduc@gmail.com"},
    {"stt": 33, "name": "Phùng Khánh Huyền", "email": "phungkhanhhuyen@gmail.com"},
    {"stt": 34, "name": "Cao Tiến Lâm", "email": "caotienlam@gmail.com"},
    {"stt": 35, "name": "Nguyễn Bảo Ngọc", "email": "nguyenbaongoc@gmail.com"},
    {"stt": 36, "name": "Trần Thanh Phong", "email": "tranthanhphong08@gmail.com"},
    {"stt": 37, "name": "Lê Văn Sơn", "email": "levanson@gmail.com"},
    {"stt": 38, "name": "Phạm Quỳnh Trang", "email": "phamquynhtrang@gmail.com"},
    {"stt": 39, "name": "Hoàng Tuấn Vũ", "email": "hoangtuanvu@gmail.com"},
    {"stt": 40, "name": "Vũ Hoàng Yến", "email": "vuhoangyen@gmail.com"},
    {"stt": 41, "name": "Đỗ Văn Tuấn", "email": "dovantuan@gmail.com"},
    {"stt": 42, "name": "Nguyễn Minh Anh", "email": "nguyenminhanh08@gmail.com"},
    {"stt": 43, "name": "Trần Văn Hùng", "email": "tranvanhung@gmail.com"},
    {"stt": 44, "name": "Lê Thị Lan", "email": "lethilan@gmail.com"},
    {"stt": 45, "name": "Phạm Văn Minh", "email": "phamvanminh@gmail.com"},
    {"stt": 46, "name": "Đặng Thị Nga", "email": "dangthinga08@gmail.com"},
    {"stt": 47, "name": "Vũ Văn Phương", "email": "vuvanphuong@gmail.com"},
    {"stt": 48, "name": "Hoàng Minh Tâm", "email": "hoangminhtam@gmail.com"},
    {"stt": 49, "name": "Bùi Thị Thùy", "email": "buithithuy@gmail.com"},
    {"stt": 50, "name": "Nguyễn Tiến Dũng", "email": "nguyentiendung08@gmail.com"}
]

DEFAULT_PASSWORD = "Welcome@2026"

def type_slowly(element, text):
    """Mô phỏng gõ phím chậm như người dùng thật để tránh bị hệ thống chặn."""
    for char in text:
        element.send_keys(char)
        time.sleep(random.uniform(0.02, 0.08))

def run_registration(target_url, count_to_register=50, run_headless=True):
    print("==================================================")
    print(" [BOT] AUTO REGISTRATION BOT - EDUTECHVN.ME ")
    print(f" URL muc tieu: {target_url}")
    print(f" So luong dang ky: {count_to_register}")
    print(f" Che do chay: {'Chay ngam (Headless)' if run_headless else 'Hien trinh duyet'}")
    print("==================================================")

    # Đảm bảo đường dẫn URL kết thúc bằng /
    if not target_url.endswith("/"):
        base_url = target_url + "/"
    else:
        base_url = target_url

    register_url = f"{base_url}register"
    results = []

    # Chọn số lượng user muốn đăng ký
    users_subset = USERS_DATA[:count_to_register]

    for index, user in enumerate(users_subset):
        stt = user["stt"]
        name = user["name"]
        email = user["email"]
        
        print(f"\n[#{index+1}/{len(users_subset)}] Bat dau dang ky: STT {stt} - {name} ({email})...")

        # Cấu hình Chrome Driver
        chrome_options = Options()
        if run_headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1280,800")
        
        # User agent ngẫu nhiên
        user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0"
        ]
        chrome_options.add_argument(f"user-agent={random.choice(user_agents)}")

        try:
            driver = webdriver.Chrome(options=chrome_options)
        except Exception as e:
            print(f"   [ERROR] Loi khoi tao trinh duyet Chrome: {e}")
            results.append({"stt": stt, "name": name, "email": email, "status": "Failed", "error": f"Init Chrome failed: {str(e)}"})
            continue

        try:
            # 1. Truy cập trang đăng ký
            driver.get(register_url)
            time.sleep(random.uniform(2.0, 3.5))

            # 2. Chờ form load
            name_input = WebDriverWait(driver, 8).until(
                EC.presence_of_element_located((By.ID, "name"))
            )
            email_input = driver.find_element(By.ID, "email")
            password_input = driver.find_element(By.ID, "password")
            confirm_password_input = driver.find_element(By.ID, "confirmPassword")

            # 3. Điền thông tin
            print(f"   -> Nhap Ho ten: {name}")
            type_slowly(name_input, name)
            time.sleep(random.uniform(0.2, 0.5))

            print(f"   -> Nhap Email: {email}")
            type_slowly(email_input, email)
            time.sleep(random.uniform(0.2, 0.5))

            # Chọn vai trò student nếu có
            try:
                role_elem = driver.find_element(By.ID, "role")
                role_select = Select(role_elem)
                role_select.select_by_value("student")
                print("   -> Da chon vai tro: Student")
                time.sleep(0.3)
            except Exception:
                pass

            print("   -> Nhap mat khau...")
            type_slowly(password_input, DEFAULT_PASSWORD)
            time.sleep(random.uniform(0.2, 0.5))

            print("   -> Nhap lai mat khau...")
            type_slowly(confirm_password_input, DEFAULT_PASSWORD)
            time.sleep(random.uniform(0.3, 0.6))

            # Đồng ý điều khoản nếu có checkbox
            try:
                terms_checkbox = driver.find_element(By.CSS_SELECTOR, "input[type='checkbox']")
                if not terms_checkbox.is_selected():
                    driver.execute_script("arguments[0].click();", terms_checkbox)
                    print("   -> Da chon dong y Dieu khoan")
                    time.sleep(0.3)
            except Exception:
                pass

            # 4. Gửi form
            submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submit_btn)
            time.sleep(0.5)
            
            print("   >>> Click nut Dang ky...")
            submit_btn.click()

            # Chờ xử lý đăng ký và chuyển hướng
            time.sleep(5.0)

            # Kiểm tra trạng thái đăng ký thành công
            current_url = driver.current_url
            print(f"   [INFO] URL hien tai sau dang ky: {current_url}")

            if "login" in current_url or "dashboard" in current_url or "verify" in current_url:
                print(f"   [SUCCESS] Dang ky THANH CONG cho {name}")
                results.append({"stt": stt, "name": name, "email": email, "status": "Success"})
            else:
                error_msg = "Khong xac dinh (Trang khong chuyen huong)"
                try:
                    error_elements = driver.find_elements(By.CSS_SELECTOR, ".alert-danger, .error-message, [class*='error']")
                    for err in error_elements:
                        if err.is_displayed() and err.text.strip():
                            error_msg = err.text.strip()
                            break
                except Exception:
                    pass
                print(f"   [WARNING] Dang ky co the THAT BAI: {error_msg}")
                results.append({"stt": stt, "name": name, "email": email, "status": "Unverified/Failed", "reason": error_msg})

        except Exception as e:
            print(f"   [ERROR] Gap loi khi xu ly: {e}")
            results.append({"stt": stt, "name": name, "email": email, "status": "Failed", "error": str(e)})
        finally:
            driver.quit()

        # Nghỉ giữa các lượt đăng ký
        delay = random.randint(2, 4)
        if index < len(users_subset) - 1:
            print(f"Nghi {delay} giay truoc khi dang ky tai khoan tiep theo...")
            time.sleep(delay)

    # 5. Lưu báo cáo ra file JSON
    report_file = os.path.join(os.path.dirname(__file__), "registration_report.json")
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=4)
    
    print("\n==================================================")
    print(" [COMPLETE] HOAN THANH QUY TRINH DANG KY ")
    success_count = sum(1 for r in results if r["status"] == "Success")
    print(f" Thanh cong: {success_count}/{len(results)}")
    print(f" File bao cao: {report_file}")
    print("==================================================")

if __name__ == "__main__":
    url = "https://www.edutechvn.me/"
    count = 50
    headless = True

    if len(sys.argv) > 1:
        url = sys.argv[1]
    if len(sys.argv) > 2:
        try:
            count = int(sys.argv[2])
        except ValueError:
            pass
    if len(sys.argv) > 3:
        headless = sys.argv[3].lower() != "false"

    run_registration(url, count, headless)
