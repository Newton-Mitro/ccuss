import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';

import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';

import { formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Vault } from '../../../types/cash_treasury_module';

interface ShowVaultPageProps extends SharedData {
    vault: Vault;
}

export default function ShowVaultPage({ vault }: ShowVaultPageProps) {
    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vaults', href: route('vaults.index') },
        { title: vault.name, href: '' },
    ];

    const StatusBadge = ({ isActive }: { isActive: boolean }) => {
        return (
            <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    isActive
                        ? 'bg-success text-success-foreground'
                        : 'bg-destructive text-destructive-foreground'
                }`}
            >
                {isActive ? 'Active' : 'Inactive'}
            </span>
        );
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Vault - ${vault.name}`} />

            {/* Header */}
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={vault.name}
                    description="Vault profile, branch mapping, and account linkage"
                />

                <Link href={route('vaults.edit', vault.id)}>
                    <Button>Edit Vault</Button>
                </Link>
            </div>

            {/* Main Card */}
            <div className="space-y-6 rounded-md border bg-card p-6 sm:p-8">
                {/* Top Status Row */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-info">
                        Vault Overview
                    </h3>

                    {StatusBadge({ isActive: vault.is_active })}
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Branch */}
                    <div>
                        <p className="text-sm text-muted-foreground">Branch</p>
                        <p className="font-medium">
                            {vault.branch?.name ?? '—'}
                        </p>
                    </div>

                    {/* Vault Name */}
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Vault Name
                        </p>
                        <p className="font-medium">{vault.name}</p>
                    </div>

                    {/* Account */}
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Subledger Account
                        </p>
                        <p className="font-medium">
                            {vault.subledger_account?.name ?? '—'}
                        </p>
                    </div>

                    {/* Account */}
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Subledger Account
                        </p>
                        <p className="font-medium">
                            {vault.subledger_account?.name ?? '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Subledger Account Number
                        </p>
                        <p className="font-medium">
                            {vault.subledger_account?.account_number ?? '—'}
                        </p>
                    </div>

                    {/* Created At */}
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Created At
                        </p>
                        <p className="font-medium">
                            {formatDateTime(vault.created_at)}
                        </p>
                    </div>

                    {/* Updated At */}
                    <div>
                        <p className="text-sm text-muted-foreground">
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
