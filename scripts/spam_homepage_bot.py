import time
import random
import threading
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains

# Set console encoding to UTF-8 for Windows
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BASE_URL = "https://www.edutechvn.me"
DEFAULT_THREADS = 10  # Number of concurrent browsers

# Realistic user agents
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
    print(f"[Thread #{tid:02d}] {msg}")

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

def visit_homepage(thread_id):
    driver = None
    try:
        driver = build_stealth_driver()
        
        # Decide organic source once for this session
        source = random.choices(["google", "facebook", "direct"], weights=[30, 20, 50], k=1)[0]
        if source == "google":
            url = f"{BASE_URL}/?utm_source=google&utm_medium=organic"
        elif source == "facebook":
            url = f"{BASE_URL}/?utm_source=facebook&utm_medium=social"
        else:
            url = f"{BASE_URL}/"

        log(thread_id, f"🚀 Launching reusable session ({source})...")
        driver.get(url)
        time.sleep(random.uniform(3.0, 5.0))

        # We will perform multiple pageviews (reloads) inside this SINGLE session
        # 10 to 15 pageviews per browser session
        pageviews_to_trigger = random.randint(10, 15)
        log(thread_id, f"🔄 Will trigger {pageviews_to_trigger} pageviews inside this single session.")

        # List of routes to jump to before returning home to force route change tracking
        sub_routes = ["/guide-app", "/join-school", "/library", "/find-ai"]

        for pv in range(pageviews_to_trigger):
            log(thread_id, f"📈 Pageview {pv+1}/{pageviews_to_trigger} (Current URL: {driver.current_url})")
            
            # Stay on the page and interact to ensure GA4 registers active engagement
            read_time = random.uniform(15.0, 20.0)
            checkpoints = [0.3, 0.6, 0.9]
            chunk = read_time / len(checkpoints)
            
            for pct in checkpoints:
                time.sleep(chunk)
                driver.execute_script(f"window.scrollTo({{top: document.body.scrollHeight * {pct}, behavior:'smooth'}});")
                try:
                    ActionChains(driver).move_by_offset(random.randint(-10, 10), random.randint(-10, 10)).perform()
                except:
                    pass

            if pv < pageviews_to_trigger - 1:
                # ── JUMP TO SUBPAGE TO TRIGGER ROUTE CHANGE ──
                target_route = random.choice(sub_routes)
                log(thread_id, f"   ➡️ Navigating to intermediate: {target_route}")
                
                navigated = False
                try:
                    # Attempt to click link first
                    link = driver.find_element(By.CSS_SELECTOR, f"a[href*='{target_route}']")
                    if link.is_displayed():
                        driver.execute_script("arguments[0].scrollIntoView({behavior:'smooth',block:'center'});", link)
                        time.sleep(1.0)
                        ActionChains(driver).move_to_element(link).click().perform()
                        navigated = True
                except:
                    pass

                if not navigated:
                    # Fallback to direct sub-URL navigation
                    driver.get(f"{BASE_URL}{target_route}")
                
                # Wait for subpage load
                time.sleep(random.uniform(3.0, 5.0))

                # ── INTERACT WITH INTERMEDIATE PAGE TO PREVENT BOUNCE ──
                # Scroll to 90% depth and stay for 12-16 seconds
                sub_read_time = random.uniform(12.0, 16.0)
                sub_checkpoints = [0.3, 0.6, 0.9]
                sub_chunk = sub_read_time / len(sub_checkpoints)
                for spct in sub_checkpoints:
                    time.sleep(sub_chunk)
                    driver.execute_script(f"window.scrollTo({{top: document.body.scrollHeight * {spct}, behavior:'smooth'}});")
                    try:
                        # Dummy mouse movements to trigger active status
                        ActionChains(driver).move_by_offset(random.randint(-10, 10), random.randint(-10, 10)).perform()
                    except:
                        pass
                
                # Random interactive click on subpage if any link/button available
                try:
                    sub_els = [e for e in driver.find_elements(By.CSS_SELECTOR, "button, a[class*='btn'], [role='tab']") if e.is_displayed()]
                    if sub_els:
                        el = random.choice(sub_els[:5])
                        ActionChains(driver).move_to_element(el).pause(0.5).perform()
                except:
                    pass

                time.sleep(random.uniform(2.0, 4.0))

                # ── RETURN HOME ──
                log(thread_id, "   ↩️ Returning to Homepage...")
                returned = False
                try:
                    # Attempt click Logo
                    logo = driver.find_element(By.CSS_SELECTOR, "a[href='/'], [class*='logo'] a, [class*='brand'] a")
                    if logo.is_displayed():
                        ActionChains(driver).move_to_element(logo).click().perform()
                        returned = True
                except:
                    pass

                if not returned:
                    driver.get(f"{BASE_URL}/")
                
                time.sleep(random.uniform(3.0, 5.0))

        log(thread_id, f"✅ Reusable session completed! Generated views using loop.")

    except Exception as e:
        log(thread_id, f"❌ Error: {str(e)[:60]}")
    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass

def worker(thread_id, total_views, semaphore):
    while True:
        with semaphore:
            # Atomic decrement of global counter
            global views_left
            if views_left <= 0:
                break
            views_left -= 1
            current_job = total_views - views_left
        
        log(thread_id, f"🔔 Starting job {current_job}/{total_views}")
        visit_homepage(thread_id)
        # Relax between visits
        time.sleep(random.uniform(2.0, 5.0))

if __name__ == "__main__":
    total_views = 50       # Default total target homepage views
    concurrency = DEFAULT_THREADS
    
    if len(sys.argv) > 1:
        try: total_views = int(sys.argv[1])
        except: pass
    if len(sys.argv) > 2:
        try: concurrency = int(sys.argv[2])
        except: pass

    print("══════════════════════════════════════════════════════")
    print(" 🤖 HOMEPAGE BOOSTER BOT (SPAM TRANG CHỦ)")
    print(f" Target Views   : {total_views}")
    print(f" Concurrency    : {concurrency} threads")
    print(f" Bypass Bounce  : Yes (engaged scroll + 15s+ duration)")
    print("══════════════════════════════════════════════════════")

    views_left = total_views
    sem = threading.Semaphore(1)
    
    threads = []
    for i in range(concurrency):
        t = threading.Thread(target=worker, args=(i+1, total_views, sem), daemon=True)
        threads.append(t)
        t.start()
        # Stagger startups slightly
        time.sleep(random.uniform(1.0, 3.0))

    # Wait for all workers
    for t in threads:
        t.join()

    print("\n✅ Booster bot completed all tasks!")
