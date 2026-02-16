import { Head, Link } from '@inertiajs/react';
import { HomeIcon, UserIcon } from 'lucide-react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { CustomerIntroducer } from '../../../types/introduced_customer';

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
                    title="Introducer Details"
                    description="View detailed information about this introducer."
                />

                {/* Introducer Information */}
                <section className="space-y-10 rounded-md border bg-card p-6">
                    <div className="">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                            <UserIcon size={16} />
                            <span>Customer Information</span>
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                            <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                                {introducer.introduced_customer?.photo?.url ? (
                                    <img
                                        src={
                                            introducer.introduced_customer
                                                ?.photo.url
                                        }
                                        alt={
                                            introducer.introduced_customer?.name
                                        }
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                        {introducer.introduced_customer?.name.charAt(
                                            0,
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        {introducer.introduced_customer ? (
                                            <Link
                                                href={`/customers/${introducer.introduced_customer.id}`}
                                                className="text-primary underline"
                                            >
                                                {
                                                    introducer
                                                        .introduced_customer
                                                        .name
                                                }
                                            </Link>
                                        ) : (
                                            '—'
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {introducer.introduced_customer?.type} •{' '}
                                        {introducer.introduced_customer?.status}
                                    </p>
                                    <div className="text-xs text-muted-foreground">
                                        {introducer.introduced_customer?.id} •{' '}
                                        {
                                            introducer.introduced_customer
                                                ?.customer_no
                                        }{' '}
                                        •{' '}
                                        {introducer.introduced_customer?.email}{' '}
                                        •{' '}
                                        {introducer.introduced_customer?.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

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
                        <Info label="Remarks" value={introducer.remarks} />
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
