import time
import random
import threading
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains

if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BASE_URL = "https://www.edutechvn.me"

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

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
]

STEALTH_JS = """
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['vi-VN', 'vi', 'en-US', 'en'] });
"""

def log(tid, msg):
    print(f"[Bot #{tid:02d}] {msg}")

def build_stealth_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    opts.add_experimental_option("excludeSwitches", ["enable-automation", "enable-logging"])
    opts.add_argument(f"user-agent={random.choice(USER_AGENTS)}")
    opts.add_argument(f"--window-size={random.choice(['1366,768', '1440,900', '1920,1080'])}")
    
    driver = webdriver.Chrome(options=opts)
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": STEALTH_JS})
    return driver

def slow_type(el, text):
    """Giả lập gõ phím từ từ như người thật"""
    for c in text:
        el.send_keys(c)
        time.sleep(random.uniform(0.05, 0.15))

def scroll_and_read(driver, duration=20):
    """Giả lập người dùng cuộn chuột đọc trang để tăng thời gian session (Time on Page)"""
    checkpoints = [0.25, 0.5, 0.75, 0.9, 0.5, 0.2]
    chunk = duration / len(checkpoints)
    for pct in checkpoints:
        time.sleep(chunk)
        try:
            driver.execute_script(f"window.scrollTo({{top: document.body.scrollHeight * {pct}, behavior:'smooth'}});")
            ActionChains(driver).move_by_offset(random.randint(-10, 10), random.randint(-10, 10)).perform()
        except:
            pass

def click_internal_link(driver):
    """Click một link bất kỳ trên trang để chuyển hướng sang trang thứ 2 (Triệt tiêu Bounce Rate)"""
    try:
        links = driver.find_elements(By.CSS_SELECTOR, "a[href^='/'], a[href^='" + BASE_URL + "']")
        valid_links = [link for link in links if link.is_displayed()]
        if valid_links:
            target = random.choice(valid_links)
            try:
                driver.execute_script("arguments[0].scrollIntoView({behavior:'smooth',block:'center'});", target)
                time.sleep(1)
                target.click()
            except:
                driver.execute_script("arguments[0].click();", target)
            return True
    except:
        pass
    return False

def do_login(driver, acc, thread_id):
    """Thực hiện đăng nhập để GA4 ghi nhận là Returning User (Người dùng cũ quay lại)"""
    try:
        email_el = driver.find_element(By.CSS_SELECTOR, "input[type='email'], input[name='email']")
        pass_el = driver.find_element(By.CSS_SELECTOR, "input[type='password'], input[name='password']")
        btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        
        slow_type(email_el, acc['email'])
        time.sleep(0.5)
        slow_type(pass_el, acc['pass'])
        time.sleep(0.5)
        btn.click()
        log(thread_id, f"🔑 Logged in successfully as returning user: {acc['name']}")
        return True
    except Exception as e:
        log(thread_id, f"❌ Login failed: {str(e)[:30]}")
        return False

def bot_session(thread_id, is_returning_user=False):
    driver = build_stealth_driver()
    try:
        if is_returning_user:
            # === Luồng dành cho Người dùng cũ quay lại (Returning User) ===
            acc = random.choice(ACCOUNTS)
            
            # 1. Ưu tiên hạ cánh ở trang chủ để kéo view trang chủ
            landing_routes = ["/", "/", "/", "/library", "/dashboard"]
            route = random.choice(landing_routes)
            url = f"{BASE_URL}{route}"
            log(thread_id, f"Landing on {url} (Returning User: {acc['name']})")
            driver.get(url)
            time.sleep(random.uniform(3, 5))
            
            # 2. Tương tác với trang Landing (đọc nội dung)
            read_time = random.uniform(15, 20)
            log(thread_id, f"Reading landing page for {int(read_time)}s before logging in...")
            scroll_and_read(driver, duration=read_time)
            
            # 3. Điều hướng sang trang Login
            log(thread_id, f"Navigating to login page...")
            try:
                login_links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/login']")
                valid_login_links = [l for l in login_links if l.is_displayed()]
                if valid_login_links:
                    driver.execute_script("arguments[0].scrollIntoView({behavior:'smooth',block:'center'});", valid_login_links[0])
                    time.sleep(1)
                    valid_login_links[0].click()
                else:
                    driver.get(f"{BASE_URL}/login")
            except:
                driver.get(f"{BASE_URL}/login")
                
            time.sleep(random.uniform(3, 5))
            
            # 4. Thực hiện đăng nhập
            do_login(driver, acc, thread_id)
            time.sleep(random.uniform(5, 8)) # Đợi load xong sau khi login
            
        else:
            # === Luồng dành cho Người dùng mới (New User) ===
            # Ưu tiên trang chủ để tăng view mạnh cho trang chủ
            landing_routes = ["/", "/", "/", "/", "/login", "/dashboard", "/library"]
            route = random.choice(landing_routes)
            url = f"{BASE_URL}{route}"
            
            log(thread_id, f"Landed on {url} (New User)")
            driver.get(url)
            time.sleep(random.uniform(3, 5))
            
            # Ở lại trang đích đủ lâu để kích hoạt "Engaged Session"
            read_time = random.uniform(20, 30)
            log(thread_id, f"Reading landing page for {int(read_time)}s...")
            scroll_and_read(driver, duration=read_time)
            
            # Cần chuyển trang để tránh bị đánh giá là Bounce (Thoát)
            log(thread_id, f"Navigating to a second page to eliminate bounce...")
            clicked = click_internal_link(driver)
            
            if not clicked:
                fallback_routes = ["/guide-app", "/join-school", "/", "/", "/find-ai"]
                target = random.choice(fallback_routes)
                driver.get(f"{BASE_URL}{target}")
                
            time.sleep(random.uniform(3, 5))
            
        # Các hành động tiếp theo cho cả 2 luồng (New User / Returning User)
        log(thread_id, f"Arrived at second page: {driver.current_url}")
        read_time = random.uniform(20, 30)
        log(thread_id, f"Reading second page for {int(read_time)}s...")
        scroll_and_read(driver, duration=read_time)
        
        # Thêm vòng lặp để tăng số pageviews (lượt xem trang) lên đều đặn
        extra_pages = random.randint(3, 7) # Xem thêm từ 3 đến 7 trang nữa
        log(thread_id, f"Will browse {extra_pages} more pages to increase pageviews...")
        
        for i in range(extra_pages):
            clicked = click_internal_link(driver)
            if not clicked:
                # Ép bot quay về trang chủ nhiều hơn nếu không tìm thấy link nội bộ
                fallback_routes = ["/", "/", "/", "/guide-app", "/join-school", "/library", "/find-ai", "/dashboard"]
                driver.get(f"{BASE_URL}{random.choice(fallback_routes)}")
                
            time.sleep(random.uniform(3, 5))
            log(thread_id, f"Arrived at page {i+3}: {driver.current_url}")
            scroll_and_read(driver, duration=random.uniform(15, 25))
            
        log(thread_id, f"✅ Session complete (0% bounce rate, total {extra_pages + 2} pages viewed).")
    except Exception as e:
        log(thread_id, f"❌ Error: {str(e)[:50]}")
    finally:
        driver.quit()

def worker(thread_id, total_sessions, semaphore):
    global sessions_left
    global returning_users_left
    while True:
        with semaphore:
            if sessions_left <= 0:
                break
            sessions_left -= 1
            current = total_sessions - sessions_left
            
            # Quyết định xem session này có phải là Returning User không
            is_returning = False
            if returning_users_left > 0:
                is_returning = True
                returning_users_left -= 1
                
        log(thread_id, f"--- Starting session {current}/{total_sessions} ---")
        bot_session(thread_id, is_returning_user=is_returning)
        time.sleep(random.uniform(5, 15)) # Delay giữa các lần mở browser mới

if __name__ == "__main__":
    TOTAL_SESSIONS = 50
    CONCURRENCY = 5
    RETURNING_USERS_TARGET = 15 # 15 người dùng cũ quay lại theo yêu cầu
    
    if len(sys.argv) > 1:
        try: TOTAL_SESSIONS = int(sys.argv[1])
        except: pass
    if len(sys.argv) > 2:
        try: CONCURRENCY = int(sys.argv[2])
        except: pass

    print("==========================================================")
    print(" 📉 ANTI-BOUNCE & SESSION BOOST BOT (GIẢM TỈ LỆ THOÁT)")
    print(f" Total Sessions : {TOTAL_SESSIONS}")
    print(f" Concurrency    : {CONCURRENCY} threads")
    print(f" Returning Users: {RETURNING_USERS_TARGET} sessions sẽ thực hiện Đăng nhập")
    print("==========================================================")

    sessions_left = TOTAL_SESSIONS
    returning_users_left = RETURNING_USERS_TARGET
    sem = threading.Semaphore(1)
    
    threads = []
    for i in range(CONCURRENCY):
        t = threading.Thread(target=worker, args=(i+1, TOTAL_SESSIONS, sem), daemon=True)
        threads.append(t)
        t.start()
        time.sleep(random.uniform(1, 3))
        
    for t in threads:
        t.join()
        
    print("✅ All anti-bounce sessions completed!")
