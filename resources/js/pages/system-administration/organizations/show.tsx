import { Head, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import BolderLessInfoBox from '../../../components/borderless-info-box';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

function Show() {
    const { organization } = usePage<any>().props;

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'System Administration', href: '' },
        { title: 'Organizations', href: route('organizations.index') },
        { title: 'Organization Details', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Organization Details" />

            <div className="space-y-4 text-foreground">
                <HeadingSmall
                    title="Organization Details"
                    description="Overview of the organization profile."
                />

                {/* 🔹 Header Card */}
                <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
                    {organization.logo_url ? (
                        <img
                            src={organization.logo_url}
                            alt="Logo"
                            className="h-16 w-16 rounded-lg border object-cover"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
                            No Logo
                        </div>
                    )}

                    <div>
                        <h2 className="text-lg font-semibold">
                            {organization.name}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {organization.short_name} • Code:{' '}
                            {organization.code}
                        </p>
                    </div>
                </div>

                {/* 🔹 Basic Details */}
                <div className="rounded-lg border bg-card p-4">
                    <h3 className="text-md mb-2 font-semibold text-muted-foreground">
                        Basic Details
                    </h3>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <BolderLessInfoBox
                            label="Code"
                            value={organization.code}
                        />
                        <BolderLessInfoBox
                            label="Name"
                            value={organization.name}
                        />
                        <BolderLessInfoBox
                            label="Short Name"
                            value={organization.short_name}
                        />
                        <BolderLessInfoBox
                            label="Registration No"
                            value={organization.registration_no}
                        />
                        <BolderLessInfoBox
                            label="Tax ID"
                            value={organization.tax_id}
                        />
                    </div>
                </div>

                {/* 🔹 Contact & Address */}
                <div className="rounded-lg border bg-card p-4">
                    <h3 className="text-md mb-2 font-semibold text-muted-foreground">
                        Contact & Address
                    </h3>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <BolderLessInfoBox
                            label="Phone"
                            value={organization.phone}
                        />
                        <BolderLessInfoBox
                            label="Email"
                            value={organization.email}
                        />
                        <BolderLessInfoBox
                            label="Website"
                            value={organization.website}
                        />
                        <BolderLessInfoBox
                            label="Address"
                            value={`${organization.address_line1} ${organization.address_line2}`}
                        />
                        <BolderLessInfoBox
                            label="City/State"
                            value={`${organization.city}, ${organization.state}`}
                        />
                        <BolderLessInfoBox
                            label="Postal Code"
                            value={organization.postal_code}
                        />
                        <BolderLessInfoBox
                            label="Country"
                            value={organization.country}
                        />
                    </div>
                </div>

                {/* 🔹 Report Config */}
                <div className="rounded-lg border bg-card p-4">
                    <h3 className="text-md mb-2 font-semibold text-muted-foreground">
                        Report Configuration
                    </h3>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <BolderLessInfoBox
                            label="Header Line 1"
                            value={organization.report_header_line1}
                        />
                        <BolderLessInfoBox
                            label="Header Line 2"
                            value={organization.report_header_line2}
                        />
                        <BolderLessInfoBox
                            label="Footer"
                            value={organization.report_footer}
                        />
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

export default Show;
