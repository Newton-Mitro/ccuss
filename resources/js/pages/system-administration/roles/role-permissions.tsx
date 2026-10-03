import type { RolePermissionPageProps } from '@/types/system-administration';
import { Head, useForm } from '@inertiajs/react';
import { CheckCheck, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '../../../components/ui/tooltip';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import type { Permission, Role } from '../../../types/user';

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

    const [selectedRole, setSelectedRole] = useState<Role | null>(
        allRoles[0] || null,
    );

    const [roleFormOpen, setRoleFormOpen] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

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

    const deleteRole = (role: Role | null = selectedRole) => {
        if (!role || role.preset || role.users_count || deleteForm.processing) {
            return;
        }
        if (!window.confirm(`Delete the ${role.name} role?`)) return;

        deleteForm.delete(route('roles.destroy', role.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedRole?.id === role.id) setSelectedRole(null);
            },
        });
    };

    const toggleSelectAll = () => {
        if (!selectedRole) return;
        if (selectAll) {
            setData('permissions', []);
        } else {
            setData(
                'permissions',
                permissions.map((permission) => permission.id),
            );
        }
    };

    const selectAll =
        permissions.length > 0 &&
        permissions.every((permission) =>
            data.permissions.includes(permission.id),
        );

    const groupedPermissions = permissions.reduce(
        (acc, perm) => {
            if (!acc[perm.module]) acc[perm.module] = [];
            acc[perm.module].push(perm);
            return acc;
        },
        {} as Record<string, Permission[]>,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administrative Tasks', href: '' },
        { title: 'Roles', href: route('roles.index') },
        { title: 'Role Permissions', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Assign Permissions" />
            <HeadingSmall
                title="Assign Role Permissions"
                description="Select a role and assign permissions."
            />

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

            <div className="mt-4 flex gap-4">
                {/* Left: Role List */}
                <div className="flex h-[76vh] w-72 shrink-0 flex-col rounded-md border bg-card p-3">
                    <div className="flex shrink-0 items-center justify-between py-2">
                        <span className="text-sm">Roles</span>
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            title="Add role"
                            aria-label="Add role"
                            onClick={openCreateRole}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
                        {allRoles.map((role) => (
                            <div
                                key={role.id}
                                className="flex items-center gap-1"
                            >
                                <button
                                    type="button"
                                    className={`min-w-0 flex-1 cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-all ${
                                        selectedRole?.id === role.id
                                            ? 'bg-primary font-medium text-primary-foreground shadow'
                                            : 'hover:bg-muted'
                                    }`}
                                    onClick={() => setSelectedRole(role)}
                                >
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="truncate">
                                            {role.name}
                                        </span>
                                        {role.preset && (
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                Preset
                                            </span>
                                        )}
                                    </span>
                                </button>
                                {!role.preset && (
                                    <div className="flex shrink-0 items-center">
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            title={`Edit ${role.name}`}
                                            aria-label={`Edit ${role.name}`}
                                            onClick={() => openEditRole(role)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
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
                                            onClick={() => deleteRole(role)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Permissions */}
                <div className="min-w-0 flex-1 space-y-4 rounded-md border bg-card p-4">
                    <form onSubmit={handleSubmit}>
                        {selectedRole && (
                            <>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">
                                        Permissions
                                    </Label>
                                    {!selectedRole.preset && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={toggleSelectAll}
                                        >
                                            {selectAll
                                                ? 'Clear All'
                                                : 'Select All'}
                                        </Button>
                                    )}
                                </div>

                                <div className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent h-[63vh] space-y-4 overflow-y-auto rounded-md border">
                                    {Object.entries(groupedPermissions).map(
                                        ([module, perms]) => {
                                            const ids = perms.map((p) => p.id);
                                            const allSelected = ids.every(
                                                (id) =>
                                                    data.permissions.includes(
                                                        id,
                                                    ),
                                            );

                                            return (
                                                <div
                                                    key={module}
                                                    className="rounded-lg"
                                                >
                                                    {/* Module Header */}
                                                    <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-lg border-b bg-background/80 px-4 py-2 backdrop-blur">
                                                        <h3 className="text-sm font-semibold capitalize">
                                                            {module.replace(
                                                                '-',
                                                                ' ',
                                                            )}
                                                        </h3>
                                                        {!selectedRole.preset && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-xs"
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
                                                                    : 'Select'}{' '}
                                                                Section
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Permission Grid */}
                                                    <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-3 lg:grid-cols-4">
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
                                                                    className={`group flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all ${
                                                                        checked
                                                                            ? 'border-primary bg-primary/10'
                                                                            : 'hover:bg-muted/50'
                                                                    } ${selectedRole.preset ? 'cursor-default' : 'cursor-pointer'}`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            disabled={
                                                                                selectedRole.preset
                                                                            }
                                                                            checked={
                                                                                checked
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) => {
                                                                                if (
                                                                                    selectedRole.preset
                                                                                ) {
                                                                                    return;
                                                                                }
                                                                                if (
                                                                                    e
                                                                                        .target
                                                                                        .checked
                                                                                ) {
                                                                                    setData(
                                                                                        'permissions',
                                                                                        [
                                                                                            ...data.permissions,
                                                                                            perm.id,
                                                                                        ],
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
                                                                            className="h-4 w-4"
                                                                        />
                                                                        <div className="flex flex-col">
                                                                            <Tooltip>
                                                                                <TooltipTrigger
                                                                                    asChild
                                                                                >
                                                                                    <span className="capitalize">
                                                                                        {
                                                                                            perm.name
                                                                                        }
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <span className="text-xs">
                                                                                        {
                                                                                            perm.description
                                                                                        }
                                                                                    </span>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </div>
                                                                    </div>
                                                                    {checked && (
                                                                        <CheckCheck className="h-4 w-4 text-primary opacity-80" />
                                                                    )}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                                {!selectedRole.preset && (
                                    <>
                                        <InputError
                                            message={errors.permissions}
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCheck className="mr-2 h-4 w-4" />
                                                        Save Permissions
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </form>
                </div>
            </div>
        </CustomAuthLayout>
    );
};

export default RolePermissionForm;
