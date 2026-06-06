import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./assets/styles/index.css";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { initGA } from "./utils/analytics.ts";

// Initialize Google Analytics
initGA();


// Intercept all fetch requests globally to attach session headers and handle concurrent login logouts
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
    let url = "";
    if (typeof input === 'string') {
        url = input;
    } else if (input instanceof URL) {
        url = input.toString();
    } else if (input && typeof input === 'object' && 'url' in input) {
        url = (input as any).url;
    }

    const isApiRequest = url.includes('/api/');
    const isAuthRoute = url.includes('/api/login') || 
                        url.includes('/api/forgot-password') || 
                        url.includes('/api/reset-password') ||
                        (url.includes('/api/users') && init?.method === 'POST');

    if (isApiRequest && !isAuthRoute) {
        const userStr = localStorage.getItem('edu_tech_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.id && user.sessionToken) {
                    init = init || {};
                    const headers: Record<string, string> = {};
                    if (init.headers) {
                        if (init.headers instanceof Headers) {
                            init.headers.forEach((value, key) => {
                                headers[key] = value;
                            });
                        } else if (Array.isArray(init.headers)) {
                            init.headers.forEach(([key, value]) => {
                                headers[key] = value;
                            });
                        } else {
                            Object.assign(headers, init.headers);
                        }
                    }
                    headers['X-Session-Token'] = user.sessionToken;
                    headers['X-User-Id'] = user.id;
                    init.headers = headers;
                }
            } catch (e) {
                console.error('Error attaching session headers:', e);
            }
        }
    }

    const response = await originalFetch(input, init);

    if (response.status === 401) {
        try {
            const clone = response.clone();
            const data = await clone.json();
            if (data.error === 'SESSION_INVALID') {
                localStorage.removeItem('edu_tech_user');
                window.location.href = '/login?session_expired=true';
            }
        } catch (e) {
            // Not JSON
        }
    }

    return response;
};

import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id';

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <GoogleOAuthProvider clientId={googleClientId}>
                <App />
            </GoogleOAuthProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
