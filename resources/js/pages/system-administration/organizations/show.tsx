import { Head, Link, usePage } from '@inertiajs/react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Organization } from '../../../types/organization';
import InfoItem from './info-item';

function ShowOrganization() {
    const { organization } = usePage<{ organization: Organization }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Organizations', href: '/organizations' },
        { title: organization.name, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Organization - ${organization.name}`} />

            <div className="space-y-6 text-foreground">
                {/* Header */}
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title={organization.name}
                        description="Organization details overview."
                    />

                    <div className="flex gap-2">
                        <Link
                            href={`/organizations/${organization.id}/edit`}
                            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                        >
                            Edit
                        </Link>

                        <Link
                            href="/organizations"
                            className="rounded-md bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/80"
                        >
                            Back
                        </Link>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-primary">
                        Basic Information
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <InfoItem label="Code" value={organization.code} />
                        <InfoItem label="Name" value={organization.name} />
                        <InfoItem
                            label="Short Name"
                            value={organization.short_name}
                        />
                        <InfoItem
                            label="Registration No"
                            value={organization.registration_no}
                        />
                        <InfoItem label="Tax ID" value={organization.tax_id} />
                    </div>
                </div>

                {/* Contact Info */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-primary">
                        Contact Information
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <InfoItem label="Phone" value={organization.phone} />
                        <InfoItem label="Email" value={organization.email} />
                        <InfoItem
                            label="Website"
                            value={organization.website}
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-primary">
                        Address
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <InfoItem
                            label="Address Line 1"
                            value={organization.address_line1}
                        />
                        <InfoItem
                            label="Address Line 2"
                            value={organization.address_line2}
                        />
                        <InfoItem label="City" value={organization.city} />
                        <InfoItem label="State" value={organization.state} />
                        <InfoItem
                            label="Postal Code"
                            value={organization.postal_code}
                        />
                        <InfoItem
                            label="Country"
                            value={organization.country}
                        />
                    </div>
                </div>

                {/* Report Settings */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-primary">
                        Report Configuration
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <InfoItem
                            label="Header Line 1"
                            value={organization.report_header_line1}
                        />
                        <InfoItem
                            label="Header Line 2"
                            value={organization.report_header_line2}
                        />
                        <InfoItem
                            label="Footer"
                            value={organization.report_footer}
                        />
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

export default ShowOrganization;
