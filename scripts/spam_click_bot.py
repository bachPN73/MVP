import time
import random
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

def type_slowly(element, text):
    """Simulate realistic slow typing."""
    for char in text:
        element.send_keys(char)
        time.sleep(random.uniform(0.02, 0.08))

def click_element_safely(driver, by, value, timeout=5):
    """Safely wait and click on an element, scrolling it into view first."""
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
        time.sleep(0.5)
        element.click()
        return True
    except Exception as e:
        print(f"⚠️ Không thể click vào phần tử ({by}={value}): {e}")
        return False

def spam_click_in_page(driver, click_interval=2):
    """Find and quickly click elements on the current page to simulate spam clicking."""
    try:
        # Find clickable links and buttons in the main content area
        elements = driver.find_elements(By.CSS_SELECTOR, "main a, main button, a.nav-link, .btn")
        valid_elements = []
        
        for elem in elements:
            try:
                if elem.is_displayed() and elem.is_enabled():
                    text = elem.text.strip()
                    href = elem.get_attribute("href")
                    
                    # Avoid logout or destructive buttons
                    if not text and not elem.get_attribute("aria-label"):
                        continue
                    if any(x in text.lower() for x in ["đăng xuất", "logout", "delete", "xóa", "hủy", "cancel", "deactivate"]):
                        continue
                    
                    valid_elements.append(elem)
            except:
                continue
        
        if not valid_elements:
            # Fallback to any links on page
            elements = driver.find_elements(By.TAG_NAME, "a")
            valid_elements = [e for e in elements if e.is_displayed() and e.is_enabled()]
            
        if valid_elements:
            target_elem = random.choice(valid_elements)
            elem_desc = target_elem.text.strip() or target_elem.get_attribute("aria-label") or target_elem.get_attribute("href") or target_elem.tag_name
            print(f"   ⚡ [Spam Click] Click ngẫu nhiên vào: '{elem_desc[:50]}'")
            
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", target_elem)
            time.sleep(0.5)
            driver.execute_script("arguments[0].click();", target_elem)
            return True
    except Exception as e:
        print(f"   ⚠️ Lỗi click ngẫu nhiên: {e}")
    return False

def run_spam_bot(url, total_duration_min=10, run_headless=True):
    total_seconds = total_duration_min * 60
    print(f"==================================================")
    print(f" 🤖 SPAM CLICK BOT - GIẢ LẬP HỌC LIỆU {total_duration_min} PHÚT ")
    print(f" Đường dẫn đích: {url}")
    print(f" Tổng thời gian chạy: {total_duration_min} phút ({total_seconds} giây)")
    print(f" Chế độ: {'Ẩn danh (Headless)' if run_headless else 'Hiện trình duyệt'}")
    print(f"==================================================")
    
    # Normalize base URL
    if not url.endswith("/"):
        base_url = url + "/"
    else:
        base_url = url

    chrome_options = Options()
    if run_headless:
        chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1280,800")
    
    # Randomize User-Agent
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
        start_time = time.time()
        
        # Step 1: Create a random user profile to register/login
        rand_id = random.randint(10000, 99999)
        test_name = f"Spam User {rand_id}"
        test_email = f"spam_bot_{rand_id}@edutechvn.me"
        test_pass = f"PassSpam{rand_id}!"
        
        # Access Home
        print(f"🌐 1. Truy cập trang chủ: {url}")
        driver.get(url)
        time.sleep(3)
        
        # Try registering to access the content
        print(f"📝 2. Đăng ký tài khoản ảo để vào xem học liệu...")
        driver.get(f"{base_url}register")
        time.sleep(3)
        
        try:
            name_input = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "name")))
            email_input = driver.find_element(By.ID, "email")
            password_input = driver.find_element(By.ID, "password")
            confirm_password_input = driver.find_element(By.ID, "confirmPassword")
            
            type_slowly(name_input, test_name)
            type_slowly(email_input, test_email)
            
            try:
                role_select = Select(driver.find_element(By.ID, "role"))
                role_select.select_by_value("student")
            except:
                pass
                
            type_slowly(password_input, test_pass)
            type_slowly(confirm_password_input, test_pass)
            
            try:
                terms_checkbox = driver.find_element(By.CSS_SELECTOR, "input[type='checkbox']")
                driver.execute_script("arguments[0].click();", terms_checkbox)
            except:
                pass
                
            submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            driver.execute_script("arguments[0].click();", submit_btn)
            print("   👉 Đã gửi form đăng ký, đợi chuyển hướng...")
            time.sleep(5)
        except Exception as reg_err:
            print(f"   ⚠️ Lỗi trong quá trình đăng ký (có thể đã đăng ký hoặc trang khác): {reg_err}")
            
        # Try logging in
        print(f"🔑 3. Đăng nhập hệ thống...")
        driver.get(f"{base_url}login")
        time.sleep(3)
        try:
            email_input = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "email")))
            password_input = driver.find_element(By.ID, "password")
            
            type_slowly(email_input, test_email)
            type_slowly(password_input, test_pass)
            
            submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            driver.execute_script("arguments[0].click();", submit_btn)
            print("   👉 Đã gửi form đăng nhập...")
            time.sleep(5)
        except Exception as log_err:
            print(f"   ⚠️ Lỗi đăng nhập hoặc đã tự động đăng nhập: {log_err}")

        # Navigate to Library
        print(f"📚 4. Vào trang Thư viện học liệu...")
        driver.get(f"{base_url}library")
        time.sleep(4)
        
        # Loop for exactly 10 minutes
        print(f"⏱️ Bắt đầu spam click và học thử học liệu trong {total_duration_min} phút...")
        
        while time.time() - start_time < total_seconds:
            elapsed = int(time.time() - start_time)
            remaining = total_seconds - elapsed
            current_url = driver.current_url
            
            print(f"   [Đã qua: {elapsed}s/{total_seconds}s | Còn lại: {remaining}s] Hiện tại: {current_url}")
            
            # If we are on the library page, click a material
            if "/library" in current_url:
                try:
                    materials = driver.find_elements(By.CSS_SELECTOR, "a[href*='/material/']")
                    if materials:
                        target = random.choice(materials)
                        print(f"   📖 Click vào học liệu: {target.text.strip()}")
                        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", target)
                        time.sleep(1)
                        driver.execute_script("arguments[0].click();", target)
                        time.sleep(4)
                    else:
                        print("   ⚠️ Không tìm thấy học liệu nào trên trang. Thử click dạo...")
                        spam_click_in_page(driver)
                        time.sleep(3)
                except Exception as e:
                    print(f"   ⚠️ Lỗi ở trang thư viện: {e}")
                    time.sleep(3)
                    
            elif "/material/" in current_url:
                # Scroll up and down to simulate reading
                print("   📖 Đang ở trang chi tiết học liệu. Cuộn trang...")
                try:
                    for _ in range(random.randint(2, 4)):
                        scroll_amount = random.randint(200, 600)
                        driver.execute_script(f"window.scrollBy({{top: {scroll_amount}, behavior: 'smooth'}});")
                        time.sleep(random.uniform(1.5, 3.0))
                    
                    # Spam click some tabs or buttons inside material
                    for _ in range(random.randint(2, 5)):
                        spam_click_in_page(driver)
                        time.sleep(random.uniform(1.5, 3.0))
                        
                    # Go back to library
                    print("   ↩️ Trở lại thư viện...")
                    driver.get(f"{base_url}library")
                    time.sleep(3)
                except Exception as e:
                    print(f"   ⚠️ Lỗi ở trang học liệu: {e}")
                    driver.get(f"{base_url}library")
                    time.sleep(3)
            else:
                # If we get navigated elsewhere, try to go back to library
                print("   🧭 Đang ở trang khác. Di chuyển về Thư viện...")
                driver.get(f"{base_url}library")
                time.sleep(4)
                
            # Quick check if time exceeded
            if time.time() - start_time >= total_seconds:
                break
                
            # Random wait between major cycles
            time.sleep(random.uniform(2, 5))
            
        print(f"✅ Hoàn thành chạy bot giả lập học liệu trong {total_duration_min} phút thành công!")
        
    except Exception as e:
        print(f"❌ Có lỗi lớn xảy ra: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    # Target URL
    target_url = "https://www.edutechvn.me/"
    duration_min = 10
    headless = True
    
    if len(sys.argv) > 1:
        target_url = sys.argv[1]
    if len(sys.argv) > 2:
        try:
            duration_min = int(sys.argv[2])
        except ValueError:
            pass
    if len(sys.argv) > 3:
        headless = sys.argv[3].lower() != "false"
        
    run_spam_bot(target_url, duration_min, headless)
