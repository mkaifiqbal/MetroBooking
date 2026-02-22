import { create } from 'zustand';

function getInitialTheme() {
    try {
        const saved = localStorage.getItem('metro_theme');
        if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* ignore */ }
    return 'light';
}

export const useThemeStore = create((set) => ({
    theme: getInitialTheme(),

    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('metro_theme', newTheme); } catch { /* ignore */ }
        document.documentElement.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
    }),

    setTheme: (theme) => {
        try { localStorage.setItem('metro_theme', theme); } catch { /* ignore */ }
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
    }
}));

// set the theme as soon as the page loads so there is no flash
document.documentElement.setAttribute('data-theme', getInitialTheme());
