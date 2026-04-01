import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCheck, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Permission, Role } from '../../../types/user';

interface RolePermissionFormProps extends SharedData {
    roles: Role[];
    permissions: Permission[];
}

const RolePermissionForm = ({
    roles,
    permissions,
}: RolePermissionFormProps) => {
    const { flash } = usePage<RolePermissionFormProps>().props;

    const filteredRoles = roles.filter(
        (role) => role.name.toLowerCase() !== 'system administrator',
    );
    const [selectedRole, setSelectedRole] = useState<Role | null>(
        filteredRoles[0] || null,
    );
    const [selectAll, setSelectAll] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        permissions: selectedRole?.permissions?.map((p) => p.id) || [],
    });

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    useEffect(() => {
        if (!selectedRole) return;

        const initialPermissions =
            selectedRole.permissions?.map((p) => p.id) || [];
        setData('permissions', initialPermissions);

        // Wrap setSelectAll in a microtask to avoid sync state update in effect
        Promise.resolve().then(() => {
            setSelectAll(initialPermissions.length === permissions.length);
        });
    }, [selectedRole, permissions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;
        put(route('roles.update-permissions', selectedRole.id), {
            data,
            preserveScroll: true,
            onSuccess: () => toast.success('Permissions updated successfully!'),
            onError: (err) => toast.error(JSON.stringify(err)),
        });
    };

    const toggleSelectAll = () => {
        if (!selectedRole) return;
        if (selectAll) {
            setData('permissions', []);
            setSelectAll(false);
        } else {
            setData(
                'permissions',
                permissions.map((p) => p.id),
            );
            setSelectAll(true);
        }
    };

    const groupedPermissions = permissions.reduce(
        (acc, perm) => {
            if (!acc[perm.module]) acc[perm.module] = [];
            acc[perm.module].push(perm);
            return acc;
        },
        {} as Record<string, Permission[]>,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles', href: '/roles' },
        { title: 'Role Permissions', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Assign Permissions" />
            <HeadingSmall
                title="Assign Role Permissions"
                description="Select a role and assign permissions."
            />

            <form onSubmit={handleSubmit} className="mt-4 flex gap-4">
                {/* Left: Role List */}
                <div className="w-64 shrink-0 space-y-2 rounded-md border bg-card p-3">
                    <div className="py-2 text-sm">Roles</div>
                    {filteredRoles.map((role) => (
                        <button
                            key={role.id}
                            type="button"
                            className={`w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-all ${
                                selectedRole?.id === role.id
                                    ? 'bg-primary font-medium text-primary-foreground shadow'
                                    : 'hover:bg-muted'
                            }`}
                            onClick={() => setSelectedRole(role)}
                        >
                            {role.name}
                        </button>
                    ))}
                </div>

                {/* Right: Permissions */}
                <div className="flex-1 space-y-4 rounded-md border bg-card p-4">
                    {selectedRole && (
                        <>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">Permissions</Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={toggleSelectAll}
                                >
                                    {selectAll ? 'Clear All' : 'Select All'}
                                </Button>
                            </div>

                            <div className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent max-h-[65vh] space-y-4 overflow-y-auto rounded-md border">
                                {Object.entries(groupedPermissions).map(
                                    ([module, perms]) => {
                                        const ids = perms.map((p) => p.id);
                                        const allSelected = ids.every((id) =>
                                            data.permissions.includes(id),
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
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs"
                                                        onClick={() => {
                                                            if (allSelected) {
                                                                setData(
                                                                    'permissions',
                                                                    data.permissions.filter(
                                                                        (id) =>
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
                                                                key={perm.id}
                                                                className={`group flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all ${
                                                                    checked
                                                                        ? 'border-primary bg-primary/10 shadow-sm'
                                                                        : 'hover:bg-muted/50'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            checked
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
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
                                                                        <span className="capitalize">
                                                                            {
                                                                                perm.name
                                                                            }
                                                                        </span>
                                                                        {/* <span className="text-xs">
                                                                            {
                                                                                perm.description
                                                                            }
                                                                        </span> */}
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
                            <InputError message={errors.permissions} />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
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
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default RolePermissionForm;
