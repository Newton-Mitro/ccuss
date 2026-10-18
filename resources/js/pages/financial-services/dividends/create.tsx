import { ResourcePageHeader } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { route } from 'ziggy-js';

type Props = {
    fiscalYears: {
        id: number;
        name: string;
        start_date: string;
        end_date: string;
    }[];
};

export default function DividendDeclarationCreate() {
    const { fiscalYears } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        fiscal_year_id: '',
        dividend_rate: '0',
        declaration_date: new Date().toISOString().slice(0, 10),
        note: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Dividends', href: route('dividends.index') },
        { title: 'Create declaration', href: route('dividends.create') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Dividend Declaration" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Create dividend declaration"
                    description="Set the fiscal year, dividend rate, and declaration date."
                    action={
                        <Button asChild variant="outline">
                            <Link href={route('dividends.index')}>
                                <ChevronLeft />
                                Back to dividends
                            </Link>
                        </Button>
                    }
                />
                <section className="max-w-3xl rounded-lg border bg-card p-4">
                    <form
                        className="grid gap-4 sm:grid-cols-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(route('dividends.store'));
                        }}
                    >
                        <div>
                            <Label htmlFor="fiscal_year_id">Fiscal year</Label>
                            <Select
                                id="fiscal_year_id"
                                className="h-9"
                                value={data.fiscal_year_id}
                                onChange={(value) =>
                                    setData('fiscal_year_id', value)
                                }
                                placeholder="Select fiscal year"
                                options={[
                                    {
                                        value: '',
                                        label: 'Select fiscal year',
                                    },
                                    ...fiscalYears.map((year) => ({
                                        value: String(year.id),
                                        label: `${year.name} · ${formatDate(year.start_date)} to ${formatDate(year.end_date)}`,
                                    })),
                                ]}
                            />
                            {errors.fiscal_year_id && (
                                <p className="mt-1 text-sm text-destructive">
                                    {errors.fiscal_year_id}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="dividend_rate">
                                Dividend rate %
                            </Label>
                            <Input
                                id="dividend_rate"
                                type="number"
                                min="0"
                                step="0.0001"
                                value={data.dividend_rate}
                                onChange={(event) =>
                                    setData('dividend_rate', event.target.value)
                                }
                            />
                            {errors.dividend_rate && (
                                <p className="mt-1 text-sm text-destructive">
                                    {errors.dividend_rate}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="declaration_date">
                                Declaration date
                            </Label>
                            <AppDatePicker
                                id="declaration_date"
                                value={data.declaration_date}
                                onChange={(value) =>
                                    setData('declaration_date', value)
                                }
                            />
                            {errors.declaration_date && (
                                <p className="mt-1 text-sm text-destructive">
                                    {errors.declaration_date}
                                </p>
                            )}
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="note">Note</Label>
                            <Input
                                id="note"
                                value={data.note}
                                onChange={(event) =>
                                    setData('note', event.target.value)
                                }
                                placeholder="Optional declaration note"
                            />
                            {errors.note && (
                                <p className="mt-1 text-sm text-destructive">
                                    {errors.note}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2 sm:col-span-2">
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Creating...'
                                    : 'Create declaration'}
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={route('dividends.index')}>
                                    Cancel
                                </Link>
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
