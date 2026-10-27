import {
    DashboardMetricGrid,
    DashboardQuickLinks,
} from '@/components/dashboard-summary';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    FileCheck2,
    FileClock,
    MapPin,
    UserCheck,
    Users,
    UsersRound,
} from 'lucide-react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import { StatusBadge } from '@/components/resource-page-shell';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import CustomerDashboardCharts from '@/modules/customers-kyc/components/customer-dashboard-charts';
import type { CustomerKycDashboardProps } from '@/modules/customers-kyc/types/dashboard.interfaces';
import { BreadcrumbItem } from '@/types';

const links = [
    {
        label: 'Customers',
        href: 'customers.index',
        icon: Users,
    },
    {
        label: 'Address approvals',
        href: 'addresses.index',
        icon: MapPin,
    },
    {
        label: 'Family approvals',
        href: 'family-relations.index',
        icon: UsersRound,
    },
    {
        label: 'KYC documents',
        href: 'kyc-documents.index',
        icon: FileCheck2,
    },
] as const;

export default function Dashboard() {
    const { stats, charts } = usePage<CustomerKycDashboardProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Customer & KYC',
            href: route('customer-kyc.dashboard'),
        },
        {
            title: 'Dashboard',
            href: '',
        },
    ];

    const totalPending =
        stats.pendingCustomers +
        stats.pendingAddresses +
        stats.pendingFamilyRelations +
        stats.pendingIntroducers +
        stats.pendingDocuments;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer & KYC" />

            <div className="space-y-5 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Customer & KYC"
                        description="Customer onboarding, records, and verification activities."
                    />
                    <div className="flex flex-col gap-2 empty:hidden sm:flex-row sm:items-center">
                        <StatusBadge
                            tone={totalPending > 0 ? 'warning' : 'success'}
                        >
                            {totalPending > 0
                                ? `${totalPending.toLocaleString()} pending`
                                : 'All clear'}
                        </StatusBadge>
                    </div>
                </div>

                {/* Summary metrics */}
                <DashboardMetricGrid
                    metrics={[
                        {
                            label: 'Total customers',
                            value: stats.customers,
                            detail: 'Registered customers',
                            icon: Users,
                        },
                        {
                            label: 'Active customers',
                            value: stats.activeCustomers,
                            detail: 'Currently active',
                            icon: UserCheck,
                        },
                        {
                            label: 'Pending customers',
                            value: stats.pendingCustomers,
                            detail: 'Awaiting approval',
                            icon: FileClock,
                        },
                        {
                            label: 'Pending KYC',
                            value: stats.pendingDocuments,
                            detail: 'Documents awaiting review',
                            icon: FileCheck2,
                        },
                    ].map((metric) => ({
                        ...metric,
                        value: metric.value.toLocaleString(),
                    }))}
                />

                {/* Quick navigation */}
                <DashboardQuickLinks
                    label="Customer and KYC"
                    links={links.map((link) => ({
                        ...link,
                        href: route(link.href),
                    }))}
                />

                {/* Metrics chart */}
                <CustomerDashboardCharts charts={charts} />

                {/* Verification queue */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Verification queue
                            </h2>

                            <p className="text-xs text-muted-foreground">
                                Customer information awaiting review
                            </p>
                        </div>

                        <StatusBadge
                            tone={totalPending > 0 ? 'warning' : 'success'}
                        >
                            {totalPending.toLocaleString()} pending
                        </StatusBadge>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                label: 'Addresses',
                                value: stats.pendingAddresses,
                                detail: 'Pending address verification',
                                href: 'addresses.index',
                                icon: MapPin,
                            },
                            {
                                label: 'Family relations',
                                value: stats.pendingFamilyRelations,
                                detail: 'Pending relationship review',
                                href: 'family-relations.index',
                                icon: UsersRound,
                            },
                            {
                                label: 'Introducers',
                                value: stats.pendingIntroducers,
                                detail: 'Pending introducer review',
                                href: 'introducers.index',
                                icon: UserCheck,
                            },
                            {
                                label: 'KYC documents',
                                value: stats.pendingDocuments,
                                detail: 'Pending document verification',
                                href: 'kyc-documents.index',
                                icon: FileCheck2,
                            },
                        ].map(({ label, value, detail, href, icon: Icon }) => (
                            <Link
                                key={href}
                                href={route(href)}
                                className="group flex min-w-0 items-center justify-between gap-3 border-b py-3 transition hover:bg-muted/40 sm:px-2"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-medium">
                                            {label}
                                        </div>

                                        <div className="truncate text-[10px] text-muted-foreground">
                                            {detail}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    <span
                                        className={`text-sm font-semibold tabular-nums ${
                                            value > 0
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {value.toLocaleString()}
                                    </span>

                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
