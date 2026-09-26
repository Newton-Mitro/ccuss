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
    Building2,
    CheckCircle2,
    ChevronsDown,
    ChevronsUp,
    Columns2,
    InfoIcon,
    LogOut,
    Monitor,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    Sun,
    TriangleAlert,
    UserCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { route } from 'ziggy-js';
import AppLogo from '../components/app-logo';
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
const SIDEBAR_FLOATING_KEY = 'app_sidebar_floating_v1';

interface CustomAuthLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function CustomAuthLayout({
    children,
    breadcrumbs,
}: CustomAuthLayoutProps) {
    const page = usePage<SharedData>();

    const { auth, organization } = page.props;
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

    const [sidebarFloating, setSidebarFloating] = useState<boolean>(() => {
        try {
            const value = localStorage.getItem(SIDEBAR_FLOATING_KEY);
            return value ? JSON.parse(value) : false;
        } catch {
            return false;
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
     * Logout
     * ------------------------------------------------------------------ */
    const handleLogout = () => {
        cleanup();
        localStorage.removeItem(STORAGE_KEY);
        router.post(logout(), {}, { preserveScroll: false });
    };

    /* ------------------------------------------------------------------
     * Persist sidebar open/close
     * ------------------------------------------------------------------ */
    useEffect(() => {
        localStorage.setItem(SIDEBAR_OPEN_KEY, JSON.stringify(sidebarOpen));
    }, [sidebarOpen]);

    useEffect(() => {
        localStorage.setItem(
            SIDEBAR_FLOATING_KEY,
            JSON.stringify(sidebarFloating),
        );
    }, [sidebarFloating]);

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
        Object.keys(localStorage).forEach((k) =>
            localStorage.setItem(k, JSON.stringify(action === 'expand-all')),
        );

        setMenuAction(action);
        setTimeout(() => setMenuAction(null), 0);
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
        <div className="app-shell relative flex h-screen overflow-hidden bg-background text-foreground">
            {/* Sidebar */}
            <aside
                className={cn(
                    'app-sidebar z-40 flex h-screen shrink-0 flex-col overflow-hidden border-r border-sidebar-border/80 bg-sidebar text-sidebar-foreground transition-all duration-300 print:hidden',
                    sidebarFloating ? 'absolute top-0 left-0' : 'relative',
                    sidebarOpen ? 'w-72' : 'w-16',
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center gap-2 border-b border-sidebar-border/80 bg-linear-to-r from-sidebar to-sidebar/80 pl-3">
                    <Link
                        href={route('dashboard')}
                        className="flex min-w-0 items-center gap-2"
                    >
                        <AppLogo className="h-10 w-10 rounded-full border p-1" />

                        <span
                            className={cn(
                                'font-semibold transition-opacity',
                                sidebarOpen ? 'inline-block' : 'hidden w-0',
                            )}
                        >
                            <div className="">
                                <h1 className="-mb-1 text-lg font-semibold">
                                    <span className="text-primary">
                                        {import.meta.env.VITE_APP_NAME_FIRST}
                                    </span>
                                    <span className="text-sidebar-foreground/90">
                                        {import.meta.env.VITE_APP_NAME_SECOND}
                                    </span>
                                </h1>
                                <p className="text-xs font-light text-sidebar-foreground/70">
                                    {import.meta.env.VITE_APP_SHORT_TAG}
                                </p>
                            </div>
                        </span>
                    </Link>
                    {sidebarOpen && (
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto rounded-lg p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground"
                            aria-label="Close sidebar"
                            title="Close sidebar"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Search + controls */}
                <div
                    className={cn(
                        'flex items-center gap-2 border-b border-sidebar-border/60 px-3 py-3',
                        !sidebarOpen && 'hidden',
                    )}
                >
                    <div className="flex flex-1 items-center gap-1 rounded-xl border border-sidebar-border bg-sidebar/70 px-3 py-2 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent text-sm outline-none placeholder:text-sidebar-foreground/50"
                        />
                    </div>
                    <div className="">
                        <button
                            onClick={() => applyMenuAction('expand-all')}
                            className="rounded-lg p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground"
                            title="Expand all"
                        >
                            <ChevronsDown size={18} />
                        </button>
                        <button
                            onClick={() => applyMenuAction('collapse-all')}
                            className="rounded-lg p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground"
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
                            'mt-auto flex flex-col items-center justify-center border-t border-sidebar-border/80 bg-sidebar/60 px-3 py-3',
                        )}
                    >
                        <div
                            className={cn(
                                'mb-3 flex w-full items-start gap-3 rounded-xl border bg-background/70 px-3 py-2.5 text-left text-sm',
                                organization.active
                                    ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                                    : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
                            )}
                        >
                            {organization.active ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                            ) : (
                                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                            )}
                            <div className="min-w-0">
                                {organization.active ? (
                                    <div className="flex min-w-0 flex-col justify-center">
                                        <p className="truncate leading-tight font-medium">
                                            {organization.active.name}
                                        </p>
                                        <p className="mt-0.5 text-xs opacity-70">
                                            {organization.active.code}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center rounded-md px-2 py-1">
                                        <p className="text-xs font-medium tracking-wide text-red-600 uppercase dark:text-red-400">
                                            No Active Organization
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div
                            className={cn(
                                'group flex w-full items-center justify-center rounded',
                                !sidebarOpen && 'justify-center',
                            )}
                        >
                            {sidebarOpen && (
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <Link
                                        href={'/settings/profile'}
                                        className="flex flex-col items-center justify-center"
                                    >
                                        <span className="text-sm font-medium hover:underline">
                                            {auth?.user?.name}
                                        </span>
                                    </Link>

                                    <div className="text-xs">
                                        <span
                                            className={`rounded-full border px-2 py-0.5 ${
                                                auth?.user?.branch
                                                    ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
                                                    : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
                                            }`}
                                        >
                                            {auth?.user?.branch?.name ||
                                                'Assign User to Branch'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Organization & Branch Info */}
                        {sidebarOpen && (
                            <div className="flex flex-col items-center px-2 text-xs text-sidebar-foreground/70">
                                <div className="pt-2 text-xs text-muted-foreground/90">
                                    {`${import.meta.env.VITE_APP_NAME}` +
                                        ' | ' +
                                        `${import.meta.env.VITE_APP_VERSION}`}
                                </div>
                                <div className="text-center text-[10px] text-muted-foreground/90">
                                    {`© ${new Date().getFullYear()} Denton Studio. All rights reserved.`}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </aside>

            {/* Main */}
            <div
                className={cn(
                    'flex min-w-0 flex-1 flex-col',
                    sidebarFloating && 'md:pl-16',
                )}
            >
                <header className="flex h-16 items-center justify-between border-b border-border/80 bg-sidebar/80 px-4 text-sidebar-foreground backdrop-blur-xl md:px-6 print:hidden">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen((v) => !v)}
                            className="rounded-xl border border-border/70 bg-card/60 p-2 transition-colors hover:bg-muted"
                            aria-label={
                                sidebarOpen ? 'Close sidebar' : 'Open sidebar'
                            }
                        >
                            {sidebarOpen ? (
                                <PanelLeftClose size={18} />
                            ) : (
                                <PanelLeftOpen size={18} />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSidebarFloating((v) => !v)}
                            className="rounded-xl border border-border/70 bg-card/60 p-2 transition-colors hover:bg-muted"
                            aria-label={
                                sidebarFloating
                                    ? 'Use side-by-side sidebar'
                                    : 'Use floating sidebar'
                            }
                            title={
                                sidebarFloating
                                    ? 'Use side-by-side sidebar'
                                    : 'Use floating sidebar'
                            }
                        >
                            <Columns2 size={18} />
                        </button>
                        {breadcrumbs && (
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        )}
                    </div>

                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/70 px-2 py-1 transition-colors hover:bg-muted">
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
                                <button className="flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-muted/70">
                                    <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-border bg-card">
                                        <AvatarImage
                                            src={auth?.user?.avatar}
                                            alt={auth?.user?.name ?? 'User'}
                                        />
                                        <AvatarFallback className="rounded-lg text-sm text-muted-foreground">
                                            {getInitials(auth?.user?.name)}
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
                                            <UserCircle
                                                size={16}
                                                className="text-card-foreground hover:text-primary-foreground"
                                            />
                                            User Profile
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={''}
                                            preserveScroll
                                            onClick={cleanup}
                                            className="flex gap-2"
                                        >
                                            <InfoIcon
                                                size={16}
                                                className="text-card-foreground hover:text-primary-foreground"
                                            />
                                            About
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={''}
                                            preserveScroll
                                            onClick={cleanup}
                                            className="flex gap-2"
                                        >
                                            <InfoIcon
                                                size={16}
                                                className="text-card-foreground hover:text-primary-foreground"
                                            />
                                            What's new?
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={''}
                                            preserveScroll
                                            onClick={cleanup}
                                            className="flex gap-2"
                                        >
                                            <Building2
                                                size={16}
                                                className="text-card-foreground hover:text-primary-foreground"
                                            />
                                            Developer Profile
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

                <main className="app-main flex-1 overflow-auto bg-background/80 p-4 md:p-6">
                    {children}
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            style: {
                                background: 'var(--accent)',
                                color: 'var(--accent-foreground)',
                            },
                            className:
                                'rounded-xl text-accent-foreground bg-accent',
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
