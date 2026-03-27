import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';
import { User } from './user';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    flash?: {
        error?: string;
        success?: string;
        message?: string;
    };
    [key: string]: unknown;
}

export interface SidebarItem {
    name: string;
    icon?: React.ReactNode;
    path?: string;
    match_path?: string;
    children_expanded?: boolean;
    permission?: string[];
    description?: string;
    children?: SidebarItem[];
}
