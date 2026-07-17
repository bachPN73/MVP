import time
import random
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Danh sách tài khoản subscriber
ACCOUNTS = [
    {"email": "haothienkhuyen71@gmail.com", "pass": "Admin123456K@kaS"},
    {"email": "schooladmin@mvp.com", "pass": "Admin123"},
    {"email": "lamta1988@gmial.com", "pass": "Admin123456K@kaS"}
]

BASE_URL = "https://www.edutechvn.me/"

def slow_scroll(driver, max_scrolls=3):
    """Mô phỏng hành vi cuộn trang chậm rãi để đọc nội dung"""
    for _ in range(max_scrolls):
        scroll_amount = random.randint(200, 600)
        driver.execute_script(f"window.scrollBy({{top: {scroll_amount}, left: 0, behavior: 'smooth'}});")
        time.sleep(random.uniform(1.5, 3.5))

def human_interact(driver, min_actions=28, max_actions=35, target_duration_minutes=10):
    """
    Tương tác theo hành vi thực tế ~30 actions/phien.
    """
    target_actions = random.randint(min_actions, max_actions)
    target_seconds = target_duration_minutes * 60
    
    # Tính thời gian chờ trung bình cho mỗi action để rải đều trong 10 phút
    avg_sleep_per_action = target_seconds / target_actions
    
    print(f"   [INFO] Thuc hien {target_actions} hanh dong tuong tac rải đều trong ~{target_duration_minutes} phút (avg {avg_sleep_per_action:.1f}s/action)...")

    start_time = time.time()

    for i in range(target_actions):
        try:
            current_url = driver.current_url
            if "login" in current_url or "register" in current_url:
                driver.get(f"{BASE_URL}library")
                time.sleep(3)
                continue

            rand_choice = random.random()

            # 40% cơ hội cuộn trang từ từ
            if rand_choice < 0.40:
                slow_scroll(driver, random.randint(1, 4))

            # 40% cơ hội click vào các thành phần trên trang
            elif rand_choice < 0.80:
                elements = driver.find_elements(By.CSS_SELECTOR, "main a, main button, aside a")
                valid_elements = [el for el in elements if el.is_displayed() and el.is_enabled() and 
                                  not any(x in el.text.strip().lower() for x in ["đăng xuất", "logout", "delete", "xóa"])]
                
                if valid_elements:
                    target = random.choice(valid_elements)
                    driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", target)
                    time.sleep(random.uniform(0.5, 1.5))
                    driver.execute_script("arguments[0].click();", target)
                else:
                    slow_scroll(driver, 1)

            # 20% cơ hội nhảy sang một tài liệu ngẫu nhiên
            else:
                if "/library" in current_url:
                    materials = driver.find_elements(By.CSS_SELECTOR, "a[href*='/material/']")
                    if materials:
                        target = random.choice(materials[:5])
                        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", target)
                        time.sleep(1)
                        driver.execute_script("arguments[0].click();", target)
                    else:
                        driver.get(f"{BASE_URL}library")
                else:
                    driver.get(f"{BASE_URL}library")
                
            # Đợi thời gian ngẫu nhiên dựa trên mức trung bình để tổng phiên đạt target_duration_minutes
            sleep_time = random.uniform(avg_sleep_per_action * 0.6, avg_sleep_per_action * 1.4)
            time.sleep(sleep_time)

            if (i+1) % 5 == 0:
                elapsed = time.time() - start_time
                print(f"      -> Da xong {i+1}/{target_actions} hanh dong... (Đã chạy {elapsed/60:.1f} phút)")

        except Exception as e:
            time.sleep(2)
            pass

    return target_actions

def run_ga_booster(total_sessions=20, run_headless=True):
    print("==================================================")
    print(" [BOT] GA QUALITY TRAFFIC - FIRST USER: FACEBOOK ")
    print(f" Muc tieu tong so PHIEN (Sessions): {total_sessions}")
    print(f" Che do chay: {'Ngam (Headless)' if run_headless else 'Hien thi trinh duyet'}")
    print("==================================================")

    successful_sessions = 0

    for session_id in range(1, total_sessions + 1):
        acc = random.choice(ACCOUNTS)
        email = acc["email"]
        password = acc["pass"]

        print(f"\n[Phien #{session_id}/{total_sessions}] Tai khoan: {email}")

        chrome_options = Options()
        if run_headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1366,768")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option("useAutomationExtension", False)
        
        user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
        ]
        chrome_options.add_argument(f"user-agent={random.choice(user_agents)}")

        driver = None
        try:
            driver = webdriver.Chrome(options=chrome_options)
            
            # Xóa cờ webdriver để GA4 không nhận diện là bot (Bot thường bị GA4 cho vào not set)
            driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
                "source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
            })
            
            # Random chọn nguồn Facebook (l hoặc m) hoặc Google
            source_type = random.choice(["l.facebook.com", "m.facebook.com", "google"])
            
            if source_type in ["l.facebook.com", "m.facebook.com"]:
                # 1A. GHI NHẬN FIRST USER LÀ FACEBOOK.COM / REFERRAL QUA HTTP REFERER
                print(f"   [INFO] Đang thiết lập Nguồn từ {source_type}...")
                driver.get(f"https://{source_type}/")
                time.sleep(2.0)
                
                # Cố tình KHÔNG dùng UTM để GA4 bắt buộc phải tự đọc Referer và phân loại thành l.facebook.com hoặc m.facebook.com
                target_url = f"{BASE_URL}login"
                driver.execute_script(f"""
                    var a = document.createElement('a');
                    a.href = '{target_url}';
                    document.body.appendChild(a);
                    a.click();
                """)
            else:
                # 1B. GHI NHẬN FIRST USER LÀ GOOGLE / ORGANIC
                print("   [INFO] Đang thiết lập Nguồn từ Google Search...")
                driver.get("https://www.google.com/")
                time.sleep(random.uniform(1.5, 3.0))
                
                try:
                    # Tìm ô tìm kiếm của Google và gõ từ khóa
                    from selenium.webdriver.common.keys import Keys
                    search_box = WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.NAME, "q"))
                    )
                    search_box.send_keys("edutechvn")
                    time.sleep(1.0)
                    search_box.send_keys(Keys.RETURN)
                    
                    # Cuộn trang giả vờ đang tìm kiếm kết quả
                    time.sleep(random.uniform(2.0, 4.0))
                    driver.execute_script("window.scrollBy({top: 300, left: 0, behavior: 'smooth'});")
                    time.sleep(2.0)
                    
                    # Bắt buộc click vào kết quả tìm kiếm ĐẦU TIÊN trên Google
                    print("   [INFO] Đang tìm và click vào kết quả tìm kiếm đầu tiên trên Google...")
                    
                    # Trên Google Search, kết quả tự nhiên đầu tiên luôn là thẻ <h3>
                    first_result_h3 = driver.find_element(By.CSS_SELECTOR, "h3")
                    
                    # Lấy thẻ <a> bọc ngoài <h3> để lấy link
                    first_link = first_result_h3.find_element(By.XPATH, "..")
                    
                    driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", first_link)
                    time.sleep(1.0)
                    driver.execute_script("arguments[0].click();", first_link)
                    
                except Exception as e:
                    print(f"   [ERROR] Bị lỗi khi cố gắng click kết quả đầu tiên trên Google: {e}")
            
            # Đợi 8 giây để GA4 load xong và gửi ping đầu tiên
            time.sleep(8.0)

            # 2. Đăng nhập
            if "login" not in driver.current_url:
                driver.get(f"{BASE_URL}login")
                time.sleep(3.0)
                
            print("   [INFO] Đang tiến hành điền form đăng nhập...")
            email_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "email"))
            )
            password_input = driver.find_element(By.ID, "password")

            email_input.send_keys(email)
            password_input.send_keys(password)
            time.sleep(1)

            submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            driver.execute_script("arguments[0].click();", submit_btn)
            time.sleep(random.uniform(4.0, 6.0))

            if "login" in driver.current_url:
                print("   [ERROR] Đăng nhập thất bại. Chuyển sang phiên tiếp theo.")
                continue

            print("   [SUCCESS] Đăng nhập thành công.")

            # 3. Tiến vào thư viện và tương tác
            driver.get(f"{BASE_URL}library")
            time.sleep(random.uniform(3.0, 5.0))

            # Thực hiện khoảng 28 - 35 tương tác như bạn yêu cầu
            human_interact(driver, min_actions=28, max_actions=35)

            successful_sessions += 1
            print("   [INFO] Chờ 15s để GA4 chốt toàn bộ dữ liệu phiên...")
            time.sleep(15) 

            # QUAN TRỌNG: Điều hướng ra khỏi trang để GA4 kịp gửi sự kiện chốt thời gian phiên (user_engagement) qua sendBeacon
            print("   [INFO] Thoát trang để GA4 chốt thời gian tương tác (1s -> ~10m)...")
            driver.get("about:blank")
            time.sleep(5)
            
        except Exception as e:
            print(f"   [ERROR] Phiên {session_id} gặp sự cố: {e}")
        finally:
            if driver:
                driver.quit()

        delay_between_sessions = random.randint(15, 30)
        print(f"[Hoàn thành Phiên #{session_id}] Nghỉ {delay_between_sessions}s trước khi chạy phiên tiếp...")
        time.sleep(delay_between_sessions)

    print("\n==================================================")
    print(" [COMPLETE] ĐÃ HOÀN THÀNH TIẾN TRÌNH TẠO TRAFFIC ")
    print(f" Số phiên (Sessions) thành công: {successful_sessions}/{total_sessions}")
    print("==================================================")

if __name__ == "__main__":
    target_sessions = 20
    headless = False 

    if len(sys.argv) > 1:
        try:
            target_sessions = int(sys.argv[1])
        except ValueError:
            pass
    if len(sys.argv) > 2:
        headless = sys.argv[2].lower() != "false"

    run_ga_booster(target_sessions, headless)