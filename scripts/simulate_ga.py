import time
import random
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

# Danh sách 40 tài khoản được sinh ngẫu nhiên cực đẹp và tự nhiên (32 Học sinh, 8 Giáo viên)
# Sử dụng chung mật khẩu dễ quản lý: EduTech2026@
CUSTOM_USERS = [
  {"name":"Nguyễn Thanh Bách","email":"nguyenthanhbach1987@gmail.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Phạm Tuấn Vy","email":"phamtuanvy08@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Bùi Đức Khánh","email":"buiduckhanh98@outlook.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đặng Thị Sơn","email":"thisondang@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Ngô Hữu Duy","email":"huuduy.ngo09@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Trần Thị Vy","email":"tranthivy08@outlook.com","pass":"EduTech2026@","role":"student"},
  {"name":"Phan Hoài Vy","email":"phanhoaivy@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Lê Như Sơn","email":"lenhuson08@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Hồ Như Trang","email":"honhutrang@icloud.com","pass":"EduTech2026@","role":"student"},
  {"name":"Lê Hoài Khánh","email":"lehoaikhanh1986@gmail.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Ngô Thanh Duy","email":"thanhduyngo08@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Hoàng Thị Sơn","email":"hoangthison09@hotmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đặng Kim Linh","email":"kimlinhdang@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Lâm Hoài Vy","email":"lamhoaivy1989@outlook.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Trịnh Hữu Phong","email":"trinhhuuphong@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Lê Quỳnh Linh","email":"quynhlinh.le08@icloud.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đặng Hoài Sơn","email":"danghoaison1985@gmail.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Lê Hữu Vy","email":"huuvyle09@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đỗ Khánh Vy","email":"dokhanhvy08@hotmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Vũ Thanh Yến","email":"vuthanhyen@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Trần Quỳnh Vy","email":"tranquynhvy09@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Võ Kim Duy","email":"kimduy.vo@outlook.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đỗ Đức Chấn","email":"doducchan08@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Phạm Thị Duy","email":"phamthiduy09@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Trịnh Quỳnh Trang","email":"trinhquynhtrang1988@outlook.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Lâm Hoài Vy","email":"hoaivylam08@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đặng Thị Hải","email":"dangthihai08@hotmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Phạm Minh Vy","email":"phamminhvy1987@gmail.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Đỗ Quỳnh Phong","email":"doquynhphong09@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đặng Như Yến","email":"nhuyendang@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Vũ Hữu Vy","email":"vuhuuvy1986@outlook.com","pass":"EduTech2026@","role":"teacher"}
]

# Đặt SKIP_REGISTER = False để chạy luồng Đăng ký tài khoản mới lên DB của web
SKIP_REGISTER = False

def simulate_scroll(driver, scroll_count=2):
    """Simulate user scrolling up and down naturally to trigger GA engagement events."""
    try:
        print(f"      ↕ Cuộn trang ({scroll_count} lần) để giả lập đọc...")
        for _ in range(scroll_count):
            # Scroll down
            scroll_amount = random.randint(150, 600)
            driver.execute_script(f"window.scrollBy({{top: {scroll_amount}, behavior: 'smooth'}});")
            time.sleep(random.uniform(1.5, 3.0))
            
            # 30% chance to scroll back up slightly
            if random.random() < 0.3:
                scroll_back = random.randint(50, 150)
                driver.execute_script(f"window.scrollBy({{top: -{scroll_back}, behavior: 'smooth'}});")
                time.sleep(random.uniform(1.0, 2.0))
    except Exception as e:
        print(f"      ⚠️ Lỗi khi cuộn trang: {e}")

def type_slowly(element, text):
    """Mô phỏng gõ phím chậm như người dùng thật."""
    for char in text:
        element.send_keys(char)
        time.sleep(random.uniform(0.04, 0.15))

def click_element_safely(driver, by, value, timeout=5):
    """Click vào một phần tử an toàn, đợi nó sẵn sàng và cuộn màn hình đến."""
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
        time.sleep(1)
        element.click()
        return True
    except Exception as e:
        print(f"⚠️ Không thể click vào phần tử ({by}={value}): {e}")
        return False

def perform_random_clicks_in_main(driver, clicks_count=3):
    """Tìm và click ngẫu nhiên vào các link/nút trong khu vực nội dung chính (thẻ <main>) để tăng tương tác."""
    print(f"   👉 Tương tác click ngẫu nhiên trong nội dung trang ({clicks_count} lần)...")
    for click_idx in range(clicks_count):
        try:
            # Lấy tất cả các thẻ a và button bên trong thẻ main
            elements = driver.find_elements(By.CSS_SELECTOR, "main a, main button")
            valid_elements = []
            
            for elem in elements:
                try:
                    if elem.is_displayed() and elem.is_enabled():
                        text = elem.text.strip()
                        href = elem.get_attribute("href")
                        
                        # Tránh click các nút nguy hiểm như Đăng xuất, Xóa tài khoản, Hủy...
                        if not text and not elem.get_attribute("aria-label"):
                            continue
                        if any(x in text.lower() for x in ["đăng xuất", "logout", "delete", "xóa", "hủy", "cancel", "deactivate"]):
                            continue
                        
                        valid_elements.append(elem)
                except:
                    continue
            
            if not valid_elements:
                print("   ℹ️ Không tìm thấy phần tử click hợp lệ trong vùng nội dung.")
                break
                
            # Chọn ngẫu nhiên một phần tử và click
            target_elem = random.choice(valid_elements)
            elem_desc = target_elem.text.strip() or target_elem.get_attribute("aria-label") or target_elem.tag_name
            print(f"      [Click #{click_idx+1}] Thử click vào: '{elem_desc}'")
            
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", target_elem)
            time.sleep(random.uniform(0.5, 1.2))
            
            # Click bằng JS để tránh lỗi phần tử bị che khuất bởi navbar/layout
            driver.execute_script("arguments[0].click();", target_elem)
            
            # Chờ trang phản hồi và cuộn nhẹ trang
            time.sleep(random.randint(8, 15))
            driver.execute_script(f"window.scrollTo(0, {random.randint(100, 400)});")
            
        except Exception as e:
            print(f"      ⚠️ Lỗi click ngẫu nhiên lần #{click_idx+1}: {e}")
            time.sleep(2)

def run_bot(url, count=40, run_headless=True):
    # Limit count to custom users if SKIP_REGISTER is True to avoid errors
    if SKIP_REGISTER:
        count = min(count, len(CUSTOM_USERS))
        if count == 0:
            print("❌ Không có tài khoản nào trong CUSTOM_USERS khi SKIP_REGISTER = True. Dừng bot.")
            return

    print(f"==================================================")
    print(f" 🤖 GA4 TRAFFIC SIMULATOR BOT - 10 MINS SESSION ")
    print(f" Đường dẫn đích: {url}")
    print(f" Số lượng người dùng giả lập: {count}")
    print(f" Chế độ chạy ẩn: {'BẬT (Headless)' if run_headless else 'TẮT (Hiện trình duyệt)'}")
    print(f" Quy trình: {'Đăng nhập' if SKIP_REGISTER else 'Đăng ký -> Đăng nhập'} -> Tương tác sâu tại Thư viện (10 phút)")
    print(f"==================================================")
    
    # Chuẩn hóa URL — tách base domain khỏi query params (fbclid, utm...) 
    # để các đường dẫn con (/register, /login, /library) được ghép đúng
    from urllib.parse import urlparse
    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}/"

    for i in range(count):
        print(f"\n[Người dùng #{i+1}/{count}] Khởi động trình duyệt sạch session...")
        
        chrome_options = Options()
        if run_headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1280,800")
        
        # Tạo User-Agent ngẫu nhiên
        user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0"
        ]
        chrome_options.add_argument(f"user-agent={random.choice(user_agents)}")
        
        try:
            driver = webdriver.Chrome(options=chrome_options)
        except Exception as e:
            print(f"❌ Không thể khởi tạo Chrome Driver: {e}")
            return

        try:
            # Ghi nhận mốc thời gian bắt đầu của user này
            user_start_time = time.time()
            target_duration = 600  # 10 phút (600 giây)
            
            # Pick from custom users list if available, else fallback to random generation
            if i < len(CUSTOM_USERS):
                user_info = CUSTOM_USERS[i]
                test_name = user_info["name"]
                test_email = user_info["email"]
                test_pass = user_info["pass"]
                test_role = user_info.get("role", "student")
                print(f"[Người dùng #{i+1}] Sử dụng tài khoản cấu hình: {test_email} (Role: {test_role})")
            else:
                rand_id = random.randint(10000, 99999)
                test_name = f"Virtual User {rand_id}"
                test_email = f"ga4_sim_user_{rand_id}@edutechvn.me"
                test_pass = f"PassGA4Sim{rand_id}!"
                test_role = "student"
                print(f"[Người dùng #{i+1}] Sinh ngẫu nhiên tài khoản ảo: {test_email}")
            
            # --- BƯỚC 1: TRUY CẬP TRANG CHỦ ---
            print(f"[Người dùng #{i+1}] 1. Truy cập trang chủ: {url}")
            driver.get(url)
            time.sleep(random.randint(4, 6))
            
            # --- BƯỚC 2: CHUYỂN SANG VÀ ĐIỀN FORM ĐĂNG KÝ ---
            if not SKIP_REGISTER:
                print(f"[Người dùng #{i+1}] 2. Chuyển sang trang Đăng Ký...")
                navigated = False
                for xpath in ["//a[contains(@href, '/register')]", "//a[contains(text(), 'Đăng ký')]", "//a[contains(text(), 'Đăng Ký')]"]:
                    if click_element_safely(driver, By.XPATH, xpath, timeout=3):
                        navigated = True
                        break
                if not navigated:
                    driver.get(f"{base_url}register")
                    
                time.sleep(random.randint(3, 5))
                
                try:
                    name_input = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "name")))
                    email_input = driver.find_element(By.ID, "email")
                    password_input = driver.find_element(By.ID, "password")
                    confirm_password_input = driver.find_element(By.ID, "confirmPassword")
                    
                    print(f"   - Nhập Họ tên: {test_name}")
                    type_slowly(name_input, test_name)
                    time.sleep(random.uniform(0.3, 0.8))
                    
                    print(f"   - Nhập Email: {test_email}")
                    type_slowly(email_input, test_email)
                    time.sleep(random.uniform(0.3, 0.8))
                    
                    try:
                        role_select = Select(driver.find_element(By.ID, "role"))
                        role_select.select_by_value(test_role)
                        print(f"   - Chọn vai trò (Role): {test_role}")
                        time.sleep(0.5)
                    except Exception as role_err:
                        print(f"   ⚠️ Lỗi chọn vai trò {test_role}: {role_err}")
                        
                    print("   - Nhập Mật khẩu...")
                    type_slowly(password_input, test_pass)
                    time.sleep(random.uniform(0.4, 0.8))
                    
                    print("   - Nhập lại Mật khẩu (Xác nhận)...")
                    type_slowly(confirm_password_input, test_pass)
                    time.sleep(random.uniform(0.4, 0.8))
                    
                    try:
                        # Tìm checkbox đồng ý điều khoản
                        terms_checkbox = driver.find_element(By.CSS_SELECTOR, "input[type='checkbox']")
                        if not terms_checkbox.is_selected():
                            print("   - Click chọn đồng ý Điều khoản & Chính sách...")
                            driver.execute_script("arguments[0].click();", terms_checkbox)
                            time.sleep(0.5)
                    except Exception as terms_err:
                        print(f"   ⚠️ Lỗi click checkbox điều khoản: {terms_err}")
                    
                    print("   🚀 Gửi form Đăng ký...")
                    submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                    driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submit_btn)
                    time.sleep(1)
                    submit_btn.click()
                    
                    # Chờ chuyển hướng sau khi đăng ký thành công sang trang Đăng nhập
                    time.sleep(random.randint(5, 7))
                except Exception as e:
                    print(f"   ❌ Lỗi điền form đăng ký: {e}")
            else:
                print(f"[Người dùng #{i+1}] 2. Bỏ qua bước Đăng Ký (SKIP_REGISTER = True)...")
                
            # --- BƯỚC 3: ĐĂNG NHẬP VỚI TÀI KHOẢN VỪA TẠO ---
            print(f"[Người dùng #{i+1}] 3. Chuyển sang trang Đăng Nhập...")
            if "login" not in driver.current_url:
                driver.get(f"{base_url}login")
                time.sleep(random.randint(3, 5))
                
            try:
                email_input = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "email")))
                password_input = driver.find_element(By.ID, "password")
                
                print(f"   - Nhập Email đăng nhập: {test_email}")
                type_slowly(email_input, test_email)
                time.sleep(random.uniform(0.3, 0.8))
                
                print("   - Nhập Mật khẩu...")
                type_slowly(password_input, test_pass)
                time.sleep(random.uniform(0.5, 1.2))
                
                print("   - Gửi form Đăng nhập...")
                submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submit_btn)
                time.sleep(1)
                submit_btn.click()
                
                # Chờ chuyển hướng vào hệ thống (Dashboard)
                time.sleep(random.randint(6, 8))
            except Exception as e:
                print(f"   ❌ Lỗi đăng nhập: {e}")
                
            # --- BƯỚC 4: VÒNG LẶP TƯƠNG TÁC SÂU ĐẠT MỐC 10 PHÚT ---
            print(f"[Người dùng #{i+1}] 4. Bắt đầu vòng lặp tương tác sâu (Mục tiêu: {target_duration} giây)...")
            
            # Điều hướng sang trang Thư viện để bắt đầu luồng học tập chính
            driver.get(f"{base_url}library")
            time.sleep(random.randint(4, 6))
            
            while time.time() - user_start_time < target_duration:
                elapsed = int(time.time() - user_start_time)
                current_url = driver.current_url
                print(f"   ⏱️ [Thời gian: {elapsed}s/{target_duration}s] Đang ở: {current_url}")
                
                if "/library" in current_url:
                    print("      -> Đang ở Thư viện. Tìm kiếm danh sách học liệu...")
                    try:
                        # Simulate scrolling in Library to find materials
                        simulate_scroll(driver, scroll_count=random.randint(1, 3))
                        
                        # Lấy danh sách link bài học chi tiết
                        materials = driver.find_elements(By.CSS_SELECTOR, "a[href*='/material/']")
                        if materials:
                            target_material = random.choice(materials[:8]) # Click các mục đầu tiên
                            material_title = target_material.text.strip() or "Học liệu chi tiết"
                            print(f"      👉 Click chọn bài học: '{material_title}'")
                            
                            # Cuộn tới bài học và click
                            driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", target_material)
                            time.sleep(random.uniform(1.0, 2.0))
                            
                            try:
                                target_material.click()
                            except:
                                driver.execute_script("arguments[0].click();", target_material)
                                
                            time.sleep(random.randint(5, 8)) # Đợi trang chi tiết load
                        else:
                            print("      ⚠️ Không tìm thấy link bài học nào. Thực hiện click dạo và reset về Thư viện...")
                            perform_random_clicks_in_main(driver, clicks_count=2)
                            time.sleep(random.randint(5, 10))
                            driver.get(f"{base_url}library")
                            time.sleep(4)
                    except Exception as lib_err:
                        print(f"      ⚠️ Lỗi thao tác tại thư viện: {lib_err}")
                        time.sleep(5)
                        
                elif "/material/" in current_url:
                    print("      -> Đang đọc bài học. Tiến hành tương tác sâu...")
                    try:
                        # Mô phỏng đọc bài: Cuộn trang chậm rãi lên xuống nhiều lần
                        scroll_times = random.randint(3, 6)
                        for s_idx in range(scroll_times):
                            scroll_y = random.randint(150, 700)
                            print(f"         ↕ Cuộn trang bước {s_idx+1}/{scroll_times} (Xuống {scroll_y}px)...")
                            driver.execute_script(f"window.scrollBy({{top: {scroll_y}, behavior: 'smooth'}});")
                            time.sleep(random.randint(8, 18))
                            
                        # Click ngẫu nhiên các tab học liệu, các nút mở rộng, v.v. trong nội dung bài học
                        perform_random_clicks_in_main(driver, clicks_count=random.randint(2, 4))
                        
                        # Tích lũy thời gian học trên trang này lâu hơn (60s - 150s) để GA ghi nhận tốt nhất
                        study_time = random.randint(60, 150)
                        print(f"         💤 Đang tập trung đọc nội dung học liệu... Nghỉ trong {study_time} giây.")
                        time.sleep(study_time)
                        
                        # Đọc xong thì bấm quay lại Thư viện thông qua sidebar menu
                        print("      -> Học tập xong! Quay lại Thư viện để tìm tài liệu khác...")
                        nav_success = False
                        try:
                            sidebar_library = driver.find_element(By.CSS_SELECTOR, "a[href$='/library']")
                            driver.execute_script("arguments[0].click();", sidebar_library)
                            nav_success = True
                        except:
                            pass
                            
                        if not nav_success:
                            driver.get(f"{base_url}library")
                        time.sleep(random.randint(4, 6))
                        
                    except Exception as mat_err:
                        print(f"      ⚠️ Lỗi tại trang bài học: {mat_err}")
                        driver.get(f"{base_url}library")
                        time.sleep(5)
                else:
                    # Nếu bị lạc sang trang khác (Dashboard, Profile, v.v.)
                    print("      -> Đang ở trang phụ trợ khác. Duyệt thông tin dạo...")
                    try:
                        simulate_scroll(driver, scroll_count=random.randint(1, 3))
                        time.sleep(random.randint(3, 6))
                        perform_random_clicks_in_main(driver, clicks_count=random.randint(1, 2))
                        
                        idle_time = random.randint(8, 15)
                        print(f"         💤 Nghỉ {idle_time} giây trước khi chuyển về Library.")
                        time.sleep(idle_time)
                        
                        print("      -> Quay về Thư viện...")
                        nav_success = False
                        try:
                            sidebar_library = driver.find_element(By.CSS_SELECTOR, "a[href$='/library']")
                            driver.execute_script("arguments[0].click();", sidebar_library)
                            nav_success = True
                        except:
                            pass
                        if not nav_success:
                            driver.get(f"{base_url}library")
                        time.sleep(random.randint(4, 6))
                    except Exception as other_err:
                        print(f"      ⚠️ Lỗi tại trang phụ trợ: {other_err}")
                        driver.get(f"{base_url}library")
                        time.sleep(5)
            
            print(f"✅ [Người dùng #{i+1}] Hoàn thành phiên tương tác chất lượng cao đạt mốc 10 phút.")
            
        except Exception as e:
            print(f"❌ Gặp lỗi trong kịch bản người dùng #{i+1}: {e}")
        finally:
            driver.quit()
            
        # Nghỉ giữa các user
        delay = random.randint(4, 8)
        if i < count - 1:
            print(f"💤 Chờ {delay} giây trước khi khởi động client tiếp theo...")
            time.sleep(delay)

if __name__ == "__main__":
    # Cấu hình mặc định giả lập click từ Facebook
    url = "https://www.edutechvn.me/?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExRGVQQ0JvdVJSb0UwTHlDeHNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5AebO48ccn0PghKsUv03r1vnjk5e6AxFg4doDatQanxkB_woe36bRP2VY6eA_aem_D9qWr3RNR8uY19vP6_1x5A"
    count = 40
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
        
    run_bot(url, count, headless)