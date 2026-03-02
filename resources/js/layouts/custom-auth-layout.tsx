import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ListCollapse,
    ListPlus,
    LogOut,
    Menu,
    Search,
    UserCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Breadcrumbs } from '../components/breadcrumbs';
import { SidebarMenuItem } from '../components/sidebar-menu-item';
import { sidebarMenu } from '../data/sidebar-menu';
import { edit } from '../routes/profile';
import { BreadcrumbItem, SharedData, SidebarItem } from '../types';

const STORAGE_KEY = 'app_sidebar_open_menus_v1';

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

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
        try {
            const v = localStorage.getItem('app_sidebar_open_state_v1');
            return v ? JSON.parse(v) : true;
        } catch {
            return true;
        }
    });

    const [menuAction, setMenuAction] = useState<
        'expand-all' | 'collapse-all' | null
    >(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        try {
            localStorage.setItem(
                'app_sidebar_open_state_v1',
                JSON.stringify(sidebarOpen),
            );
        } catch {
            console.warn('Failed to save sidebar open state');
        }
    }, [sidebarOpen]);

    const applyMenuAction = (action: 'expand-all' | 'collapse-all') => {
        try {
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
        } catch {
            console.warn('Failed to save sidebar openMenus');
        }
    };

    const handleLogout = () => {
        cleanup();
        localStorage.removeItem(STORAGE_KEY);
        router.post(logout(), {}, { preserveScroll: false });
    };

    /** Recursive filter for sidebar menu by search term */
    const filteredMenu = useMemo(() => {
        if (!searchTerm.trim()) return sidebarMenu;

        const filterRecursive = (items: SidebarItem[]): SidebarItem[] => {
            return items
                .map((item) => {
                    let children: SidebarItem[] | undefined;
                    if (item.children) {
                        children = filterRecursive(item.children);
                    }

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
        };

        return filterRecursive(sidebarMenu);
    }, [searchTerm]);

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside
                className={cn(
                    'flex-shrink-0 border-r transition-all duration-300 print:hidden',
                    sidebarOpen ? 'w-72' : 'w-16',
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center gap-2 border-b px-4">
                    <img src="/logo.png" className="h-8 w-8" />
                    <span
                        className={cn(
                            'font-semibold transition-opacity',
                            sidebarOpen ? 'opacity-100' : 'w-0 opacity-0',
                        )}
                    >
                        CCUSS
                    </span>
                </div>

                {/* Search + Expand/Collapse */}
                <div
                    className={`my-3 flex items-center gap-2 px-2 ${sidebarOpen ? '' : 'hidden'}`}
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
                    <button
                        onClick={() => applyMenuAction('expand-all')}
                        className="rounded p-1 hover:bg-muted"
                        title="Expand All"
                    >
                        <ListPlus size={18} />
                    </button>
                    <button
                        onClick={() => applyMenuAction('collapse-all')}
                        className="rounded p-1 hover:bg-muted"
                        title="Collapse All"
                    >
                        <ListCollapse size={18} />
                    </button>
                </div>

                <nav className="h-[calc(100%-8rem)] overflow-y-auto px-2 pb-4">
                    <ul className="space-y-1">
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

                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded px-2 py-1">
                                    <UserInfo user={auth?.user} showEmail />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={edit()}
                                            as="button"
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
