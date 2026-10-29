import DataTablePagination from '@/components/data-table-pagination';
import HeadingSmall from '@/components/heading-small';
import {
    ResourceTableCard,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { Props } from '@/modules/financial-services/types/default-rules/index.types';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

export default function DefaultRulesIndex() {
    const { rules, auth } = usePage<Props>().props;
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const canUpdate = (auth.user.permissions ?? []).some(
        (permission) => permission.slug === 'financial.products.update',
    );
    const normalizedSearch = search.trim().toLowerCase();
    const filteredRules = rules.filter((rule) =>
        [
            rule.name,
            rule.account_type,
            rule.fine_calculation,
            rule.fine_amount,
            rule.fine_rate,
            rule.maximum_fine,
            rule.grace_days,
            rule.effective_from,
            rule.effective_to,
            rule.is_active ? 'active' : 'inactive',
            rule.product?.code,
            rule.product?.name,
        ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch),
    );
    const totalPages = Math.max(1, Math.ceil(filteredRules.length / perPage));
    const currentPage = Math.min(page, totalPages);
    const visibleRules = filteredRules.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage,
    );
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
        { title: 'Default Rules', href: route('account-default-rules.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Default Rules" />
            <div className="space-y-5">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Default rules"
                        description="Manage effective account and product fine rules."
                    />
                    <div className="flex flex-col gap-2 empty:hidden sm:flex-row sm:items-center">
                        {canUpdate && (
                            <Button asChild>
                                <Link
                                    href={route('account-default-rules.create')}
                                >
                                    <Plus className="mr-2 size-4" />
                                    Create rule
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-sm font-semibold">
                            Rules directory
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Search and manage account-wide or product-specific
                            rules.
                        </p>
                    </div>
                    <Input
                        className="w-full bg-background sm:max-w-sm"
                        type="search"
                        placeholder="Search rules..."
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <ResourceTableCard className="max-h-[calc(100vh-360px)] min-h-60">
                    <div className="overflow-auto">
                        <table className="w-full min-w-[900px] border-collapse text-sm">
                            <thead className="sticky top-0 z-10 bg-muted text-muted-foreground">
                                <tr>
                                    {[
                                        'Name',
                                        'Product scope',
                                        'Fine',
                                        'Grace days',
                                        'Effective dates',
                                        'Status',
                                        'Actions',
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="border-b px-4 py-3 text-left font-medium"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {visibleRules.map((rule) => (
                                    <tr
                                        key={rule.id}
                                        className="border-b last:border-0 even:bg-muted/30 hover:bg-accent/20"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-foreground">
                                                {rule.name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {rule.account_type.replaceAll(
                                                    '_',
                                                    ' ',
                                                )}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {rule.product
                                                ? `${rule.product.code} · ${rule.product.name}`
                                                : 'All products'}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            {rule.fine_calculation ===
                                            'PERCENTAGE'
                                                ? `${rule.fine_rate}%`
                                                : rule.fine_amount}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            {rule.grace_days} days
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {rule.effective_from?.slice(
                                                0,
                                                10,
                                            ) ?? '—'}
                                            {' – '}
                                            {rule.effective_to?.slice(0, 10) ??
                                                'No end date'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                tone={
                                                    rule.is_active
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {rule.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </StatusBadge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {canUpdate && (
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'account-default-rules.edit',
                                                                rule.id,
                                                            )}
                                                        >
                                                            <Pencil className="mr-1.5 size-3.5" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.delete(
                                                            route(
                                                                'account-default-rules.destroy',
                                                                rule.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="mr-1.5 size-3.5" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {visibleRules.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-12 text-center text-sm text-muted-foreground"
                                        >
                                            {rules.length === 0
                                                ? 'No default rules found.'
                                                : 'No rules match your search.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </ResourceTableCard>
                {filteredRules.length > 0 && (
                    <DataTablePagination
                        perPage={perPage}
                        onPerPageChange={(value) => {
                            setPerPage(value);
                            setPage(1);
                        }}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredRules.length}
                        onPageChange={setPage}
                        onNext={() =>
                            setPage((current) =>
                                Math.min(current + 1, totalPages),
                            )
                        }
                        onPrevious={() =>
                            setPage((current) => Math.max(current - 1, 1))
                        }
                    />
                )}
            </div>
        </CustomAuthLayout>
    );
}
