import time
import random
import sys
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Đảm bảo console Windows hỗ trợ in UTF-8
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Danh sách 4 tài khoản cố định được cung cấp
ACCOUNTS = [
    {"email": "admin@mvp.com", "pass": "Admin123456K@kaS"},
    {"email": "haothienkhuyen71@gmail.com", "pass": "Admin123456K@kaS"},
    {"email": "schooladmin@mvp.com", "pass": "Admin123"},
    {"email": "phamngocback@gmail.com", "pass": "123456Ga"}
]

def fast_interact(driver, actions_count=1000):
    """
    Thực hiện tương tác siêu tốc (click và scroll liên tục với delay rất nhỏ)
    để kích hoạt nhiều sự kiện GA4 nhất có thể trong cùng một session.
    """
    base_url = driver.current_url.split('/login')[0].split('/register')[0].split('/library')[0]
    if not base_url.endswith("/"):
        base_url += "/"

    print(f"   [INFO] Bat dau chuoi {actions_count} tuong tac sieu toc de tao event...")
    
    actions_done = 0
    consecutive_errors = 0

    while actions_done < actions_count:
        try:
            # Random chọn hành động: cuộn trang (40%), click dạo (55%), chuyển trang lớn (5%)
            rand_choice = random.random()
            
            current_url = driver.current_url
            if "login" in current_url or "register" in current_url:
                print("   [WARNING] Bi lac ve trang login/register. Dang tu dong quay lai thu vien...")
                driver.get(f"{base_url}library")
                time.sleep(3)
                continue

            # 1. Hành động CUỘN TRANG (Scroll) - Tạo event scroll và user_engagement
            if rand_choice < 0.40:
                scroll_y = random.randint(-500, 500)
                driver.execute_script(f"window.scrollBy(0, {scroll_y});")
                actions_done += 1
                consecutive_errors = 0
                if actions_done % 100 == 0:
                    print(f"      -> Da hoan thanh {actions_done}/{actions_count} tuong tac...")
                time.sleep(random.uniform(0.1, 0.3))

            # 2. Hành động CLICK DẠO (Click) - Tạo event click
            elif rand_choice < 0.95:
                elements = driver.find_elements(By.CSS_SELECTOR, "main a, main button, aside a")
                valid_elements = []
                
                for elem in elements:
                    try:
                        if elem.is_displayed() and elem.is_enabled():
                            text = elem.text.strip().lower()
                            if any(x in text for x in ["đăng xuất", "logout", "delete", "xóa", "hủy", "cancel", "deactivate"]):
                                continue
                            valid_elements.append(elem)
                    except:
                        continue

                if valid_elements:
                    target = random.choice(valid_elements)
                    driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", target)
                    time.sleep(0.05)
                    driver.execute_script("arguments[0].click();", target)
                    
                    actions_done += 1
                    consecutive_errors = 0
                    if actions_done % 100 == 0:
                        print(f"      -> Da hoan thanh {actions_done}/{actions_count} tuong tac...")
                    time.sleep(random.uniform(0.3, 0.6))
                else:
                    driver.get(f"{base_url}library")
                    time.sleep(2)

            # 3. Hành động CHUYỂN TRANG LỚN - Tạo event page_view
            else:
                if "/library" in current_url:
                    materials = driver.find_elements(By.CSS_SELECTOR, "a[href*='/material/']")
                    if materials:
                        target = random.choice(materials[:10])
                        driver.execute_script("arguments[0].click();", target)
                    else:
                        driver.get(f"{base_url}library")
                else:
                    driver.get(f"{base_url}library")
                
                actions_done += 1
                consecutive_errors = 0
                time.sleep(random.uniform(1.0, 1.8))

        except Exception as e:
            consecutive_errors += 1
            if consecutive_errors > 20:
                print(f"   [ERROR] Gap loi lien tuc ({consecutive_errors} lan): {e}. Dung tuong tac.")
                break
            time.sleep(1)

    print(f"   [SUCCESS] Hoan thanh chuoi tuong tac tren tai khoan nay. Da thuc heit: {actions_done} actions")
    return actions_done

def run_ga_booster(target_url, total_events_target=15000, run_headless=True):
    print("==================================================")
    print(" [BOT] GA EVENT BOOST BOT - MINIMIZE SESSIONS ")
    print(f" URL muc tieu: {target_url}")
    print(f" Muc tieu tong event: {total_events_target}")
    print(f" Chay tren cac tai khoan co san")
    print(f" Che do chay: {'Chay ngam (Headless)' if run_headless else 'Hien trinh duyet'}")
    print("==================================================")

    if not target_url.endswith("/"):
        base_url = target_url + "/"
    else:
        base_url = target_url

    login_url = f"{base_url}login"
    
    # Ước lượng 1 hành động click/scroll sinh ra trung bình 1.5 event GA4
    estimated_events_per_action = 1.5
    total_actions_needed = int(total_events_target / estimated_events_per_action)
    
    remained_actions = total_actions_needed
    successful_accounts = 0

    print(f" [PLAN] Tong so tuong tac can thuc hien: {total_actions_needed}")

    for index, acc in enumerate(ACCOUNTS):
        # Tính số lượng tài khoản còn lại có thể xử lý (tính cả tài khoản hiện tại)
        remained_accounts = len(ACCOUNTS) - index
        
        # Nếu đã hoàn thành đủ số event mục tiêu thì dừng
        if remained_actions <= 0:
            print("\n [INFO] Da dat du so luong tuong tac muc tieu. Dung chuong trinh.")
            break
            
        # Chia đều số tương tác còn lại cho các tài khoản còn lại
        current_target_actions = int(remained_actions / remained_accounts)
        current_target_actions = max(10, current_target_actions) # Tối thiểu 10 tương tác

        email = acc["email"]
        password = acc["pass"]
        
        print(f"\n[Tai khoan #{index+1}/{len(ACCOUNTS)}] Bat dau phien: {email}")
        print(f" -> Muc tieu can tuong tac cua tai khoan nay: {current_target_actions} actions")

        chrome_options = Options()
        if run_headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1280,800")
        
        user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ]
        chrome_options.add_argument(f"user-agent={random.choice(user_agents)}")

        try:
            driver = webdriver.Chrome(options=chrome_options)
        except Exception as e:
            print(f"   [ERROR] Khong the mo Chrome Driver: {e}")
            continue

        try:
            # 1. Đăng nhập
            driver.get(login_url)
            time.sleep(2)

            email_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "email"))
            )
            password_input = driver.find_element(By.ID, "password")

            email_input.send_keys(email)
            password_input.send_keys(password)
            time.sleep(0.5)

            submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            driver.execute_script("arguments[0].click();", submit_btn)
            
            time.sleep(4)
            current_url = driver.current_url

            if "login" in current_url:
                print("   [ERROR] Dang nhap THAT BAI! Bo qua tai khoan nay.")
                driver.quit()
                continue

            print("   [SUCCESS] Dang nhap thanh cong.")
            successful_accounts += 1

            # Điều hướng sang trang thư viện
            driver.get(f"{base_url}library")
            time.sleep(3)

            # 2. Chạy tương tác
            actions_completed = fast_interact(driver, actions_count=current_target_actions)
            
            # Khấu trừ số lượng tương tác đã thực hiện
            remained_actions -= actions_completed
            print(f"   [INFO] Con lai can thuc hien: {max(0, remained_actions)} actions.")

            # 3. Đợi để GA4 gửi nốt event
            print("   [INFO] Dang doi 15 giay de GA4 hoan thanh gui toan bo event...")
            time.sleep(15)

        except Exception as e:
            print(f"   [ERROR] Gap loi trong phien chay cua {email}: {e}")
        finally:
            driver.quit()

        print(f"[Tai khoan #{index+1}] Hoan thanh phien.")
        time.sleep(5)

    print("\n==================================================")
    print(" [COMPLETE] DA HOAN THANH TOAN BO TIEN TRINH GA BOOST ")
    print(f" So tai khoan dang nhap thanh cong: {successful_accounts}/{len(ACCOUNTS)}")
    print(f" So tuong tac con thieu (chua hoan thanh): {max(0, remained_actions)}")
    print("==================================================")

if __name__ == "__main__":
    url = "https://www.edutechvn.me/"
    target_events = 15000
    headless = True

    if len(sys.argv) > 1:
        url = sys.argv[1]
    if len(sys.argv) > 2:
        try:
            target_events = int(sys.argv[2])
        except ValueError:
            pass
    if len(sys.argv) > 3:
        headless = sys.argv[3].lower() != "false"

    run_ga_booster(url, target_events, headless)
