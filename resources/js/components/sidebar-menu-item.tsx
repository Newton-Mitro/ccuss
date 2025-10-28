import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SidebarItem } from '../types';

interface SidebarMenuItemProps {
    item?: SidebarItem;
    openMenus: Record<string, boolean>;
    toggleMenu: (name: string) => void;
    sidebarOpen: boolean;
}

export default function SidebarMenuItem({
    item,
    openMenus,
    toggleMenu,
    sidebarOpen,
}: SidebarMenuItemProps) {
    const { url } = usePage();

    if (!item || !item.name) return null;

    const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;
    const isOpen = openMenus[item.name] || false;

    // Strip query params from current URL for proper active check
    const currentPath = url.split('?')[0];

    // Recursive check for active menu
    const isActive = (item: SidebarItem): boolean => {
        if (item.match_path && currentPath.includes(item.match_path))
            return true;
        if (item.children) {
            return item.children.some((child) => child && isActive(child));
        }
        return false;
    };

    const active = isActive(item);
    const isChildActive =
        item.match_path && currentPath.includes(item.match_path);

    const handleClick = () => {
        if (hasChildren) toggleMenu(item.name);
    };

    // Colors
    const parentBg = 'bg-accent/30 text-accent-foreground';
    const childBg = 'bg-primary text-primary-foreground';
    const defaultBg =
        'text-foreground/80 hover:bg-accent hover:text-accent-foreground';

    const paddingLeft = 12; // fixed for all items to left-align

    return (
        <li>
            {item.path ? (
                <Link
                    href={item.path}
                    className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none',
                        isChildActive ? childBg : active ? parentBg : defaultBg,
                    )}
                    style={{ paddingLeft }}
                >
                    {item.icon && (
                        <span
                            className={cn(
                                isChildActive
                                    ? 'text-primary-foreground'
                                    : 'text-primary',
                            )}
                        >
                            {item.icon}
                        </span>
                    )}
                    {sidebarOpen && <span>{item.name}</span>}
                </Link>
            ) : (
                <button
                    onClick={handleClick}
                    className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        active ? parentBg : defaultBg,
                    )}
                    style={{ paddingLeft }}
                >
                    <div className="flex items-center gap-2">
                        {item.icon && (
                            <span className="text-primary">{item.icon}</span>
                        )}
                        {sidebarOpen && <span>{item.name}</span>}
                    </div>
                    {hasChildren &&
                        sidebarOpen &&
                        (isOpen ? (
                            <ChevronDown size={14} />
                        ) : (
                            <ChevronRight size={14} />
                        ))}
                </button>
            )}

            {hasChildren && isOpen && (
                <ul className="flex flex-col gap-1 border-l">
                    {item.children?.map((child) =>
                        child ? (
                            <SidebarMenuItem
                                key={child.name}
                                item={child}
                                openMenus={openMenus}
                                toggleMenu={toggleMenu}
                                sidebarOpen={sidebarOpen}
                            />
                        ) : null,
                    )}
                </ul>
            )}
        </li>
    );
}
