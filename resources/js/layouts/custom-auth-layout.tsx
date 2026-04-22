import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronsDown,
    ChevronsUp,
    LogOut,
    Menu,
    Monitor,
    Moon,
    Search,
    Sun,
    UserCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { route } from 'ziggy-js';
import { Breadcrumbs } from '../components/breadcrumbs';
import { SidebarMenuItem } from '../components/sidebar-menu-item';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { sidebarMenu } from '../data/menus';
import { useAppearance } from '../hooks/use-appearance';
import { edit } from '../routes/profile';
import { BreadcrumbItem, SharedData, SidebarItem } from '../types';

const STORAGE_KEY = 'app_sidebar_open_menus_v1';
const SIDEBAR_SCROLL_KEY = 'app_sidebar_scroll_v1';
const SIDEBAR_OPEN_KEY = 'app_sidebar_open_state_v1';

interface CustomAuthLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function CustomAuthLayout({
    children,
    breadcrumbs,
}: CustomAuthLayoutProps) {
    const page = usePage<SharedData>();

    const { auth, appNameFirst, appNameSecond, appShortTag } = page.props;
    const cleanup = useMobileNavigation();

    /* ------------------------------------------------------------------
     * Sidebar state
     * ------------------------------------------------------------------ */
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
        try {
            const v = localStorage.getItem(SIDEBAR_OPEN_KEY);
            return v ? JSON.parse(v) : true;
        } catch {
            return true;
        }
    });

    const [menuAction, setMenuAction] = useState<
        'expand-all' | 'collapse-all' | null
    >(null);

    const [searchTerm, setSearchTerm] = useState('');

    const THEME_COLORS = [
        { value: 'default', label: 'Default', preview: 'bg-neutral-400' },
        { value: 'blue', label: 'Blue', preview: 'bg-blue-500' },
        { value: 'green', label: 'Green', preview: 'bg-green-500' },
        { value: 'brown', label: 'Brown', preview: 'bg-amber-700' },
        { value: 'violet', label: 'Violet', preview: 'bg-violet-500' },
    ];

    /* ------------------------------------------------------------------
     * Persist sidebar open/close
     * ------------------------------------------------------------------ */
    useEffect(() => {
        localStorage.setItem(SIDEBAR_OPEN_KEY, JSON.stringify(sidebarOpen));
    }, [sidebarOpen]);

    /* ------------------------------------------------------------------
     * Sidebar scroll preservation
     * ------------------------------------------------------------------ */
    const sidebarScrollRef = useRef<HTMLDivElement | null>(null);
    const getInitials = useInitials();
    const { mode, color, updateMode, updateColor } = useAppearance();

    // Save scroll position
    useEffect(() => {
        const el = sidebarScrollRef.current;
        if (!el) return;

        const onScroll = () => {
            localStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop));
        };

        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    // Restore scroll position
    useEffect(() => {
        const el = sidebarScrollRef.current;
        if (!el) return;

        const saved = localStorage.getItem(SIDEBAR_SCROLL_KEY);
        if (!saved) return;

        requestAnimationFrame(() => {
            el.scrollTop = Number(saved);
        });
    }, []);

    /* ------------------------------------------------------------------
     * Expand / Collapse all menus
     * ------------------------------------------------------------------ */
    const applyMenuAction = (action: 'expand-all' | 'collapse-all') => {
        Object.keys(localStorage)
            .filter((k) => k.startsWith(STORAGE_KEY))
            .forEach((k) =>
                localStorage.setItem(
                    k,
                    JSON.stringify(action === 'expand-all'),
                ),
            );

        setMenuAction(action);
        setTimeout(() => setMenuAction(null), 0);
    };

    /* ------------------------------------------------------------------
     * Logout
     * ------------------------------------------------------------------ */
    const handleLogout = () => {
        cleanup();
        localStorage.removeItem(STORAGE_KEY);
        router.post(logout(), {}, { preserveScroll: false });
    };

    /* ------------------------------------------------------------------
     * Sidebar search filter
     * ------------------------------------------------------------------ */
    const filteredMenu = useMemo(() => {
        if (!searchTerm.trim()) return sidebarMenu;

        const filterRecursive = (items: SidebarItem[]): SidebarItem[] =>
            items
                .map((item) => {
                    const children = item.children
                        ? filterRecursive(item.children)
                        : undefined;

                    if (
                        item.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                        (children && children.length)
                    ) {
                        return { ...item, children };
                    }

                    return null;
                })
                .filter(Boolean) as SidebarItem[];

        return filterRecursive(sidebarMenu);
    }, [searchTerm]);

    /* ------------------------------------------------------------------
     * Render
     * ------------------------------------------------------------------ */
    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside
                className={cn(
                    'flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 print:hidden', // flex-col for vertical layout
                    sidebarOpen ? 'w-72' : 'w-16',
                )}
            >
                {/* Logo */}
                <Link
                    href={route('auth.home')}
                    className="flex h-16 items-center gap-2 border-b pl-3"
                >
                    <img
                        src={import.meta.env.VITE_LOGO_PATH}
                        className="h-10 w-10 rounded-full border border-border bg-card p-1"
                    />
                    <span
                        className={cn(
                            'font-semibold transition-opacity',
                            sidebarOpen ? 'inline-block' : 'hidden w-0',
                        )}
                    >
                        <div className="">
                            <h1 className="-mb-1 text-lg font-semibold">
                                <span className="text-primary">
                                    {appNameFirst as string}{' '}
                                </span>
                                <span className="text-sidebar-foreground/90">
                                    {appNameSecond as string}
                                </span>
                            </h1>
                            <p className="text-xs font-light text-sidebar-foreground/70">
                                {appShortTag as string}
                            </p>
                        </div>
                    </span>
                </Link>

                {/* Search + controls */}
                <div
                    className={cn(
                        'flex items-center gap-2 px-4 py-3',
                        !sidebarOpen && 'hidden',
                    )}
                >
                    <div className="flex flex-1 items-center gap-1 rounded border px-2 py-1">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background text-sm outline-none"
                        />
                    </div>
                    <div className="">
                        <button
                            onClick={() => applyMenuAction('expand-all')}
                            className="rounded p-1 hover:bg-muted"
                            title="Expand all"
                        >
                            <ChevronsDown size={18} />
                        </button>
                        <button
                            onClick={() => applyMenuAction('collapse-all')}
                            className="rounded p-1 hover:bg-muted"
                            title="Collapse all"
                        >
                            <ChevronsUp size={18} />
                        </button>
                    </div>
                </div>

                {/* Menu */}

                <nav
                    ref={sidebarScrollRef}
                    className="flex-1 overflow-y-auto px-2 pb-4" // flex-1 takes remaining space
                >
                    <ul className="space-y-0 transition-all duration-300 ease-in-out">
                        {filteredMenu.map((item, index) => (
                            <SidebarMenuItem
                                key={`${item.name}-${index}`}
                                item={item}
                                sidebarOpen={sidebarOpen}
                                menuAction={menuAction}
                            />
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                {sidebarOpen && (
                    <div
                        className={cn(
                            'mt-auto flex flex-col border-t border-border bg-secondary px-4 py-3 transition-colors',
                            !sidebarOpen && 'items-center',
                        )}
                    >
                        {/* User Info */}
                        <Link
                            href={'/settings/profile'}
                            className={cn(
                                'group flex w-full items-center justify-center gap-3 rounded p-2 transition-colors',
                                !sidebarOpen && 'justify-center',
                            )}
                        >
                            {sidebarOpen && (
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-sm font-medium hover:underline">
                                        {auth?.user?.name}
                                    </span>
                                    <span className="text-xs text-sidebar-foreground/70">
                                        {auth?.user?.email}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className={cn(
                                            'flex items-center gap-2 rounded text-destructive transition-colors hover:underline',
                                            !sidebarOpen && 'justify-center',
                                        )}
                                        title="Logout"
                                    >
                                        <LogOut size={14} />
                                        {sidebarOpen && (
                                            <span className="text-xs">
                                                Log out
                                            </span>
                                        )}
                                    </button>
                                </div>
                            )}
                        </Link>

                        {/* Organization & Branch Info */}
                        {sidebarOpen && (
                            <div className="flex flex-col items-center gap-0.5 px-2 text-xs text-sidebar-foreground/70">
                                <span className="uppercase">
                                    {auth?.user?.organization?.name || 'N/A'}
                                </span>
                                <div className="">
                                    <span className="rounded-full bg-accent px-2 py-0.5">
                                        {auth?.user?.branch?.name || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </aside>

            {/* Main */}
            <div className="flex flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b bg-sidebar px-6 text-sidebar-foreground print:hidden">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen((v) => !v)}
                            className="rounded p-1 hover:bg-muted"
                        >
                            <Menu size={18} />
                        </button>
                        {breadcrumbs && (
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        )}
                    </div>

                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex h-8 w-8 items-center gap-2 rounded-full border border-border bg-card px-2 py-1 transition-colors hover:bg-muted">
                                    <Monitor size={18} />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48">
                                {/* ================= Mode ================= */}
                                <DropdownMenuGroup>
                                    <div className="px-2 py-1 text-xs text-muted-foreground">
                                        Theme Mode
                                    </div>

                                    {[
                                        {
                                            value: 'light',
                                            icon: Sun,
                                            label: 'Light',
                                        },
                                        {
                                            value: 'dark',
                                            icon: Moon,
                                            label: 'Dark',
                                        },
                                        {
                                            value: 'system',
                                            icon: Monitor,
                                            label: 'System',
                                        },
                                    ].map(({ value, icon: Icon, label }) => (
                                        <DropdownMenuItem key={value} asChild>
                                            <button
                                                onClick={() =>
                                                    updateMode(value as any)
                                                }
                                                className={cn(
                                                    'flex w-full items-center justify-between gap-2',
                                                    mode === value &&
                                                        'font-semibold',
                                                )}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Icon size={16} />
                                                    {label}
                                                </span>

                                                {mode === value && (
                                                    <span className="text-xs">
                                                        ✓
                                                    </span>
                                                )}
                                            </button>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                {/* ================= Color ================= */}
                                <DropdownMenuGroup>
                                    <div className="px-2 py-1 text-xs text-muted-foreground">
                                        Theme Color
                                    </div>

                                    {THEME_COLORS.map(
                                        ({ value, label, preview }) => (
                                            <DropdownMenuItem
                                                key={value}
                                                asChild
                                            >
                                                <button
                                                    onClick={() =>
                                                        updateColor(
                                                            value as any,
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex w-full items-center justify-between',
                                                        color === value &&
                                                            'font-semibold',
                                                    )}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {/* 🎯 Color Preview */}
                                                        <span
                                                            className={cn(
                                                                'h-3 w-3 rounded-full border',
                                                                preview,
                                                            )}
                                                        />
                                                        {label}
                                                    </span>

                                                    {color === value && (
                                                        <span className="text-xs">
                                                            ✓
                                                        </span>
                                                    )}
                                                </button>
                                            </DropdownMenuItem>
                                        ),
                                    )}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded px-2 py-1">
                                    <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-border bg-card">
                                        <AvatarImage
                                            src={auth?.user?.avatar}
                                            alt={auth?.user.name}
                                        />
                                        <AvatarFallback className="rounded-lg text-sm text-muted-foreground">
                                            {getInitials(auth?.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={edit()}
                                            preserveScroll
                                            onClick={cleanup}
                                            className="flex gap-2"
                                        >
                                            <UserCircle size={16} />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full gap-2 text-destructive"
                                    >
                                        <LogOut size={16} />
                                        Log out
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    {children}
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            style: {
                                background: 'var(--accent)',
                                color: 'var(--accent-foreground)',
                            },
                            className:
                                'rounded-xl shadow-lg text-accent-foreground bg-accent',
                            success: {
                                style: {
                                    background: 'var(--card)',
                                    color: 'var(--card-foreground)',
                                },
                            },
                            error: {
                                style: {
                                    background: 'var(--card)',
                                    color: 'var(--card-foreground)',
                                },
                            },
                        }}
                    />
                </main>
            </div>
        </div>
    );
}
