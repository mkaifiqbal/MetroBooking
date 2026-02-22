import { create } from 'zustand';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// check if there's a saved login session
function loadSession() {
    try {
        const saved = localStorage.getItem('metro_auth');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.isLoggedIn) return parsed;
        }
    } catch { /* ignore bad data */ }
    return { isLoggedIn: false, user: null };
}

export const useAuthStore = create((set) => ({
    ...loadSession(),
    login: (username, password) => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const session = { isLoggedIn: true, user: { name: 'Admin', role: 'admin' } };
            localStorage.setItem('metro_auth', JSON.stringify(session));
            set(session);
            return true;
        }
        return false;
    },

    logout: () => {
        localStorage.removeItem('metro_auth');
        set({ isLoggedIn: false, user: null });
    },
}));
