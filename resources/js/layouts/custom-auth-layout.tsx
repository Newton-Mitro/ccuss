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
import { Breadcrumbs } from '../components/breadcrumbs';
import { SidebarMenuItem } from '../components/sidebar-menu-item';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { sidebarMenu } from '../data/menus';
import { sidebarMenuPermissions } from '../data/permissions';
import { Appearance, useAppearance } from '../hooks/use-appearance';
import { filterMenuByPermission } from '../lib/filter_menu_by_permission';
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
    const auth = page.props?.auth;

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
    const { appearance, updateAppearance } = useAppearance();

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

    const permissionFilteredMenu = filterMenuByPermission(
        sidebarMenu,
        sidebarMenuPermissions,
    );
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
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside
                className={cn(
                    'flex flex-col border-r transition-all duration-300 print:hidden', // flex-col for vertical layout
                    sidebarOpen ? 'w-72' : 'w-16',
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center gap-2 border-b pl-4">
                    <img
                        src="/logo.png"
                        className="h-10 w-10 rounded-full p-1"
                    />
                    <span
                        className={cn(
                            'font-semibold transition-opacity',
                            sidebarOpen ? 'inline-block' : 'hidden w-0',
                        )}
                    >
                        <div className="">
                            <h1 className="-mb-1 text-lg font-semibold">
                                <span className="text-accent"> Unity </span>{' '}
                                Banking
                            </h1>
                            <p className="text-xs text-muted-foreground/50">
                                Core banking & credit solution.
                            </p>
                        </div>
                    </span>
                </div>

                {/* Search + controls */}
                <div
                    className={cn(
                        'my-3 flex items-center gap-2 px-4',
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
                            className="w-full bg-transparent text-sm outline-none"
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
                    <ul className="space-y-0">
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
                <div
                    className={cn(
                        'bg-sidebar-footer mt-auto flex flex-col border-t border-muted/20 px-4 py-3 transition-colors',
                        !sidebarOpen && 'items-center',
                    )}
                >
                    {/* User Info */}
                    <Link
                        href={'/settings/profile'}
                        className={cn(
                            'group flex w-full items-center gap-3 rounded p-2 transition-colors hover:bg-muted/20',
                            !sidebarOpen && 'justify-center',
                        )}
                    >
                        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                            <AvatarImage
                                src={auth?.user?.avatar}
                                alt={auth?.user?.name}
                            />
                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(auth?.user?.name)}
                            </AvatarFallback>
                        </Avatar>
                        {sidebarOpen && (
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-medium group-hover:underline">
                                    {auth?.user?.name}
                                </span>
                                <span className="text-xs text-muted-foreground/70">
                                    {auth?.user?.email}
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Organization & Branch Info */}
                    {sidebarOpen && (
                        <div className="flex flex-col gap-0.5 px-2 text-xs text-muted-foreground/60">
                            <span>
                                Organization:{' '}
                                {auth?.user?.organization?.name || 'N/A'}
                            </span>
                            <span>
                                Branch: {auth?.user?.branch?.name || 'N/A'}
                            </span>
                        </div>
                    )}

                    {/* Settings & Logout */}
                    <div className="mt-1 flex flex-col">
                        <button
                            onClick={handleLogout}
                            className={cn(
                                'flex items-center gap-2 rounded p-2 text-destructive transition-colors hover:bg-destructive/10',
                                !sidebarOpen && 'justify-center',
                            )}
                            title="Logout"
                        >
                            <LogOut size={16} />
                            {sidebarOpen && <span>Log out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b px-6 print:hidden">
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

                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-muted">
                                    <Monitor size={18} />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-36">
                                {['light', 'dark', 'system'].map((mode) => (
                                    <DropdownMenuItem key={mode} asChild>
                                        <button
                                            className={cn(
                                                'flex w-full items-center gap-2',
                                                appearance === mode
                                                    ? 'font-semibold'
                                                    : 'font-normal',
                                            )}
                                            onClick={() =>
                                                updateAppearance(
                                                    mode as Appearance,
                                                )
                                            }
                                        >
                                            {mode === 'light' && (
                                                <Sun size={16} />
                                            )}
                                            {mode === 'dark' && (
                                                <Moon size={16} />
                                            )}
                                            {mode === 'system' && (
                                                <Monitor size={16} />
                                            )}
                                            <span className="capitalize">
                                                {mode}
                                            </span>
                                        </button>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded px-2 py-1">
                                    <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth?.user?.avatar}
                                            alt={auth?.user.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
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

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                    <Toaster position="top-center" />
                </main>
            </div>
        </div>
    );
}
