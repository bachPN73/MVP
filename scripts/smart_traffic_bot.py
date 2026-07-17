import time
import random
import threading
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

ACCOUNTS = [
  {"name":"Trần Tuấn Chấn","email":"tuanchan1988@outlook.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Hồ Văn Bình","email":"hovanbinh08@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đỗ Thanh Linh","email":"thanhlinh.do@outlook.com","pass":"EduTech2026@","role":"student"},
  {"name":"Ngô Quỳnh Phong","email":"ngoquynhphong09@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Vũ Văn Phong","email":"vuvanphong01@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Lê Như Linh","email":"lenhulinh2209@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Trần Như Vy","email":"nhuvy.tran09@hotmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Hồ Đức Trang","email":"ductrangho@gmail.com","pass":"EduTech2026@","role":"student"},
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

if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BASE_URL = "https://www.edutechvn.me"

# Tỷ lệ phân bổ traffic lấy cảm hứng từ ảnh bạn cung cấp
ROUTES_WEIGHTS = [
    ("/library", 29),
    ("/login", 20),
    ("/dashboard", 10),
    ("/", 8),
    ("/register", 3),
    ("/pricing-app", 3),
    ("/find-ai", 2),
    ("/join-school", 1.5),
    ("/guide-app", 1.4),
    ("/pricing", 1.3),
]

def get_random_route():
    routes = [r[0] for r in ROUTES_WEIGHTS]
    weights = [r[1] for r in ROUTES_WEIGHTS]
    return random.choices(routes, weights=weights, k=1)[0]

def simulate_user(user_id, headless=True):
    chrome_options = Options()
    if headless:
        chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--log-level=3") # Giảm bớt log rác của Chrome
    
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1"
    ]
    chrome_options.add_argument(f"user-agent={random.choice(user_agents)}")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        
        # Lấy tài khoản theo lượt
        acc = ACCOUNTS[user_id % len(ACCOUNTS)]
        
        # Quyết định nguồn truy cập (Source)
        source_type = random.choice(["google", "facebook", "direct"])
        
        if source_type == "google":
            print(f"[User #{user_id+1} - {acc['name']}] Bắt đầu từ Google Search...")
            driver.get("https://www.google.com/")
            time.sleep(random.uniform(2.0, 3.0))
            try:
                search_box = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.NAME, "q"))
                )
                for char in "edutechvn":
                    search_box.send_keys(char)
                    time.sleep(0.1)
                time.sleep(1.0)
                search_box.send_keys(Keys.RETURN)
                
                time.sleep(random.uniform(2.0, 4.0))
                driver.execute_script("window.scrollBy({top: 300, left: 0, behavior: 'smooth'});")
                time.sleep(2.0)
                
                # Tìm chính xác kết quả có chứa edutechvn.me để tránh click nhầm web khác
                results = driver.find_elements(By.CSS_SELECTOR, "a[href*='edutechvn.me']")
                if results:
                    first_link = results[0]
                    driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", first_link)
                    time.sleep(1.0)
                    driver.execute_script("arguments[0].click();", first_link)
                    time.sleep(5.0)
                else:
                    raise Exception("Không tìm thấy link của edutech trên trang 1 Google")
            except Exception as e:
                print(f"[User #{user_id+1}] ⚠️ Lỗi Google ({e}), dùng URL UTM thay thế để đảm bảo GA nhận là Google.")
                driver.get(f"{BASE_URL}/?utm_source=google&utm_medium=organic")
                time.sleep(3.0)
                
        elif source_type == "facebook":
            print(f"[User #{user_id+1} - {acc['name']}] Bắt đầu từ link Facebook...")
            # Sử dụng utm để backup nếu fbclid bị lỗi
            fb_url = f"{BASE_URL}/?utm_source=facebook&utm_medium=social&fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExRGVQQ0JvdVJSb0UwTHlDeHNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5AebO48ccn0PghKsUv03r1vnjk5e6AxFg4doDatQanxkB_woe36bRP2VY6eA_aem_D9qWr3RNR8uY19vP6_1x5A"
            driver.get(fb_url)
            time.sleep(5.0)
            
        else:
            print(f"[User #{user_id+1} - {acc['name']}] Bắt đầu truy cập trực tiếp...")
            driver.get(f"{BASE_URL}/?utm_source=direct")
            time.sleep(3.0)

        # Chủ động ĐĂNG KÝ
        print(f"[User #{user_id+1}] Chuyển đến trang Đăng Ký...")
        
        # Click điều hướng bằng thẻ <a> để chắc chắn GA giữ nguyên session referer thay vì gõ URL mới
        try:
            driver.execute_script("window.history.pushState({}, '', '/register'); window.dispatchEvent(new Event('popstate'));")
        except:
            driver.get(f"{BASE_URL}/register")
        time.sleep(random.randint(3, 5))
        try:
            name_input = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "name")))
            email_input = driver.find_element(By.ID, "email")
            password_input = driver.find_element(By.ID, "password")
            confirm_password_input = driver.find_element(By.ID, "confirmPassword")
            
            print(f"[User #{user_id+1}] Điền form Đăng Ký...")
            for char in acc["name"]: name_input.send_keys(char); time.sleep(0.05)
            for char in acc["email"]: email_input.send_keys(char); time.sleep(0.05)
            
            try:
                role_select = Select(driver.find_element(By.ID, "role"))
                role_select.select_by_value(acc.get("role", "student"))
                time.sleep(0.5)
            except Exception:
                pass
                
            for char in acc["pass"]: password_input.send_keys(char); time.sleep(0.05)
            for char in acc["pass"]: confirm_password_input.send_keys(char); time.sleep(0.05)
            
            try:
                terms_checkbox = driver.find_element(By.CSS_SELECTOR, "input[type='checkbox']")
                if not terms_checkbox.is_selected():
                    driver.execute_script("arguments[0].click();", terms_checkbox)
                    time.sleep(0.5)
            except Exception:
                pass
            
            submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submit_btn)
            time.sleep(1)
            submit_btn.click()
            time.sleep(random.randint(5, 7))
        except Exception as e:
            print(f"[User #{user_id+1}] ⚠️ Bỏ qua Đăng Ký (có thể lỗi hoặc tài khoản đã tồn tại): {e}")

        # Chủ động đăng nhập ngay từ đầu
        print(f"[User #{user_id+1}] Thực hiện điền form đăng nhập...")
        driver.get(f"{BASE_URL}/login")
        try:
            email_input = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.ID, "email"))
            )
            password_input = driver.find_element(By.ID, "password")
            
            for char in acc["email"]:
                email_input.send_keys(char)
                time.sleep(0.05)
            for char in acc["pass"]:
                password_input.send_keys(char)
                time.sleep(0.05)
                
            submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            driver.execute_script("arguments[0].click();", submit_btn)
            time.sleep(random.uniform(3, 5))
        except Exception:
            print(f"[User #{user_id+1}] Bỏ qua điền form (có thể đã đăng nhập rồi)")

        # Mô phỏng mỗi user sẽ xem từ 4 đến 8 trang (để đạt trung bình ~6 phút/phiên)
        pages_to_visit = random.randint(4, 8)
        print(f"[User #{user_id+1}] Bắt đầu đọc {pages_to_visit} trang...")
        
        for i in range(pages_to_visit):
            route = get_random_route()
            # Bỏ qua /login vì đã đăng nhập rồi
            while route == "/login" or route == "/register":
                route = get_random_route()
                
            target_url = f"{BASE_URL}{route}"
            
            print(f"  -> [User #{user_id+1}] Đang xem: {target_url}")
            driver.get(target_url)
            
            # TƯƠNG TÁC SÂU TRONG THƯ VIỆN
            if route == "/library":
                try:
                    # Chờ thư viện load
                    time.sleep(random.uniform(2, 4))
                    
                    # Cuộn nhẹ vài cái để tìm bài
                    print(f"     [User #{user_id+1}] Cuộn trang để tìm kiếm học liệu...")
                    for _ in range(random.randint(1, 2)):
                        scroll_amount = random.randint(200, 600)
                        driver.execute_script(f"window.scrollBy({{top: {scroll_amount}, behavior: 'smooth'}});")
                        time.sleep(random.uniform(1.5, 3.0))
                    
                    # Tìm học liệu và click
                    materials = driver.find_elements(By.CSS_SELECTOR, "a[href*='/material/']")
                    if materials:
                        target_material = random.choice(materials[:8])
                        material_title = target_material.text.strip() or "Học liệu chi tiết"
                        print(f"     [User #{user_id+1}] 👉 Bấm vào học liệu: '{material_title}'")
                        
                        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", target_material)
                        time.sleep(1.0)
                        driver.execute_script("arguments[0].click();", target_material)
                        
                        # Thời gian đọc bài bên trong học liệu
                        study_time = random.uniform(40, 80)
                        print(f"     [User #{user_id+1}] 💤 Đang tập trung đọc nội dung... Đợi khoảng {int(study_time)} giây.")
                        
                        # Chia nhỏ thời gian để cuộn đọc bài
                        time.sleep(study_time / 3)
                        driver.execute_script("window.scrollBy(0, window.innerHeight / 2);")
                        time.sleep(study_time / 3)
                        driver.execute_script("window.scrollBy(0, window.innerHeight / 3);")
                        time.sleep(study_time / 3)
                        
                        # Hoàn thành đọc học liệu, vòng lặp tự qua route khác
                        continue 
                    else:
                        print(f"     [User #{user_id+1}] ⚠️ Không thấy học liệu nào để click.")
                except Exception as e:
                    print(f"     [User #{user_id+1}] ⚠️ Lỗi khi tương tác trong thư viện: {e}")
            
            # Nếu không phải thư viện (hoặc lỗi), thời gian ở lại trang mô phỏng người thật đọc nội dung (40 - 80s)
            time.sleep(random.uniform(40, 80))
            
            # Mô phỏng cuộn trang nhẹ nhàng để Google Analytics tính là Active
            driver.execute_script("window.scrollBy(0, window.innerHeight / 2);")
            time.sleep(random.uniform(2, 5))
            
    except Exception as e:
        print(f"[User #{user_id}] Lỗi: {e}")
    finally:
        driver.quit()

def run_bot(total_users=50, concurrent_threads=5, headless=True):
    print("==================================================")
    print(" 🤖 BẮT ĐẦU BOT MÔ PHỎNG LƯU LƯỢNG HỢP LÝ")
    print(f" Phân bổ chuẩn theo biểu đồ: Library > Login > Dashboard...")
    print(f" Tổng người dùng: {total_users}")
    print(f" Chạy tuần tự: MỘT TAB DUY NHẤT")
    print(f" Chế độ: {'Ẩn (Headless)' if headless else 'Hiện trình duyệt (Visible)'}")
    print("==================================================")
    
    for i in range(total_users):
        print(f"\n--- Bắt đầu lượt tài khoản {i+1}/{total_users} ---")
        simulate_user(i, headless)
        
        delay = random.uniform(2, 8)
        if i < total_users - 1:
            print(f"💤 Đã xong 1 tab! Chờ {delay:.1f} giây trước khi chạy tài khoản tiếp theo...")
            time.sleep(delay)
        
    print("✅ Đã hoàn thành toàn bộ chiến dịch giả lập traffic!")

if __name__ == "__main__":
    # Mặc định
    target_users = 39
    run_headless = True
    
    # Xử lý tham số truyền vào từ dòng lệnh
    if len(sys.argv) > 1:
        arg1 = sys.argv[1].lower()
        if arg1 == "false":
            run_headless = False
        elif arg1 == "true":
            run_headless = True
        else:
            try:
                target_users = int(arg1)
            except ValueError:
                pass

    run_bot(total_users=target_users, headless=run_headless)
