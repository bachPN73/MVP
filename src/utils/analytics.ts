/**
 * Google Analytics 4 (GA4) Utility
 * Handles dynamic script loading, initialization, pageview tracking, and custom event tracking.
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Declare gtag function on window object for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Dynamically loads the Google Analytics gtag.js script and initializes GA.
 */
export function initGA() {
  if (!GA_MEASUREMENT_ID) {
    console.warn("Google Analytics: VITE_GA_MEASUREMENT_ID is not defined in .env. GA tracking disabled.");
    return;
  }

  // Check if script already exists to prevent duplicates
  if (document.getElementById("google-tag-manager")) {
    return;
  }

  try {
    const script = document.createElement("script");
    script.id = "google-tag-manager";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    // Disable automatic page_view because we track manually on route changes in SPAs
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
    
    console.log("Google Analytics: Initialized successfully with ID", GA_MEASUREMENT_ID);
  } catch (error) {
    console.error("Google Analytics: Failed to initialize", error);
  }
}

/**
 * Tracks a pageview event. Call this on route changes.
 * @param path - The page path (e.g. /library or /dashboard)
 * @param title - The page title
 */
export function trackPageView(path: string, title?: string) {
  if (GA_MEASUREMENT_ID && typeof window.gtag === "function") {
    const configOptions: Record<string, any> = { page_path: path };
    if (title) {
      configOptions.page_title = title;
    }
    window.gtag("config", GA_MEASUREMENT_ID, configOptions);
  }
}

/**
 * Tracks a custom event in Google Analytics.
 * @param action - Event name (e.g. 'click', 'submit_form')
 * @param category - Category (e.g. 'Auth', 'Material')
 * @param label - Optional label (e.g. 'Saved to Vault')
 * @param value - Optional numeric value
 */
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (GA_MEASUREMENT_ID && typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}
