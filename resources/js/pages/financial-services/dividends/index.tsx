import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Declaration = {
    id: number;
    declaration_no: string;
    declaration_date: string;
    dividend_rate: string | number;
    total_basis_amount: string | number;
    total_dividend_amount: string | number;
    status: string;
    allocations?: {
        id: number;
        basis_amount: string | number;
        dividend_amount: string | number;
        status: string;
    }[];
};
type Props = {
    declarations: { data: Declaration[] };
    fiscalYears: {
        id: number;
        name: string;
        start_date: string;
        end_date: string;
    }[];
};

export default function DividendsIndex() {
    const { declarations, fiscalYears } = usePage<Props>().props;
    const { data, setData, post, processing } = useForm({
        fiscal_year_id: '',
        dividend_rate: '0',
        declaration_date: new Date().toISOString().slice(0, 10),
        note: '',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Dividends', href: route('dividends.index') },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Share Dividends" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Share Dividends"
                    description="Declare, calculate, review, and approve member dividends."
                />
                <section className="rounded-lg border bg-card p-4">
                    <form
                        className="grid gap-3 sm:grid-cols-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(route('dividends.store'));
                        }}
                    >
                        <div>
                            <Label>Fiscal year</Label>
                            <select
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.fiscal_year_id}
                                onChange={(event) =>
                                    setData(
                                        'fiscal_year_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Select fiscal year</option>
                                {fiscalYears.map((year) => (
                                    <option key={year.id} value={year.id}>
                                        {year.name} · {year.start_date} to{' '}
                                        {year.end_date}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Dividend rate %</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={data.dividend_rate}
                                onChange={(event) =>
                                    setData('dividend_rate', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Declaration date</Label>
                            <Input
                                type="date"
                                value={data.declaration_date}
                                onChange={(event) =>
                                    setData(
                                        'declaration_date',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <Button type="submit" disabled={processing}>
                                Create declaration
                            </Button>
                        </div>
                    </form>
                </section>
                <section className="rounded-lg border bg-card">
                    <div className="divide-y">
                        {declarations.data.map((declaration) => (
                            <div
                                key={declaration.id}
                                className="space-y-2 p-4 text-sm"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium">
                                            {declaration.declaration_no} ·{' '}
                                            {declaration.dividend_rate}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Basis{' '}
                                            {declaration.total_basis_amount} ·
                                            Dividend{' '}
                                            {declaration.total_dividend_amount}{' '}
                                            · Allocations{' '}
                                            {declaration.allocations?.length ??
                                                0}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge
                                            tone={
                                                declaration.status ===
                                                'APPROVED'
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                        >
                                            {declaration.status}
                                        </StatusBadge>
                                        {declaration.status === 'DRAFT' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        router.post(
                                                            route(
                                                                'dividends.calculate',
                                                                declaration.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Calculate
                                                </Button>
                                                {(declaration.allocations
                                                    ?.length ?? 0) > 0 && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            router.post(
                                                                route(
                                                                    'dividends.approve',
                                                                    declaration.id,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                {(declaration.allocations?.length ?? 0) > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        Allocation preview:{' '}
                                        {declaration.allocations
                                            ?.slice(0, 5)
                                            .map(
                                                (allocation) =>
                                                    `${allocation.basis_amount} basis → ${allocation.dividend_amount}`,
                                            )
                                            .join(' · ')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
