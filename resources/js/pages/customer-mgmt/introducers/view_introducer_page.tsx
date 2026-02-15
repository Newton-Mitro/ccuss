import { Head, Link } from '@inertiajs/react';
import { HomeIcon, UserIcon } from 'lucide-react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { CustomerIntroducer } from '../../../types/customer';

interface Props {
    introducer: CustomerIntroducer;
}

export default function ViewIntroducer({ introducer }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Introducers', href: '/introducers' },
        {
            title: `Introducer #${introducer.id}`,
            href: `/introducers/${introducer.id}`,
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Introducer #${introducer.id}`} />

            <div className="space-y-4 p-2">
                <HeadingSmall
                    title="Customer Introducer Details"
                    description="View detailed information about this introducer."
                />

                {/* Introducer Information */}
                <section className="rounded-md border bg-card p-4">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                        <HomeIcon size={16} />
                        <span>Introducer Information</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <Info
                            label="Introducer Name"
                            value={
                                introducer.introducer_customer ? (
                                    <Link
                                        href={`/customers/${introducer.introducer_customer.id}`}
                                        className="text-primary underline"
                                    >
                                        {introducer.introducer_customer.name}
                                    </Link>
                                ) : (
                                    '—'
                                )
                            }
                        />
                        <Info
                            label="Introducer ID"
                            value={
                                introducer.introducer_customer_id?.toString() ||
                                '—'
                            }
                        />
                        <Info
                            label="Relationship Type"
                            value={introducer.relationship_type}
                        />
                        <Info
                            label="Verification Status"
                            value={introducer.verification_status}
                        />
                        <Info
                            label="Verified By"
                            value={introducer.verified_by_user?.name || '—'}
                        />
                        <Info
                            label="Verified At"
                            value={introducer.verified_at || '—'}
                        />
                        <Info label="Remarks" value={introducer.remarks} />
                    </div>
                </section>

                {/* Customer Information */}
                <section className="rounded-md border bg-card p-4">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                        <UserIcon size={16} />
                        <span>Customer Info</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <Info
                            label="Customer Name"
                            value={
                                introducer.introduced_customer ? (
                                    <Link
                                        href={`/customers/${introducer.introduced_customer.id}`}
                                        className="text-primary underline"
                                    >
                                        {introducer.introduced_customer.name}
                                    </Link>
                                ) : (
                                    '—'
                                )
                            }
                        />
                        <Info
                            label="Customer ID"
                            value={
                                introducer.introduced_customer?.id?.toString() ||
                                '—'
                            }
                        />
                        <Info
                            label="Customer No"
                            value={
                                introducer.introduced_customer?.customer_no ||
                                '—'
                            }
                        />
                        <Info
                            label="Customer Type"
                            value={introducer.introduced_customer?.type || '—'}
                        />
                        <Info
                            label="Email"
                            value={introducer.introduced_customer?.email || '—'}
                        />
                        <Info
                            label="Phone"
                            value={introducer.introduced_customer?.phone || '—'}
                        />
                        <Info
                            label="Identification Type"
                            value={
                                introducer.introduced_customer
                                    ?.identification_type || '—'
                            }
                        />
                        <Info
                            label="Identification Number"
                            value={
                                introducer.introduced_customer
                                    ?.identification_number || '—'
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
