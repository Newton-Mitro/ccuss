import { Head, Link } from '@inertiajs/react';
import {
    Edit2,
    EyeClosed,
    HomeIcon,
    ListFilter,
    UserIcon,
    X,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { BorderInfoBox } from '../../../components/border-info-box';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { CustomerAddress } from '../../../types/customer_kyc_module';

interface Props extends SharedData {
    address: CustomerAddress;
}

export default function ViewAddress({ address }: Props) {
    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: '' },
        { title: 'Customers', href: route('customers.index') },
        {
            title: `Address #${address.id}`,
            href: '#',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Address #${address.id}`} />

            <div className="space-y-4 p-2">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <HeadingSmall
                        title="Customer Address Details"
                        description="View detailed information about this address."
                    />

                    <div className="flex gap-2">
                        <Link
                            href={route('addresses.edit', address.id)}
                            className="flex items-center gap-1 rounded bg-accent px-3 py-1 text-accent-foreground transition hover:bg-accent/90"
                        >
                            <Edit2 size={16} />
                            <span className="hidden sm:inline">Edit</span>
                        </Link>

                        <button
                            type="button"
                            className="flex items-center gap-1 rounded bg-destructive px-3 py-1 text-destructive-foreground transition hover:bg-destructive/90"
                        >
                            <EyeClosed size={16} />
                            <span className="hidden sm:inline">Suspend</span>
                        </button>

                        <button
                            type="button"
                            className="flex items-center gap-1 rounded bg-destructive px-3 py-1 text-destructive-foreground transition hover:bg-destructive/90"
                        >
                            <X size={16} />
                            <span className="hidden sm:inline">
                                Close Account
                            </span>
                        </button>

                        <Link
                            href={route('customers.index')}
                            className="flex items-center gap-1 rounded bg-secondary px-3 py-1 text-secondary-foreground transition hover:bg-secondary/90"
                        >
                            <ListFilter size={16} />
                            <span className="hidden sm:inline">Customers</span>
                        </Link>
                    </div>
                </div>

                <section className="space-y-10 rounded-md border bg-card p-8">
                    <div className="">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                            <UserIcon size={16} />
                            <span>Customer Info</span>
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                            <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                                {address.customer?.photo?.url ? (
                                    <img
                                        src={address.customer?.photo.url}
                                        alt={address.customer?.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                        {address.customer?.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div>
                                    <BorderInfoBox
                                        label=""
                                        value={
                                            address.customer ? (
                                                <Link
                                                    href={route(
                                                        'customers.show',
                                                        address.customer.id,
                                                    )}
                                                    className="text-primary underline"
                                                >
                                                    {address.customer.name}
                                                </Link>
                                            ) : (
                                                '—'
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {address.customer?.type} •{' '}
                                        {address.customer?.kyc_status}
                                    </p>
                                    <div className="text-xs text-muted-foreground">
                                        {address.customer?.id} •{' '}
                                        {address.customer?.customer_no} •{' '}
                                        {address.customer?.email} •{' '}
                                        {address.customer?.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                            <HomeIcon size={16} />
                            <span>Address Information</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <BorderInfoBox
                                label="Address Line 1"
                                value={address.line1}
                            />
                            <BorderInfoBox
                                label="Address Line 2"
                                value={address.line2}
                            />
                            <BorderInfoBox
                                label="Division"
                                value={address.division}
                            />
                            <BorderInfoBox
                                label="District"
                                value={address.district}
                            />
                            <BorderInfoBox
                                label="Upazila"
                                value={address.upazila}
                            />
                            <BorderInfoBox
                                label="Union/Ward"
                                value={address.union_ward}
                            />
                            <BorderInfoBox
                                label="Postal Code"
                                value={address.postal_code}
                            />
                            <BorderInfoBox
                                label="Country"
                                value={address.country}
                            />
                            <BorderInfoBox label="Type" value={address.type} />
                            <BorderInfoBox
                                label="Verification Status"
                                value={address.verification_status}
                            />
                            <BorderInfoBox
                                label="Remarks"
                                value={address.remarks}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
