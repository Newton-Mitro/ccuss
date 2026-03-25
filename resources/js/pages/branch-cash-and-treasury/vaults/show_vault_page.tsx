import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface Vault {
    id: number;
    name: string;
    total_balance: number;
    is_active: boolean;
    branch?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    vault: Vault;
}

export default function ShowVaultPage({ vault }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vaults', href: route('vaults.index') },
        { title: 'Vault Details', href: '' },
    ];

    const StatusBadge = ({ isActive }: { isActive: boolean }) => {
        const bgClass = isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';

        return (
            <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${bgClass}`}
            >
                {isActive ? 'Active' : 'Inactive'}
            </span>
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Vault Details" />

            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Vault Details"
                    description="View vault information and status."
                />

                <Link href={route('vaults.edit', vault.id)}>
                    <Button>Edit Vault</Button>
                </Link>
            </div>

            <div className="w-full space-y-6 rounded-md border bg-card p-6 sm:p-8 lg:w-5xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Vault Info</h3>
                    {StatusBadge({ isActive: vault.is_active })}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="text-sm text-info">Vault Name</p>
                        <p className="font-medium">{vault.name}</p>
                    </div>

                    <div>
                        <p className="text-sm text-info">Branch</p>
                        <p className="font-medium">
                            {vault.branch?.name ?? '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-info">Total Balance</p>
                        <p className="font-medium">
                            {Number(vault.total_balance).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-info">Created At</p>
                        <p className="font-medium">
                            {new Date(vault.created_at).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-info">Last Updated</p>
                        <p className="font-medium">
                            {new Date(vault.updated_at).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
