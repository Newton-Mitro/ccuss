import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SidebarItem } from '../types';

interface SidebarMenuItemProps {
    item?: SidebarItem;
    openMenus: Record<string, boolean>;
    toggleMenu: (name: string) => void;
    level: number;
    sidebarOpen: boolean;
}

export default function SidebarMenuItem({
    item,
    openMenus,
    toggleMenu,
    level,
    sidebarOpen,
}: SidebarMenuItemProps) {
    const { url } = usePage();

    if (!item || !item.name) return null;

    const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;
    const isOpen = openMenus[item.name] || false;
    const paddingLeft = 12 + level * 16;

    // 🔹 Recursive check for active item
    const isActive = (item: SidebarItem): boolean => {
        if (item.path && item.path === url) return true;
        if (item.children) {
            return item.children.some((child) => child && isActive(child));
        }
        return false;
    };

    const active = isActive(item);
    const isChildActive = item.path === url;

    const handleClick = () => {
        if (hasChildren) toggleMenu(item.name);
    };

    // 🔹 Colors: parent vs child
    const parentBg = 'bg-accent/30 text-accent-foreground';
    const childBg = 'bg-primary text-primary-foreground';

    return (
        <li>
            {item.path ? (
                <Link
                    href={item.path}
                    className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none',
                        active
                            ? isChildActive
                                ? childBg
                                : parentBg
                            : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground',
                    )}
                    style={{ paddingLeft }}
                >
                    <span
                        className={cn(
                            isChildActive
                                ? 'text-primary-foreground'
                                : 'text-primary',
                        )}
                    >
                        {item.icon}
                    </span>
                    {sidebarOpen && <span>{item.name}</span>}
                </Link>
            ) : (
                <button
                    onClick={handleClick}
                    className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        active
                            ? parentBg
                            : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground',
                    )}
                    style={{ paddingLeft }}
                >
                    <div className="flex items-center gap-2">
                        <span className={cn('text-primary')}>{item.icon}</span>
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
                <ul className="ml-1 border-l border-border">
                    {item.children?.map((child) =>
                        child ? (
                            <SidebarMenuItem
                                key={child.name}
                                item={child}
                                openMenus={openMenus}
                                toggleMenu={toggleMenu}
                                level={level + 1}
                                sidebarOpen={sidebarOpen}
                            />
                        ) : null,
                    )}
                </ul>
            )}
        </li>
    );
}
