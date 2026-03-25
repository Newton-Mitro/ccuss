import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface Teller {
    id: number;
    code: string;
    name: string;
    max_cash_limit: number;
    max_transaction_limit: number;
    is_active: boolean;
    user?: {
        id: number;
        name: string;
        email?: string;
    };
    branch?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    teller: Teller;
}

export default function ShowTellerPage({ teller }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tellers', href: route('tellers.index') },
        { title: 'Teller Details', href: '' },
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

            <div className="w-full space-y-6 rounded-md border bg-card p-6 sm:p-8 lg:w-5xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Teller Info</h3>
                    {StatusBadge({ isActive: teller.is_active })}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="text-sm text-info">Code</p>
                        <p className="font-medium">{teller.code}</p>
                    </div>

                    <div>
                        <p className="text-sm text-info">Name</p>
                        <p className="font-medium">{teller.name}</p>
                    </div>

                    <div>
                        <p className="text-sm text-info">User</p>
                        <p className="font-medium">
                            {teller.user?.name ?? '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-info">Branch</p>
                        <p className="font-medium">
                            {teller.branch?.name ?? '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-info">Max Cash Limit</p>
                        <p className="font-medium">
                            {Number(teller.max_cash_limit).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-info">
                            Max Transaction Limit
                        </p>
                        <p className="font-medium">
                            {Number(
                                teller.max_transaction_limit,
                            ).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-info">Created At</p>
                        <p className="font-medium">
                            {new Date(teller.created_at).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-info">Last Updated</p>
                        <p className="font-medium">
                            {new Date(teller.updated_at).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
