import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ResourcePageHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function ResourcePageHeader({
    title,
    description,
    action,
    className,
}: ResourcePageHeaderProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-2 md:flex-row md:items-center md:justify-between',
                className,
            )}
        >
            <div className="space-y-1">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-primary/80 uppercase">
                    Resource
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
    );
}

interface ResourceToolbarProps {
    children: ReactNode;
    className?: string;
}

export function ResourceToolbar({ children, className }: ResourceToolbarProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-2 md:flex-row md:items-center md:justify-between',
                className,
            )}
        >
            {children}
        </div>
    );
}

interface ResourceTableCardProps {
    children: ReactNode;
    className?: string;
}

export function ResourceTableCard({
    children,
    className,
}: ResourceTableCardProps) {
    return (
        <div
            data-slot="resource-table-card"
            className={cn(
                'overflow-hidden rounded-md border bg-card',
                className,
            )}
        >
            <div className="overflow-auto">{children}</div>
        </div>
    );
}

interface ResourceEmptyStateProps {
    title: string;
    description?: string;
    className?: string;
}

export function ResourceEmptyState({
    title,
    description,
    className,
}: ResourceEmptyStateProps) {
    return (
        <div
            className={cn(
                'flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed bg-card px-6 py-12 text-center',
                className,
            )}
        >
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description && (
                <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
}

interface ResourceTableViewportProps {
    children: ReactNode;
    mobile: ReactNode;
    heightClassName?: string;
}

export function ResourceTableViewport({
    children,
    mobile,
    heightClassName = 'h-[calc(100vh-320px)]',
}: ResourceTableViewportProps) {
    return (
        <>
            <div
                className={cn(
                    'hidden overflow-auto rounded-md border bg-card md:block',
                    heightClassName,
                )}
            >
                {children}
            </div>
            <div className="space-y-3 md:hidden">{mobile}</div>
        </>
    );
}

interface ResourceRowActionsProps {
    children: ReactNode;
    className?: string;
}

export function ResourceRowActions({
    children,
    className,
}: ResourceRowActionsProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {children}
        </div>
    );
}

interface StatusBadgeProps {
    tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
    children: ReactNode;
    className?: string;
}

export function StatusBadge({
    tone = 'neutral',
    children,
    className,
}: StatusBadgeProps) {
    const tones = {
        success:
            'border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        warning:
            'border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        danger: 'border border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300',
        info: 'border border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
        neutral: 'border border-border bg-muted/80 text-muted-foreground',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs leading-none font-medium',
                tones[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}
