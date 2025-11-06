import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { SidebarItem } from '../types';

interface SidebarMenuItemProps {
    item?: SidebarItem;
    openMenus: Record<string, boolean>;
    toggleMenu: (name: string) => void;
    sidebarOpen: boolean;
}

// 🎨 Define consistent color palette
const borderColors = [
    'border-l-red-400',
    'border-l-blue-400',
    'border-l-green-400',
    'border-l-yellow-400',
    'border-l-purple-400',
    'border-l-pink-400',
    'border-l-cyan-400',
    'border-l-amber-400',
];

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

    const currentPath = url.split('?')[0];

    const isActive = (i: SidebarItem): boolean => {
        if (i.match_path && currentPath.includes(i.match_path)) return true;
        if (i.children) return i.children.some((c) => c && isActive(c));
        return false;
    };

    const active = isActive(item);
    const isChildActive =
        item.match_path && currentPath.includes(item.match_path);

    const handleClick = () => {
        if (hasChildren) toggleMenu(item.name);
    };

    // Pick unique border color (based on name hash)
    const colorIndex =
        Math.abs(
            item.name
                .split('')
                .reduce((acc, char) => acc + char.charCodeAt(0), 0),
        ) % borderColors.length;
    const borderColor = borderColors[colorIndex];

    const parentBg = 'bg-accent/30 text-accent-foreground';
    const childBg = 'bg-primary text-primary-foreground';
    const defaultBg =
        'text-foreground/80 hover:bg-accent hover:text-accent-foreground';
    const paddingLeft = 12;

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
                    {hasChildren && sidebarOpen && (
                        <motion.div
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <ChevronRight size={14} />
                        </motion.div>
                    )}
                </button>
            )}

            <AnimatePresence initial={false}>
                {hasChildren && isOpen && (
                    <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className={cn(
                            'flex flex-col gap-1 border-l',
                            borderColor, // 🎨 dynamic color class
                        )}
                    >
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
                    </motion.ul>
                )}
            </AnimatePresence>
        </li>
    );
}
