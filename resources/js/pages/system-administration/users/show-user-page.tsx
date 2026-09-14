import { Head, usePage } from '@inertiajs/react';
import { CheckCircle2, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { route } from 'ziggy-js';
import BolderLessInfoBox from '../../../components/borderless-info-box';
import HeadingSmall from '../../../components/heading-small';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '../../../components/ui/avatar';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import { useInitials } from '../../../hooks/use-initials';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

function ShowUser() {
    const { user } = usePage<any>().props;
    useFlashToastHandler();

    const getInitials = useInitials();

    const permissionsByModule = (user.permissions || []).reduce(
        (groups, permission) => {
            const module = permission.module || 'General';
            groups[module] ??= [];
            groups[module].push(permission);
            return groups;
        },
        {} as Record<string, any[]>,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'System Administration', href: '' },
        { title: 'Users', href: route('users.index') },
        { title: 'User Details', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="User Details" />

            <div className="space-y-3 text-foreground">
                <HeadingSmall
                    title="User Details"
                    description="Profile, access, and branch assignment."
                />

                {/* 🔹 Header Card */}
                <div className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-14 w-14 shrink-0 overflow-hidden rounded-full border">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback className="rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                {getInitials(user?.name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="truncate text-base font-semibold">
                                    {user.name}
                                </h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {user.status || 'Active'}
                                </span>
                            </div>
                            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                <Mail className="h-3 w-3 shrink-0" />
                                {user.email}
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {user.roles.length > 0
                                    ? user.roles.map((role) => (
                                          <span
                                              key={role.id}
                                              className="rounded-full bg-warning/20 px-2 py-0.5 text-[11px] font-medium text-foreground"
                                          >
                                              {role.name}
                                          </span>
                                      ))
                                    : '-'}
                            </div>
                        </div>
                    </div>

                    <div className="hidden shrink-0 items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-2 text-xs text-muted-foreground sm:flex">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span>{user.permissions?.length || 0} permissions</span>
                    </div>
                </div>

                {/* 🔹 Basic Info */}
                <div className="rounded-lg border bg-card p-3">
                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                        <UserRound className="h-4 w-4 text-primary" />
                        Basic Info
                    </h3>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        <BolderLessInfoBox label="Name" value={user.name} />
                        <BolderLessInfoBox label="Email" value={user.email} />
                        <BolderLessInfoBox
                            label="Email Verified"
                            value={user.email_verified_at ? 'Yes' : 'No'}
                        />

                        <BolderLessInfoBox
                            label="Branch"
                            value={user.branch?.name || '-'}
                        />
                    </div>
                </div>

                {/* 🔹 Permissions */}
                <div className="rounded-lg border bg-card p-3">
                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Permissions
                    </h3>
                    <div className="space-y-2">
                        {Object.keys(permissionsByModule).length > 0 ? (
                            (
                                Object.entries(permissionsByModule) as [
                                    string,
                                    any[],
                                ][]
                            ).map(([module, permissions]) => (
                                <div
                                    key={module}
                                    className="flex flex-col gap-1.5 rounded-md bg-muted/35 px-2.5 py-2 sm:flex-row sm:items-start"
                                >
                                    <span className="w-36 shrink-0 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                        {module.replaceAll('_', ' ')}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {permissions.map((permission) => (
                                            <span
                                                key={permission.id}
                                                className="rounded border border-border/70 bg-background px-2 py-0.5 text-[11px] font-medium text-foreground"
                                            >
                                                {permission.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                No permissions assigned.
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

export default ShowUser;
