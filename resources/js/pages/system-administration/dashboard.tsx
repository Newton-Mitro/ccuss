import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    ClipboardList,
    GitBranch,
    ShieldCheck,
    Users,
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
        organizations: number;
        branches: number;
        users: number;
        roles: number;
        auditLogs: number;
        successfulBackups: number;
    };
}

const links: { label: string; href: string; icon: typeof Building2 }[] = [
    { label: 'Organizations', href: 'organizations.index', icon: Building2 },
    { label: 'Branches', href: 'branches.index', icon: GitBranch },
    { label: 'Users', href: 'users.index', icon: Users },
    { label: 'Role permissions', href: 'roles.index', icon: ShieldCheck },
    { label: 'Activity logs', href: 'audits.index', icon: ClipboardList },
];

export default function Dashboard() {
    const { stats } = usePage<Props>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administrative Tasks', href: route('admin-dashboard') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="System Administration Dashboard" />
            <div className="space-y-6 text-foreground">
                <ResourcePageHeader
                    title="System Administration"
                    description="Monitor organizations, access, and system history."
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        ['Organizations', stats.organizations],
                        ['Branches', stats.branches],
                        ['Users', stats.users],
                        ['Roles', stats.roles],
                        ['Audit events', stats.auditLogs],
                        ['Successful backups', stats.successfulBackups],
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
                        <CardTitle>Administration workspace</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {links.map(({ label, href, icon: LinkIcon }) => {
                            return (
                                <Link
                                    key={label}
                                    href={route(href)}
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
            </div>
        </CustomAuthLayout>
    );
}
