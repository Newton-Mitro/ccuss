import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    CalendarDays,
    UserRound,
    Vault,
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
        vaults: number;
        tellers: number;
        openBranchDays: number;
        openTellerSessions: number;
    };
}

const links = [
    ['Branch days', 'branch-days.index', CalendarDays],
    ['Vaults', 'vaults.index', Vault],
    ['Tellers', 'tellers.index', UserRound],
    ['Teller sessions', 'teller-sessions.index', Banknote],
] as const;

export default function Dashboard() {
    const { stats } = usePage<Props>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: route('treasury-cash.dashboard') },
        { title: 'Dashboard', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Treasury & Cash Dashboard" />
            <div className="space-y-6 text-foreground">
                <ResourcePageHeader
                    title="Treasury & Cash"
                    description="Monitor branch days, cash locations, and teller activity."
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['Vaults', stats.vaults],
                        ['Tellers', stats.tellers],
                        ['Open branch days', stats.openBranchDays],
                        ['Open teller sessions', stats.openTellerSessions],
                    ].map(([label, value]) => (
                        <Card key={label}>
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
                        <CardTitle>Treasury workspace</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {links.map(([label, href, Icon]) => (
                            <Link
                                key={label}
                                href={route(href)}
                                className="flex items-center justify-between rounded-md border p-4 hover:bg-muted"
                            >
                                <span className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-primary" />
                                    {label}
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </CustomAuthLayout>
    );
}
