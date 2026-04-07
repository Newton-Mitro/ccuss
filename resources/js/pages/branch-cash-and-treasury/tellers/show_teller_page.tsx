import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Teller } from '../../../types/cash_treasury_module';

interface Props extends SharedData {
    teller: Teller;
}

export default function ShowTellerPage({ teller }: Props) {
    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tellers', href: route('tellers.index') },
        { title: 'Teller Details', href: '' },
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
            <Head title="Teller Details" />

            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Teller Details"
                    description="View teller profile and limits."
                />

                <Link href={route('tellers.edit', teller.id)}>
                    <Button>Edit Teller</Button>
                </Link>
            </div>

            <div className="w-full space-y-6 rounded-md border bg-card p-6 sm:p-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Teller Info</h3>
                    {StatusBadge({ isActive: teller.is_active })}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="text-sm text-card-foreground">Code</p>
                        <p className="font-medium">{teller.code}</p>
                    </div>

                    <div>
                        <p className="text-sm text-card-foreground">Name</p>
                        <p className="font-medium">{teller.name}</p>
                    </div>

                    <div>
                        <p className="text-sm text-card-foreground">User</p>
                        <p className="font-medium">
                            {teller.user?.name ?? '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-card-foreground">Branch</p>
                        <p className="font-medium">
                            {teller.branch?.name ?? '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-card-foreground">
                            Max Cash Limit
                        </p>
                        <p className="font-medium">
                            {formatBDTCurrency(teller.max_cash_limit)}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-card-foreground">
                            Max Transaction Limit
                        </p>
                        <p className="font-medium">
                            {formatBDTCurrency(teller.max_transaction_limit)}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-card-foreground">
                            Created At
                        </p>
                        <p className="font-medium">
                            {formatDateTime(teller.created_at)}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-card-foreground">
                            Last Updated
                        </p>
                        <p className="font-medium">
                            {formatDateTime(teller.updated_at)}
                        </p>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
