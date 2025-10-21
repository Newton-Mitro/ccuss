import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SidebarItem } from '../types';

interface SidebarMenuItemProps {
    item: SidebarItem;
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
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.name];

    return (
        <li>
            <button
                onClick={() => hasChildren && toggleMenu(item.name)}
                className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors',
                    isOpen
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted hover:text-foreground',
                    level > 0
                        ? 'pl-6 text-sm text-muted-foreground'
                        : 'font-medium',
                )}
            >
                <div className="flex items-center gap-3">
                    <span className="text-current">{item.icon}</span>
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
