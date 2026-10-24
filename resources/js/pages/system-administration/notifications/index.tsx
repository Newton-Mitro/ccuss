import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, Check, CheckCheck, Circle, Inbox } from 'lucide-react';
import { route } from 'ziggy-js';
import { Button } from '../../../components/ui/button';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';

interface NotificationItem {
    id: string;
    read_at: string | null;
    created_at: string;
    data: {
        title?: string;
        message?: string;
        url?: string;
        event?: string;
    };
}

interface Props extends SharedData {
    notifications: {
        data: NotificationItem[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    unreadCount: number;
}

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

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="mx-auto max-w-5xl space-y-6 pb-8">
                <header className="relative isolate overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="absolute -top-24 right-8 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-8">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <Bell className="size-7" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                    Approval activity
                                </span>
                                <span className="rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    {unreadCount} unread
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                Notifications
                            </h1>
                            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                                Stay up to date with approval requests and
                                decisions across your organization.
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 gap-2 rounded-lg"
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
                </header>

                <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-5 py-4 sm:px-7">
                        <div>
                            <h2 className="font-semibold tracking-tight">
                                Recent activity
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Notifications are also sent to your email.
                            </p>
                        </div>
                        <Inbox className="size-5 text-muted-foreground" />
                    </div>
                    {notifications.data.length ? (
                        <div className="divide-y">
                            {notifications.data.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() =>
                                        openNotification(notification)
                                    }
                                    className={`flex w-full items-start gap-4 px-5 py-5 text-left transition hover:bg-muted/50 sm:px-7 ${
                                        notification.read_at
                                            ? 'bg-card'
                                            : 'bg-primary/[0.035]'
                                    }`}
                                >
                                    <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                                        {notification.read_at ? (
                                            <Check className="size-4" />
                                        ) : (
                                            <Circle className="size-3 fill-primary text-primary" />
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-medium">
                                                {notification.data.title ??
                                                    'Approval update'}
                                            </span>
                                            <time className="text-xs text-muted-foreground">
                                                {new Date(
                                                    notification.created_at,
                                                ).toLocaleString()}
                                            </time>
                                        </span>
                                        <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                                            {notification.data.message}
                                        </span>
                                        {notification.data.url && (
                                            <span className="mt-2 block text-xs font-medium text-primary">
                                                Open details
                                            </span>
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-5 py-16 text-center sm:px-7">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                <Inbox className="size-6" />
                            </div>
                            <h3 className="mt-4 font-semibold">
                                You’re all caught up
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                New approval activity will appear here.
                            </p>
                        </div>
                    )}
                    {notifications.links.length > 3 && (
                        <div className="flex flex-wrap justify-center gap-2 border-t p-4">
                            {notifications.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url}
                                        preserveScroll
                                        className={`rounded-lg border px-3 py-2 text-sm ${
                                            link.active
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'bg-background hover:bg-muted'
                                        }`}
                                    >
                                        {link.label
                                            .replace(/<[^>]*>/g, '')
                                            .replace(/&laquo;/g, '«')
                                            .replace(/&raquo;/g, '»')
                                            .replace(/&amp;/g, '&')}
                                    </Link>
                                ) : (
                                    <span
                                        key={`${link.label}-${index}`}
                                        className="rounded-lg border px-3 py-2 text-sm text-muted-foreground opacity-50"
                                    >
                                        {link.label
                                            .replace(/<[^>]*>/g, '')
                                            .replace(/&laquo;/g, '«')
                                            .replace(/&raquo;/g, '»')
                                            .replace(/&amp;/g, '&')}
                                    </span>
                                ),
                            )}
                        </div>
                    )}
                </section>
            </div>
        </CustomAuthLayout>
    );
}
