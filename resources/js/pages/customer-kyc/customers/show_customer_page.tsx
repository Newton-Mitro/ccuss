import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit2,
    FileText,
    HomeIcon,
    ListFilter,
    Plus,
    UserCheckIcon,
    UserIcon,
    Users,
    UsersIcon,
    X,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { UserInfo } from '../../../components/user-info';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDate } from '../../../lib/date_util';
import kycDocumentStatusConfig from '../../../lib/kycDocumentStatusConfig';
import statusConfig, { Status } from '../../../lib/statusConfig';
import { BreadcrumbItem } from '../../../types';
import { Customer } from '../../../types/customer_kyc_module';

interface ShowProps {
    customer: Customer;
}

export default function Show({ customer }: ShowProps) {
    console.log(customer);
    const handleBack = () => window.history.back();

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

                        <p className="text-xs text-foreground/70">
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
                        href={route('customers.edit', customer.id)}
                        className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground hover:bg-secondary/80"
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
                            href={route('kyc-profiles.edit', {
                                id: customer.id,
                            })}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground hover:bg-secondary/80"
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
                            href={route('addresses.create')}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground hover:bg-secondary/80"
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
                            href={route('family-relations.create')}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground hover:bg-secondary/80"
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
                                            <Link
                                                href={route(
                                                    'customers.show',
                                                    rel.relative?.id,
                                                )}
                                                className="cursor-pointer text-sm font-semibold hover:underline"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {`${rel.relative?.name} • ${rel.relative?.customer_no}`}
                                            </Link>
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
                            href={route('introducers.create')}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground hover:bg-secondary/80"
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
                                <div className="flex items-center gap-2">
                                    {intro.introducer_customer?.photo?.url ? (
                                        <img
                                            src={
                                                intro.introducer_customer.photo
                                                    .url
                                            }
                                            className="h-10 w-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs">
                                            {intro.introducer_customer?.name?.charAt(
                                                0,
                                            )}
                                        </div>
                                    )}
                                    <div className="">
                                        <div className="text-sm font-medium">
                                            <Link
                                                href={route(
                                                    'customers.show',
                                                    intro.introducer_customer
                                                        ?.id,
                                                )}
                                                className="cursor-pointer text-sm font-semibold hover:underline"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {`${intro.introducer_customer?.name} • ${intro.introducer_customer?.customer_no}`}
                                            </Link>
                                        </div>

                                        <div className="flex gap-2 text-xs">
                                            <span>
                                                {intro.relationship_type}
                                            </span>

                                            <Badge
                                                text={intro.verification_status}
                                            />
                                        </div>
                                    </div>
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
                            href={route('kyc-documents.create')}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground hover:bg-secondary/80"
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
                                        <Link
                                            href={doc.url}
                                            className="cursor-pointer text-sm font-semibold hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {doc.document_type}
                                        </Link>
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
                    icon={<Users size={18} />}
                    title="Online Service Account"
                >
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                        <div className="flex items-center gap-2">
                            <UserInfo
                                user={customer.online_service_client}
                                showEmail
                            />
                        </div>
                    </div>
                </SectionHeader>
            )}
        </CustomAuthLayout>
    );
}

/* ================= UI Components ================= */

const ActionButton = ({ children, icon, as = 'button', ...props }: any) =>
    as === 'button' ? (
        <button
            className={`flex items-center gap-1 rounded bg-primary px-2 py-1 text-primary-foreground hover:bg-primary/80`}
            {...props}
        >
            {icon} {children}
        </button>
    ) : (
        <Link
            className={`flex items-center gap-1 rounded bg-primary px-2 py-1 text-primary-foreground hover:bg-primary/80`}
            {...props}
        >
            {icon} {children}
        </Link>
    );

const InfoItem = ({ label, value }: any) => (
    <div className="flex flex-col">
        <span className="text-[10px] text-foreground uppercase">{label}</span>
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
    <div className="group relative rounded-md border bg-card p-3 shadow-sm transition hover:shadow-md">
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

const Badge = ({ text }: { text: Status }) => {
    const config = statusConfig[text];

    return (
        <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                config?.class ??
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }`}
        >
            {config?.label ?? text}
        </span>
    );
};

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

const VerificationStatus = ({ status }: { status: Status }) => {
    const config = kycDocumentStatusConfig[status];

    if (!config) return null;

    const Icon = config.icon;

    return (
        <span className={`flex items-center gap-1 text-xs ${config.iconClass}`}>
            <Icon size={18} />
        </span>
    );
};
