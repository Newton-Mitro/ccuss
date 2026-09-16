import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { Badge } from '../../../lib/statusConfig';
import { BreadcrumbItem, SharedData } from '../../../types';
import { CustomerAddress } from '../../../types/customer_kyc_module';
import { PaginatedResponse } from '../../../types/paginated_response';

interface Props extends SharedData {
    paginated_data: PaginatedResponse<CustomerAddress>;
    filters: Record<string, string | number>;
}

export default function AddressIndex() {
    const { paginated_data, filters } = usePage<Props>().props;

    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 18,
        page: Number(filters.page) || 1,
    });

    const isEmpty = paginated_data.data.length === 0;

    useFlashToastHandler();

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('addresses.index'), {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page, get]);

    const handleDelete = (address: CustomerAddress) => {
        appSwal
            .fire({
                title: 'Delete address?',
                text: 'This address will be permanently deleted.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(
                        route('customers.addresses.destroy', [
                            address.customer_id,
                            address.id,
                        ]),
                        { preserveScroll: true },
                    );
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Addresses', href: route('addresses.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Addresses" />

            <div className="space-y-4 text-foreground">
                <HeadingSmall
                    title="Addresses"
                    description="Review and approve customer addresses."
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Input
                            className="bg-card"
                            placeholder="Search customer name or number..."
                            value={data.search}
                            onChange={(event) => {
                                setData('search', event.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>
                </div>

                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center rounded-md border bg-card py-16 text-center text-muted-foreground">
                        <p className="text-base font-medium">
                            No pending addresses found
                        </p>
                        <p className="text-xs">
                            Try adjusting your search criteria.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border bg-card md:block">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                                    <tr>
                                        {[
                                            'Customer',
                                            'Type',
                                            'Status',
                                            'Address',
                                            'Actions',
                                        ].map((header) => (
                                            <th
                                                key={header}
                                                className="border-b p-2 text-left text-sm font-medium"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated_data.data.map((address) => (
                                        <tr
                                            key={address.id}
                                            className="border-b even:bg-muted hover:bg-accent/20"
                                        >
                                            <td className="px-2 py-1">
                                                {address.customer?.name ??
                                                    'Unknown'}
                                            </td>
                                            <td className="px-2 py-1 capitalize">
                                                {address.type}
                                            </td>
                                            <td className="px-2 py-1">
                                                <Badge
                                                    text={
                                                        address.verification_status
                                                    }
                                                />
                                            </td>
                                            <td className="px-2 py-1">
                                                {[
                                                    address.line1,
                                                    address.line2,
                                                    address.district,
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </td>
                                            <td className="px-2 py-1">
                                                <AddressActions
                                                    address={address}
                                                    onDelete={handleDelete}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-3 md:hidden">
                            {paginated_data.data.map((address) => (
                                <div
                                    key={address.id}
                                    className="space-y-2 rounded-md border bg-card p-3"
                                >
                                    <div className="flex justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {address.customer?.name ??
                                                    'Unknown'}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {address.type} address
                                            </p>
                                        </div>
                                        <Badge
                                            text={address.verification_status}
                                        />
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        {[
                                            address.line1,
                                            address.line2,
                                            address.district,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>

                                    <div className="flex justify-end">
                                        <AddressActions
                                            address={address}
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!isEmpty && (
                    <DataTablePagination
                        perPage={Number(paginated_data.per_page) || 18}
                        onPerPageChange={(value) => {
                            setData('per_page', value);
                            setData('page', 1);
                        }}
                        links={paginated_data.links}
                    />
                )}
            </div>
        </CustomAuthLayout>
    );
}

function AddressActions({
    address,
    onDelete,
}: {
    address: CustomerAddress;
    onDelete: (address: CustomerAddress) => void;
}) {
    return (
        <div className="flex justify-end gap-3">
            <Link
                href={route('customers.addresses.show', [
                    address.customer_id,
                    address.id,
                ])}
                title="View address"
                className="text-info"
            >
                <Eye className="h-5 w-5" />
            </Link>
            <Link
                href={route('customers.addresses.edit', [
                    address.customer_id,
                    address.id,
                ])}
                title="Edit address"
                className="text-primary"
            >
                <Pencil className="h-5 w-5" />
            </Link>
            <button
                type="button"
                onClick={() => onDelete(address)}
                title="Delete address"
                className="text-destructive"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );
}
