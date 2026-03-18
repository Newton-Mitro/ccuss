import HeadingSmall from '@/components/heading-small';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import { Role, User } from '../../../types/user';

interface AssignRolesPageProps {
    user: User;
    roles: Role[];
}

// types/userForm.ts
export interface UserFormData {
    name: string;
    email: string;
    password?: string;
    organization_id: number;
    branch_id: number;
    roles?: number[];
    permissions?: number[];
}

export default function AssignRoles() {
    const { user, roles } = usePage().props as unknown as AssignRolesPageProps;

    const { data, setData, post, processing } = useForm({
        roles: user.roles.map((r) => r.id), // preselect existing roles
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.roles.update', user.id), {
            onSuccess: () => toast.success('User roles updated successfully!'),
            onError: () => toast.error('Failed to update roles.'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/users' },
        { title: user.name, href: `/users/${user.id}` },
        { title: 'Assign Roles', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Assign Roles - ${user.name}`} />
            <div className="max-w-lg space-y-4 p-2 text-foreground">
                <HeadingSmall
                    title={`Assign Roles to ${user.name}`}
                    description="Select the roles you want to assign or remove for this user."
                />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col gap-2">
                        {roles.map((role) => (
                            <label
                                key={role.id}
                                className="flex items-center gap-2"
                            >
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
                                                    (id: number) =>
                                                        id !== roleId,
                                                ),
                                            );
                                        }
                                    }}
                                    className="h-4 w-4 rounded border border-border bg-background text-primary focus:ring-2 focus:ring-ring focus:outline-none"
                                />
                                <span className="text-sm">{role.name}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            Save Roles
                        </button>
                        <Link
                            href="/users"
                            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
