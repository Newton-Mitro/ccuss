import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SidebarItem } from '../types';

const STORAGE_KEY = 'app_sidebar_open_menus_v2';

interface Props {
    item: SidebarItem;
    level?: number;
    sidebarOpen: boolean;
    menuAction?: 'expand-all' | 'collapse-all' | null;
}

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

    const isActive = isSelfActive || hasActiveChild;

    const storageKey = `${STORAGE_KEY}:${item.name}`;

    const [open, setOpen] = useState<boolean>(() => {
        try {
            const v = localStorage.getItem(storageKey);
            return v ? JSON.parse(v) : (item.children_expanded ?? false);
        } catch {
            return false;
        }
    });

    /** Auto-expand active children */
    useEffect(() => {
        if (hasActiveChild && hasChildren) {
            Promise.resolve().then(() => setOpen(true));
        }
    }, [hasActiveChild, hasChildren]);

    /** Handle expand/collapse all from parent menu */
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

    const indentStyle = sidebarOpen
        ? { paddingLeft: `${12 + level * 16}px` }
        : undefined;

    /** Tailwind classes for container */
    const containerClasses = cn(
        'block w-full rounded-lg text-sm transition-colors duration-200',
        sidebarOpen ? 'px-0' : '',
        isActive
            ? isSelfActive
                ? 'bg-sidebar-active font-medium text-sidebar-active-foreground'
                : 'border-l-2 border-accent bg-sidebar text-sidebar-active-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-hover',
    );

    const contentClasses = 'flex w-full items-center gap-2 px-3 py-2';
    const iconClasses = cn(
        'shrink-0 text-base transition-colors',
        isActive ? 'text-sidebar-active-foreground' : 'text-muted-foreground',
    );

    return (
        <li className="w-full">
            {item.path ? (
                <Link href={item.path} className={containerClasses}>
                    <div className={contentClasses} style={indentStyle}>
                        <span className={iconClasses}>{item.icon}</span>
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
                        <span className={iconClasses}>{item.icon}</span>
                        {sidebarOpen && (
                            <>
                                <span className="flex-1 text-left">
                                    {item.name}
                                </span>
                                {hasChildren && (
                                    <ChevronDown
                                        size={16}
                                        className={cn(
                                            'text-muted-foreground transition-transform duration-200',
                                            open && 'rotate-180',
                                        )}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </button>
            )}

            {/* Children */}
            <AnimatePresence initial={false}>
                {hasChildren && open && sidebarOpen && (
                    <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-1 space-y-1 rounded-md bg-sidebar/50"
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
