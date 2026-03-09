import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit2,
    HomeIcon,
    ListFilter,
    Plus,
    UserCheckIcon,
    UserIcon,
    UsersIcon,
} from 'lucide-react';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDate } from '../../../lib/date_util';
import { BreadcrumbItem } from '../../../types';
import {
    Customer,
    CustomerAddress,
    CustomerFamilyRelation,
    CustomerIntroducer,
} from '../../../types/customer_kyc_module';

// -------------------- Theme Colors --------------------
const themeColors = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground',
    muted: 'bg-muted text-muted-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
};

interface ShowProps {
    customer: Customer & {
        addresses?: CustomerAddress[];
        family_relations?: CustomerFamilyRelation[];
        introducers?: CustomerIntroducer[];
    };
    backUrl: string;
}

export default function Show({ customer, backUrl }: ShowProps) {
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

            {/* ================= Header ================= */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    {customer.photo ? (
                        <img
                            src={customer.photo.url}
                            alt={customer.name}
                            className="h-16 w-16 rounded-full border border-gray-300 object-cover dark:border-gray-700"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-lg font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200">
                            {customer.name.charAt(0)}
                        </div>
                    )}
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {customer.name}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {customer.customer_no} | {customer.type}
                        </p>
                        <p
                            className={`text-xs font-medium ${getStatusColor(customer.kyc_status)}`}
                        >
                            {customer.kyc_status}
                        </p>
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
                icon={<UserIcon />}
                title="Basic Information"
                actions={
                    <Link
                        href={`/customers/${customer.id}/edit`}
                        className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground transition hover:bg-accent/80"
                    >
                        <Edit2 size={14} /> Edit
                    </Link>
                }
            >
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
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
                        label="KYC Status"
                        value={customer.kyc_status}
                        badge
                    />
                    <InfoItem
                        label="Type"
                        value={customer.identification_type}
                    />
                    <InfoItem
                        label="ID Number"
                        value={customer.identification_number}
                    />
                </div>
            </SectionHeader>

            {/* ================= Addresses ================= */}
            {customer.addresses?.length > 0 && (
                <SectionHeader
                    icon={<HomeIcon />}
                    title="Addresses"
                    actions={<AddButton />}
                >
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {customer.addresses.map((addr, i) => (
                            <DataCard
                                key={addr.id}
                                title={`${i + 1}. ${addr.type}`}
                            >
                                <div className="text-xs opacity-80">
                                    {addr.line1}, {addr.line2}, {addr.district}
                                </div>
                                <div className="mt-1 text-[10px] opacity-70">
                                    {addr.division}, {addr.upazila},{' '}
                                    {addr.union_ward}, {addr.postal_code},{' '}
                                    {addr.country}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    <Badge
                                        text={addr.verification_status}
                                        color="accent"
                                    />
                                </div>
                            </DataCard>
                        ))}
                    </div>
                </SectionHeader>
            )}

            {/* ================= Family Relations ================= */}
            {customer.family_relations?.length > 0 && (
                <SectionHeader
                    icon={<UsersIcon />}
                    title="Family Relations"
                    actions={<AddButton />}
                >
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {customer.family_relations.map((rel) => (
                            <DataCard key={rel.id} title={''}>
                                <div className="flex items-center gap-2">
                                    {rel.relative?.photo?.url ? (
                                        <img
                                            src={rel.relative.photo.url}
                                            alt={rel.relative.name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs">
                                            {rel.relative?.name?.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1 text-xs">
                                        <div className="text-sm font-medium">
                                            {rel.relative?.name}
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="text-xs opacity-80">
                                                {rel.relation_type}
                                            </div>
                                            <Badge
                                                text={rel.verification_status}
                                                color="accent"
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
                    icon={<UserCheckIcon />}
                    title="Introducers"
                    actions={<AddButton />}
                >
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {customer.introducers.map((intro) => (
                            <DataCard key={intro.id} title={''}>
                                <div className="flex items-center gap-2">
                                    {intro.introducer_customer?.photo?.url ? (
                                        <img
                                            src={
                                                intro.introducer_customer.photo
                                                    .url
                                            }
                                            alt={intro.introducer_customer.name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-border bg-secondary text-xs">
                                            {intro.introducer_customer?.name?.charAt(
                                                0,
                                            )}
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1 text-xs">
                                        <div className="text-sm font-medium">
                                            {intro.introducer_customer?.name}
                                        </div>

                                        <div className="flex gap-2 text-xs">
                                            <div className="text-xs opacity-80">
                                                {intro.relationship_type}
                                            </div>

                                            <Badge
                                                text={`${intro.verification_status}`}
                                                color="accent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </DataCard>
                        ))}
                    </div>
                </SectionHeader>
            )}
        </CustomAuthLayout>
    );
}

// -------------------- Helpers --------------------
const ActionButton = ({
    children,
    icon,
    color = 'muted',
    as = 'button',
    ...props
}: {
    children: React.ReactNode;
    icon: React.ReactNode;
    color?: keyof typeof themeColors;
    as?: 'button' | typeof Link;
    [key: string]: any;
}) =>
    as === 'button' ? (
        <button
            className={`flex items-center gap-1 rounded px-2 py-1 ${themeColors[color]} transition hover:brightness-90`}
            {...props}
        >
            {icon} {children}
        </button>
    ) : (
        <Link
            className={`flex items-center gap-1 rounded px-2 py-1 ${themeColors[color]} transition hover:brightness-90`}
            {...props}
        >
            {icon} {children}
        </Link>
    );

const InfoItem = ({
    label,
    value,
    badge = false,
}: {
    label: string;
    value?: string | null;
    badge?: boolean;
}) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold text-gray-500 uppercase dark:text-gray-400">
            {label}
        </span>
        {badge ? (
            <div className="">
                <span className="mt-0.5 inline-block rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    {value || '—'}
                </span>
            </div>
        ) : (
            <span className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">
                {value || '—'}
            </span>
        )}
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

const Badge = ({
    text,
    color = 'accent',
}: {
    text: string;
    color?: keyof typeof themeColors;
}) => (
    <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-medium bg-${color}/20 text-${color}-foreground`}
    >
        {text}
    </span>
);

const AddButton = () => (
    <button className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-secondary-foreground transition hover:bg-accent/80">
        <Plus size={16} /> Add
    </button>
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
