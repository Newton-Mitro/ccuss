import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDateTime } from '@/lib/date_util';
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
    ExternalLink,
    Inbox,
    Sparkles,
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

            <div className="w-full min-w-0 space-y-5 pb-8 text-foreground">
                <header className="relative isolate overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.12] via-card to-card px-5 py-5 shadow-sm sm:px-7 sm:py-6">
                    <div className="pointer-events-none absolute -top-20 right-4 -z-10 size-56 rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute -right-10 -bottom-28 -z-10 size-64 rounded-full bg-sky-500/[0.07] blur-3xl" />

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-background/80 text-primary shadow-sm">
                                <Bell className="size-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-card bg-primary text-[9px] font-bold text-primary-foreground">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                                    Your updates
                                </p>
                                <h1 className="mt-0.5 text-xl font-semibold tracking-tight sm:text-2xl">
                                    Notifications
                                </h1>
                                <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
                                    Stay on top of approvals and important
                                    activity across your organization.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/75 px-3 py-2">
                                <span
                                    className={`size-2 rounded-full ${
                                        unreadCount > 0
                                            ? 'bg-primary shadow-[0_0_0_3px] shadow-primary/10'
                                            : 'bg-emerald-500 shadow-[0_0_0_3px] shadow-emerald-500/10'
                                    }`}
                                />
                                <span className="text-xs font-medium">
                                    {unreadCount > 0
                                        ? `${unreadCount} unread`
                                        : 'All caught up'}
                                </span>
                            </div>

                            {unreadCount > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 border-primary/20 bg-background/80 shadow-sm hover:bg-primary/5"
                                    onClick={() =>
                                        router.post(
                                            route('notifications.read-all'),
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    <CheckCheck className="size-4" />
                                    Mark all as read
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Notifications list */}
                <section className="min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/15 px-4 py-3.5 sm:px-5">
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Inbox className="size-4" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Recent activity
                                </h2>
                                <p className="text-[11px] text-muted-foreground">
                                    Your latest updates and alerts
                                </p>
                            </div>
                            <span className="ml-1 rounded-full border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                                {notifications.data.length}
                            </span>
                        </div>

                        <span className="hidden text-[11px] text-muted-foreground sm:block">
                            Select an update to view details
                        </span>
                    </div>

                    {notifications.data.length > 0 ? (
                        <div className="divide-y divide-border/70">
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
                                        className={`group relative flex w-full min-w-0 items-start gap-3.5 px-4 py-4 text-left transition-colors hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset sm:px-5 ${
                                            unread
                                                ? 'bg-primary/[0.025]'
                                                : 'bg-card'
                                        }`}
                                    >
                                        {/* Read status */}
                                        <span
                                            className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
                                                unread
                                                    ? 'bg-primary/10 text-primary ring-primary/15'
                                                    : 'bg-muted/60 text-muted-foreground ring-border/70'
                                            }`}
                                        >
                                            {unread ? (
                                                <Bell className="size-4" />
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
                                                        <span className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-primary">
                                                            NEW
                                                        </span>
                                                    )}
                                                </span>

                                                <time className="shrink-0 text-[11px] text-muted-foreground sm:pt-0.5">
                                                    {formatDateTime(
                                                        notification.created_at,
                                                    )}
                                                </time>
                                            </span>

                                            <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                                                {notification.data.message}
                                            </span>

                                            {hasInternalUrl && (
                                                <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
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
                        <div className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-14 text-center sm:py-16">
                            <div className="pointer-events-none absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.045] blur-3xl" />
                            <div className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 to-primary/[0.03] text-primary shadow-sm">
                                <Bell className="size-7" />
                                <span className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-xl border-2 border-card bg-background text-emerald-600 shadow-sm dark:text-emerald-400">
                                    <Sparkles className="size-3.5" />
                                </span>
                            </div>

                            <span className="relative mt-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-400">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Inbox is clear
                            </span>

                            <h3 className="relative mt-3 text-base font-semibold">
                                Nothing needs your attention
                            </h3>

                            <p className="relative mt-1 max-w-sm text-xs leading-5 text-muted-foreground sm:text-sm">
                                There’s nothing new to review right now. We’ll
                                let you know when an approval or important
                                update needs your attention.
                            </p>
                        </div>
                    )}

                    {/* Compact pagination */}
                    {notifications.links.length > 3 && (
                        <nav
                            aria-label="Notification pagination"
                            className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-muted/10 px-3 py-3 sm:px-5"
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
