import { Head, Link } from '@inertiajs/react';
import {
    Edit2,
    EyeClosed,
    HomeIcon,
    ListFilter,
    UserIcon,
    X,
} from 'lucide-react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { CustomerAddress } from '../../../types/customer';

interface Props {
    address: CustomerAddress;
}

export default function ViewAddress({ address }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Addresses', href: '/addresses' },
        {
            title: `Address #${address.id}`,
            href: `/addresses/${address.id}`,
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
                            href={`/addresses/${address.id}/edit`}
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
                            href={`/addresses`}
                            className="flex items-center gap-1 rounded bg-secondary px-3 py-1 text-secondary-foreground transition hover:bg-secondary/90"
                        >
                            <ListFilter size={16} />
                            <span className="hidden sm:inline">Addresses</span>
                        </Link>
                    </div>
                </div>

                <section className="space-y-6 rounded-md border bg-card p-4">
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
                                    <Info
                                        label=""
                                        value={
                                            address.customer ? (
                                                <Link
                                                    href={`/customers/${address.customer.id}`}
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
                                        {address.customer?.status}
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
                            <Info
                                label="Address Line 1"
                                value={address.line1}
                            />
                            <Info
                                label="Address Line 2"
                                value={address.line2}
                            />
                            <Info label="Division" value={address.division} />
                            <Info label="District" value={address.district} />
                            <Info label="Upazila" value={address.upazila} />
                            <Info
                                label="Union/Ward"
                                value={address.union_ward}
                            />
                            <Info
                                label="Postal Code"
                                value={address.postal_code}
                            />
                            <Info label="Country" value={address.country} />
                            <Info label="Type" value={address.type} />
                            <Info
                                label="Verification Status"
                                value={address.verification_status}
                            />
                            <Info label="Remarks" value={address.remarks} />
                        </div>
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}

function Info({
    label,
    value,
}: {
    label: string;
    value?: React.ReactNode | null;
}) {
    return (
        <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">
                {label}
            </p>
            <p className="text-sm">{value || '—'}</p>
        </div>
    );
}
