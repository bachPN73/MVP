import time
import random
import threading
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

# ==================== ACCOUNTS ====================
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

BASE_URL           = "https://www.edutechvn.me"
DEFAULT_CONCURRENT = 8

AI_KEYWORDS = [
    "sinh học tế bào", "quá trình quang hợp", "di truyền Mendel",
    "cấu trúc ADN", "tiến hóa Darwin", "enzyme xúc tác",
    "hệ tuần hoàn máu", "phân bào nguyên phân", "sinh thái học",
    "protein cấu trúc", "hô hấp tế bào", "đột biến gen",
    "chuỗi thức ăn", "hệ miễn dịch", "phản xạ thần kinh",
]

VIEWPORTS = [
    (1366, 768), (1440, 900), (1280, 800),
    (1536, 864), (1920, 1080), (375, 812),   # mobile
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
]

# ==================== EVENT COUNTER ====================
class EventCounter:
    def __init__(self, uid, name):
        self.uid   = uid
        self.name  = name
        self.count = 0

    def rec(self, etype, detail=""):
        self.count += 1
        print(f"   [#{self.uid+1}|E{self.count:02d}] {etype}" + (f" — {detail}" if detail else ""))

# ==================== ANTI-BOT: BUILD STEALTH DRIVER ====================

STEALTH_JS = """
    // Remove webdriver flag
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

    // Fake plugins (real browsers have plugins)
    Object.defineProperty(navigator, 'plugins', {
        get: () => {
            const arr = [1,2,3,4,5];
            arr.item = (i) => arr[i];
            arr.namedItem = (n) => null;
            arr.refresh = () => {};
            return arr;
        }
    });

    // Realistic languages
    Object.defineProperty(navigator, 'languages', {
        get: () => ['vi-VN', 'vi', 'en-US', 'en']
    });

    // Fake chrome object (headless Chrome lacks this)
    if (!window.chrome) {
        window.chrome = { runtime: {}, loadTimes: function(){}, csi: function(){} };
    }

    // Fix permissions query (headless returns different values)
    const origQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (params) =>
        params.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission })
            : origQuery(params);

    // Realistic screen properties
    Object.defineProperty(screen, 'availWidth',  { get: () => window.outerWidth  });
    Object.defineProperty(screen, 'availHeight', { get: () => window.outerHeight });
"""

def build_driver(headless=True):
    """Build a stealth Chrome driver that bypasses most bot detection."""
    opts = Options()

    # ── Anti-detection flags ──────────────────────────────────────────
    opts.add_argument("--disable-blink-features=AutomationControlled")
    opts.add_experimental_option("excludeSwitches", ["enable-automation", "enable-logging"])
    opts.add_experimental_option("useAutomationExtension", False)

    if headless:
        # Use new headless mode (less detectable than old --headless)
        opts.add_argument("--headless=new")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-infobars")
    opts.add_argument("--disable-notifications")
    opts.add_argument("--disable-popup-blocking")
    opts.add_argument("--ignore-certificate-errors")
    opts.add_argument("--log-level=3")
    opts.add_argument("--silent")

    # Randomize viewport
    w, h = random.choice(VIEWPORTS)
    opts.add_argument(f"--window-size={w},{h}")

    # Randomize user-agent
    ua = random.choice(USER_AGENTS)
    opts.add_argument(f"user-agent={ua}")

    # Extra realism flags
    opts.add_argument("--lang=vi-VN")
    opts.add_argument("--accept-lang=vi-VN,vi,en-US,en")

    driver = webdriver.Chrome(options=opts)

    # Inject stealth JS before every page load
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": STEALTH_JS})

    # Set realistic accept-language header
    driver.execute_cdp_cmd("Network.enable", {})
    driver.execute_cdp_cmd("Network.setExtraHTTPHeaders", {
        "headers": {
            "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        }
    })

    return driver

# ==================== DETECTION CHECKS ====================

BLOCK_SIGNALS = [
    "captcha", "robot", "verify you are human", "access denied",
    "cloudflare", "just a moment", "ddos", "challenge", "blocked",
    "403", "too many requests", "bot detected",
]

def is_blocked(driver) -> bool:
    """Check if the current page is a bot/captcha/block page."""
    try:
        title = driver.title.lower()
        body  = driver.find_element(By.TAG_NAME, "body").text.lower()[:500]
        combined = title + " " + body
        for signal in BLOCK_SIGNALS:
            if signal in combined:
                return True
        return False
    except Exception:
        return False

def handle_blocked(driver, ev: EventCounter, url: str) -> bool:
    """
    If bot detection triggered, wait then retry once.
    Returns True if recovered, False if still blocked.
    """
    ev.rec("🚫 blocked", f"Bot detection on {url}")
    # Wait like a real user confused by the page
    time.sleep(random.uniform(5, 10))

    # Try pressing Escape (dismiss some overlays)
    try:
        ActionChains(driver).send_keys(Keys.ESCAPE).perform()
        time.sleep(1)
    except Exception:
        pass

    # Reload once
    try:
        driver.refresh()
        time.sleep(random.uniform(4, 7))
        if not is_blocked(driver):
            ev.rec("✅ recovered", "Block cleared after refresh")
            return True
    except Exception:
        pass

    ev.rec("⚠️ skip", f"Still blocked on {url}, skipping step")
    return False

def safe_get(driver, ev: EventCounter, url: str, wait: float = 3.0) -> bool:
    """Navigate to URL with block detection. Returns False if still blocked."""
    try:
        driver.get(url)
        time.sleep(wait)
        if is_blocked(driver):
            return handle_blocked(driver, ev, url)
        return True
    except Exception as e:
        ev.rec("❌ nav_error", str(e)[:60])
        return False

# ==================== PRIMITIVES ====================

def slow_type(el, text):
    """Human-like typing with variable speed."""
    for c in text:
        el.send_keys(c)
        time.sleep(random.uniform(0.06, 0.13))

def human_mouse_path(driver, el):
    """
    Move mouse to element via a curved path (not straight line).
    Bypasses some bot detectors that track mouse movement linearity.
    """
    try:
        size   = el.size
        loc    = el.location
        end_x  = loc['x'] + size['width']  // 2
        end_y  = loc['y'] + size['height'] // 2
        # Move through 3 random intermediate points
        ac = ActionChains(driver)
        for _ in range(3):
            mid_x = random.randint(max(0, end_x - 200), end_x + 200)
            mid_y = random.randint(max(0, end_y - 100), end_y + 100)
            ac.move_by_offset(
                mid_x - (end_x + 400) // 2,
                mid_y - (end_y + 200) // 2
            ).pause(random.uniform(0.05, 0.15))
        ac.move_to_element(el).pause(random.uniform(0.1, 0.3))
        ac.perform()
    except Exception:
        pass

def safe_click(driver, el, ev: EventCounter, label="click"):
    """Scroll → move mouse naturally → click. Handles stale element."""
    try:
        driver.execute_script("arguments[0].scrollIntoView({behavior:'smooth',block:'center'});", el)
        time.sleep(random.uniform(0.4, 0.8))
        human_mouse_path(driver, el)
        ActionChains(driver).move_to_element(el).pause(random.uniform(0.15, 0.35)).click().perform()
        ev.rec("🖱️ click", label)
        time.sleep(random.uniform(0.5, 1.2))
        return True
    except Exception:
        try:
            driver.execute_script("arguments[0].click();", el)
            ev.rec("🖱️ js-click", label)
            time.sleep(0.5)
            return True
        except Exception:
            return False

def scroll_to_pct(driver, ev: EventCounter, pct: float):
    """Scroll to % depth — GA4 fires 'scroll' event at 90%."""
    driver.execute_script(
        f"window.scrollTo({{top: document.body.scrollHeight * {pct}, behavior:'smooth'}});"
    )
    ev.rec("📜 scroll", f"{int(pct*100)}% depth")
    time.sleep(random.uniform(2.0, 3.5))

def read_page(driver, ev: EventCounter, label: str, duration: float):
    """
    Simulate reading: scroll through 25→50→75→90% milestones.
    90% fires GA4 enhanced measurement 'scroll' event.
    Guarantees minimum engagement time of at least 15s to prevent bounce.
    """
    checkpoints = [0.25, 0.50, 0.75, 0.90]
    # Ensure minimum duration to trigger GA4 engagement signal
    actual_duration = max(duration, 15.0)
    chunk = actual_duration / len(checkpoints)
    
    for pct in checkpoints:
        time.sleep(chunk)
        scroll_to_pct(driver, ev, pct)
        time.sleep(random.uniform(1.0, 2.0))
        # Fire dummy mouse move to ensure GA4 captures active engagement
        try:
            ActionChains(driver).move_by_offset(random.randint(-5, 5), random.randint(-5, 5)).perform()
        except Exception:
            pass
            
    ev.rec("⏱️ engaged", f"{label} — {int(actual_duration)}s")

def try_click_any(driver, ev: EventCounter, selectors: list, label: str, max_n=2):
    """Try clicking elements from CSS selectors list. Skip stale/invisible elements."""
    found = 0
    for sel in selectors:
        if found >= max_n:
            break
        try:
            els = [e for e in driver.find_elements(By.CSS_SELECTOR, sel)
                   if e.is_displayed() and e.is_enabled()]
            if els:
                el  = random.choice(els[:6])
                txt = el.text.strip()[:25] or sel
                if safe_click(driver, el, ev, f"{label}: '{txt}'"):
                    found += 1
                    time.sleep(random.uniform(0.8, 1.5))
        except Exception:
            pass
    return found

def hover_row(driver, selectors: list, count=3):
    """Hover over visible elements — mouseover events."""
    for sel in selectors:
        try:
            els = [e for e in driver.find_elements(By.CSS_SELECTOR, sel) if e.is_displayed()]
            if not els:
                continue
            picks = random.sample(els, min(count, len(els)))
            for el in picks:
                try:
                    ActionChains(driver).move_to_element(el).pause(random.uniform(0.2, 0.5)).perform()
                    time.sleep(random.uniform(0.1, 0.3))
                except Exception:
                    pass
            return  # done
        except Exception:
            pass

def wait_for_page(driver, timeout=15):
    """Wait until document.readyState is complete."""
    try:
        WebDriverWait(driver, timeout).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        time.sleep(random.uniform(1.0, 2.0))
    except Exception:
        pass

# ==================== STEP 1: ARRIVE + BROWSE HOMEPAGE ====================

def arrive_and_browse_home(driver, acc, ev: EventCounter):
    """
    ALWAYS land on homepage first via Google/Facebook/direct,
    browse it for 15–20s, and then we will transition to login.
    """
    source = random.choices(["google", "facebook", "direct"], weights=[40, 20, 40], k=1)[0]

    # Force navigate to homepage URL inside these flows
    if source == "google":
        ev.rec("🔍 source", "Google Search")
        ok = safe_get(driver, ev, "https://www.google.com/", wait=3)
        if ok and not is_blocked(driver):
            try:
                box = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "q")))
                slow_type(box, "edutechvn học liệu sinh học")
                time.sleep(random.uniform(0.5, 1.0))
                box.send_keys(Keys.RETURN)
                time.sleep(random.uniform(3, 5))
                links = driver.find_elements(By.CSS_SELECTOR, "a[href*='edutechvn.me']")
                if links:
                    driver.execute_script("arguments[0].click();", links[0])
                    wait_for_page(driver)
                    time.sleep(3)
                    if not is_blocked(driver):
                        ev.rec("📄 page_view", "/ homepage (via Google)")
                        read_page(driver, ev, "homepage", duration=random.uniform(15, 20))
                        return
            except Exception:
                pass
        ev.rec("⚠️ fallback", "Google failed → Direct Homepage")
        safe_get(driver, ev, f"{BASE_URL}/", wait=4)

    elif source == "facebook":
        ev.rec("📘 source", "Facebook")
        safe_get(driver, ev, f"{BASE_URL}/?utm_source=facebook&utm_medium=social", wait=4)

    else:
        ev.rec("🌐 source", "Direct")
        safe_get(driver, ev, f"{BASE_URL}/", wait=3)

    ev.rec("📄 page_view", "/ homepage")
    if is_blocked(driver):
        handle_blocked(driver, ev, BASE_URL)
        return

    # Browse homepage before going to login
    read_page(driver, ev, "homepage", duration=random.uniform(15, 20))
    hover_row(driver, ["nav a", "header a", "button", "[class*='cta']"], count=4)

# ==================== STEP 2: LOGIN VIA LINK FROM HOMEPAGE ====================

def do_login(driver, acc, ev: EventCounter) -> bool:
    """
    Must transition from homepage to login by clicking a link on the homepage.
    """
    login_clicked = False
    try:
        # Search for login link/button on the homepage
        login_links = [e for e in driver.find_elements(
            By.CSS_SELECTOR,
            "a[href*='/login'], button[class*='login'], [class*='sign-in'], [class*='dang-nhap'], a[href='/login']"
        ) if e.is_displayed()]
        
        if login_links:
            # Click the actual element on the homepage
            safe_click(driver, login_links[0], ev, "click Login link on homepage")
            login_clicked = True
            wait_for_page(driver)
            time.sleep(random.uniform(2, 4))
    except Exception as e:
        ev.rec("⚠️ search_login_link_error", str(e)[:50])

    # Fallback only if the link click failed to navigate
    if not login_clicked or "/login" not in driver.current_url:
        ev.rec("⚠️ fallback", "Direct navigation to /login")
        if not safe_get(driver, ev, f"{BASE_URL}/login", wait=3):
            return False

    ev.rec("📄 page_view", "/login")

    # Check if blocked (CAPTCHA on login page)
    if is_blocked(driver):
        if not handle_blocked(driver, ev, "/login"):
            return False

    try:
        email_el = WebDriverWait(driver, 12).until(EC.presence_of_element_located((By.ID, "email")))
    except Exception:
        # Try alternative selectors
        try:
            email_el = driver.find_element(By.CSS_SELECTOR,
                "input[type='email'], input[name='email'], input[placeholder*='email' i]")
        except Exception:
            ev.rec("❌ login", "Không tìm thấy form đăng nhập")
            return False

    try:
        pass_el = driver.find_element(By.ID, "password")
    except Exception:
        try:
            pass_el = driver.find_element(By.CSS_SELECTOR,
                "input[type='password'], input[name='password']")
        except Exception:
            ev.rec("❌ login", "Không tìm thấy ô mật khẩu")
            return False

    # Type with human-like pace
    safe_click(driver, email_el, ev, "focus email input")
    slow_type(email_el, acc["email"])
    time.sleep(random.uniform(0.5, 1.0))

    safe_click(driver, pass_el, ev, "focus password input")
    slow_type(pass_el, acc["pass"])
    time.sleep(random.uniform(0.6, 1.2))

    # Find submit button
    try:
        btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    except Exception:
        try:
            btn = driver.find_element(By.CSS_SELECTOR,
                "button[class*='login'], button[class*='submit'], input[type='submit']")
        except Exception:
            ev.rec("❌ login", "Không tìm thấy nút submit")
            return False

    safe_click(driver, btn, ev, "submit login form")
    wait_for_page(driver, timeout=15)
    time.sleep(random.uniform(4, 7))

    # Verify login succeeded (should NOT be on /login anymore)
    current = driver.current_url
    if "/login" in current:
        ev.rec("⚠️ login_check", "Vẫn còn ở /login — thử lại sau 3s")
        time.sleep(3)
        if "/login" in driver.current_url:
            ev.rec("❌ login_fail", "Đăng nhập không thành công")
            return False

    ev.rec("✅ login_ok", f"Đã vào: {driver.current_url[:50]}")
    return True

# ==================== STEP 3: DASHBOARD (~50s, ~10 events) ====================

def visit_dashboard(driver, acc, ev: EventCounter):
    if not safe_get(driver, ev, f"{BASE_URL}/dashboard", wait=4):
        return
    if is_blocked(driver):
        handle_blocked(driver, ev, "/dashboard")
        return

    ev.rec("📄 page_view", "/dashboard")
    hover_row(driver, ["nav a", ".sidebar a", "header a", "[class*='menu'] a"], count=5)
    read_page(driver, ev, "dashboard", duration=random.uniform(35, 45))
    try_click_any(driver, ev,
        ["[class*='card']","[class*='stat']","[class*='widget']","[class*='progress']"],
        label="dashboard card", max_n=2)
    try_click_any(driver, ev,
        ["[role='tab']","[class*='tab']","[class*='filter']"],
        label="dashboard tab", max_n=1)
    # Nav to library via link click
    try_click_any(driver, ev,
        ["nav a[href*='/library']","a[href*='/find-ai']","a[href*='/guide']"],
        label="dashboard nav", max_n=1)
    time.sleep(2)
    driver.back()
    ev.rec("📄 page_view", "/dashboard (back)")
    wait_for_page(driver)
    time.sleep(random.uniform(3, 4))

# ==================== STEP 4: LIBRARY DEEP (~100s, ~20 events per visit) ====================

MATERIAL_SELS = [
    "a[href*='/material/']",
    "[class*='material-card'] a",
    "[class*='lesson-card'] a",
    "[class*='card'] a[href*='/']",
    "[class*='item'] a[href]",
]

def read_material(driver, acc, ev: EventCounter, material_idx: int):
    """Click + read 1 material: 60–90s, ~10 events. Handles stale elements."""
    # Re-fetch materials after possible back navigation
    materials = []
    for sel in MATERIAL_SELS:
        try:
            found = [e for e in driver.find_elements(By.CSS_SELECTOR, sel) if e.is_displayed()]
            if found:
                materials = found
                break
        except Exception:
            pass

    if not materials:
        ev.rec("⚠️ warn", "Không thấy học liệu — đọc trang library")
        read_page(driver, ev, "library fallback", duration=random.uniform(40, 55))
        return

    idx    = material_idx % len(materials)
    target = materials[idx]
    title  = (target.text.strip()[:40] or f"Học liệu #{idx+1}")

    ev.rec("📄 page_view", f"/material/ '{title}'")
    if not safe_click(driver, target, ev, f"open material: '{title}'"):
        ev.rec("⚠️ skip", "Không click được học liệu")
        return

    wait_for_page(driver)
    time.sleep(random.uniform(3, 5))

    # Check if redirected to login (session expired)
    if "/login" in driver.current_url:
        ev.rec("⚠️ session", "Bị redirect về login — bỏ qua bước này")
        return

    # Check block
    if is_blocked(driver):
        handle_blocked(driver, ev, "/material/")
        return

    # Read material 60–90s
    read_duration = random.uniform(60, 90)
    ev.rec("📖 reading", f"'{title}' {int(read_duration)}s")
    read_page(driver, ev, f"material '{title}'", duration=read_duration)

    # Click action buttons
    try_click_any(driver, ev,
        ["button[class*='like']","button[class*='fav']","[class*='bookmark']",
         "button[aria-label]","[role='tab']","[class*='tab']","[class*='chapter']"],
        label="material action", max_n=2)
    time.sleep(random.uniform(2, 3))

    hover_row(driver,
        ["[class*='related'] a","[class*='recommend'] a","a[href*='/material/']"], count=3)
    time.sleep(2)

    # Back to library
    driver.back()
    ev.rec("📄 page_view", "/library (back from material)")
    wait_for_page(driver)
    time.sleep(random.uniform(3, 4))

def visit_library(driver, acc, ev: EventCounter, visit_num: int):
    """Library: 80–100s, ~20 events. Browse + 2 filter clicks + 2 material reads."""
    if not safe_get(driver, ev, f"{BASE_URL}/library", wait=4):
        return
    if is_blocked(driver):
        handle_blocked(driver, ev, "/library")
        return

    ev.rec("📄 page_view", f"/library visit #{visit_num}")
    scroll_to_pct(driver, ev, 0.30)
    time.sleep(random.uniform(2, 3))

    # Click filters
    for sel in ["[class*='filter']","[class*='category']","[class*='subject']",
                "[role='tab']","[class*='chip']","button"]:
        try:
            els = [e for e in driver.find_elements(By.CSS_SELECTOR, sel)
                   if e.is_displayed() and e.is_enabled() and e.text.strip()]
            if len(els) >= 2:
                picks = random.sample(els[:8], min(2, len(els)))
                for el in picks:
                    safe_click(driver, el, ev, f"library filter: '{el.text.strip()[:20]}'")
                    time.sleep(random.uniform(1.5, 2.5))
                break
        except Exception:
            pass

    scroll_to_pct(driver, ev, 0.55)
    time.sleep(random.uniform(2, 3))

    # Read 2 materials
    for i in range(2):
        read_material(driver, acc, ev, material_idx=visit_num * 2 + i)
        if i == 0:
            scroll_to_pct(driver, ev, 0.40)
            time.sleep(random.uniform(2, 3))

    scroll_to_pct(driver, ev, 0.90)
    time.sleep(random.uniform(3, 4))
    ev.rec("✅ library_done", f"Visit #{visit_num}")

# ==================== STEP 5: FIND-AI × 5 (~120s, ~20 events) ====================

INPUT_SELS = [
    "textarea", "input[type='text']", "input[placeholder]",
    "[contenteditable='true']", "input[class*='search']", "input[class*='query']",
]

def visit_find_ai(driver, acc, ev: EventCounter):
    """5 AI searches: each = click + submit + 30s wait + scroll 90%. ~120s, ~20 events."""
    if not safe_get(driver, ev, f"{BASE_URL}/find-ai", wait=4):
        return
    if is_blocked(driver):
        handle_blocked(driver, ev, "/find-ai")
        return

    ev.rec("📄 page_view", "/find-ai")
    scroll_to_pct(driver, ev, 0.30)
    time.sleep(2)

    keywords = random.sample(AI_KEYWORDS, 5)

    for i, kw in enumerate(keywords):
        # Find input — retry with multiple selectors
        search_box = None
        for sel in INPUT_SELS:
            try:
                els = [e for e in driver.find_elements(By.CSS_SELECTOR, sel)
                       if e.is_displayed() and e.is_enabled()]
                if els:
                    search_box = els[0]
                    break
            except Exception:
                pass

        if not search_box:
            ev.rec("⚠️ warn", f"Không thấy input AI [{i+1}/5] — chờ 20s")
            time.sleep(20)
            continue

        # Click (focus event)
        safe_click(driver, search_box, ev, f"AI input [{i+1}/5]")

        # Clear + type
        try:
            search_box.send_keys(Keys.CONTROL + "a")
            search_box.send_keys(Keys.DELETE)
        except Exception:
            pass
        time.sleep(0.3)
        slow_type(search_box, kw)
        time.sleep(random.uniform(0.6, 1.0))

        # Submit
        try:
            search_box.send_keys(Keys.RETURN)
        except Exception:
            try:
                btn = driver.find_element(By.CSS_SELECTOR,
                    "button[type='submit'], button[class*='send'], button[class*='search']")
                safe_click(driver, btn, ev, "AI send button")
            except Exception:
                pass

        ev.rec("⌨️ submit", f"AI: '{kw}'")

        # Wait + scroll during AI response
        wait = random.uniform(28, 38)
        time.sleep(wait * 0.4)
        scroll_to_pct(driver, ev, 0.50)
        time.sleep(wait * 0.3)
        scroll_to_pct(driver, ev, 0.90)
        time.sleep(wait * 0.2)

        # Click result if any
        try_click_any(driver, ev,
            ["[class*='result'] a","[class*='source']","button[class*='copy']"],
            label="AI result", max_n=1)

        # Scroll to top for next search
        driver.execute_script("window.scrollTo({top:0,behavior:'smooth'});")
        ev.rec("📜 scroll", "back to top")
        time.sleep(random.uniform(2, 3))

    ev.rec("✅ find_ai_done", "5/5 searches complete")

# ==================== STEP 6: EXTRA PAGE (~40s, ~5 events) ====================

EXTRA_ROUTES = [
    ("/join-school", "🏫 Tham gia trường học"),
    ("/guide-app",   "📘 Hướng dẫn sử dụng"),
    ("/dashboard",   "📊 Bảng điều khiển"),
]

def visit_extra(driver, acc, ev: EventCounter, pricing_done: list):
    """Extra page: 35–45s, no repeated pricing."""
    if not pricing_done and random.random() < 0.15:
        route, label = "/pricing-app", "💰 Bảng giá (1 lần)"
        pricing_done.append(True)
    else:
        route, label = random.choice(EXTRA_ROUTES)

    if not safe_get(driver, ev, f"{BASE_URL}{route}", wait=4):
        return
    if is_blocked(driver):
        handle_blocked(driver, ev, route)
        return

    ev.rec("📄 page_view", route)
    read_page(driver, ev, label, duration=random.uniform(28, 38))
    try_click_any(driver, ev,
        ["[class*='plan']","[class*='cta']","button[class*='primary']",
         "a[class*='btn']","[class*='join']"],
        label="extra CTA", max_n=1)
    time.sleep(random.uniform(5, 8))

# ==================== MAIN SESSION ====================

def simulate_user(user_id, headless=True):
    """
    Session 7–9 phút, 55–84 events, anti-bot stealth:
    ① Homepage + browse 20s
    ② Login via link (không vào /login trực tiếp)
    ③ Dashboard 50s
    ④ Library #1: 2 materials × 75s
    ⑤ Find-AI × 5 searches × 33s
    ④ Library #2: 2 materials × 75s
    ⑥ Extra page 40s
    """
    driver = None
    t0     = time.time()
    acc    = ACCOUNTS[user_id % len(ACCOUNTS)]
    ev     = EventCounter(user_id, acc['name'])
    pricing_done = []

    try:
        driver = build_driver(headless)
        print(f"\n[#{user_id+1} {acc['name']}] ══ SESSION START ══")

        arrive_and_browse_home(driver, acc, ev)
        if not do_login(driver, acc, ev):
            print(f"[#{user_id+1}] ❌ Login failed, ending session.")
            return

        visit_dashboard(driver, acc, ev)
        visit_library(driver, acc, ev, visit_num=1)
        visit_find_ai(driver, acc, ev)
        visit_library(driver, acc, ev, visit_num=2)
        visit_extra(driver, acc, ev, pricing_done)

        elapsed = time.time() - t0
        print(f"[#{user_id+1} {acc['name']}] ══ END: {elapsed/60:.1f} min | {ev.count} events ══")

    except Exception as e:
        elapsed = time.time() - t0
        print(f"[#{user_id+1}] ❌ Fatal error after {elapsed:.0f}s: {e}")
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass

# ==================== RUNNER ====================

def run_bot(total_users=39, concurrent_threads=DEFAULT_CONCURRENT, headless=True):
    print("══════════════════════════════════════════════════════")
    print(" 🤖 SMART TRAFFIC BOT — STEALTH + HIGH METRICS MODE")
    print(f" Tổng phiên          : {total_users}")
    print(f" Active cùng lúc     : {concurrent_threads} sessions")
    print(f" Anti-bot            : Stealth JS, CDP headers, curved mouse, no automation flag")
    print(f" Block detection     : Tự động phát hiện & xử lý CAPTCHA/block")
    print(f" Session             : 7–9 phút | 55–84 events")
    print(f" Library             : 2 visits × 2 materials = 4 Chi tiết học liệu views")
    print(f" AI searches         : 5 lượt × ~33s = ~165s")
    print(f" Bảng giá            : ≤1 lần/session (15%)")
    print(f" Chế độ              : {'🕶️  Headless (new)' if headless else '🖥️  Visible'}")
    print("══════════════════════════════════════════════════════")

    semaphore = threading.Semaphore(concurrent_threads)

    def run_one(uid):
        with semaphore:
            simulate_user(uid, headless)

    threads = [threading.Thread(target=run_one, args=(i,), daemon=True)
               for i in range(total_users)]

    for i, t in enumerate(threads):
        t.start()
        stagger = random.uniform(6, 15)
        print(f"[Main] 🚀 User #{i+1}/{total_users} start, next in {stagger:.1f}s...")
        time.sleep(stagger)

    for t in threads:
        t.join()
    print("\n✅ Campaign complete!")

# ==================== ENTRY POINT ====================

if __name__ == "__main__":
    target_users = 39
    concurrent   = DEFAULT_CONCURRENT
    run_headless = True

    if len(sys.argv) > 1:
        a = sys.argv[1].lower()
        if a in ("true", "false"):
            run_headless = (a == "true")
        else:
            try: target_users = int(a)
            except ValueError: pass

    if len(sys.argv) > 2:
        try: concurrent = int(sys.argv[2])
        except ValueError: pass

    if len(sys.argv) > 3:
        run_headless = sys.argv[3].lower() != "false"

    run_bot(total_users=target_users, concurrent_threads=concurrent, headless=run_headless)
