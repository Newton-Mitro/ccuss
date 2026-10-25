import type { RolePermissionPageProps } from '@/modules/administration-security/types/page-props';
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
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
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
import { BreadcrumbItem } from '@/types';
import type { Permission, Role } from '@/modules/administration-security/types/user';

const RolePermissionForm = ({
    roles,
    permissions,
}: RolePermissionPageProps) => {
    const systemAdminRole = roles.filter(
        (r) => r.slug == 'system_administrator',
    );

    const filteredRoles = roles.filter(
        (role) => role.slug !== 'system_administrator',
    );

    const allRoles = [...systemAdminRole, ...filteredRoles];
    const hasEditableRoles = allRoles.some((role) => !role.preset);

    const [selectedRole, setSelectedRole] = useState<Role | null>(
        allRoles.find((role) => !role.preset) || allRoles[0] || null,
    );

    const [roleFormOpen, setRoleFormOpen] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const [roleSearch, setRoleSearch] = useState('');
    const [permissionSearch, setPermissionSearch] = useState('');

    const roleForm = useForm({ name: '', slug: '', description: '' });
    const deleteForm = useForm({});

    const { data, setData, put, processing, errors } = useForm({
        permissions: selectedRole?.permissions?.map((p) => p.id) || [],
    });

    useFlashToastHandler();

    useEffect(() => {
        if (!selectedRole) return;

        const initialPermissions =
            selectedRole.permissions?.map((p) => p.id) || [];
        setData('permissions', initialPermissions);
    }, [selectedRole, permissions, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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

    const handleRoleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
            showCancelButton: true,
            confirmButtonText: 'Delete role',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        });
        if (!confirmation.isConfirmed) return;

        deleteForm.delete(route('roles.destroy', role.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedRole?.id === role.id) setSelectedRole(null);
            },
        });
    };

    const groupedPermissions = permissions.reduce(
        (acc, perm) => {
            const module = perm.module || 'General';
            if (!acc[module]) acc[module] = [];
            acc[module].push(perm);
            return acc;
        },
        {} as Record<string, Permission[]>,
    );

    const visibleRoles = allRoles.filter((role) =>
        role.name.toLowerCase().includes(roleSearch.trim().toLowerCase()),
    );
    const visiblePermissionGroups = Object.entries(groupedPermissions)
        .map(
            ([module, modulePermissions]) =>
                [
                    module,
                    modulePermissions.filter((permission) => {
                        const query = permissionSearch.trim().toLowerCase();
                        return (
                            !query ||
                            module.toLowerCase().includes(query) ||
                            permission.name.toLowerCase().includes(query) ||
                            permission.slug.toLowerCase().includes(query) ||
                            (permission.description ?? '')
                                .toLowerCase()
                                .includes(query)
                        );
                    }),
                ] as const,
        )
        .filter(([, modulePermissions]) => modulePermissions.length > 0);
    const visiblePermissionIds = visiblePermissionGroups.flatMap(([, items]) =>
        items.map((permission) => permission.id),
    );

    const toggleSelectAll = () => {
        if (!selectedRole) return;
        if (selectVisible) {
            setData(
                'permissions',
                data.permissions.filter(
                    (permissionId) =>
                        !visiblePermissionIds.includes(permissionId),
                ),
            );
        } else {
            setData(
                'permissions',
                Array.from(
                    new Set([...data.permissions, ...visiblePermissionIds]),
                ),
            );
        }
    };

    const selectVisible =
        visiblePermissionIds.length > 0 &&
        visiblePermissionIds.every((permissionId) =>
            data.permissions.includes(permissionId),
        );
    const selectedPermissionCount = permissions.reduce(
        (total, permission) =>
            total + Number(data.permissions.includes(permission.id)),
        0,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administrative Tasks', href: '' },
        { title: 'Roles', href: route('roles.index') },
        { title: 'Role Permissions', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Permissions" />

            <Dialog open={roleFormOpen} onOpenChange={setRoleFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingRoleId ? 'Edit Role' : 'Create Role'}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the role name, slug, and description.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRoleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="role-name">Name</Label>
                            <Input
                                id="role-name"
                                value={roleForm.data.name}
                                onChange={(event) =>
                                    roleForm.setData('name', event.target.value)
                                }
                            />
                            <InputError message={roleForm.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role-slug">Slug</Label>
                            <Input
                                id="role-slug"
                                value={roleForm.data.slug}
                                onChange={(event) =>
                                    roleForm.setData('slug', event.target.value)
                                }
                            />
                            <InputError message={roleForm.errors.slug} />
                        </div>
                        <div className="space-y-2">
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
                            />
                            <InputError message={roleForm.errors.description} />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRoleFormOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={roleForm.processing}
                            >
                                {roleForm.processing
                                    ? 'Saving...'
                                    : 'Save Role'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="mx-auto w-full max-w-7xl space-y-5 pb-8 text-foreground">
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                            Access control
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Role permissions
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Choose a role, review its access, and manage
                            permissions by module.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                            {allRoles.length} roles
                        </span>
                        <span className="rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                            {permissions.length} permissions
                        </span>
                    </div>
                </div>

                <div className="grid items-start gap-4 lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]">
                    <aside className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:sticky lg:top-4">
                        <div className="border-b border-border bg-muted/15 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Roles
                                    </h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {hasEditableRoles
                                            ? 'Preset roles are locked. Select a custom role to manage access.'
                                            : 'All current roles are presets. Create a custom role to manage access.'}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    title="Add role"
                                    aria-label="Add role"
                                    onClick={openCreateRole}
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </div>
                            <div className="relative mt-3">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={roleSearch}
                                    onChange={(event) =>
                                        setRoleSearch(event.target.value)
                                    }
                                    placeholder="Find a role..."
                                    aria-label="Search roles"
                                    className="h-9 bg-background pl-9 text-sm"
                                />
                            </div>
                        </div>
                        <div className="max-h-[60vh] space-y-1 overflow-y-auto p-2 lg:max-h-[calc(100vh-310px)]">
                            {visibleRoles.map((role) => {
                                const active = selectedRole?.id === role.id;
                                const assignedCount =
                                    role.permissions?.length ?? 0;

                                return (
                                    <div
                                        key={role.id}
                                        className={`group flex items-center gap-1 rounded-xl border p-1 transition-colors ${
                                            active
                                                ? 'border-primary/30 bg-primary/5'
                                                : 'border-transparent hover:border-border hover:bg-muted/40'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            aria-pressed={active}
                                            className="min-w-0 flex-1 rounded-lg px-2.5 py-2 text-left"
                                            onClick={() =>
                                                setSelectedRole(role)
                                            }
                                        >
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                                                        active
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    <ShieldCheck className="size-4" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="truncate text-sm font-medium">
                                                            {role.name}
                                                        </span>
                                                        {role.preset && (
                                                            <LockKeyhole className="size-3 shrink-0 text-muted-foreground" />
                                                        )}
                                                    </span>
                                                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                                                        {role.users_count ?? 0}{' '}
                                                        users · {assignedCount}{' '}
                                                        permissions
                                                    </span>
                                                </span>
                                            </span>
                                        </button>
                                        {!role.preset && (
                                            <div className="flex shrink-0">
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-8"
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
                                                    className="size-8"
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
                                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                                    No roles match your search.
                                </p>
                            )}
                        </div>
                    </aside>

                    <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        {selectedRole ? (
                            <form onSubmit={handleSubmit}>
                                <div className="border-b border-border bg-muted/15 p-4 sm:p-5">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                {selectedRole.preset ? (
                                                    <LockKeyhole className="size-5" />
                                                ) : (
                                                    <ShieldCheck className="size-5" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="truncate text-lg font-semibold">
                                                        {selectedRole.name}
                                                    </h2>
                                                    {selectedRole.preset && (
                                                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                            Preset role
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {selectedRole.description ||
                                                        selectedRole.slug.replaceAll(
                                                            '_',
                                                            ' ',
                                                        )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground">
                                                <UsersRound className="size-3.5" />
                                                {selectedRole.users_count ?? 0}{' '}
                                                users
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground">
                                                <KeyRound className="size-3.5" />
                                                {selectedPermissionCount} /{' '}
                                                {permissions.length} selected
                                            </span>
                                            {!selectedRole.preset && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={toggleSelectAll}
                                                >
                                                    {selectVisible
                                                        ? 'Clear visible'
                                                        : permissionSearch
                                                          ? 'Select visible'
                                                          : 'Select all'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {selectedRole.preset && (
                                        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 sm:flex-row sm:items-center sm:justify-between dark:text-amber-300">
                                            <span className="flex items-center gap-2">
                                                <LockKeyhole className="size-3.5 shrink-0" />
                                                Preset role permissions are
                                                locked.
                                                {!hasEditableRoles &&
                                                    ' Create a custom role to assign permissions.'}
                                            </span>
                                            {!hasEditableRoles && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 shrink-0 bg-background px-2 text-xs"
                                                    onClick={openCreateRole}
                                                >
                                                    <Plus className="size-3.5" />
                                                    Create custom role
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                                            <KeyRound className="size-4 text-primary" />
                                            Permissions by module
                                        </h3>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Toggle individual permissions or
                                            update a whole module.
                                        </p>
                                    </div>
                                    <div className="relative w-full sm:w-64">
                                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={permissionSearch}
                                            onChange={(event) =>
                                                setPermissionSearch(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Search permissions..."
                                            aria-label="Search permissions"
                                            className="h-9 bg-background pl-9 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="max-h-[55vh] space-y-3 overflow-y-auto p-3 sm:p-4">
                                    {visiblePermissionGroups.map(
                                        ([module, perms]) => {
                                            const ids = perms.map(
                                                (permission) => permission.id,
                                            );
                                            const allSelected = ids.every(
                                                (id) =>
                                                    data.permissions.includes(
                                                        id,
                                                    ),
                                            );

                                            return (
                                                <div
                                                    key={module}
                                                    className="overflow-hidden rounded-xl border border-border/80"
                                                >
                                                    <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/25 px-3 py-2">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <h4 className="truncate text-xs font-semibold tracking-wide uppercase">
                                                                {module.replaceAll(
                                                                    '-',
                                                                    ' ',
                                                                )}
                                                            </h4>
                                                            <span className="rounded-full bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                                                                {
                                                                    ids.filter(
                                                                        (id) =>
                                                                            data.permissions.includes(
                                                                                id,
                                                                            ),
                                                                    ).length
                                                                }{' '}
                                                                / {ids.length}
                                                            </span>
                                                        </div>
                                                        {!selectedRole.preset && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 px-2 text-xs"
                                                                onClick={() => {
                                                                    if (
                                                                        allSelected
                                                                    ) {
                                                                        setData(
                                                                            'permissions',
                                                                            data.permissions.filter(
                                                                                (
                                                                                    id,
                                                                                ) =>
                                                                                    !ids.includes(
                                                                                        id,
                                                                                    ),
                                                                            ),
                                                                        );
                                                                    } else {
                                                                        setData(
                                                                            'permissions',
                                                                            Array.from(
                                                                                new Set(
                                                                                    [
                                                                                        ...data.permissions,
                                                                                        ...ids,
                                                                                    ],
                                                                                ),
                                                                            ),
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                {allSelected
                                                                    ? 'Clear'
                                                                    : 'Select'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div className="grid gap-1.5 p-2 sm:grid-cols-2 xl:grid-cols-3">
                                                        {perms.map((perm) => {
                                                            const checked =
                                                                data.permissions.includes(
                                                                    perm.id,
                                                                );
                                                            return (
                                                                <label
                                                                    key={
                                                                        perm.id
                                                                    }
                                                                    className={`flex min-w-0 items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors ${
                                                                        checked
                                                                            ? 'border-primary/30 bg-primary/5'
                                                                            : 'border-transparent bg-muted/20 hover:border-border hover:bg-muted/50'
                                                                    } ${selectedRole.preset ? 'cursor-default' : 'cursor-pointer'}`}
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
                                                                        ) => {
                                                                            if (
                                                                                event
                                                                                    .target
                                                                                    .checked
                                                                            ) {
                                                                                setData(
                                                                                    'permissions',
                                                                                    Array.from(
                                                                                        new Set(
                                                                                            [
                                                                                                ...data.permissions,
                                                                                                perm.id,
                                                                                            ],
                                                                                        ),
                                                                                    ),
                                                                                );
                                                                            } else {
                                                                                setData(
                                                                                    'permissions',
                                                                                    data.permissions.filter(
                                                                                        (
                                                                                            id,
                                                                                        ) =>
                                                                                            id !==
                                                                                            perm.id,
                                                                                    ),
                                                                                );
                                                                            }
                                                                        }}
                                                                        className="size-4 shrink-0"
                                                                    />
                                                                    <span className="min-w-0 flex-1">
                                                                        <span className="block truncate text-xs font-medium">
                                                                            {
                                                                                perm.name
                                                                            }
                                                                        </span>
                                                                        {perm.description && (
                                                                            <Tooltip>
                                                                                <TooltipTrigger
                                                                                    asChild
                                                                                >
                                                                                    <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                                                                                        {
                                                                                            perm.description
                                                                                        }
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    {
                                                                                        perm.description
                                                                                    }
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        )}
                                                                    </span>
                                                                    {checked && (
                                                                        <Check className="size-4 shrink-0 text-primary" />
                                                                    )}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                    {visiblePermissionGroups.length === 0 && (
                                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
                                            <Search className="size-5 text-muted-foreground" />
                                            <p className="mt-2 text-sm font-medium">
                                                No matching permissions
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Try a different search term.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {!selectedRole.preset && (
                                    <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                                        <InputError
                                            message={errors.permissions}
                                        />
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="sm:ml-auto"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCheck className="size-4" />
                                                    Save permissions
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                                <ShieldCheck className="size-8 text-muted-foreground" />
                                <h2 className="mt-3 text-sm font-semibold">
                                    Select a role
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Choose a role from the list to inspect its
                                    permissions.
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
