import { Head, Link, router } from '@inertiajs/react';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Customer } from '../../../types/customer';

interface ShowProps {
    customer: Customer;
    backUrl: string;
}

function Show({ customer, backUrl }: ShowProps) {
    const handleBack = () => {
        router.visit(backUrl, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
        { title: customer.name, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer - ${customer.name}`} />

            <div className="space-y-10">
                {/* ================= Header ================= */}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-5">
                        {customer.photo ? (
                            <img
                                src={customer.photo.url}
                                alt={customer.name}
                                className="h-24 w-24 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-xl font-semibold">
                                {customer.name.charAt(0)}
                            </div>
                        )}

                        <div>
                            <h1 className="text-2xl font-semibold">
                                {customer.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Customer No · {customer.customer_no}
                            </p>

                            <p
                                className={`mt-1 text-sm font-medium ${
                                    customer.status === 'ACTIVE'
                                        ? 'text-green-600'
                                        : customer.status === 'SUSPENDED'
                                          ? 'text-yellow-600'
                                          : 'text-muted-foreground'
                                }`}
                            >
                                {customer.status}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link href={`/auth/customers/${customer.id}/edit`}>
                            <Button variant="outline">Edit Profile</Button>
                        </Link>

                        <Button onClick={handleBack}>Back</Button>
                    </div>
                </div>

                {/* ================= Basic Info ================= */}
                <section>
                    <HeadingSmall
                        title="Basic Information"
                        description="Personal and contact details"
                    />

                    <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
                        <Info label="Customer Type" value={customer.type} />
                        <Info label="Phone" value={customer.phone} />
                        <Info label="Email" value={customer.email} />
                        <Info label="KYC Level" value={customer.kyc_level} />
                        <Info label="Date of Birth" value={customer.dob} />
                        <Info label="Gender" value={customer.gender} />
                        <Info label="Religion" value={customer.religion} />
                    </div>
                </section>

                {/* ================= Identification ================= */}
                <section>
                    <HeadingSmall
                        title="Identification"
                        description="Verification and legal identity"
                    />

                    <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
                        <Info
                            label="Identification Type"
                            value={customer.identification_type}
                        />
                        <Info
                            label="Identification Number"
                            value={customer.identification_number}
                        />

                        {customer.type === 'Organization' && (
                            <Info
                                label="Registration No"
                                value={customer.registration_no}
                                full
                            />
                        )}
                    </div>
                </section>

                {/* ================= Metadata ================= */}
                <section className="text-xs text-muted-foreground">
                    <p>
                        Created:{' '}
                        <span className="text-foreground">
                            {formatDateTime(customer.created_at)}
                        </span>
                    </p>
                    <p>
                        Updated:{' '}
                        <span className="text-foreground">
                            {formatDateTime(customer.updated_at)}
                        </span>
                    </p>
                </section>
            </div>
        </CustomAuthLayout>
    );
}

export default Show;

function Info({
    label,
    value,
    full = false,
}: {
    label: string;
    value?: string | null;
    full?: boolean;
}) {
    return (
        <div className={full ? 'md:col-span-2' : ''}>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-1 text-sm text-foreground">{value || '—'}</p>
        </div>
    );
}

function formatDateTime(value?: string | null) {
    if (!value) return '—';

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}
