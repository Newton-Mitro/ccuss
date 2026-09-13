import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
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
    const { paginated_data } = usePage<Props>().props;

    useFlashToastHandler();

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
                    description="View customer addresses."
                />

                <div className="overflow-x-auto rounded-md border bg-card">
                    <table className="w-full border-collapse text-sm">
                        <thead className="border-b bg-muted text-left text-muted-foreground">
                            <tr>
                                <th className="p-2 font-medium">Customer</th>
                                <th className="p-2 font-medium">Type</th>
                                <th className="p-2 font-medium">Status</th>
                                <th className="p-2 font-medium">Address</th>
                                <th className="p-2 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated_data.data.map((address) => (
                                <tr
                                    key={address.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-2">
                                        {address.customer?.name ?? 'Unknown'}
                                    </td>
                                    <td className="p-2 capitalize">
                                        {address.type}
                                    </td>
                                    <td className="p-2">
                                        <Badge
                                            text={address.verification_status}
                                        />
                                    </td>
                                    <td className="p-2">
                                        {[
                                            address.line1,
                                            address.line2,
                                            address.district,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </td>
                                    <td className="p-2">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={route(
                                                    'customers.addresses.show',
                                                    [
                                                        address.customer_id,
                                                        address.id,
                                                    ],
                                                )}
                                                title="View customer"
                                                className="text-info"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={route(
                                                    'customers.addresses.edit',
                                                    [
                                                        address.customer_id,
                                                        address.id,
                                                    ],
                                                )}
                                                title="Edit address"
                                                className="text-primary"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(address)
                                                }
                                                title="Delete address"
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <DataTablePagination
                    perPage={Number(paginated_data.per_page) || 18}
                    onPerPageChange={() => undefined}
                    links={paginated_data.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
