import { useCallback, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeColor = 'default' | 'blue' | 'green' | 'brown' | 'violet';

const THEME_CLASSES = [
    'theme-default',
    'theme-blue',
    'theme-green',
    'theme-brown',
    'theme-violet',
];

/** Detect system dark mode */
const prefersDark = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/** Cookies helpers */
const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getCookie = (name: string) => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(
        new RegExp('(^| )' + name + '=([^;]+)'),
    );
    return match ? match[2] : '';
};

/** Apply theme to document */
const applyTheme = (mode: ThemeMode, color: ThemeColor) => {
    const isDark = mode === 'dark' || (mode === 'system' && prefersDark());
    const root = document.documentElement;

    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';

    // remove existing theme classes
    root.classList.remove(...THEME_CLASSES);
    root.classList.add(`theme-${color}`);
};

/** Media query listener for system changes */
const mediaQuery = () => {
    if (typeof window === 'undefined') return null;
    return window.matchMedia('(prefers-color-scheme: dark)');
};

/** Initialize theme on app start */
export function initializeTheme() {
    const mode =
        (getCookie('theme_mode') as ThemeMode) ||
        (localStorage.getItem('theme_mode') as ThemeMode) ||
        'system';

    const color =
        (getCookie('theme_color') as ThemeColor) ||
        (localStorage.getItem('theme_color') as ThemeColor) ||
        'default';

    applyTheme(mode, color);

    mediaQuery()?.addEventListener('change', () => {
        applyTheme(mode, color);
    });
}

/** React hook to manage theme */
export function useAppearance() {
    const [mode, setMode] = useState<ThemeMode>(() => {
        return (
            (getCookie('theme_mode') as ThemeMode) ||
            (localStorage.getItem('theme_mode') as ThemeMode) ||
            'system'
        );
    });

    const [color, setColor] = useState<ThemeColor>(() => {
        return (
            (getCookie('theme_color') as ThemeColor) ||
            (localStorage.getItem('theme_color') as ThemeColor) ||
            'default'
        );
    });

    // Apply theme whenever mode or color changes
    useEffect(() => {
        applyTheme(mode, color);
    }, [mode, color]);

    // Listen to system theme changes
    useEffect(() => {
        const mq = mediaQuery();
        if (!mq) return;

        const handler = () => applyTheme(mode, color);
        mq.addEventListener('change', handler);

        return () => mq.removeEventListener('change', handler);
    }, [mode, color]);

    const updateMode = useCallback((newMode: ThemeMode) => {
        setMode(newMode);
        localStorage.setItem('theme_mode', newMode);
        setCookie('theme_mode', newMode);
    }, []);

    const updateColor = useCallback((newColor: ThemeColor) => {
        setColor(newColor);
        localStorage.setItem('theme_color', newColor);
        setCookie('theme_color', newColor);
    }, []);

    return { mode, color, updateMode, updateColor } as const;
}
