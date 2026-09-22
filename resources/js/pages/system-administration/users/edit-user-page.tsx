import type { UserFormPageProps } from '@/types/system-administration';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Key, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '../../../components/ui/tooltip';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import type { Permission, Role } from '../../../types/user';

const UserForm = ({
    user,
    roles,
    organizations,
    permissions,
    auth,
}: UserFormPageProps) => {
    useFlashToastHandler();

    const handleBack = () => window.history.back();

    const isEdit = !!user;

    const { data, setData, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        organization_id: user?.organization_id || '',
        roles: user?.roles?.map((r: any) => r.id) || [],
        permissions: user?.permissions?.map((p: any) => p.id) || [],
        photo: null as File | null,
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        user?.avatar || null,
    );
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file) return;
            // Validate type
            if (!file.type.startsWith('image/')) {
                alert('Only image files are allowed');
                return;
            }
            // Optional: limit size (e.g., 3MB)
            if (file.size > 3 * 1024 * 1024) {
                alert('Image must be less than 2MB');
                return;
            }
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                    value.forEach((v) => payload.append(`${key}[]`, v));
                } else {
                    payload.append(key, value as any);
                }
            }
        });

        if (isEdit) {
            payload.append('_method', 'PUT'); // ✅ method spoofing

            router.post(`/users/${user.id}`, payload, {
                preserveScroll: true,
                forceFormData: true,
            });
        } else {
            router.post('/users', payload, {
                preserveScroll: true,
                forceFormData: true,
            });
        }
    };

    const systemAdminRole = auth.user.roles.filter(
        (r) => r.slug == 'system_administrator',
    );

    const filteredRoles = roles.filter(
        (role) => role.slug !== 'system_administrator',
    );

    const allRoles = [...systemAdminRole, ...filteredRoles];

    const [selectedRole, setSelectedRole] = useState<Role | null>(
        allRoles[0] || null,
    );

    const [selectAll, setSelectAll] = useState(false);

    useFlashToastHandler();

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
        { title: 'System Administration', href: '' },
        { title: 'Users', href: route('users.index') },
        { title: isEdit ? `Edit ${user.name}` : 'Create User', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? `Edit User - ${user.name}` : 'Create User'} />
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={isEdit ? `Edit User: ${user.name}` : 'Create User'}
                    description="Manage user details and roles."
                />
                <div className="flex flex-wrap gap-2">
                    <div className="">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-sm text-card-foreground transition-all hover:bg-card/50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    </div>
                    <Link
                        href="/users"
                        className="flex items-center gap-1 rounded bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition hover:bg-secondary/90"
                    >
                        <Key className="h-4 w-4" />
                        <span className="hidden sm:inline">Users</span>
                    </Link>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full space-y-4 rounded-md border bg-card p-4 sm:p-6"
            >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    {/* LEFT: FORM */}
                    <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div>
                            <Label className="text-xs">Organization</Label>
                            <Select
                                value={data.organization_id?.toString()}
                                onChange={(val) =>
                                    setData('organization_id', Number(val))
                                }
                                options={organizations.map((org) => ({
                                    value: org.id.toString(),
                                    label: org.name,
                                }))}
                                placeholder="Select Organization"
                            />
                            <InputError message={errors.organization_id} />
                        </div>

                        <div>
                            <Label className="text-xs">Name</Label>
                            <Input
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="h-9 text-sm"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div>
                            <Label className="text-xs">Email</Label>
                            <Input
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className="h-9 text-sm"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div>
                            <Label className="text-xs">Password</Label>
                            <Input
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="h-9 text-sm"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div>
                            <Label className="text-xs">Confirm Password</Label>
                            <Input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                className="h-9 text-sm"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>
                    </div>

                    {/* RIGHT: AVATAR */}
                    <div className="flex w-full justify-center lg:w-64 lg:justify-center">
                        <label className="group relative cursor-pointer">
                            {/* Avatar */}
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="h-32 w-32 rounded-full border object-cover sm:h-40 sm:w-40"
                                />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-full border bg-background sm:h-40 sm:w-40">
                                    <span className="text-sm font-semibold text-muted-foreground">
                                        No Photo
                                    </span>
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 hidden items-center justify-center rounded-full bg-black/50 transition group-hover:flex">
                                <span className="text-xs font-medium text-white">
                                    Upload
                                </span>
                            </div>

                            {/* Input */}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* ROLES */}
                <div>
                    <Label className="text-xs font-medium">Roles</Label>

                    <div className="mt-1 grid grid-cols-3 gap-2 overflow-y-auto rounded-md border p-2">
                        {allRoles.map((role) => {
                            const isChecked = data.roles.includes(role.id);

                            return (
                                <div
                                    key={role.id}
                                    className="flex items-center gap-3 rounded-md border p-2 hover:bg-accent/30"
                                >
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        value={role.id}
                                        checked={isChecked}
                                        onChange={(e) => {
                                            const roleId = role.id;

                                            if (e.target.checked) {
                                                setData('roles', [
                                                    ...data.roles,
                                                    roleId,
                                                ]);
                                            } else {
                                                setData(
                                                    'roles',
                                                    data.roles.filter(
                                                        (id) => id !== roleId,
                                                    ),
                                                );
                                            }
                                        }}
                                        className="mt-0.5 h-4 w-4 rounded border bg-background text-primary focus:ring-2 focus:ring-ring focus:outline-none"
                                    />

                                    {/* Role Content */}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-foreground">
                                            {role.name}
                                        </span>

                                        {role.description && (
                                            <span className="text-xs text-muted-foreground">
                                                {role.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <InputError message={errors.roles} />
                </div>

                <div className="flex-1 space-y-4 rounded-md border bg-card p-4">
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
                                                    {module.replace('-', ' ')}
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
                                                                    new Set([
                                                                        ...data.permissions,
                                                                        ...ids,
                                                                    ]),
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
                                                                    ? 'border-primary bg-primary/10'
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
                </div>

                {/* SUBMIT */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="flex items-center justify-center rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCheck className="mr-2 h-4 w-4" />
                                {isEdit ? 'Update User' : 'Create User'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default UserForm;
