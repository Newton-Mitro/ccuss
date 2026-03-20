import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class', 'html'],
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './src/**/*.{js,ts,jsx,tsx}',
        '../views/**/*.blade.php',
        '../../vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            fontFamily: {
                sans: ['var(--font-sans)'],
            },
            borderRadius: {
                lg: 'var(--radius-lg)',
                md: 'var(--radius-md)',
                sm: 'var(--radius-sm)',
            },
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',

                card: 'var(--card)',
                'card-foreground': 'var(--card-foreground)',

                primary: 'var(--primary)',
                'primary-foreground': 'var(--primary-foreground)',

                secondary: 'var(--secondary)',
                'secondary-foreground': 'var(--secondary-foreground)',

                accent: 'var(--accent)',
                'accent-foreground': 'var(--accent-foreground)',

                muted: 'var(--muted)',
                'muted-foreground': 'var(--muted-foreground)',

                border: 'var(--border)',
                input: 'var(--input)',
                ring: 'var(--ring)',

                /* 🔥 Sidebar (THIS IS THE IMPORTANT PART) */
                sidebar: 'var(--sidebar)',
                'sidebar-foreground': 'var(--sidebar-foreground)',
                'sidebar-hover': 'var(--sidebar-hover)',
                'sidebar-active': 'var(--sidebar-active)',
                'sidebar-active-foreground': 'var(--sidebar-active-foreground)',
            },
        },
    },
    plugins: [],
};

export default config;
