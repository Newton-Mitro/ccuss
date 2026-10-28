import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '@/lib/appSwal';
import type { RolePermissionPageProps } from '@/modules/administration-security/types/page-props';
import type {
    Permission,
    Role,
} from '@/modules/administration-security/types/user';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    Check,
    CheckCheck,
    KeyRound,
    Loader2,
    LockKeyhole,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    UsersRound,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

const RolePermissionForm = ({
    roles,
    permissions,
}: RolePermissionPageProps) => {
    const allRoles = [
        ...roles.filter((role) => role.slug === 'system_administrator'),
        ...roles.filter((role) => role.slug !== 'system_administrator'),
    ];

    const hasEditableRoles = allRoles.some((role) => !role.preset);

    const [selectedRole, setSelectedRole] = useState<Role | null>(
        allRoles.find((role) => !role.preset) || allRoles[0] || null,
    );
    const [roleFormOpen, setRoleFormOpen] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const [roleSearch, setRoleSearch] = useState('');
    const [permissionSearch, setPermissionSearch] = useState('');

    const roleForm = useForm({
        name: '',
        slug: '',
        description: '',
    });
    const deleteForm = useForm({});

    const { data, setData, put, processing, errors } = useForm<{
        permissions: number[];
    }>({
        permissions: selectedRole?.permissions?.map((p) => p.id) || [],
    });

    useFlashToastHandler();

    useEffect(() => {
        if (!selectedRole) return;

        setData(
            'permissions',
            selectedRole.permissions?.map((permission) => permission.id) || [],
        );
    }, [selectedRole, permissions, setData]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedRole || selectedRole.preset) return;

        put(route('roles.update-permissions', selectedRole.id), {
            preserveScroll: true,
        });
    };

    const openCreateRole = () => {
        setEditingRoleId(null);
        roleForm.reset();
        roleForm.clearErrors();
        setRoleFormOpen(true);
    };

    const openEditRole = (role: Role | null = selectedRole) => {
        if (!role || role.preset) return;

        setSelectedRole(role);
        setEditingRoleId(role.id);
        roleForm.setData({
            name: role.name,
            slug: role.slug,
            description: role.description || '',
        });
        roleForm.clearErrors();
        setRoleFormOpen(true);
    };

    const handleRoleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => setRoleFormOpen(false),
        };

        if (editingRoleId) {
            roleForm.put(route('roles.update', editingRoleId), options);
        } else {
            roleForm.post(route('roles.store'), options);
        }
    };

    const deleteRole = async (role: Role | null = selectedRole) => {
        if (!role || role.preset || role.users_count || deleteForm.processing) {
            return;
        }

        const confirmation = await appSwal.fire({
            title: 'Delete role?',
            text: `Delete the ${role.name} role? This action cannot be undone.`,
            icon: 'warning',
            iconColor: 'var(--destructive)',
            showCancelButton: true,
            confirmButtonText: 'Delete role',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: {
                popup: 'rounded-2xl !border !border-destructive/20 !bg-card !text-foreground shadow-2xl',
                title: 'text-lg font-semibold tracking-tight',
                htmlContainer: 'text-sm text-muted-foreground',
                actions: 'gap-2',
                confirmButton:
                    'rounded-lg border border-destructive bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:opacity-90',
                cancelButton:
                    'rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted',
            },
        });

        if (!confirmation.isConfirmed) return;

        deleteForm.delete(route('roles.destroy', role.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedRole?.id === role.id) {
                    setSelectedRole(null);
                }
            },
        });
    };

    const groupedPermissions = permissions.reduce(
        (groups, permission) => {
            const module = permission.module || 'General';
            if (!groups[module]) groups[module] = [];
            groups[module].push(permission);
            return groups;
        },
        {} as Record<string, Permission[]>,
    );

    const query = permissionSearch.trim().toLowerCase();

    const visibleRoles = allRoles.filter((role) =>
        role.name.toLowerCase().includes(roleSearch.trim().toLowerCase()),
    );

    const visiblePermissionGroups = Object.entries(groupedPermissions)
        .map(
            ([module, modulePermissions]) =>
                [
                    module,
                    modulePermissions.filter(
                        (permission) =>
                            !query ||
                            module.toLowerCase().includes(query) ||
                            permission.name.toLowerCase().includes(query) ||
                            permission.slug.toLowerCase().includes(query) ||
                            (permission.description ?? '')
                                .toLowerCase()
                                .includes(query),
                    ),
                ] as const,
        )
        .filter(([, items]) => items.length > 0);

    const visiblePermissionIds = visiblePermissionGroups.flatMap(([, items]) =>
        items.map((permission) => permission.id),
    );

    const selectVisible =
        visiblePermissionIds.length > 0 &&
        visiblePermissionIds.every((id) => data.permissions.includes(id));

    const selectedPermissionCount = permissions.filter((permission) =>
        data.permissions.includes(permission.id),
    ).length;

    const toggleSelectAll = () => {
        if (!selectedRole) return;

        setData(
            'permissions',
            selectVisible
                ? data.permissions.filter(
                      (id) => !visiblePermissionIds.includes(id),
                  )
                : Array.from(
                      new Set([...data.permissions, ...visiblePermissionIds]),
                  ),
        );
    };

    const toggleModule = (ids: number[], allSelected: boolean) => {
        setData(
            'permissions',
            allSelected
                ? data.permissions.filter((id) => !ids.includes(id))
                : Array.from(new Set([...data.permissions, ...ids])),
        );
    };

    const togglePermission = (id: number, checked: boolean) => {
        setData(
            'permissions',
            checked
                ? Array.from(new Set([...data.permissions, id]))
                : data.permissions.filter(
                      (permissionId) => permissionId !== id,
                  ),
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administrative Tasks', href: '' },
        { title: 'Roles', href: route('roles.index') },
        { title: 'Role Permissions', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Permissions" />

            {/* Role create/edit dialog */}
            <Dialog open={roleFormOpen} onOpenChange={setRoleFormOpen}>
                <DialogContent className="gap-0 overflow-hidden rounded-2xl border-border/80 bg-card p-0 shadow-2xl sm:max-w-xl">
                    <DialogHeader className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-5 text-left">
                        <div className="absolute -top-14 right-8 -z-10 size-36 rounded-full bg-primary/10 blur-2xl" />
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-background/80 text-primary shadow-sm">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div className="min-w-0 space-y-1">
                                <DialogTitle className="text-base font-semibold tracking-tight">
                                    {editingRoleId ? 'Edit role' : 'Create role'}
                                </DialogTitle>
                                <DialogDescription className="text-xs leading-relaxed">
                                    Configure the role name, slug, and
                                    description.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form
                        onSubmit={handleRoleSubmit}
                        className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6"
                    >
                        <div className="space-y-1.5">
                            <Label htmlFor="role-name">
                                Role name{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="role-name"
                                value={roleForm.data.name}
                                onChange={(event) =>
                                    roleForm.setData('name', event.target.value)
                                }
                                maxLength={150}
                                required
                                className="h-9"
                                aria-invalid={Boolean(roleForm.errors.name)}
                            />
                            <InputError message={roleForm.errors.name} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="role-slug">
                                Slug <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="role-slug"
                                value={roleForm.data.slug}
                                onChange={(event) =>
                                    roleForm.setData('slug', event.target.value)
                                }
                                required
                                className="h-9"
                                aria-invalid={Boolean(roleForm.errors.slug)}
                            />
                            <InputError message={roleForm.errors.slug} />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="role-description">
                                Description
                            </Label>
                            <Input
                                id="role-description"
                                value={roleForm.data.description}
                                onChange={(event) =>
                                    roleForm.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                className="h-9"
                                aria-invalid={Boolean(
                                    roleForm.errors.description,
                                )}
                            />
                            <InputError message={roleForm.errors.description} />
                        </div>

                        <DialogFooter className="-mx-5 -mb-5 border-t border-border bg-muted/20 px-5 py-4 sm:col-span-2 sm:-mx-6 sm:-mb-6 sm:px-6">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={roleForm.processing}
                                onClick={() => setRoleFormOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={roleForm.processing}
                            >
                                {roleForm.processing && (
                                    <Loader2 className="size-4 animate-spin" />
                                )}
                                {roleForm.processing
                                    ? 'Saving...'
                                    : 'Save role'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="w-full min-w-0 space-y-4 pb-6 text-foreground">
                <header className="relative isolate overflow-hidden rounded-xl border border-border bg-gradient-to-r from-primary/10 via-card to-card px-4 py-4 shadow-sm sm:flex sm:items-center sm:justify-between sm:px-5">
                    <div className="absolute -top-20 right-24 -z-10 size-48 rounded-full bg-primary/10 blur-3xl" />
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-background/80 text-primary shadow-sm">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                                Access control
                            </p>
                            <h1 className="mt-0.5 text-xl leading-tight font-semibold tracking-tight">
                                Role permissions
                            </h1>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                Manage role access and permissions by module.
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0 sm:justify-end">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/70 px-3 py-2 text-xs shadow-sm">
                            <UsersRound className="size-3.5 text-muted-foreground" />
                            <strong className="font-semibold">
                                {allRoles.length}
                            </strong>
                            <span className="text-muted-foreground">roles</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/70 px-3 py-2 text-xs shadow-sm">
                            <KeyRound className="size-3.5 text-muted-foreground" />
                            <strong className="font-semibold">
                                {permissions.length}
                            </strong>
                            <span className="text-muted-foreground">
                                permissions
                            </span>
                        </span>
                        <Button
                            size="sm"
                            className="h-9 shadow-sm"
                            onClick={openCreateRole}
                        >
                            <Plus className="size-4" />
                            Add role
                        </Button>
                    </div>
                </header>

                <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(240px,0.24fr)_minmax(0,1fr)]">
                    {/* Roles sidebar */}
                    <aside className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:sticky lg:top-3">
                        <div className="border-b border-border bg-muted/15 px-3 py-3">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Roles
                                    </h2>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        {visibleRoles.length} of{' '}
                                        {allRoles.length} roles
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="size-8"
                                    title="Add role"
                                    aria-label="Add role"
                                    onClick={openCreateRole}
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </div>

                            <div className="relative mt-3">
                                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={roleSearch}
                                    onChange={(event) =>
                                        setRoleSearch(event.target.value)
                                    }
                                    placeholder="Search roles..."
                                    aria-label="Search roles"
                                    className="h-8 bg-background pl-8 text-xs"
                                />
                                {roleSearch && (
                                    <button
                                        type="button"
                                        aria-label="Clear role search"
                                        onClick={() => setRoleSearch('')}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-[40vh] space-y-1 overflow-y-auto p-1.5 lg:max-h-[calc(100vh-250px)]">
                            {visibleRoles.map((role) => {
                                const active = selectedRole?.id === role.id;
                                const assignedCount =
                                    role.permissions?.length ?? 0;

                                return (
                                    <div
                                        key={role.id}
                                        className={`group flex min-w-0 items-center gap-1 rounded-md border p-1 transition-colors ${
                                            active
                                                ? 'border-primary/30 bg-primary/5'
                                                : 'border-transparent hover:border-border hover:bg-muted/40'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() =>
                                                setSelectedRole(role)
                                            }
                                            className="flex min-w-0 flex-1 items-center gap-2 rounded px-1.5 py-2 text-left"
                                        >
                                            <span
                                                className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
                                                    active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {role.preset ? (
                                                    <LockKeyhole className="size-4" />
                                                ) : (
                                                    <ShieldCheck className="size-4" />
                                                )}
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-1">
                                                    <span className="truncate text-xs font-medium">
                                                        {role.name}
                                                    </span>
                                                    {role.preset && (
                                                        <LockKeyhole className="size-3 shrink-0 text-muted-foreground" />
                                                    )}
                                                </span>
                                                <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                                                    {role.users_count ?? 0}{' '}
                                                    users
                                                    <span className="mx-1">
                                                        ·
                                                    </span>
                                                    {assignedCount} permissions
                                                </span>
                                            </span>
                                        </button>

                                        {!role.preset && (
                                            <div className="flex shrink-0 items-center">
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-7"
                                                    title={`Edit ${role.name}`}
                                                    aria-label={`Edit ${role.name}`}
                                                    onClick={() =>
                                                        openEditRole(role)
                                                    }
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-7"
                                                    disabled={
                                                        !!role.users_count ||
                                                        deleteForm.processing
                                                    }
                                                    title={
                                                        role.users_count
                                                            ? 'Remove this role from its users before deleting it'
                                                            : `Delete ${role.name}`
                                                    }
                                                    aria-label={`Delete ${role.name}`}
                                                    onClick={() =>
                                                        deleteRole(role)
                                                    }
                                                >
                                                    <Trash2 className="size-3.5 text-destructive" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {visibleRoles.length === 0 && (
                                <p className="px-3 py-7 text-center text-xs text-muted-foreground">
                                    No roles match your search.
                                </p>
                            )}
                        </div>

                        <div className="border-t border-border bg-muted/15 px-3 py-2">
                            <p className="text-[10px] leading-relaxed text-muted-foreground">
                                Preset roles are locked. Create a custom role to
                                configure access.
                            </p>
                        </div>
                    </aside>

                    {/* Permissions panel */}
                    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        {selectedRole ? (
                            <form onSubmit={handleSubmit}>
                                {/* Selected role summary */}
                                <div className="flex flex-col gap-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-background text-primary shadow-sm">
                                            {selectedRole.preset ? (
                                                <LockKeyhole className="size-4" />
                                            ) : (
                                                <ShieldCheck className="size-4" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <h2 className="truncate text-sm font-semibold">
                                                    {selectedRole.name}
                                                </h2>
                                                {selectedRole.preset && (
                                                    <span className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                                                        PRESET
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                                {selectedRole.description ||
                                                    selectedRole.slug.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-[11px] text-muted-foreground">
                                            <UsersRound className="size-3.5" />
                                            {selectedRole.users_count ?? 0}{' '}
                                            users
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-[11px] text-muted-foreground">
                                            <KeyRound className="size-3.5" />
                                            {selectedPermissionCount}/
                                            {permissions.length}
                                        </span>

                                        {!selectedRole.preset && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs"
                                                disabled={
                                                    visiblePermissionIds.length ===
                                                    0
                                                }
                                                onClick={toggleSelectAll}
                                            >
                                                {selectVisible
                                                    ? 'Clear visible'
                                                    : 'Select visible'}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {selectedRole.preset && (
                                    <div className="flex flex-col gap-2 border-b border-amber-500/20 bg-amber-500/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                                            <LockKeyhole className="size-3.5 shrink-0" />
                                            Permissions for this preset role
                                            cannot be changed.
                                        </p>
                                        {!hasEditableRoles && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-7 bg-background text-xs"
                                                onClick={openCreateRole}
                                            >
                                                <Plus className="size-3.5" />
                                                Create custom role
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Search and permission controls */}
                                <div className="flex flex-col gap-2 border-b border-border bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                    <div className="flex items-center gap-2">
                                        <KeyRound className="size-4 text-primary" />
                                        <div>
                                            <h3 className="text-xs font-semibold">
                                                Permissions by module
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground">
                                                {visiblePermissionIds.length}{' '}
                                                permissions shown
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative w-full sm:max-w-xs">
                                        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={permissionSearch}
                                            onChange={(event) =>
                                                setPermissionSearch(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Search name, module, or slug..."
                                            aria-label="Search permissions"
                                            className="h-8 bg-background pr-8 pl-8 text-xs"
                                        />
                                        {permissionSearch && (
                                            <button
                                                type="button"
                                                aria-label="Clear permission search"
                                                onClick={() =>
                                                    setPermissionSearch('')
                                                }
                                                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Dense, scrollable permission groups */}
                                <div className="max-h-[min(68vh,900px)] space-y-2 overflow-y-auto bg-muted/[0.03] p-3 sm:p-4">
                                    {visiblePermissionGroups.map(
                                        ([module, perms]) => {
                                            const ids = perms.map(
                                                (permission) => permission.id,
                                            );
                                            const selectedCount = ids.filter(
                                                (id) =>
                                                    data.permissions.includes(
                                                        id,
                                                    ),
                                            ).length;
                                            const allSelected =
                                                selectedCount === ids.length;

                                            return (
                                                <div
                                                    key={module}
                                                    className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                                                >
                                                    <div className="flex min-h-10 items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <h4 className="truncate text-[11px] font-semibold tracking-wide uppercase">
                                                                {module.replaceAll(
                                                                    '-',
                                                                    ' ',
                                                                )}
                                                            </h4>
                                                            <span className="shrink-0 rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground tabular-nums">
                                                                {selectedCount}/
                                                                {ids.length}
                                                            </span>
                                                        </div>

                                                        {!selectedRole.preset && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 shrink-0 px-2 text-[10px]"
                                                                onClick={() =>
                                                                    toggleModule(
                                                                        ids,
                                                                        allSelected,
                                                                    )
                                                                }
                                                            >
                                                                {allSelected
                                                                    ? 'Clear module'
                                                                    : 'Select module'}
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-1 p-1.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                                        {perms.map(
                                                            (permission) => {
                                                                const checked =
                                                                    data.permissions.includes(
                                                                        permission.id,
                                                                    );

                                                                return (
                                                                    <label
                                                                        key={
                                                                            permission.id
                                                                        }
                                                                        className={`flex min-w-0 items-center gap-2 rounded border px-2 py-1.5 transition-colors ${
                                                                            checked
                                                                                ? 'border-primary/25 bg-primary/5'
                                                                                : 'border-transparent hover:border-border hover:bg-muted/30'
                                                                        } ${
                                                                            selectedRole.preset
                                                                                ? 'cursor-default'
                                                                                : 'cursor-pointer'
                                                                        }`}
                                                                    >
                                                                        <Input
                                                                            type="checkbox"
                                                                            disabled={
                                                                                selectedRole.preset
                                                                            }
                                                                            checked={
                                                                                checked
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                togglePermission(
                                                                                    permission.id,
                                                                                    event
                                                                                        .target
                                                                                        .checked,
                                                                                )
                                                                            }
                                                                            className="size-3.5 shrink-0"
                                                                        />

                                                                        <span className="min-w-0 flex-1">
                                                                            <span className="block truncate text-[11px] leading-4 font-medium">
                                                                                {
                                                                                    permission.name
                                                                                }
                                                                            </span>
                                                                            {permission.description && (
                                                                                <Tooltip>
                                                                                    <TooltipTrigger
                                                                                        asChild
                                                                                    >
                                                                                        <span className="mt-0.5 block truncate text-[10px] leading-3 text-muted-foreground">
                                                                                            {
                                                                                                permission.description
                                                                                            }
                                                                                        </span>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent className="max-w-xs text-xs">
                                                                                        {
                                                                                            permission.description
                                                                                        }
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            )}
                                                                        </span>

                                                                        {checked && (
                                                                            <Check className="size-3.5 shrink-0 text-primary" />
                                                                        )}
                                                                    </label>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}

                                    {visiblePermissionGroups.length === 0 && (
                                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border px-4 py-10 text-center">
                                            <Search className="size-5 text-muted-foreground" />
                                            <p className="mt-2 text-sm font-medium">
                                                No matching permissions
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Try another search term.
                                            </p>
                                            {permissionSearch && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-2 h-7 text-xs"
                                                    onClick={() =>
                                                        setPermissionSearch('')
                                                    }
                                                >
                                                    Clear search
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Compact sticky save bar */}
                                {!selectedRole.preset && (
                                    <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-border bg-card/95 px-4 py-3 shadow-[0_-8px_24px_-20px_hsl(var(--foreground)/0.4)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                <CheckCheck className="size-3.5" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium">
                                                    {selectedPermissionCount}{' '}
                                                    permissions selected
                                                </p>
                                                <div className="text-[10px] text-muted-foreground">
                                                    Review your changes before
                                                    saving.
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <InputError
                                                    message={errors.permissions}
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={processing}
                                            className="sm:ml-auto"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCheck className="size-3.5" />
                                                    Save permissions
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="flex min-h-64 flex-col items-center justify-center px-5 py-10 text-center">
                                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <ShieldCheck className="size-5" />
                                </div>
                                <h2 className="mt-3 text-sm font-semibold">
                                    Select a role
                                </h2>
                                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                                    Choose a role from the sidebar to view and
                                    manage its permissions.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </CustomAuthLayout>
    );
};

export default RolePermissionForm;
