import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { Link, router } from '@inertiajs/react';
import { LogOut, Menu, UserCircle } from 'lucide-react';
import { useState } from 'react';
import AppearanceToggleTab from '../components/appearance-tabs';
import SidebarMenuItem from '../components/sidebar-menu-item';
import { sidebarMenu } from '../data/sidebar-menu';
import { edit } from '../routes/profile';
import { User } from '../types';

interface CustomAuthLayoutProps {
    children: React.ReactNode;
    user?: User;
}

export default function CustomAuthLayout({
    children,
    user = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@email.com',
        avatar: '/logo.png',
        email_verified_at: null,
        created_at: '2023-03-12T09:32:56.000000Z',
        updated_at: '2023-03-12T09:32:56.000000Z',
    },
}: CustomAuthLayoutProps) {
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const cleanup = useMobileNavigation();

    const toggleMenu = (name: string) =>
        setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));

    const handleLogout = () => {
        cleanup();
        router.post(logout(), {}, { preserveScroll: false });
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
                    <ul className="">
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

                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <AppearanceToggleTab />

                        {/* User Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded px-2 py-1 focus:outline-none">
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-8 w-8 rounded-full border border-border object-cover p-1"
                                    />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                className="w-52 bg-card text-card-foreground"
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                                        <UserInfo
                                            user={user}
                                            showEmail={true}
                                        />
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
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

                <main className="flex-1 overflow-y-auto bg-background p-6 transition-colors">
                    {children}
                </main>
            </div>
        </div>
    );
}
