import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Key, Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Branch } from '../../../types/branch';
import { Organization } from '../../../types/organization';
import { Role, User } from '../../../types/user';

interface UserFormPageProps {
    backUrl: string;
    user?: User;
    roles: Role[];
    organizations: Organization[];
    branches: Branch[];
}

const UserForm = ({
    backUrl,
    user,
    roles,
    organizations,
    branches,
}: UserFormPageProps) => {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleBack = () => window.history.back();

    const isEdit = !!user;

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        organization_id: user?.organization_id || '',
        branch_id: user?.branch_id || '',
        roles: user?.roles?.map((r: any) => r.id) || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null) payload.append(key, value as any);
        });

        if (isEdit) {
            put(`/users/${user.id}`, {
                data: payload,
                preserveScroll: true,
                onError: (err) => toast.error(JSON.stringify(err)),
            });
        } else {
            post('/users', {
                data: payload,
                preserveScroll: true,
                onError: (err) => toast.error(JSON.stringify(err)),
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/users' },
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
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
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
                className="w-full space-y-4 rounded-md border bg-card p-4 sm:p-6 lg:w-5xl"
            >
                {/* basic INFO */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label className="text-xs">Email</Label>
                        <Input
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="h-8 text-sm"
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
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.password} />
                    </div>
                    <div>
                        <Label className="text-xs">Confirm Password</Label>
                        <Input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>
                    <div>
                        <Label className="text-xs">Organization</Label>
                        <Select
                            value={data.organization_id.toString()}
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
                        <Label className="text-xs">Branch</Label>
                        <Select
                            value={data.branch_id.toString()}
                            onChange={(val) =>
                                setData('branch_id', Number(val))
                            }
                            options={branches.map((b) => ({
                                value: b.id.toString(),
                                label: b.name,
                            }))}
                            placeholder="Select Branch"
                        />
                        <InputError message={errors.branch_id} />
                    </div>
                </div>

                {/* ROLES */}
                <div>
                    <Label className="text-xs">Roles</Label>
                    <div className="mt-1 grid max-h-60 grid-cols-3 gap-2 overflow-y-auto rounded-md border p-2">
                        {roles.map((role) => (
                            <label
                                key={role.id}
                                className="rounded-md px-2 py-1.5 transition hover:bg-muted/80"
                            >
                                <div className="inline-flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        value={role.id}
                                        checked={data.roles.includes(role.id)}
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
                                        className="h-4 w-4 rounded border bg-background text-primary focus:ring-2 focus:ring-ring focus:outline-none"
                                    />

                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {role.name}
                                        </span>
                                        {role.description && (
                                            <span className="text-xs text-muted-foreground">
                                                {role.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </label>
                        ))}
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
