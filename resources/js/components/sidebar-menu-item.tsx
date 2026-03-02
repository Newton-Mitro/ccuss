import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SidebarItem } from '../types';

const STORAGE_KEY = 'app_sidebar_open_menus_v1';

interface Props {
    item: SidebarItem;
    level?: number;
    sidebarOpen: boolean;
}

/**
 * Recursively detect whether this item or any of its children
 * matches the current route
 */
function isItemActive(item: SidebarItem, url: string): boolean {
    if (item.match_path && url.includes(item.match_path)) {
        return true;
    }

    if (item.children?.length) {
        return item.children.some((child) => isItemActive(child, url));
    }

    return false;
}

export function SidebarMenuItem({ item, level = 0, sidebarOpen }: Props) {
    const { url } = usePage();
    const hasChildren = !!item.children?.length;

    /** Exact (leaf) active */
    const isSelfActive = useMemo(
        () => !!item.match_path && url.includes(item.match_path),
        [url, item.match_path],
    );

    /** Parent active because a child is active */
    const hasActiveChild = useMemo(
        () =>
            !!item.children?.length &&
            item.children.some((c) => isItemActive(c, url)),
        [item.children, url],
    );

    const storageKey = `${STORAGE_KEY}:${item.name}`;

    const [open, setOpen] = useState<boolean>(() => {
        try {
            const v = localStorage.getItem(storageKey);
            return v ? JSON.parse(v) : (item.children_expanded ?? false);
        } catch {
            return false;
        }
    });

    /** Auto-expand when a child route is active */
    useEffect(() => {
        if (hasActiveChild && hasChildren) {
            Promise.resolve().then(() => {
                setOpen(true);
            });
        }
    }, [hasActiveChild, hasChildren]);

    /** Persist open state */
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(open));
        } catch {
            console.warn('Failed to save sidebar openMenus');
        }
    }, [open, storageKey]);

    /**
     * 👉 IMPORTANT:
     * Indentation is applied to INNER content,
     * not the clickable container
     */
    const indentStyle = sidebarOpen
        ? { paddingLeft: `${12 + level * 16}px` }
        : undefined;

    /** Full-width clickable container */
    const containerClasses = cn(
        'block w-full rounded-md transition-colors',
        'hover:bg-muted',
        isSelfActive && 'bg-muted font-medium text-primary',
        hasActiveChild &&
            !isSelfActive &&
            'border-l-2 border-primary/60 bg-muted/50 text-primary',
    );

    /** Inner content (indented visually) */
    const contentClasses = 'flex w-full h-full items-center gap-3 px-3 py-2';

    return (
        <li className="w-full">
            {/* LINK ITEM */}
            {item.path ? (
                <Link href={item.path} className={containerClasses}>
                    <div className={contentClasses} style={indentStyle}>
                        <span className="shrink-0 text-base">{item.icon}</span>
                        {sidebarOpen && <span>{item.name}</span>}
                    </div>
                </Link>
            ) : (
                /* GROUP ITEM */
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

            {/* CHILDREN */}
            {hasChildren && open && sidebarOpen && (
                <ul className="mt-1 space-y-1">
                    {item.children!.map((child, idx) => (
                        <SidebarMenuItem
                            key={`${child.name}-${idx}`}
                            item={child}
                            level={level + 1}
                            sidebarOpen={sidebarOpen}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}
