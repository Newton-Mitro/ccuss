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
import { LogOut, Menu, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Breadcrumbs } from '../components/breadcrumbs';
import SidebarMenuItem from '../components/sidebar-menu-item';
import { sidebarMenu } from '../data/sidebar-menu';
import { edit } from '../routes/profile';
import { BreadcrumbItem, SharedData, SidebarItem } from '../types';

interface CustomAuthLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

const STORAGE_KEY = 'app_sidebar_open_menus_v1';

export default function CustomAuthLayout({
    children,
    breadcrumbs,
}: CustomAuthLayoutProps) {
    const page = usePage<SharedData>();
    const url = page.url ?? '';
    const auth = page.props?.auth;

    const cleanup = useMobileNavigation();

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
        try {
            if (typeof window === 'undefined') return true;
            const v = localStorage.getItem('app_sidebar_open_state_v1');
            return v ? JSON.parse(v) : true;
        } catch {
            return true;
        }
    });

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    // --- Restore openMenus on mount ---
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                // ✅ defer to avoid synchronous state update warning
                Promise.resolve().then(() => {
                    setOpenMenus(JSON.parse(raw));
                });
            }
        } catch (e) {
            console.warn('Failed to load sidebar openMenus', e);
        }
    }, []);

    // --- Persist openMenus whenever it changes ---
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(openMenus));
        } catch (e) {
            console.warn('Failed to save sidebar openMenus', e);
        }
    }, [openMenus]);

    // --- Persist sidebar collapse state ---
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(
                'app_sidebar_open_state_v1',
                JSON.stringify(sidebarOpen),
            );
        } catch {
            console.warn('Failed to save sidebar open state');
        }
    }, [sidebarOpen]);

    // --- Auto-open parent menus that contain the active route ---
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const currentPath = String(url).split('?')[0]; // remove query params

        // recursively collect parents containing the active path
        const collectParents = (items: SidebarItem[]): string[] => {
            const activeParents: string[] = [];
            for (const item of items) {
                if (!item) continue;

                // direct match or child match
                const isActive = item.path && currentPath.startsWith(item.path);

                if (item.children && item.children.length > 0) {
                    const childParents = collectParents(item.children);
                    if (childParents.length > 0) {
                        activeParents.push(item.name, ...childParents);
                    }
                }

                if (isActive) {
                    activeParents.push(item.name);
                }
            }
            return activeParents;
        };

        const parents = collectParents(sidebarMenu);

        if (parents.length > 0) {
            // ✅ Use microtask to avoid React "setState in effect" warning
            Promise.resolve().then(() => {
                setOpenMenus((prev) => {
                    const updated = { ...prev };
                    parents.forEach((p) => (updated[p] = true));
                    try {
                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify(updated),
                        );
                    } catch {
                        console.warn('Failed to save sidebar openMenus');
                    }
                    return updated;
                });
            });
        }
    }, [url]);

    const toggleMenu = (name: string) => {
        setOpenMenus((prev) => {
            const updated = { ...prev, [name]: !prev[name] };
            try {
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                }
            } catch {
                console.warn('Failed to save sidebar openMenus');
            }
            return updated;
        });
    };

    const handleLogout = () => {
        cleanup();
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch {
            console.warn('Failed to remove sidebar openMenus');
        }
        router.post(logout(), {}, { preserveScroll: false });
    };

    return (
        <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={cn(
                    'flex-shrink-0 border-r transition-all duration-300',
                    sidebarOpen ? 'w-72' : 'w-16',
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
                    <ul>
                        {sidebarMenu.map((item) => (
                            <SidebarMenuItem
                                key={item.name}
                                item={item}
                                openMenus={openMenus}
                                toggleMenu={toggleMenu}
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
                        {breadcrumbs && (
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* User Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded px-2 py-1 focus:outline-none">
                                    <UserInfo
                                        user={auth?.user}
                                        showEmail={true}
                                    />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                className="w-52 bg-card text-card-foreground"
                            >
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={edit()}
                                            as="button"
                                            prefetch
                                            onClick={cleanup}
                                            className="flex w-full items-center gap-2"
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
                                        data-test="logout-button"
                                        className="flex w-full items-center gap-2 text-destructive hover:text-destructive-foreground"
                                    >
                                        <LogOut size={16} />
                                        Log out
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-background p-2 transition-colors md:p-6">
                    {children}
                    <Toaster
                        position="top-center"
                        reverseOrder={false}
                        gutter={8}
                        containerClassName=""
                        containerStyle={{}}
                        toasterId="default"
                        toastOptions={{
                            // Define default options
                            className: '',
                            duration: 5000,
                            removeDelay: 1000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },

                            // Default options for specific types
                            success: {
                                duration: 3000,
                                iconTheme: {
                                    primary: 'green',
                                    secondary: 'black',
                                },
                            },
                        }}
                    />
                </main>
            </div>
        </div>
    );
}
