import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Vault } from '../../../types/cash_treasury_module';

interface ShowVaultPageProps extends SharedData {
    vault: Vault;
}

export default function ShowVaultPage({ vault, flash }: ShowVaultPageProps) {
    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vaults', href: route('vaults.index') },
        { title: 'Vault Details', href: '' },
    ];

    const StatusBadge = ({ isActive }: { isActive: boolean }) => {
        const bgClass = isActive
            ? 'bg-success text-success-foreground'
            : 'bg-destructive text-destructive-foreground';

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
                    <h3 className="text-lg font-semibold text-info">
                        Vault Info
                    </h3>
                    {StatusBadge({ isActive: vault.is_active })}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="text-sm text-card-foreground">
                            Vault Name
                        </p>
                        <p className="font-medium">{vault.name}</p>
                    </div>

                    <div>
                        <p className="text-sm text-card-foreground">Branch</p>
                        <p className="font-medium">
                            {vault.branch?.name ?? '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-card-foreground">
                            Total Balance
                        </p>
                        <p className="font-medium">
                            {formatBDTCurrency(vault.total_balance)}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-card-foreground">
                            Created At
                        </p>
                        <p className="font-medium">
                            {formatDateTime(vault.created_at)}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-card-foreground">
                            Last Updated
                        </p>
                        <p className="font-medium">
                            {formatDateTime(vault.updated_at)}
                        </p>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
