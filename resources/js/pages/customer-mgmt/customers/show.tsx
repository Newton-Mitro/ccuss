import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit2,
    EyeClosed,
    HomeIcon,
    ListFilter,
    UserCheckIcon,
    UserIcon,
    UsersIcon,
    X,
} from 'lucide-react';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDate } from '../../../lib/date_util';
import { BreadcrumbItem } from '../../../types';
import {
    Customer,
    CustomerAddress,
    CustomerFamilyRelation,
    CustomerIntroducer,
} from '../../../types/customer';

interface ShowProps {
    customer: Customer & {
        addresses?: CustomerAddress[];
        family_relations?: CustomerFamilyRelation[];
        introducers?: CustomerIntroducer[];
    };
    backUrl: string;
}

function Show({ customer, backUrl }: ShowProps) {
    const handleBack = () =>
        router.visit(backUrl, { preserveState: true, preserveScroll: true });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/customers' },
        { title: customer.name, href: '' },
    ];

    const isIndividual = customer.type === 'Individual';
    const isOrganization = customer.type === 'Organization';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer - ${customer.name}`} />

            <div className="space-y-6">
                {/* ================= Header ================= */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        {customer.photo ? (
                            <img
                                src={customer.photo.url}
                                alt={customer.name}
                                className="h-20 w-20 rounded-full border border-gray-300 object-cover dark:border-gray-700"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-xl font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                {customer.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {customer.name}
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {customer.customer_no} | {customer.type}
                            </p>
                            <p
                                className={`mt-1 text-xs font-medium ${getStatusColor(customer.status)}`}
                            >
                                {customer.status}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center gap-1 rounded bg-muted px-3 py-1 text-muted-foreground transition hover:bg-muted/90"
                        >
                            <ArrowLeft size={16} />
                            <span className="hidden sm:inline">Back</span>
                        </button>

                        <Link
                            href={`/customers/${customer.id}/edit`}
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
                            href={`/customers`}
                            className="flex items-center gap-1 rounded bg-secondary px-3 py-1 text-secondary-foreground transition hover:bg-secondary/90"
                        >
                            <ListFilter size={16} />
                            <span className="hidden sm:inline">Customers</span>
                        </Link>
                    </div>
                </div>

                {/* ================= Basic Info ================= */}
                <SectionCard
                    title="Basic Information"
                    icon={<UserIcon size={16} />}
                >
                    <div className="rounded-md border bg-card p-3">
                        <InfoGrid>
                            {isIndividual && (
                                <Info
                                    label="Date of Birth"
                                    value={formatDate(customer.dob)}
                                />
                            )}
                            {isIndividual && (
                                <Info label="Gender" value={customer.gender} />
                            )}
                            {isIndividual && (
                                <Info
                                    label="Religion"
                                    value={customer.religion}
                                />
                            )}
                            {isOrganization && (
                                <Info
                                    label="Organization Name"
                                    value={customer.name}
                                />
                            )}
                            <Info label="Phone" value={customer.phone} />
                            <Info label="Email" value={customer.email} />
                            <Info
                                label="KYC Status"
                                value={customer.kyc_status}
                            />
                        </InfoGrid>
                    </div>
                </SectionCard>

                {/* ================= Identification ================= */}
                <SectionCard
                    title="Identification"
                    icon={<UserCheckIcon size={16} />}
                >
                    <div className="rounded-md border bg-card p-3">
                        <InfoGrid>
                            <Info
                                label="Type"
                                value={customer.identification_type}
                            />
                            <Info
                                label="Identification Number"
                                value={customer.identification_number}
                            />
                        </InfoGrid>
                    </div>
                </SectionCard>

                {/* ================= Addresses ================= */}
                {customer.addresses?.length > 0 && (
                    <SectionCard
                        title="Addresses"
                        icon={<HomeIcon size={16} />}
                    >
                        {customer.addresses.length && (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {customer.addresses.map((address, index) => (
                                    <div
                                        key={address.id}
                                        className="rounded-md border bg-card p-3"
                                    >
                                        <div className="flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 text-sm">
                                                    <p className="font-semibold">
                                                        {index + 1}.{' '}
                                                        {address.line1},{' '}
                                                        {address.line2} –{' '}
                                                        {address.district}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {address.type} |{' '}
                                                        {
                                                            address.verification_status
                                                        }
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {address.division},{' '}
                                                        {address.upazila},{' '}
                                                        {address.union_ward},{' '}
                                                        {address.postal_code},{' '}
                                                        {address.country}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                )}

                {/* ================= Family Relations ================= */}
                {customer.family_relations?.length > 0 && (
                    <SectionCard
                        title="Family Relations"
                        icon={<UsersIcon size={16} />}
                    >
                        {customer.addresses.length && (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {customer.family_relations.map(
                                    (family_relation) => (
                                        <div
                                            key={family_relation.id}
                                            className="rounded-md border bg-card p-3"
                                        >
                                            <div className="flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                                                <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                                                    {family_relation.photo
                                                        ?.url ? (
                                                        <img
                                                            src={
                                                                family_relation
                                                                    .photo.url
                                                            }
                                                            alt={
                                                                family_relation.name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                                            {family_relation.name?.charAt(
                                                                0,
                                                            ) ?? '-'}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    <div>
                                                        <p className="text-sm font-semibold">
                                                            {
                                                                family_relation.name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                family_relation.gender
                                                            }{' '}
                                                            •{' '}
                                                            {
                                                                family_relation.relation_type
                                                            }
                                                            •{' '}
                                                            {
                                                                family_relation.religion
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                                                        <Info
                                                            label="Date of Birth"
                                                            value={formatDate(
                                                                family_relation.dob,
                                                            )}
                                                        />

                                                        <Info
                                                            label="Identification Type"
                                                            value={
                                                                family_relation.identification_type
                                                            }
                                                        />
                                                        <Info
                                                            label="Identification No"
                                                            value={
                                                                family_relation.identification_number
                                                            }
                                                        />
                                                        <Info
                                                            label="Phone"
                                                            value={
                                                                family_relation.phone
                                                            }
                                                        />
                                                        <Info
                                                            label="Email"
                                                            value={
                                                                family_relation.email
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </SectionCard>
                )}

                {/* ================= Introducers ================= */}
                {customer.introducers?.length > 0 && (
                    <SectionCard
                        title="Introducers"
                        icon={<UserCheckIcon size={16} />}
                    >
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {customer.introducers.map((intro) => (
                                <div
                                    key={intro.id}
                                    className="rounded-md border bg-card p-3"
                                >
                                    <div className="flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                                        <Info
                                            label="Introduced By"
                                            value={
                                                intro.introducer_customer?.name
                                            }
                                        />
                                        <Info
                                            label="Relationship"
                                            value={intro.relationship_type}
                                        />
                                        <Info
                                            label="Status"
                                            value={intro.verification_status}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}
            </div>
        </CustomAuthLayout>
    );
}

export default Show;

// -------------------- Helpers --------------------
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
            <p className="text-[10px] font-medium text-gray-500 uppercase dark:text-gray-400">
                {label}
            </p>
            <p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">
                {value || '—'}
            </p>
        </div>
    );
}

function SectionCard({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {icon} <span>{title}</span>
            </div>
            {children}
        </section>
    );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">{children}</div>
    );
}

function getStatusColor(status?: string) {
    switch (status) {
        case 'ACTIVE':
            return 'text-green-600 dark:text-green-400';
        case 'SUSPENDED':
            return 'text-yellow-600 dark:text-yellow-400';
        case 'PENDING':
            return 'text-gray-500 dark:text-gray-400';
        default:
            return 'text-gray-500 dark:text-gray-400';
    }
}
