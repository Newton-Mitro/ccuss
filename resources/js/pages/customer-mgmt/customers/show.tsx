import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Edit2,
    FileText,
    Globe,
    HomeIcon,
    ListFilter,
    Plus,
    UserCheckIcon,
    UserIcon,
    UsersIcon,
    X,
    XCircle,
} from 'lucide-react';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDate } from '../../../lib/date_util';
import { BreadcrumbItem } from '../../../types';

import { route } from 'ziggy-js';
import { Customer } from '../../../types/customer_kyc_module';

/* ================= Theme ================= */

const themeColors = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground',
    muted: 'bg-muted text-muted-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
};

const badgeColors = {
    accent: 'bg-accent/20 text-accent-foreground',
    secondary: 'bg-secondary/20 text-secondary-foreground',
    destructive: 'bg-destructive/20 text-destructive-foreground',
};

/* ================= Props ================= */

interface ShowProps {
    customer: Customer;
    backUrl: string;
}

/* ================= Page ================= */

export default function Show({ customer, backUrl }: ShowProps) {
    const handleBack = () =>
        router.visit(backUrl, { preserveState: true, preserveScroll: true });

    console.log(customer);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/customers' },
        { title: customer.name, href: '' },
    ];

    const isIndividual = customer.type === 'INDIVIDUAL';
    const isOrganization = customer.type === 'ORGANIZATION';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer - ${customer.name}`} />

            {/* ================= Header ================= */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    {customer.photo ? (
                        <img
                            src={customer.photo.url}
                            alt={customer.name}
                            className="h-20 w-20 rounded-full border object-cover"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-gray-100 text-lg font-semibold">
                            {customer.name.charAt(0)}
                        </div>
                    )}

                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold">
                            {customer.name}
                        </h1>

                        <p className="text-xs text-muted-foreground">
                            {customer.customer_no} | {customer.type}
                        </p>

                        <div className="">
                            <Badge text={customer.kyc_status} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <ActionButton
                        onClick={handleBack}
                        color="muted"
                        icon={<ArrowLeft />}
                    >
                        Back
                    </ActionButton>

                    <ActionButton
                        as={Link}
                        href="/customers"
                        color="secondary"
                        icon={<ListFilter />}
                    >
                        Customers
                    </ActionButton>
                </div>
            </div>

            {/* ================= Basic Info ================= */}

            <SectionHeader
                icon={<UserIcon size={18} />}
                title="Basic Information"
                actions={
                    <Link
                        href={`/customers/${customer.id}/edit`}
                        className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs"
                    >
                        <Edit2 size={14} /> Edit
                    </Link>
                }
            >
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                    {isIndividual && (
                        <InfoItem
                            label="Date of Birth"
                            value={formatDate(customer.dob)}
                        />
                    )}

                    {isIndividual && (
                        <InfoItem label="Gender" value={customer.gender} />
                    )}

                    {isIndividual && (
                        <InfoItem label="Religion" value={customer.religion} />
                    )}

                    {isOrganization && (
                        <InfoItem label="Organization" value={customer.name} />
                    )}

                    <InfoItem label="Phone" value={customer.phone} />
                    <InfoItem label="Email" value={customer.email} />

                    <InfoItem
                        label="ID Type"
                        value={customer.identification_type}
                    />

                    <InfoItem
                        label="ID Number"
                        value={customer.identification_number}
                    />
                </div>
            </SectionHeader>

            {/* ================= KYC Profile ================= */}
            {customer.kyc_profile && (
                <SectionHeader
                    icon={<UserCheckIcon size={18} />}
                    title="KYC Profile"
                    actions={
                        <Link
                            href={`/customers/${customer.id}/kyc-profile/edit`}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs"
                        >
                            <Edit2 size={14} /> Edit
                        </Link>
                    }
                >
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                        <InfoItem
                            label="KYC Level"
                            value={customer.kyc_profile.kyc_level}
                        />

                        <InfoItem
                            label="Risk Level"
                            value={customer.kyc_profile.risk_level}
                        />

                        <InfoItem
                            label="Verification Status"
                            value={customer.kyc_profile.verification_status}
                        />

                        <InfoItem
                            label="Remarks"
                            value={customer.kyc_profile.remarks}
                        />
                    </div>
                </SectionHeader>
            )}

            {/* ================= Addresses ================= */}

            {customer.addresses?.length > 0 && (
                <SectionHeader
                    icon={<HomeIcon size={18} />}
                    title="Addresses"
                    actions={
                        <Link
                            href={`/customers/${customer.id}/edit`}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs"
                        >
                            <Plus size={14} /> Add
                        </Link>
                    }
                >
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {customer.addresses.map((addr) => (
                            <DataCard
                                key={addr.id}
                                onEdit={() => {}}
                                onDelete={() => {}}
                            >
                                <div className="text-sm font-semibold">
                                    {addr.type}
                                </div>

                                <div className="text-xs opacity-80">
                                    {addr.line1}, {addr.district}
                                </div>

                                <div className="text-[10px] opacity-70">
                                    {addr.division}, {addr.postal_code}
                                </div>
                            </DataCard>
                        ))}
                    </div>
                </SectionHeader>
            )}

            {/* ================= Family ================= */}

            {customer.family_relations?.length > 0 && (
                <SectionHeader
                    icon={<UsersIcon size={18} />}
                    title="Family & Relatives"
                    actions={
                        <Link
                            href={`/customers/${customer.id}/edit`}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs"
                        >
                            <Plus size={14} /> Add
                        </Link>
                    }
                >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {customer.family_relations.map((rel) => (
                            <DataCard
                                key={rel.id}
                                onEdit={() => {}}
                                onDelete={() => {}}
                            >
                                <div className="flex items-center gap-2">
                                    {rel.relative?.photo?.url ? (
                                        <img
                                            src={rel.relative.photo.url}
                                            className="h-10 w-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs">
                                            {rel.relative?.name?.charAt(0)}
                                        </div>
                                    )}

                                    <div className="flex flex-col text-xs">
                                        <div className="text-sm font-medium">
                                            <a
                                                href={route(
                                                    'customers.show',
                                                    rel.relative?.id,
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cursor-pointer text-sm font-semibold hover:underline"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {`${rel.relative?.name} • ${rel.relative?.customer_no}`}
                                            </a>
                                        </div>

                                        <div className="flex gap-2">
                                            <span>{rel.relation_type}</span>

                                            <Badge
                                                text={rel.verification_status}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </DataCard>
                        ))}
                    </div>
                </SectionHeader>
            )}

            {/* ================= Introducers ================= */}

            {customer.introducers?.length > 0 && (
                <SectionHeader
                    icon={<UserCheckIcon size={18} />}
                    title="Introducers"
                    actions={
                        <Link
                            href={`/customers/${customer.id}/edit`}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs"
                        >
                            <Plus size={14} /> Add
                        </Link>
                    }
                >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {customer.introducers.map((intro) => (
                            <DataCard
                                key={intro.id}
                                onEdit={() => {}}
                                onDelete={() => {}}
                            >
                                <div className="text-sm font-medium">
                                    <a
                                        href={route(
                                            'customers.show',
                                            intro.introducer_customer?.id,
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cursor-pointer text-sm font-semibold hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {`${intro.introducer_customer?.name} • ${intro.introducer_customer?.customer_no}`}
                                    </a>
                                </div>

                                <div className="flex gap-2 text-xs">
                                    <span>{intro.relationship_type}</span>

                                    <Badge text={intro.verification_status} />
                                </div>
                            </DataCard>
                        ))}
                    </div>
                </SectionHeader>
            )}

            {/* ================= KYC Documents ================= */}

            {customer.kyc_documents?.length > 0 && (
                <SectionHeader
                    icon={<FileText size={18} />}
                    title="KYC Documents"
                    actions={
                        <Link
                            href={`/customers/${customer.id}/edit`}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs"
                        >
                            <Plus size={14} /> Add
                        </Link>
                    }
                >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {customer.kyc_documents.map((doc) => (
                            <DataCard key={doc.id} onDelete={() => {}}>
                                <div className="flex items-center gap-2">
                                    <VerificationStatus
                                        status={doc.verification_status}
                                    />
                                    <div className="text-sm font-semibold">
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="cursor-pointer text-sm font-semibold hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {doc.document_type}
                                        </a>
                                    </div>
                                </div>
                            </DataCard>
                        ))}
                    </div>
                </SectionHeader>
            )}

            {/* ================= Online Service ================= */}

            {customer.online_service_client && (
                <SectionHeader
                    icon={<Globe size={18} />}
                    title="Online Service Client"
                    actions={
                        <Link
                            href={`/customers/${customer.id}/edit`}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs"
                        >
                            <Edit2 size={14} /> Edit
                        </Link>
                    }
                >
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                        

                        <InfoItem
                            label="User Email"
                            value={customer.online_service_client.email}
                        />

                        <InfoItem
                            label="User Phone"
                            value={customer.online_service_client.phone}
                        />

                        <InfoItem
                            label="Last Login"
                            value={customer.online_service_client.last_login_at}
                        />

                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase">
                                User Status
                            </span>
                            <span className="text-sm">
                                <Badge
                                    text={customer.online_service_client.status}
                                />
                            </span>
                        </div>
                    </div>
                </SectionHeader>
            )}
        </CustomAuthLayout>
    );
}

/* ================= UI Components ================= */

const ActionButton = ({
    children,
    icon,
    color = 'muted',
    as = 'button',
    ...props
}: any) =>
    as === 'button' ? (
        <button
            className={`flex items-center gap-1 rounded px-2 py-1 ${themeColors[color]}`}
            {...props}
        >
            {icon} {children}
        </button>
    ) : (
        <Link
            className={`flex items-center gap-1 rounded px-2 py-1 ${themeColors[color]}`}
            {...props}
        >
            {icon} {children}
        </Link>
    );

const InfoItem = ({ label, value }: any) => (
    <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground uppercase">
            {label}
        </span>
        <span className="text-sm">{value || '—'}</span>
    </div>
);

const DataCard = ({
    children,
    onEdit,
    onDelete,
}: {
    children: React.ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
}) => (
    <div className="group relative rounded-md border border-border bg-card p-3 shadow-sm transition hover:shadow-md">
        {/* Edit/Delete buttons */}
        {(onEdit || onDelete) && (
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="rounded bg-secondary p-1 text-secondary-foreground hover:bg-secondary/80"
                    >
                        <Edit2 size={14} />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="rounded bg-destructive p-1 text-destructive-foreground hover:bg-destructive/80"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        )}
        {children}
    </div>
);

const Badge = ({ text, color = 'accent' }: any) => (
    <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeColors[color]}`}
    >
        {text}
    </span>
);

const SectionHeader = ({
    title,
    icon,
    actions,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <section className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-card-foreground">
            <div className="flex items-center gap-2">
                {icon} <span>{title}</span>
            </div>
            {actions && (
                <div className="flex items-center gap-2">{actions}</div>
            )}
        </div>
        {children}
    </section>
);

const VerificationStatus = ({
    status,
}: {
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}) => {
    switch (status) {
        case 'VERIFIED':
            return (
                <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 size={18} />
                </span>
            );

        case 'REJECTED':
            return (
                <span className="flex items-center gap-1 text-xs text-red-600">
                    <XCircle size={18} />
                </span>
            );

        default:
            return (
                <span className="flex items-center gap-1 text-xs text-yellow-600">
                    <Clock size={18} />
                </span>
            );
    }
};
