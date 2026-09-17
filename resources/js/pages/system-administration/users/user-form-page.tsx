import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Key, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Organization } from '../../../types/organization';
import { Role, User } from '../../../types/user';

interface UserFormPageProps extends SharedData {
    user?: User;
    roles: Role[];
    organizations: Organization[];
}

const UserForm = ({ user, roles, organizations, auth }: UserFormPageProps) => {
    useFlashToastHandler();

    const handleBack = () => window.history.back();

    const isEdit = !!user;

    const { data, setData, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        organization_id:
            user?.organization_id || user?.organizations?.[0]?.id || '',
        organization_ids:
            user?.organizations?.map((org) => org.id) ||
            (user?.organization_id ? [user.organization_id] : []),
        roles: user?.roles?.map((r: any) => r.id) || [],
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

    const toggleOrganization = (orgId: number) => {
        const current = Array.isArray(data.organization_ids)
            ? [...data.organization_ids]
            : [];
        const next = current.includes(orgId)
            ? current.filter((id) => id !== orgId)
            : [...current, orgId];

        setData('organization_ids', next);

        if (!next.length) {
            setData('organization_id', '');
            return;
        }

        const selectedPrimary = Number(data.organization_id) || next[0];
        const primaryIsSelected = next.includes(Number(selectedPrimary));

        setData(
            'organization_id',
            primaryIsSelected ? selectedPrimary : next[0],
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedOrgIds = Array.isArray(data.organization_ids)
            ? [...new Set(data.organization_ids.map(Number).filter(Boolean))]
            : [];
        const primaryOrganizationId =
            Number(data.organization_id) || selectedOrgIds[0] || '';

        const payload = new FormData();

        Object.entries({
            ...data,
            organization_id: primaryOrganizationId,
            organization_ids: selectedOrgIds,
        }).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                    value.forEach((v) => payload.append(`${key}[]`, String(v)));
                } else if (value instanceof Blob) {
                    payload.append(key, value);
                } else {
                    payload.append(key, String(value));
                }
            }
        });

        if (isEdit) {
            payload.append('_method', 'PUT'); // ✅ method spoofing

            router.post(`/users/${user.id}`, payload as any, {
                preserveScroll: true,
                forceFormData: true,
            });
        } else {
            router.post('/users', payload as any, {
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
                        <div className="md:col-span-2 xl:col-span-3">
                            <Label className="text-xs">Organizations</Label>
                            <div className="mt-1 grid grid-cols-1 gap-2 rounded-md border p-2 md:grid-cols-2 xl:grid-cols-3">
                                {organizations.map((org) => (
                                    <label
                                        key={org.id}
                                        className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent/40"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                Array.isArray(
                                                    data.organization_ids,
                                                ) &&
                                                data.organization_ids.includes(
                                                    org.id,
                                                )
                                            }
                                            onChange={() =>
                                                toggleOrganization(org.id)
                                            }
                                        />
                                        <span>{org.name}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.organization_ids} />
                        </div>

                        <div>
                            <Label className="text-xs">
                                Primary Organization
                            </Label>
                            <Select
                                value={data.organization_id?.toString() || ''}
                                onChange={(val) =>
                                    setData('organization_id', Number(val))
                                }
                                options={organizations
                                    .filter(
                                        (org) =>
                                            Array.isArray(
                                                data.organization_ids,
                                            ) &&
                                            data.organization_ids.includes(
                                                org.id,
                                            ),
                                    )
                                    .map((org) => ({
                                        value: org.id.toString(),
                                        label: org.name,
                                    }))}
                                placeholder="Select primary organization"
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
