import { Head, Link } from '@inertiajs/react';
import { HomeIcon, UserIcon } from 'lucide-react';
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
                <HeadingSmall
                    title="Customer Address Details"
                    description="View detailed information about this address."
                />

                <section className="rounded-md border bg-card p-4">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                        <HomeIcon size={16} />
                        <span>Address Information</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <Info label="Address Line 1" value={address.line1} />
                        <Info label="Address Line 2" value={address.line2} />
                        <Info label="Division" value={address.division} />
                        <Info label="District" value={address.district} />
                        <Info label="Upazila" value={address.upazila} />
                        <Info label="Union/Ward" value={address.union_ward} />
                        <Info label="Postal Code" value={address.postal_code} />
                        <Info label="Country" value={address.country} />
                        <Info label="Type" value={address.type} />
                        <Info
                            label="Verification Status"
                            value={address.verification_status}
                        />
                        <Info label="Remarks" value={address.remarks} />
                    </div>
                </section>

                <section className="rounded-md border bg-card p-4">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                        <UserIcon size={16} />
                        <span>Customer Info</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <Info
                            label="Customer Name"
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
                        <Info
                            label="Customer ID"
                            value={address.customer?.id?.toString() || '—'}
                        />
                        <Info
                            label="Customer No"
                            value={address.customer?.customer_no || '—'}
                        />
                        <Info
                            label="Customer Type"
                            value={address.customer?.type || '—'}
                        />
                        <Info
                            label="Email"
                            value={address.customer?.email || '—'}
                        />
                        <Info
                            label="Phone"
                            value={address.customer?.phone || '—'}
                        />
                        <Info
                            label="Identification Type"
                            value={address.customer?.identification_type || '—'}
                        />
                        <Info
                            label="Identification Number"
                            value={
                                address.customer?.identification_number || '—'
                            }
                        />
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
