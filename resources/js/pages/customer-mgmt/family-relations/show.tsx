import { Head } from '@inertiajs/react';
import { CheckCircle, Clock, ShieldCheck, User, XCircle } from 'lucide-react';
import HeadingSmall from '../../../components/heading-small';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { CustomerFamilyRelation } from '../../../types/customer';

interface ViewFamilyRelationProps {
    familyRelation: CustomerFamilyRelation;
}

export default function View({ familyRelation }: ViewFamilyRelationProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: '/family-relations' },
        { title: 'View Relation', href: '' },
    ];

    const STATUS_MAP = {
        VERIFIED: {
            label: 'Verified',
            icon: CheckCircle,
            class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        },
        PENDING: {
            label: 'Pending',
            icon: Clock,
            class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        },
        REJECTED: {
            label: 'Rejected',
            icon: XCircle,
            class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        },
    } as const;

    const statusConfig = STATUS_MAP[
        familyRelation.verification_status as keyof typeof STATUS_MAP
    ] ?? {
        label: 'Unknown',
        icon: Clock,
        class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };

    const StatusIcon = statusConfig.icon;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="View Family Relation" />

            <div className="space-y-8 text-foreground">
                {/* Page Header */}
                <div className="flex flex-col gap-2">
                    <HeadingSmall
                        title="Family Relation Details"
                        description="Complete information about the selected family relation."
                    />

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusConfig.class}>
                            <StatusIcon className="mr-1 h-4 w-4" />
                            {statusConfig.label}
                        </Badge>

                        <span className="text-sm text-muted-foreground">
                            Relation ID #{familyRelation.id}
                        </span>
                    </div>
                </div>

                {/* Main Card */}
                <Card className="rounded-xl border border-border bg-card shadow-sm">
                    <CardContent className="space-y-8 p-6 md:p-8">
                        {/* Customer & Relation */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <InfoItem
                                label="Customer"
                                value={`${familyRelation.customer?.name} (${familyRelation.customer?.customer_no})`}
                                icon={User}
                            />

                            <InfoItem
                                label="Relation Type"
                                value={familyRelation.relation_type.replaceAll(
                                    '_',
                                    ' ',
                                )}
                                icon={ShieldCheck}
                            />
                        </div>

                        <Divider />

                        {/* Relative Info */}
                        <Section title="Relative Information">
                            <Grid>
                                <InfoItem
                                    label="Name"
                                    value={familyRelation.name}
                                />
                                <InfoItem
                                    label="Phone"
                                    value={familyRelation.phone}
                                />
                                <InfoItem
                                    label="Email"
                                    value={familyRelation.email}
                                />
                                <InfoItem
                                    label="Date of Birth"
                                    value={familyRelation.dob}
                                />
                                <InfoItem
                                    label="Gender"
                                    value={familyRelation.gender}
                                />
                                <InfoItem
                                    label="Religion"
                                    value={familyRelation.religion}
                                />
                            </Grid>
                        </Section>

                        <Divider />

                        {/* Identification */}
                        <Section title="Identification Details">
                            <Grid>
                                <InfoItem
                                    label="ID Type"
                                    value={familyRelation.identification_type.replaceAll(
                                        '_',
                                        ' ',
                                    )}
                                />
                                <InfoItem
                                    label="ID Number"
                                    value={familyRelation.identification_number}
                                />
                            </Grid>
                        </Section>

                        <Divider />

                        {/* Verification */}
                        <Section title="Verification">
                            <Grid>
                                <InfoItem
                                    label="Status"
                                    value={statusConfig.label}
                                />
                            </Grid>
                        </Section>
                    </CardContent>
                </Card>
            </div>
        </CustomAuthLayout>
    );
}

/* -------------------------------------------------------------------------- */
/*                               Helper Components                             */
/* -------------------------------------------------------------------------- */

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {title}
            </h3>
            {children}
        </div>
    );
}

function Grid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    );
}

function InfoItem({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value?: string | null;
    icon?: any;
}) {
    return (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                {Icon && <Icon className="h-4 w-4" />}
                {label}
            </Label>
            <div className="mt-1 text-sm font-medium">{value || '—'}</div>
        </div>
    );
}

function Divider() {
    return <div className="border-t border-border" />;
}
