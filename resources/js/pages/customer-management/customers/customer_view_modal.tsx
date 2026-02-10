import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { HomeIcon, UserCheckIcon, UserIcon, UsersIcon } from 'lucide-react';
import { formatDate } from '../../../lib/date_util';

interface CustomerViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: any;
}

export default function CustomerViewModal({
    open,
    onOpenChange,
    customer,
}: CustomerViewModalProps) {
    if (!customer) return null;

    const isIndividual = customer.type === 'Individual';
    const isOrganization = customer.type === 'Organization';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col p-0">
                {/* ===== Fixed Header ===== */}
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle>Customer Details</DialogTitle>
                </DialogHeader>

                {/* ===== Scrollable Body ===== */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-6">
                        {/* ================= Header ================= */}
                        <div className="flex flex-col items-center justify-center gap-2">
                            {customer.photo?.url ? (
                                <img
                                    src={customer.photo.url}
                                    alt={customer.name}
                                    className="h-20 w-20 rounded-full border object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-muted text-xl font-semibold">
                                    {customer.name.charAt(0)}
                                </div>
                            )}

                            <div className="text-center">
                                <h2 className="text-xl font-semibold">
                                    {customer.name}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {customer.customer_no} • {customer.type}
                                </p>
                                <p
                                    className={`mt-1 text-xs font-medium ${getStatusColor(
                                        customer.status,
                                    )}`}
                                >
                                    {customer.status}
                                </p>
                            </div>
                        </div>

                        {/* ================= Basic Info ================= */}
                        <SectionCard
                            title="Basic Information"
                            icon={<UserIcon size={16} />}
                        >
                            <InfoGrid>
                                {isIndividual && (
                                    <Info
                                        label="Date of Birth"
                                        value={formatDate(customer.dob)}
                                    />
                                )}
                                {isIndividual && (
                                    <Info
                                        label="Gender"
                                        value={customer.gender}
                                    />
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
                                <Info
                                    label="Identification Number"
                                    value={customer.identification_number}
                                />
                            </InfoGrid>
                        </SectionCard>

                        {/* ================= Addresses ================= */}
                        {customer.addresses?.length > 0 && (
                            <SectionCard
                                title="Addresses"
                                icon={<HomeIcon size={16} />}
                            >
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {customer.addresses.map(
                                        (address: any, index: number) => (
                                            <div
                                                key={address.id}
                                                className="rounded-md border p-3"
                                            >
                                                <p className="text-sm font-semibold">
                                                    {index + 1}. {address.line1}
                                                    , {address.line2}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {address.type} •{' '}
                                                    {
                                                        address.verification_status
                                                    }
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {address.division},{' '}
                                                    {address.district},{' '}
                                                    {address.country}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </SectionCard>
                        )}

                        {/* ================= Family Relations ================= */}
                        {customer.family_relations?.length > 0 && (
                            <SectionCard
                                title="Family Relations"
                                icon={<UsersIcon size={16} />}
                            >
                                {customer.addresses.length && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {customer.family_relations.map(
                                            (family_relation) => (
                                                <div
                                                    key={family_relation.id}
                                                    className="rounded-md border bg-card p-3"
                                                >
                                                    <div className="flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                                                        <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                                                            {family_relation
                                                                .photo?.url ? (
                                                                <img
                                                                    src={
                                                                        family_relation
                                                                            .photo
                                                                            .url
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
                                                    label="Introducer Customer Id"
                                                    value={intro.introduced_customer_id?.toString()}
                                                />
                                                <Info
                                                    label="Introducer Account Id"
                                                    value={intro.introducer_account_id?.toString()}
                                                />
                                                <Info
                                                    label="Relationship"
                                                    value={
                                                        intro.relationship_type
                                                    }
                                                />
                                                <Info
                                                    label="Status"
                                                    value={
                                                        intro.verification_status
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Info({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">
                {label}
            </p>
            <p className="text-sm">{value || '—'}</p>
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
        <section className="rounded-md border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                {icon}
                <span>{title}</span>
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
            return 'text-green-600';
        case 'SUSPENDED':
            return 'text-yellow-600';
        case 'PENDING':
            return 'text-gray-500';
        default:
            return 'text-gray-500';
    }
}
