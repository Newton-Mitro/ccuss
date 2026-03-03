import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SidebarItem } from '../types';

const STORAGE_KEY = 'app_sidebar_open_menus_v1';

interface Props {
    item: SidebarItem;
    level?: number;
    sidebarOpen: boolean;
    menuAction?: 'expand-all' | 'collapse-all' | null;
}

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

/** Recursively check if item or its children are active */
function isItemActive(item: SidebarItem, url: string): boolean {
    if (item.match_path && url.includes(item.match_path)) return true;
    return !!item.children?.some((c) => isItemActive(c, url));
}

export function SidebarMenuItem({
    item,
    level = 0,
    sidebarOpen,
    menuAction,
}: Props) {
    const { url } = usePage();
    const hasChildren = !!item.children?.length;

    const isSelfActive = useMemo(
        () => !!item.match_path && url.includes(item.match_path),
        [url, item.match_path],
    );

    const hasActiveChild = useMemo(
        () =>
            !!item.children?.length &&
            item.children.some((c) => isItemActive(c, url)),
        [item.children, url],
    );

    const colorIndex =
        Math.abs(
            item.name
                .split('')
                .reduce((acc, char) => acc + char.charCodeAt(0), 0),
        ) % borderColors.length;
    const borderColor = borderColors[colorIndex];

    const storageKey = `${STORAGE_KEY}:${item.name}`;

    const [open, setOpen] = useState<boolean>(() => {
        try {
            const v = localStorage.getItem(storageKey);
            return v ? JSON.parse(v) : (item.children_expanded ?? false);
        } catch {
            return false;
        }
    });

    /** Auto-expand if child active */
    useEffect(() => {
        if (hasActiveChild && hasChildren) {
            Promise.resolve().then(() => setOpen(true));
        }
    }, [hasActiveChild, hasChildren]);

    /** Handle expand/collapse all */
    useEffect(() => {
        if (!menuAction || !hasChildren) return;
        const next = menuAction === 'expand-all';
        Promise.resolve().then(() => setOpen(next));
        localStorage.setItem(storageKey, JSON.stringify(next));
    }, [menuAction, hasChildren, storageKey]);

    /** Persist open state */
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(open));
        } catch {
            console.warn('Failed to save sidebar openMenus');
        }
    }, [open, storageKey]);

    /** Indentation for child items */
    const indentStyle = sidebarOpen
        ? { paddingLeft: `${12 + level * 16}px` }
        : undefined;

    const containerClasses = cn(
        'block w-full rounded-md text-sm transition-colors',
        'hover:bg-muted',
        isSelfActive && 'bg-muted font-medium text-primary',
        hasActiveChild &&
            !isSelfActive &&
            'border-l-2 border-primary/60 bg-muted/50 text-primary',
    );

    const contentClasses = 'flex w-full h-full items-center gap-2 px-3 py-2';

    return (
        <li className="w-full">
            {item.path ? (
                <Link href={item.path} className={containerClasses}>
                    <div className={contentClasses} style={indentStyle}>
                        <span className="shrink-0 text-base">{item.icon}</span>
                        {sidebarOpen && <span>{item.name}</span>}
                    </div>
                </Link>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className={containerClasses}
                >
                    <div className={contentClasses} style={indentStyle}>
                        <span className="shrink-0 text-base">{item.icon}</span>
                        {sidebarOpen && (
                            <>
                                <span className="flex-1 text-left">
                                    {item.name}
                                </span>
                                {hasChildren && (
                                    <ChevronDown
                                        size={16}
                                        className={cn(
                                            'transition-transform duration-200',
                                            open && 'rotate-180',
                                        )}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </button>
            )}

            <AnimatePresence initial={false}>
                {hasChildren && open && sidebarOpen && (
                    <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className={cn(
                            'mt-1 space-y-1 border-l bg-primary/10',
                            borderColor, // 🎨 dynamic color class
                        )}
                    >
                        {item.children!.map((child, idx) => (
                            <SidebarMenuItem
                                key={`${child.name}-${idx}`}
                                item={child}
                                level={level + 1}
                                sidebarOpen={sidebarOpen}
                                menuAction={menuAction}
                            />
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </li>
    );
}
