import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    ClipboardList,
    FileText,
    Wallet,
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
import { BreadcrumbItem } from '../../types';

interface Props {
    stats: {
        accountGroups: number;
        ledgerAccounts: number;
        openFiscalYears: number;
        openFiscalPeriods: number;
        draftVouchers: number;
        postedVouchers: number;
        activeBudgets: number;
    };
}

const links = [
    ['Chart of accounts', 'account-groups.index', BookOpen],
    ['Vouchers', 'vouchers.index', ClipboardList],
    ['Budgets', 'budgets.index', Wallet],
    ['Financial reports', 'financial-reports.trial-balance', FileText],
];

export default function Dashboard() {
    const { stats } = usePage<Props>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'General Accounting',
            href: route('general-accounting.dashboard'),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="General Accounting Dashboard" />
            <div className="space-y-6 text-foreground">
                <ResourcePageHeader
                    title="General Accounting"
                    description="Monitor the organization ledger and accounting operations."
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['Account groups', stats.accountGroups],
                        ['Ledger accounts', stats.ledgerAccounts],
                        ['Open fiscal years', stats.openFiscalYears],
                        ['Open fiscal periods', stats.openFiscalPeriods],
                        ['Draft vouchers', stats.draftVouchers],
                        ['Posted vouchers', stats.postedVouchers],
                        ['Active budgets', stats.activeBudgets],
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
                        <CardTitle>Accounting workspace</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {links.map(([label, href, Icon]) => {
                            const LinkIcon = Icon as typeof BookOpen;
                            return (
                                <Link
                                    key={label as string}
                                    href={route(href as string)}
                                    className="flex items-center justify-between rounded-md border p-4 hover:bg-muted"
                                >
                                    <span className="flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4 text-primary" />
                                        {label}
                                    </span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            );
                        })}
                    </CardContent>
                </Card>
                <Link
                    href={route('fiscal-years.index')}
                    className="flex w-fit items-center gap-2 text-sm text-primary hover:underline"
                >
                    <Calendar className="h-4 w-4" />
                    Manage fiscal years
                </Link>
            </div>
        </CustomAuthLayout>
    );
}
