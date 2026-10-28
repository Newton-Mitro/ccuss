import type { UserFormPageProps } from '@/modules/administration-security/types/page-props';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Camera,
    CheckCheck,
    KeyRound,
    Loader2,
    Mail,
    ShieldCheck,
    Sparkles,
    UserRound,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';

const UserForm = ({ user, roles, organizations, auth }: UserFormPageProps) => {
    useFlashToastHandler();

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
    const selectedOrganizations = organizations.filter((organization) =>
        data.organization_ids.includes(organization.id),
    );
    const selectedRoles = allRoles.filter((role) =>
        data.roles.includes(role.id),
    );
    const initials =
        data.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || 'U';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administrative Tasks', href: '' },
        { title: 'Users', href: route('users.index') },
        { title: isEdit ? `Edit ${user.name}` : 'Create User', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? `Edit User - ${user.name}` : 'Create User'} />
            <div className="w-full max-w-none space-y-4 pb-6">
                <header className="relative isolate overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="absolute -top-24 right-8 -z-10 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="flex flex-col gap-3 p-4 sm:p-5 md:flex-row md:items-center">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <Users className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                                    User administration
                                </span>
                                <span className="rounded-full border bg-background/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                    {isEdit
                                        ? 'Profile settings'
                                        : 'New account'}
                                </span>
                            </div>
                            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                {isEdit
                                    ? `Edit ${user.name}`
                                    : 'Create a user account'}
                            </h1>
                            <p className="max-w-2xl text-sm leading-5 text-muted-foreground">
                                Add profile details, choose organization access,
                                and assign the roles this user needs.
                            </p>
                        </div>
                        <Link
                            href={route('users.index')}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted"
                        >
                            <ArrowLeft className="size-4" />
                            Back to users
                        </Link>
                    </div>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                        <div className="space-y-4">
                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="flex items-start gap-2.5 border-b px-4 py-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                                        <UserRound className="size-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-sm font-semibold tracking-tight">
                                            Personal information
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Enter the name and login email for
                                            this account.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-x-4 gap-y-3 p-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="user-name">
                                            Full name
                                        </Label>
                                        <Input
                                            id="user-name"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. Jordan Lee"
                                            autoComplete="name"
                                            className="h-9"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="user-email">
                                            Email address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="user-email"
                                                type="email"
                                                value={data.email}
                                                onChange={(event) =>
                                                    setData(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="name@organization.com"
                                                autoComplete="email"
                                                className="h-9 pl-9"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>
                                </div>
                            </section>

                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="flex items-start gap-2.5 border-b px-4 py-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                                        <Building2 className="size-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-sm font-semibold tracking-tight">
                                            Organization access
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Select where this user can work and
                                            choose their primary organization.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3 p-4">
                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <Label>
                                                Available organizations
                                            </Label>
                                            <span className="text-xs text-muted-foreground">
                                                {selectedOrganizations.length}{' '}
                                                selected
                                            </span>
                                        </div>
                                        {organizations.length ? (
                                            <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                                                {organizations.map(
                                                    (organization) => {
                                                        const selected =
                                                            data.organization_ids.includes(
                                                                organization.id,
                                                            );
                                                        return (
                                                            <label
                                                                key={
                                                                    organization.id
                                                                }
                                                                className={`flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 transition ${
                                                                    selected
                                                                        ? 'border-primary/40 bg-primary/5'
                                                                        : 'hover:bg-muted/50'
                                                                }`}
                                                            >
                                                                <Input
                                                                    type="checkbox"
                                                                    checked={
                                                                        selected
                                                                    }
                                                                    onChange={() =>
                                                                        toggleOrganization(
                                                                            organization.id,
                                                                        )
                                                                    }
                                                                    className="size-4"
                                                                />
                                                                <span className="min-w-0 truncate text-sm font-medium">
                                                                    {
                                                                        organization.name
                                                                    }
                                                                </span>
                                                            </label>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-dashed px-4 py-4 text-center text-xs text-muted-foreground">
                                                No organizations are available.
                                            </div>
                                        )}
                                        <InputError
                                            message={errors.organization_ids}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="primary-organization">
                                            Primary organization
                                        </Label>
                                        <Select
                                            value={
                                                data.organization_id?.toString() ||
                                                ''
                                            }
                                            onChange={(value) =>
                                                setData(
                                                    'organization_id',
                                                    Number(value),
                                                )
                                            }
                                            options={selectedOrganizations.map(
                                                (organization) => ({
                                                    value: organization.id.toString(),
                                                    label: organization.name,
                                                }),
                                            )}
                                            placeholder="Select primary organization"
                                        />
                                        <InputError
                                            message={errors.organization_id}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="flex items-start gap-2.5 border-b px-4 py-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                                        <KeyRound className="size-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-sm font-semibold tracking-tight">
                                            {isEdit
                                                ? 'Update password'
                                                : 'Set a password'}
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            {isEdit
                                                ? 'Leave both fields blank to keep the current password.'
                                                : 'Choose a secure password and enter it again to confirm.'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-x-4 gap-y-3 p-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="user-password">
                                            Password
                                        </Label>
                                        <Input
                                            id="user-password"
                                            type="password"
                                            value={data.password}
                                            onChange={(event) =>
                                                setData(
                                                    'password',
                                                    event.target.value,
                                                )
                                            }
                                            autoComplete="new-password"
                                            className="h-9"
                                            required={!isEdit}
                                        />
                                        <InputError message={errors.password} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="user-password-confirm">
                                            Confirm password
                                        </Label>
                                        <Input
                                            id="user-password-confirm"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(event) =>
                                                setData(
                                                    'password_confirmation',
                                                    event.target.value,
                                                )
                                            }
                                            autoComplete="new-password"
                                            className="h-9"
                                            required={!isEdit}
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="flex items-start gap-2.5 border-b px-4 py-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                                        <ShieldCheck className="size-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-sm font-semibold tracking-tight">
                                            Roles and permissions
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Roles determine which features and
                                            actions are available to the user.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3 p-4">
                                    {allRoles.length ? (
                                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                            {allRoles.map((role) => {
                                                const selected =
                                                    data.roles.includes(
                                                        role.id,
                                                    );
                                                return (
                                                    <label
                                                        key={role.id}
                                                        className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition ${
                                                            selected
                                                                ? 'border-primary/40 bg-primary/5'
                                                                : 'hover:bg-muted/50'
                                                        }`}
                                                    >
                                                        <Input
                                                            type="checkbox"
                                                            value={role.id}
                                                            checked={selected}
                                                            onChange={(event) =>
                                                                setData(
                                                                    'roles',
                                                                    event.target
                                                                        .checked
                                                                        ? [
                                                                              ...data.roles,
                                                                              role.id,
                                                                          ]
                                                                        : data.roles.filter(
                                                                              (
                                                                                  id,
                                                                              ) =>
                                                                                  id !==
                                                                                  role.id,
                                                                          ),
                                                                )
                                                            }
                                                            className="mt-0.5 size-4"
                                                        />
                                                        <span className="min-w-0 space-y-1">
                                                            <span className="block text-sm font-medium">
                                                                {role.name}
                                                            </span>
                                                            <span className="block text-xs leading-5 text-muted-foreground">
                                                                {role.description ||
                                                                    'Role-based access for this account.'}
                                                            </span>
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                                            No roles are available to assign.
                                        </div>
                                    )}
                                    <InputError message={errors.roles} />
                                </div>
                            </section>
                        </div>

                        <aside className="space-y-4 lg:sticky lg:top-6">
                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="border-b px-4 py-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <Sparkles className="size-4 text-primary" />
                                        Account preview
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        A quick overview of the new profile.
                                    </p>
                                </div>
                                <div className="space-y-4 p-4">
                                    <div className="flex flex-col items-center text-center">
                                        <label className="group relative mb-2 cursor-pointer">
                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="User profile preview"
                                                    className="size-20 rounded-xl border object-cover shadow-sm"
                                                />
                                            ) : (
                                                <div className="flex size-20 items-center justify-center rounded-xl border bg-primary/10 text-xl font-semibold text-primary shadow-sm">
                                                    {initials}
                                                </div>
                                            )}
                                            <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                                                <Camera className="mr-1.5 size-4" />
                                                Upload photo
                                            </span>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="sr-only"
                                            />
                                        </label>
                                        <p className="max-w-full truncate font-semibold">
                                            {data.name || 'New user'}
                                        </p>
                                        <p className="max-w-full truncate text-sm text-muted-foreground">
                                            {data.email ||
                                                'Email address will appear here'}
                                        </p>
                                    </div>

                                    <div className="space-y-2.5 border-t pt-3">
                                        <div className="flex items-center justify-between gap-3 text-xs">
                                            <span className="text-muted-foreground">
                                                Organizations
                                            </span>
                                            <span className="font-medium">
                                                {selectedOrganizations.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 text-xs">
                                            <span className="text-muted-foreground">
                                                Assigned roles
                                            </span>
                                            <span className="font-medium">
                                                {selectedRoles.length}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {selectedRoles.length ? (
                                                selectedRoles
                                                    .slice(0, 3)
                                                    .map((role) => (
                                                        <span
                                                            key={role.id}
                                                            className="block truncate rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium"
                                                        >
                                                            {role.name}
                                                        </span>
                                                    ))
                                            ) : (
                                                <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                                                    No roles selected yet
                                                </p>
                                            )}
                                            {selectedRoles.length > 3 && (
                                                <p className="text-xs text-muted-foreground">
                                                    +{selectedRoles.length - 3}{' '}
                                                    more
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <div className="rounded-lg border border-primary/15 bg-primary/5 p-3 text-sm">
                                <div className="flex items-start gap-2.5">
                                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Grant only the organization access and
                                        roles required for this user’s work.
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>

                    <div className="mt-4 flex flex-col-reverse gap-2 rounded-xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <p className="text-xs text-muted-foreground">
                            Required fields must be completed before saving.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Link
                                href={route('users.index')}
                                className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-9 gap-2 rounded-lg px-4"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCheck className="size-4" />
                                        {isEdit
                                            ? 'Save changes'
                                            : 'Create user'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
};

export default UserForm;
