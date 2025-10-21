import { cn } from '@/lib/utils';
import {
    BarChart,
    ChevronDown,
    ChevronRight,
    FileText,
    Home,
    LogOut,
    Menu,
    Moon,
    Settings,
    Sun,
    Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SidebarItem {
    name: string;
    icon?: React.ReactNode;
    path?: string;
    children?: SidebarItem[];
}

const sidebarMenu: SidebarItem[] = [
    { name: 'Dashboard', icon: <Home size={18} />, path: '/dashboard' },
    {
        name: 'Users',
        icon: <Users size={18} />,
        children: [
            { name: 'All Users', path: '/users' },
            { name: 'Add New', path: '/users/create' },
            {
                name: 'Roles & Permissions',
                children: [
                    { name: 'Roles', path: '/users/roles' },
                    { name: 'Permissions', path: '/users/permissions' },
                ],
            },
        ],
    },
    {
        name: 'Reports',
        icon: <FileText size={18} />,
        children: [
            { name: 'Monthly', path: '/reports/monthly' },
            { name: 'Annual', path: '/reports/annual' },
        ],
    },
    { name: 'Analytics', icon: <BarChart size={18} />, path: '/analytics' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/settings' },
];

export default function Dashboard({ children }: { children: React.ReactNode }) {
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
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
        const newTheme = !darkMode;
        setDarkMode(newTheme);
        document.documentElement.classList.toggle('dark', newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    return (
        <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={cn(
                    'flex-shrink-0 border-r border-border bg-card transition-all duration-300',
                    sidebarOpen ? 'w-64' : 'w-16',
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
                        Dashboard
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
                {/* Top Bar */}
                <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <Menu size={18} />
                        </button>

                        {/* Breadcrumb */}
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

                    {/* User Menu */}
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
                                className="h-8 w-8 rounded-full border border-border bg-muted object-cover p-1 transition-colors hover:bg-muted-foreground"
                            />
                        </button>

                        {/* Dropdown */}
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

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-background p-6 transition-colors">
                    {children}
                </main>
            </div>
        </div>
    );
}

function SidebarMenuItem({
    item,
    openMenus,
    toggleMenu,
    level,
    sidebarOpen,
}: {
    item: SidebarItem;
    openMenus: Record<string, boolean>;
    toggleMenu: (name: string) => void;
    level: number;
    sidebarOpen: boolean;
}) {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.name];

    return (
        <li>
            <button
                onClick={() => hasChildren && toggleMenu(item.name)}
                className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors hover:bg-muted',
                    level > 0
                        ? 'pl-6 text-sm text-muted-foreground'
                        : 'font-medium',
                )}
            >
                <div className="flex items-center gap-3">
                    <span className="text-primary">{item.icon}</span>
                    {sidebarOpen && <span>{item.name}</span>}
                </div>

                {hasChildren && sidebarOpen && (
                    <span className="text-muted-foreground">
                        {isOpen ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        )}
                    </span>
                )}
            </button>

            {hasChildren && isOpen && (
                <ul
                    className={cn(
                        'mt-1 ml-2 space-y-1 border-l border-border pl-2 transition-all duration-300',
                        sidebarOpen ? 'block' : 'hidden',
                    )}
                >
                    {item.children?.map((child) => (
                        <SidebarMenuItem
                            key={child.name}
                            item={child}
                            openMenus={openMenus}
                            toggleMenu={toggleMenu}
                            level={level + 1}
                            sidebarOpen={sidebarOpen}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}
