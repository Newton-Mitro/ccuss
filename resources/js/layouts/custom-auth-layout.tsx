import { cn } from '@/lib/utils';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SidebarMenuItem from '../components/sidebar-menu-item';
import { sidebarMenu } from '../data/sidebar-menu';

export default function CustomAuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        const saved = localStorage.getItem('theme');
        const isDark = saved === 'dark';
        document.documentElement.classList.toggle('dark', isDark);
        return isDark;
    });
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close user menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = (name: string) =>
        setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));

    const toggleTheme = () => {
        setDarkMode((prev) => {
            const newTheme = !prev;
            document.documentElement.classList.toggle('dark', newTheme);
            localStorage.setItem('theme', newTheme ? 'dark' : 'light');
            return newTheme;
        });
    };

    return (
        <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={cn(
                    'flex-shrink-0 border-r transition-all duration-300',
                    sidebarOpen ? 'w-64' : 'w-16',
                    'border-border bg-sidebar text-sidebar-foreground',
                )}
            >
                <div className="flex h-16 items-center gap-2 border-b border-border px-4">
                    <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                    <div
                        className={cn(
                            'font-semibold text-primary transition-opacity duration-300',
                            sidebarOpen
                                ? 'opacity-100'
                                : 'w-0 overflow-hidden opacity-0',
                        )}
                    >
                        CCUSS
                    </div>
                </div>

                <nav className="h-[calc(100%-4rem)] overflow-y-auto px-2 py-4 text-sm">
                    <ul className="space-y-1">
                        {sidebarMenu.map((item) => (
                            <SidebarMenuItem
                                key={item.name}
                                item={item}
                                openMenus={openMenus}
                                toggleMenu={toggleMenu}
                                level={0}
                                sidebarOpen={sidebarOpen}
                            />
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col transition-colors duration-300">
                <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 text-card-foreground">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Menu size={18} />
                        </button>

                        <nav className="flex items-center space-x-1 text-sm font-semibold text-primary">
                            <a href="#" className="hover:underline">
                                Dashboard
                            </a>
                            <span className="text-muted-foreground">/</span>
                            <a href="#" className="hover:underline">
                                Hero Slides
                            </a>
                        </nav>
                    </div>

                    <div
                        className="relative flex items-center gap-3"
                        ref={userMenuRef}
                    >
                        <button
                            onClick={toggleTheme}
                            className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <button
                            onClick={() => setUserMenuOpen((prev) => !prev)}
                            className="flex items-center gap-2 rounded px-2 py-1"
                        >
                            <img
                                src="/logo.png"
                                alt="John Doe"
                                className="h-8 w-8 rounded-full border border-border object-cover p-1 transition-colors hover:bg-muted-foreground"
                            />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute top-full right-0 z-50 mt-2 w-48 rounded border border-border bg-card shadow-lg">
                                <div className="flex flex-col p-2">
                                    <span className="px-3 py-1 text-sm font-medium">
                                        John Doe
                                    </span>
                                    <span className="px-3 py-1 text-xs text-muted-foreground">
                                        john.doe@email.com
                                    </span>
                                    <button className="mt-2 flex items-center gap-2 rounded px-3 py-1 text-sm text-destructive transition-colors hover:bg-muted hover:text-destructive-foreground">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-background p-6 transition-colors">
                    {children}
                </main>
            </div>
        </div>
    );
}
