import { StatusBadge } from '@/components/resource-page-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import { useInitials } from '@/hooks/use-initials';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDateTime, formatDate as formatHumanDate } from '@/lib/date_util';
import type { Permission } from '@/modules/administration-security/types/user';
import type { Props } from '@/modules/administration-security/types/users/show-user-page.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    Building2,
    CalendarDays,
    Check,
    ChevronDown,
    Clock3,
    Fingerprint,
    GitBranch,
    KeyRound,
    Mail,
    Pencil,
    Search,
    ShieldCheck,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { route } from 'ziggy-js';

function formatDate(value?: string | null, withTime = false): string {
    return withTime ? formatDateTime(value) : formatHumanDate(value);
}

function groupPermissions(permissions: Permission[]) {
    return permissions.reduce<Record<string, Permission[]>>(
        (groups, permission) => {
            const module = permission.module || 'General';
            groups[module] ??= [];
            groups[module].push(permission);
            return groups;
        },
        {},
    );
}

export default function ShowUserPage() {
    const { user, auth } = usePage<Props>().props;
    const getInitials = useInitials();
    const [search, setSearch] = useState('');
    useFlashToastHandler();

    const permissions = useMemo(
        () => user.permissions ?? [],
        [user.permissions],
    );
    const groupedPermissions = useMemo(
        () => groupPermissions(permissions),
        [permissions],
    );
    const visibleGroups = useMemo(() => {
        const query = search.trim().toLowerCase();

        return Object.entries(groupedPermissions)
            .map(
                ([module, items]) =>
                    [
                        module,
                        items.filter(
                            (item) =>
                                !query ||
                                module.toLowerCase().includes(query) ||
                                item.name.toLowerCase().includes(query) ||
                                item.slug.toLowerCase().includes(query),
                        ),
                    ] as const,
            )
            .filter(([, items]) => items.length > 0);
    }, [groupedPermissions, search]);

    const canUpdate =
        auth.user.permissions?.some(({ slug }) => slug === 'users.update') ??
        false;
    const status = (user.status ?? 'ACTIVE').toUpperCase();
    const isActive = status === 'ACTIVE';
    const organizationCount =
        user.organizations?.length ?? (user.organization_id ? 1 : 0);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administrative Tasks', href: '' },
        { title: 'Users', href: route('users.index') },
        { title: user.name, href: route('users.show', user.id) },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name} · User details`} />

            <div className="mx-auto w-full max-w-7xl space-y-3.5 pb-6 text-foreground">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-12 border border-border">
                            <AvatarImage
                                src={user.avatar ?? undefined}
                                alt={user.name}
                            />
                            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="truncate text-xl font-semibold tracking-tight">
                                    {user.name}
                                </h1>
                                <StatusBadge
                                    tone={isActive ? 'success' : 'neutral'}
                                >
                                    {status}
                                </StatusBadge>
                            </div>
                            <p className="truncate text-sm text-muted-foreground">
                                User profile · {user.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('users.index')}>
                                <ArrowLeft />
                                Users
                            </Link>
                        </Button>
                        {canUpdate && (
                            <Button size="sm" asChild>
                                <Link href={route('users.edit', user.id)}>
                                    <Pencil />
                                    Edit user
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <section className="grid gap-2 rounded-xl border border-border bg-card p-2.5 shadow-sm sm:grid-cols-2 md:grid-cols-4">
                    <Stat
                        icon={KeyRound}
                        label="Effective permissions"
                        value={permissions.length}
                    />
                    <Stat
                        icon={ShieldCheck}
                        label="Assigned roles"
                        value={user.roles?.length ?? 0}
                    />
                    <Stat
                        icon={Building2}
                        label="Organizations"
                        value={organizationCount}
                    />
                    <Stat
                        icon={BadgeCheck}
                        label="Email verification"
                        value={user.email_verified_at ? 'Verified' : 'Pending'}
                        positive={Boolean(user.email_verified_at)}
                    />
                </section>

                <div className="grid items-start gap-3 md:grid-cols-2">
                    <div className="space-y-3">
                        <section className="rounded-xl border border-border bg-card shadow-sm">
                            <PanelHeading icon={UserRound} title="Account" />
                            <div className="grid gap-x-4 px-4 sm:grid-cols-2">
                                <InfoRow
                                    icon={Mail}
                                    label="Email"
                                    value={user.email}
                                    wide
                                />
                                <InfoRow
                                    icon={Fingerprint}
                                    label="Phone"
                                    value={user.phone || 'Not provided'}
                                />
                                <InfoRow
                                    icon={
                                        user.email_verified_at
                                            ? BadgeCheck
                                            : Clock3
                                    }
                                    label="Verified"
                                    value={
                                        user.email_verified_at
                                            ? formatDate(
                                                  user.email_verified_at,
                                                  true,
                                              )
                                            : 'Email not verified'
                                    }
                                />
                                <InfoRow
                                    icon={CalendarDays}
                                    label="Created"
                                    value={formatDate(user.created_at, true)}
                                />
                            </div>
                        </section>

                        <section className="rounded-xl border border-border bg-card shadow-sm">
                            <PanelHeading
                                icon={ShieldCheck}
                                title="Assigned roles"
                            />
                            <div className="grid gap-2 p-3 sm:grid-cols-2">
                                {user.roles?.length ? (
                                    user.roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-background/70 px-3 py-2"
                                        >
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                <ShieldCheck className="size-4" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium wrap-break-word">
                                                    {role.name}
                                                </p>
                                                <p className="truncate text-[11px] text-muted-foreground">
                                                    {role.description ||
                                                        role.slug.replaceAll(
                                                            '_',
                                                            ' ',
                                                        )}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground sm:col-span-2">
                                        No roles assigned
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>

                    <section className="rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                            <PanelHeading icon={Building2} title="Placement" />
                            {canUpdate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7"
                                    asChild
                                >
                                    <Link
                                        href={route(
                                            'users.organization.edit',
                                            user.id,
                                        )}
                                    >
                                        <Pencil />
                                        Manage
                                    </Link>
                                </Button>
                            )}
                        </div>
                        <div className="divide-y divide-border/70 px-4">
                            <InfoRow
                                icon={Building2}
                                label="Primary organization"
                                value={
                                    user.organization?.name ?? 'Not assigned'
                                }
                            />
                            <div className="flex min-h-12 items-center gap-3 py-2.5">
                                <GitBranch className="size-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] text-muted-foreground">
                                        Assigned branch
                                    </p>
                                    <p className="truncate text-sm font-medium">
                                        {user.branch?.name ?? 'Not assigned'}
                                    </p>
                                </div>
                                {canUpdate && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7"
                                        asChild
                                    >
                                        <Link
                                            href={route(
                                                'users.branch.edit',
                                                user.id,
                                            )}
                                        >
                                            Assign
                                        </Link>
                                    </Button>
                                )}
                            </div>
                            <div className="py-2.5">
                                <p className="mb-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                                    <UsersRound className="size-4" />
                                    Memberships
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {user.organizations?.length ? (
                                        user.organizations.map(
                                            (organization) => (
                                                <span
                                                    key={organization.id}
                                                    className="rounded-md bg-muted px-2 py-1 text-xs"
                                                >
                                                    {organization.name}
                                                </span>
                                            ),
                                        )
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            {user.organization?.name ?? 'None'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-semibold">
                                <KeyRound className="size-4 text-primary" />
                                Effective permissions
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                    {permissions.length}
                                </span>
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Permissions inherited from assigned roles
                            </p>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Filter permissions..."
                                aria-label="Filter permissions"
                                className="h-8 bg-background pl-8 text-xs"
                            />
                        </div>
                    </div>

                    {visibleGroups.length ? (
                        <div className="grid max-h-80 gap-2 overflow-y-auto p-3 md:grid-cols-2 xl:grid-cols-3">
                            {visibleGroups.map(([module, items]) => (
                                <details
                                    key={module}
                                    open={Boolean(search.trim())}
                                    className="group rounded-lg border border-border/80 bg-background/50"
                                >
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                                        <span className="flex min-w-0 items-center gap-2">
                                            <span className="truncate text-xs font-semibold">
                                                {module.replaceAll('_', ' ')}
                                            </span>
                                            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground tabular-nums">
                                                {items.length}
                                            </span>
                                        </span>
                                        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="flex flex-wrap gap-1.5 border-t border-border/70 px-2.5 py-2">
                                        {items.map((permission) => (
                                            <span
                                                key={permission.id}
                                                title={permission.slug}
                                                className="inline-flex items-center gap-1 rounded border border-border/80 bg-card px-2 py-1 text-[11px]"
                                            >
                                                <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                                                {permission.name}
                                            </span>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                            {permissions.length ? (
                                <Search className="size-4" />
                            ) : (
                                <X className="size-4" />
                            )}
                            {permissions.length
                                ? 'No permissions match this filter.'
                                : 'No permissions assigned.'}
                        </div>
                    )}
                </section>
            </div>
        </CustomAuthLayout>
    );
}

function Stat({
    icon: Icon,
    label,
    value,
    positive = false,
}: {
    icon: typeof KeyRound;
    label: string;
    value: string | number;
    positive?: boolean;
}) {
    return (
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/35 px-3 py-2">
            <Icon
                className={`size-4 shrink-0 ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`}
            />
            <div className="min-w-0">
                <p className="truncate text-[11px] text-muted-foreground">
                    {label}
                </p>
                <p className="truncate text-sm font-semibold tabular-nums">
                    {value}
                </p>
            </div>
        </div>
    );
}

function PanelHeading({
    icon: Icon,
    title,
}: {
    icon: typeof UserRound;
    title: string;
}) {
    return (
        <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Icon className="size-4 text-primary" />
            {title}
        </h2>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
    wide = false,
}: {
    icon: typeof Mail;
    label: string;
    value: string;
    wide?: boolean;
}) {
    return (
        <div
            className={`flex min-h-12 items-center gap-3 py-2.5 ${wide ? 'sm:col-span-2' : ''}`}
        >
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="truncate text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}
