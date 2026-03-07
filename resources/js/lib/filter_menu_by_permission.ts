import { SidebarItem } from '../types';

export function filterMenuByPermission(
    menu: SidebarItem[],
    userPermissions: string[],
): SidebarItem[] {
    const filterRecursive = (items: SidebarItem[]): SidebarItem[] => {
        return items
            .map((item) => {
                // Filter children recursively
                const children = item.children
                    ? filterRecursive(item.children)
                    : undefined;

                // Check if this item passes permission
                const hasPermission =
                    !item.permission ||
                    item.permission.some((p) => userPermissions.includes(p));

                // Keep item if it has permission OR has any visible children
                if (hasPermission || (children && children.length > 0)) {
                    return { ...item, children };
                }

                return null;
            })
            .filter(Boolean) as SidebarItem[];
    };

    return filterRecursive(menu);
}
