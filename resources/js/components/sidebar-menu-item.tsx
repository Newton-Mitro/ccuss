import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SidebarItem } from '../types';

interface SidebarMenuItemProps {
    item?: SidebarItem; // ✅ allow undefined safely
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
    // 🛑 Safety check
    if (!item || !item.name) return null;

    const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;
    const isOpen = openMenus[item.name] || false;
    const paddingLeft = 12 + level * 16;

    const handleClick = () => {
        if (hasChildren) toggleMenu(item.name);
    };

    return (
        <li>
            {item.path ? (
                <Link
                    href={item.path}
                    className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                        'text-foreground/80 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none',
                    )}
                    style={{ paddingLeft }}
                >
                    <span className="text-primary">{item.icon}</span>
                    {sidebarOpen && <span>{item.name}</span>}
                </Link>
            ) : (
                <button
                    onClick={handleClick}
                    className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                        'text-foreground/80',
                    )}
                    style={{ paddingLeft }}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-primary">{item.icon}</span>
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
                <ul className="ml-1 border-l border-border pl-2">
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
