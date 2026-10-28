import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type {
    NotificationItem,
    Props,
} from '@/modules/administration-security/types/notifications/index.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    Check,
    CheckCheck,
    Circle,
    ExternalLink,
    Inbox,
} from 'lucide-react';
import { route } from 'ziggy-js';

export default function NotificationIndex() {
    const { notifications, unreadCount } = usePage<Props>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administration & Security', href: '' },
        { title: 'Notifications', href: route('notifications.index') },
    ];

    const openNotification = (notification: NotificationItem) => {
        const visit = () => {
            if (
                notification.data.url?.startsWith('/') &&
                !notification.data.url.startsWith('//')
            ) {
                router.visit(notification.data.url);
            }
        };

        if (notification.read_at) {
            visit();
            return;
        }

        router.post(
            route('notifications.read', notification.id),
            {},
            {
                preserveScroll: true,
                onSuccess: visit,
            },
        );
    };

    const cleanPaginationLabel = (label: string) =>
        label
            .replace(/<[^>]*>/g, '')
            .replace(/&laquo;/g, '«')
            .replace(/&raquo;/g, '»')
            .replace(/&amp;/g, '&');

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="w-full min-w-0 space-y-3 pb-6 text-foreground">
                {/* Compact page header */}
                <header className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Bell className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-lg font-semibold tracking-tight">
                                    Notifications
                                </h1>

                                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] font-medium">
                                    <span
                                        className={`size-1.5 rounded-full ${
                                            unreadCount > 0
                                                ? 'bg-primary'
                                                : 'bg-muted-foreground/50'
                                        }`}
                                    />
                                    {unreadCount} unread
                                </span>
                            </div>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Stay updated on approvals and organizational
                                activity.
                            </p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 shrink-0"
                            onClick={() =>
                                router.post(
                                    route('notifications.read-all'),
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            <CheckCheck className="size-3.5" />
                            Mark all as read
                        </Button>
                    )}
                </header>

                {/* Notifications list */}
                <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/15 px-4 py-2.5">
                        <div className="flex min-w-0 items-center gap-2">
                            <Inbox className="size-4 shrink-0 text-muted-foreground" />
                            <h2 className="text-sm font-semibold">
                                Recent activity
                            </h2>
                            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground tabular-nums">
                                {notifications.data.length}
                            </span>
                        </div>

                        <span className="hidden text-[11px] text-muted-foreground sm:block">
                            Select a notification to view details
                        </span>
                    </div>

                    {notifications.data.length > 0 ? (
                        <div className="divide-y divide-border">
                            {notifications.data.map((notification) => {
                                const unread = !notification.read_at;
                                const hasInternalUrl =
                                    notification.data.url?.startsWith('/') &&
                                    !notification.data.url.startsWith('//');

                                return (
                                    <button
                                        key={notification.id}
                                        type="button"
                                        onClick={() =>
                                            openNotification(notification)
                                        }
                                        className={`group flex w-full min-w-0 items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset sm:px-4 ${
                                            unread
                                                ? 'bg-primary/[0.035]'
                                                : 'bg-card'
                                        }`}
                                    >
                                        {/* Read status */}
                                        <span
                                            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md ${
                                                unread
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-muted/60 text-muted-foreground'
                                            }`}
                                        >
                                            {unread ? (
                                                <Circle className="size-2.5 fill-current" />
                                            ) : (
                                                <Check className="size-4" />
                                            )}
                                        </span>

                                        {/* Notification content */}
                                        <span className="min-w-0 flex-1">
                                            <span className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                                <span className="flex min-w-0 items-center gap-2">
                                                    <span
                                                        className={`truncate text-sm ${
                                                            unread
                                                                ? 'font-semibold text-foreground'
                                                                : 'font-medium text-foreground/90'
                                                        }`}
                                                    >
                                                        {notification.data
                                                            .title ??
                                                            'Approval update'}
                                                    </span>

                                                    {unread && (
                                                        <span className="shrink-0 rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                                                            NEW
                                                        </span>
                                                    )}
                                                </span>

                                                <time className="shrink-0 text-[10px] text-muted-foreground sm:pt-0.5">
                                                    {new Date(
                                                        notification.created_at,
                                                    ).toLocaleString()}
                                                </time>
                                            </span>

                                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                                {notification.data.message}
                                            </span>

                                            {hasInternalUrl && (
                                                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                                                    Open details
                                                    <ExternalLink className="size-3 transition-transform group-hover:translate-x-0.5" />
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <Inbox className="size-5" />
                            </div>

                            <h3 className="mt-3 text-sm font-semibold">
                                You’re all caught up
                            </h3>

                            <p className="mt-1 text-xs text-muted-foreground">
                                New notifications will appear here.
                            </p>
                        </div>
                    )}

                    {/* Compact pagination */}
                    {notifications.links.length > 3 && (
                        <nav
                            aria-label="Notification pagination"
                            className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/10 px-3 py-2.5 sm:px-4"
                        >
                            <p className="text-[11px] text-muted-foreground">
                                Navigate notifications
                            </p>

                            <div className="flex flex-wrap items-center justify-end gap-1">
                                {notifications.links.map((link, index) => {
                                    const label = cleanPaginationLabel(
                                        link.label,
                                    );

                                    return link.url ? (
                                        <Link
                                            key={`${link.label}-${index}`}
                                            href={link.url}
                                            preserveScroll
                                            aria-current={
                                                link.active ? 'page' : undefined
                                            }
                                            className={`inline-flex min-h-7 items-center justify-center rounded-md border px-2.5 text-xs transition-colors ${
                                                link.active
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-border bg-background hover:bg-muted'
                                            }`}
                                        >
                                            {label}
                                        </Link>
                                    ) : (
                                        <span
                                            key={`${link.label}-${index}`}
                                            aria-disabled="true"
                                            className="inline-flex min-h-7 cursor-not-allowed items-center justify-center rounded-md border border-border/60 px-2.5 text-xs text-muted-foreground opacity-50"
                                        >
                                            {label}
                                        </span>
                                    );
                                })}
                            </div>
                        </nav>
                    )}
                </section>
            </div>
        </CustomAuthLayout>
    );
}
