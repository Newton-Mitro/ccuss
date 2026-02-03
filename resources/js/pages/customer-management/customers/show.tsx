import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit2,
    HomeIcon,
    ListFilter,
    SearchSlash,
    Trash2,
    UserCheckIcon,
    UserIcon,
    UsersIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Address } from '../../../types/address';
import { Customer } from '../../../types/customer';
import { FamilyRelation } from '../../../types/family_relation';
import { Introducer } from '../../../types/introducer';

interface ShowProps {
    customer: Customer & {
        addresses?: Address[];
        family_relations?: FamilyRelation[];
        introducers?: Introducer[];
    };
    backUrl: string;
}

function Show({ customer, backUrl }: ShowProps) {
    const handleBack = () =>
        router.visit(backUrl, { preserveState: true, preserveScroll: true });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
        { title: customer.name, href: '' },
    ];

    const isIndividual = customer.type === 'Individual';
    const isOrganization = customer.type === 'Organization';

    const handleDelete = (id: number, name: string) => {
        const isDark = document.documentElement.classList.contains('dark');

        Swal.fire({
            title: 'Are you sure?',
            text: `Customer "${name}" will be permanently deleted!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/auth/customers/${id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        toast.success(
                            `Customer "${name}" deleted successfully!`,
                        );
                    },
                    onError: (errors) => {
                        toast.error('Failed to delete the customer.');
                        console.error(errors);
                    },
                });
            }
        });
    };

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
                                Customer No · {customer.customer_no}
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
                            href={`/auth/customers/${customer.id}/edit`}
                            className="flex items-center gap-1 rounded bg-accent px-3 py-1 text-accent-foreground transition hover:bg-accent/90"
                        >
                            <Edit2 size={16} />
                            <span className="hidden sm:inline">Edit</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() =>
                                handleDelete(customer.id, customer.name)
                            }
                            className="flex items-center gap-1 rounded bg-destructive px-3 py-1 text-destructive-foreground transition hover:bg-destructive/90"
                        >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Delete</span>
                        </button>

                        <Link
                            href={`/auth/customers`}
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
                    <InfoGrid>
                        <Info label="Type" value={customer.type} />
                        {isIndividual && (
                            <Info label="Date of Birth" value={customer.dob} />
                        )}
                        {isIndividual && (
                            <Info label="Gender" value={customer.gender} />
                        )}
                        {isIndividual && (
                            <Info label="Religion" value={customer.religion} />
                        )}
                        {isOrganization && (
                            <Info
                                label="Organization Name"
                                value={customer.name}
                            />
                        )}
                        <Info label="Phone" value={customer.phone} />
                        <Info label="Email" value={customer.email} />
                        <Info label="KYC Status" value={customer.kyc_status} />
                    </InfoGrid>
                </SectionCard>

                {/* ================= Identification ================= */}
                <SectionCard
                    title="Identification"
                    icon={<UserCheckIcon size={16} />}
                >
                    <InfoGrid>
                        <Info
                            label="Type"
                            value={customer.identification_type}
                        />
                        {isOrganization && (
                            <Info
                                label="Identification Number"
                                value={customer.identification_number}
                            />
                        )}
                    </InfoGrid>
                </SectionCard>

                {/* ================= Basic Info ================= */}
                <SectionCard
                    title="Audit Trail"
                    icon={<SearchSlash size={16} />}
                >
                    <InfoGrid>
                        <Info
                            label="Created At"
                            value={formatDateTime(customer.created_at)}
                        />
                        <Info label="Created By" value={customer.created_at} />
                        <Info
                            label="Updated At"
                            value={formatDateTime(customer.updated_at)}
                        />
                        <Info label="Updated By" value={customer.updated_at} />
                    </InfoGrid>
                </SectionCard>

                {/* ================= Addresses ================= */}
                {customer.addresses?.length > 0 && (
                    <SectionCard
                        title="Addresses"
                        icon={<HomeIcon size={16} />}
                    >
                        <div className="grid gap-2">
                            {customer.addresses.map((addr) => (
                                <Card key={addr.id}>
                                    <Info label="Type" value={addr.type} />
                                    <Info label="Line 1" value={addr.line1} />
                                    {addr.line2 && (
                                        <Info
                                            label="Line 2"
                                            value={addr.line2}
                                        />
                                    )}
                                    <Info
                                        label="Division"
                                        value={addr.division}
                                    />
                                    <Info
                                        label="District"
                                        value={addr.district}
                                    />
                                    {addr.upazila && (
                                        <Info
                                            label="Upazila"
                                            value={addr.upazila}
                                        />
                                    )}
                                    {addr.postal_code && (
                                        <Info
                                            label="Postal Code"
                                            value={addr.postal_code}
                                        />
                                    )}
                                </Card>
                            ))}
                        </div>
                    </SectionCard>
                )}

                {/* ================= Family Relations ================= */}
                {customer.family_relations?.length > 0 && (
                    <SectionCard
                        title="Family Relations"
                        icon={<UsersIcon size={16} />}
                    >
                        <div className="grid gap-2">
                            {customer.family_relations.map((rel) => (
                                <Card key={rel.id}>
                                    <Info label="Name" value={rel.name} />
                                    <Info
                                        label="Relation"
                                        value={rel.relation_type}
                                    />
                                    {rel.phone && (
                                        <Info label="Phone" value={rel.phone} />
                                    )}
                                    {rel.email && (
                                        <Info label="Email" value={rel.email} />
                                    )}
                                    {rel.dob && (
                                        <Info label="DOB" value={rel.dob} />
                                    )}
                                    {rel.gender && (
                                        <Info
                                            label="Gender"
                                            value={rel.gender}
                                        />
                                    )}
                                </Card>
                            ))}
                        </div>
                    </SectionCard>
                )}

                {/* ================= Introducers ================= */}
                {customer.introducers?.length > 0 && (
                    <SectionCard
                        title="Introducers"
                        icon={<UserCheckIcon size={16} />}
                    >
                        <div className="grid gap-2">
                            {customer.introducers.map((intro) => (
                                <Card key={intro.id}>
                                    <Info
                                        label="Name"
                                        value={intro.introducer_name}
                                    />
                                    <Info
                                        label="Relationship"
                                        value={intro.relationship_type}
                                    />
                                    <Info
                                        label="Status"
                                        value={intro.verification_status}
                                    />
                                    {intro.verified_by_name && (
                                        <Info
                                            label="Verified By"
                                            value={intro.verified_by_name}
                                        />
                                    )}
                                    {intro.verified_at && (
                                        <Info
                                            label="Verified At"
                                            value={intro.verified_at}
                                        />
                                    )}
                                </Card>
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

function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="my-1 grid grid-cols-1 gap-2 md:grid-cols-2">
            {children}
        </div>
    );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">{children}</div>
    );
}

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
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
