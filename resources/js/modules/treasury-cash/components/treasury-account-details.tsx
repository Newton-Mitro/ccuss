import HeadingSmall from '@/components/heading-small';
import { StatusBadge } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { TreasuryAccountDetail } from '@/modules/treasury-cash/types/components/treasury-account-details.interfaces';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
export type { TreasuryAccountDetail } from '@/modules/treasury-cash/types/components/treasury-account-details.interfaces';

export default function TreasuryAccountDetails({
    title,
    description,
    breadcrumbs,
    details,
    status,
    editHref,
    editPermission,
    indexHref,
}: {
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    details: TreasuryAccountDetail[];
    status: string;
    editHref?: string;
    editPermission?: string;
    indexHref: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const permissions = new Set([
        ...(auth.user.permissions ?? []).map((permission) => permission.slug),
        ...auth.user.roles.flatMap((role) =>
            (role.permissions ?? []).map((permission) => permission.slug),
        ),
    ]);

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="space-y-5 text-foreground">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall title={title} description={description} />
                    <div className="flex flex-col gap-2 empty:hidden sm:flex-row sm:items-center">
                        <StatusBadge
                            tone={status === 'ACTIVE' ? 'success' : 'neutral'}
                        >
                            {status}
                        </StatusBadge>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link href={indexHref}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                    {editHref &&
                        (!editPermission ||
                            permissions.has(editPermission)) && (
                            <Button asChild>
                                <Link href={editHref}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                </div>
                <section className="overflow-hidden rounded-md border bg-card">
                    <dl className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                        {details.map(({ label, value, mono }) => (
                            <div
                                key={label}
                                className="min-w-0 border-b p-4 last:border-b-0 sm:odd:border-r"
                            >
                                <dt className="text-xs font-medium text-muted-foreground">
                                    {label}
                                </dt>
                                <dd
                                    className={`mt-1 text-sm font-medium break-words ${mono ? 'font-mono' : ''}`}
                                >
                                    {value === null ||
                                    value === undefined ||
                                    value === ''
                                        ? '—'
                                        : value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
