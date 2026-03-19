import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCheck, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Permission, Role } from '../../../types/user';

interface RolePermissionFormProps {
    roles: Role[];
    permissions: Permission[];
}

const RolePermissionForm = ({
    roles,
    permissions,
}: RolePermissionFormProps) => {
    const { flash } = usePage().props;
    const [selectedRole, setSelectedRole] = useState<Role | null>(
        roles[0] || null,
    );
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const { data, setData, put, processing, errors } = useForm({
        permissions: selectedRole?.permissions?.map((p) => p.id) || [],
    });

    useEffect(() => {
        if (selectedRole) {
            setData(
                'permissions',
                selectedRole.permissions?.map((p) => p.id) || [],
            );
            setSelectAll(
                selectedRole.permissions?.length === permissions.length,
            );
        }
    }, [selectedRole]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;
        // put(`/roles/${selectedRole.id}/permissions`, {
        //     data,
        //     preserveScroll: true,
        //     onSuccess: () => toast.success('Permissions updated successfully!'),
        //     onError: (err) => toast.error(JSON.stringify(err)),
        // });
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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles', href: '/roles' },
        { title: 'Role Permissions', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Assign Permissions" />
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Assign Role Permissions"
                    description="Select a role and assign permissions."
                />
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full space-y-4 rounded-md border border-border bg-card p-4 sm:p-6 lg:w-5xl"
            >
                {/* Role Selector */}
                <div>
                    <Label className="text-xs">Select Role</Label>
                    <Select
                        value={selectedRole?.id.toString() || ''}
                        onChange={(val) => {
                            const role = roles.find(
                                (r) => r.id.toString() === val,
                            );
                            setSelectedRole(role || null);
                        }}
                        options={roles.map((role) => ({
                            value: role.id.toString(),
                            label: role.name,
                        }))}
                        placeholder="Choose a role"
                    />
                </div>

                {/* Permissions */}
                {selectedRole && (
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <Label className="text-xs">Permissions</Label>
                            <Button
                                type="button"
                                onClick={toggleSelectAll}
                                variant="outline"
                                size="sm"
                            >
                                {selectAll ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                        <div className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-muted/20 grid max-h-96 grid-cols-3 gap-2 overflow-y-scroll rounded-md border border-border p-2">
                            {permissions.map((perm) => (
                                <div
                                    key={perm.id}
                                    className="inline-flex items-center gap-4 rounded-md p-2 transition hover:bg-muted/80"
                                >
                                    <input
                                        type="checkbox"
                                        value={perm.id}
                                        checked={data.permissions.includes(
                                            perm.id,
                                        )}
                                        onChange={(e) => {
                                            const permId = perm.id;
                                            if (e.target.checked) {
                                                setData('permissions', [
                                                    ...data.permissions,
                                                    permId,
                                                ]);
                                            } else {
                                                setData(
                                                    'permissions',
                                                    data.permissions.filter(
                                                        (id) => id !== permId,
                                                    ),
                                                );
                                            }
                                        }}
                                        className="h-4 w-4 rounded border border-border bg-background text-primary focus:ring-2 focus:ring-ring focus:outline-none"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {perm.name}
                                        </span>
                                        {perm.description && (
                                            <span className="text-xs text-muted-foreground">
                                                {perm.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <InputError message={errors.permissions} />
                    </div>
                )}

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={processing || !selectedRole}
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
                                Save Permissions
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default RolePermissionForm;
