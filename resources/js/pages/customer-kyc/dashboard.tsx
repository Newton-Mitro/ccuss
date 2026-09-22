import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    FileCheck2,
    MapPin,
    Users,
    UsersRound,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { ResourcePageHeader } from '../../components/resource-page-shell';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../components/ui/card';
import CustomAuthLayout from '../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../types';

interface Props extends SharedData {
    stats: {
        customers: number;
        activeCustomers: number;
        pendingCustomers: number;
        pendingAddresses: number;
        pendingFamilyRelations: number;
        pendingIntroducers: number;
        pendingDocuments: number;
    };
}

const links = [
    { label: 'Customers', href: 'customers.index', icon: Users },
    { label: 'Address approvals', href: 'addresses.index', icon: MapPin },
    {
        label: 'Family approvals',
        href: 'family-relations.index',
        icon: UsersRound,
    },
    { label: 'KYC documents', href: 'kyc-documents.index', icon: FileCheck2 },
];

export default function Dashboard() {
    const { stats } = usePage<Props>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & KYC', href: route('customer-kyc.dashboard') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer & KYC Dashboard" />
            <div className="space-y-6 text-foreground">
                <ResourcePageHeader
                    title="Customer & KYC"
                    description="Monitor customer records and verification work."
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['Customers', stats.customers],
                        ['Active customers', stats.activeCustomers],
                        ['Pending customers', stats.pendingCustomers],
                        ['Pending KYC documents', stats.pendingDocuments],
                    ].map(([label, value]) => (
                        <Card key={label as string}>
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground">
                                    {label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">
                                    {value}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Verification queue</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-3">
                        {[
                            [
                                'Addresses',
                                stats.pendingAddresses,
                                'addresses.index',
                            ],
                            [
                                'Family relations',
                                stats.pendingFamilyRelations,
                                'family-relations.index',
                            ],
                            [
                                'Introducers',
                                stats.pendingIntroducers,
                                'introducers.index',
                            ],
                        ].map(([label, value, href]) => (
                            <Link
                                key={label as string}
                                href={route(href as string)}
                                className="flex items-center justify-between rounded-md border p-4 transition-colors hover:bg-muted"
                            >
                                <span>{label}</span>
                                <span className="font-semibold">{value}</span>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {links.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={label}
                            href={route(href)}
                            className="flex items-center justify-between rounded-md border bg-card p-4 hover:bg-muted"
                        >
                            <span className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-primary" />
                                {label}
                            </span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    ))}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
