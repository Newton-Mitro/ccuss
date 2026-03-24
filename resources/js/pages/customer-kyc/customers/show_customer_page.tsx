import { Head, Link, router } from '@inertiajs/react';
import {
    Edit2,
    Eye,
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
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import { UserInfo } from '../../../components/user-info';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { formatDate } from '../../../lib/date_util';
import kycDocumentStatusConfig from '../../../lib/kycDocumentStatusConfig';
import statusConfig, { Status } from '../../../lib/statusConfig';
import { BreadcrumbItem } from '../../../types';
import { Customer } from '../../../types/customer_kyc_module';

interface ShowProps {
    customer: Customer;
}

export default function Show({ customer }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: route('customers.index') },
        { title: customer.name, href: '' },
    ];

    console.log(customer);

    const isIndividual = customer.type === 'individual';
    const isOrganization = customer.type === 'organization';

    const handleDeleteCustomerAddress = (id: number) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Customer address will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(route('addresses.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () =>
                            toast.success(
                                `Customer address deleted successfully!`,
                            ),
                        onError: () =>
                            toast.error(
                                'Failed to delete the customer address.',
                            ),
                    });
                }
            });
    };

    const handleDeleteCustomerFamilyRelation = (id: number) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Customer family relation will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(route('family-relations.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () =>
                            toast.success(
                                `Customer family relation deleted successfully!`,
                            ),
                        onError: () =>
                            toast.error(
                                'Failed to delete the customer family relation.',
                            ),
                    });
                }
            });
    };

    const handleDeleteCustomerIntroducer = (id: number) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Customer introducer will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(route('introducers.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () =>
                            toast.success(
                                `Customer introducer deleted successfully!`,
                            ),
                        onError: () =>
                            toast.error(
                                'Failed to delete the customer introducer.',
                            ),
                    });
                }
            });
    };

    const handleDeleteCustomerKycDocument = (id: number) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Customer kyc document will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(route('kyc-documents.destroy', id), {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () =>
                            toast.success(
                                `Customer kyc document deleted successfully!`,
                            ),
                        onError: () =>
                            toast.error(
                                'Failed to delete the customer kyc document.',
                            ),
                    });
                }
            });
    };

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
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-card text-lg font-semibold text-card-foreground">
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
                        <>
                            <InfoItem
                                label="Date of Birth"
                                value={formatDate(customer.dob)}
                            />

                            <InfoItem label="Gender" value={customer.gender} />
                            <InfoItem
                                label="Religion"
                                value={customer.religion}
                            />
                            <InfoItem
                                label="Marital Status"
                                value={customer.marital_status}
                            />
                            <InfoItem
                                label="Blood Group"
                                value={customer.blood_group}
                            />
                            <InfoItem
                                label="Nationality"
                                value={customer.nationality}
                            />
                            <InfoItem
                                label="Occupation"
                                value={customer.occupation}
                            />
                            <InfoItem
                                label="Education"
                                value={customer.education}
                            />
                        </>
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
                >
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                        <div className="rounded-md border bg-card px-4 py-2 shadow-sm hover:shadow-md">
                            <InfoItem
                                label="KYC Level"
                                value={customer.kyc_profile.kyc_level}
                            />
                        </div>
                        <div className="rounded-md border bg-card px-4 py-2 shadow-sm hover:shadow-md">
                            <InfoItem
                                label="Risk Level"
                                value={customer.kyc_profile.risk_level}
                            />
                        </div>
                    </div>
                </SectionHeader>
            )}

            {/* ================= Addresses ================= */}

            <SectionHeader
                icon={<HomeIcon size={18} />}
                title="Addresses"
                actions={
                    <Link
                        href={route('addresses.create', customer.id)}
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
                            onEdit={() => {
                                router.visit(
                                    route('addresses.edit', [addr.id]),
                                );
                            }}
                            onDelete={() => {
                                handleDeleteCustomerAddress(addr.id);
                            }}
                        >
                            <div className="text-sm font-semibold">
                                {addr.type}
                            </div>

                            <div className="text-xs opacity-80">
                                {addr.line1}, {addr.line2}, {addr.district},{' '}
                                {addr.division}, {addr.postal_code}
                            </div>
                        </DataCard>
                    ))}
                </div>
            </SectionHeader>

            {/* ================= Family ================= */}

            <SectionHeader
                icon={<UsersIcon size={18} />}
                title="Family & Relatives"
                actions={
                    <Link
                        href={route('family-relations.create', customer.id)}
                        className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground hover:bg-secondary/80"
                    >
                        <Plus size={14} /> Add
                    </Link>
                }
            >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                    {customer.family_relations?.map((rel) => (
                        <DataCard
                            key={rel.id}
                            onShow={() => {
                                router.visit(
                                    route('family-relations.show', [rel.id]),
                                );
                            }}
                            onEdit={() => {
                                router.visit(
                                    route('family-relations.edit', [rel.id]),
                                );
                            }}
                            onDelete={() => {
                                handleDeleteCustomerFamilyRelation(rel.id);
                            }}
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
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {`${rel.relative?.name} • ${rel.relative?.customer_no}`}
                                        </Link>
                                    </div>

                                    <div className="flex gap-2">
                                        <span>{rel.relation_type}</span>

                                        <Badge text={rel.verification_status} />
                                    </div>
                                </div>
                            </div>
                        </DataCard>
                    ))}
                    {customer.related_to_me?.map((rel) => (
                        <DataCard key={rel.customer.id}>
                            <div className="flex items-center gap-2">
                                {rel.customer?.photo?.url ? (
                                    <img
                                        src={rel.customer.photo.url}
                                        className="h-10 w-10 rounded-full"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs">
                                        {rel.customer?.name?.charAt(0)}
                                    </div>
                                )}

                                <div className="flex flex-col text-xs">
                                    <div className="text-sm font-medium">
                                        <Link
                                            href={route(
                                                'customers.show',
                                                rel.customer?.id,
                                            )}
                                            className="cursor-pointer text-sm font-semibold hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {`${rel.customer?.name} • ${rel.customer?.customer_no}`}
                                        </Link>
                                    </div>

                                    <div className="flex gap-2">
                                        <span>{rel.relation_type}</span>

                                        <Badge text={rel.verification_status} />
                                    </div>
                                </div>
                            </div>
                        </DataCard>
                    ))}
                </div>
            </SectionHeader>

            {/* ================= Introducers ================= */}

            <SectionHeader
                icon={<UserCheckIcon size={18} />}
                title="Introducers"
                actions={
                    <Link
                        href={route('introducers.create', customer.id)}
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
                            onShow={() => {
                                router.visit(
                                    route('introducers.show', [intro.id]),
                                );
                            }}
                            onEdit={() => {
                                router.visit(
                                    route('introducers.edit', [intro.id]),
                                );
                            }}
                            onDelete={() => {
                                handleDeleteCustomerIntroducer(intro.id);
                            }}
                        >
                            <div className="flex items-center gap-2">
                                {intro.introducer?.photo?.url ? (
                                    <img
                                        src={intro.introducer.photo.url}
                                        className="h-10 w-10 rounded-full"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs">
                                        {intro.introducer?.name?.charAt(0)}
                                    </div>
                                )}
                                <div className="">
                                    <div className="text-sm font-medium">
                                        <Link
                                            href={route(
                                                'customers.show',
                                                intro.introducer?.id,
                                            )}
                                            className="cursor-pointer text-sm font-semibold hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {`${intro.introducer?.name} • ${intro.introducer?.customer_no}`}
                                        </Link>
                                    </div>

                                    <div className="flex gap-2 text-xs">
                                        <span>{intro.relationship_type}</span>

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

            {/* ================= KYC Documents ================= */}

            <SectionHeader
                icon={<FileText size={18} />}
                title="KYC Documents"
                actions={
                    <Link
                        href={route('kyc-documents.create', customer.id)}
                        className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground hover:bg-secondary/80"
                    >
                        <Plus size={14} /> Add
                    </Link>
                }
            >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                    {customer.kyc_documents.map((doc) => (
                        <DataCard
                            key={doc.id}
                            onShow={() => {
                                router.visit(
                                    route('kyc-documents.show', [doc.id]),
                                );
                            }}
                            onDelete={() => {
                                handleDeleteCustomerKycDocument(doc.id);
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <VerificationStatus
                                    status={doc.verification_status}
                                />
                                <div className="text-sm font-semibold">
                                    {doc.document_type}
                                </div>
                            </div>
                        </DataCard>
                    ))}
                </div>
            </SectionHeader>

            {/* ================= Online Service ================= */}

            {customer.online_service_client && (
                <SectionHeader
                    icon={<Users size={18} />}
                    title="Online Service Account"
                >
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                        <div className="flex items-center gap-2 rounded-md border bg-card p-4 shadow-sm hover:shadow-md">
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
        <span className="text-[10px] text-foreground">{label}</span>
        <span className="text-sm">{value || '—'}</span>
    </div>
);

const DataCard = ({
    children,
    onShow,
    onEdit,
    onDelete,
}: {
    children: React.ReactNode;
    onShow?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}) => (
    <div className="group relative rounded-md border bg-card p-3 shadow-sm transition hover:shadow-md">
        {/* Edit/Delete buttons */}
        {(onEdit || onDelete || onShow) && (
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
                {onShow && (
                    <button
                        onClick={onShow}
                        className="rounded bg-secondary p-1 text-secondary-foreground hover:bg-secondary/80"
                    >
                        <Eye size={14} />
                    </button>
                )}
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
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-card-foreground">
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
