import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    CircleDollarSign,
    FileText,
    Percent,
    Sparkles,
} from 'lucide-react';
import { route } from 'ziggy-js';
import type { Props } from '@/modules/financial-services/types/dividends/create.types';


export default function DividendDeclarationCreate() {
    const { fiscalYears } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        fiscal_year_id: '',
        dividend_rate: '0',
        declaration_date: new Date().toISOString().slice(0, 10),
        note: '',
    });
    const selectedFiscalYear = fiscalYears.find(
        (year) => String(year.id) === data.fiscal_year_id,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Dividends', href: route('dividends.index') },
        { title: 'Create declaration', href: route('dividends.create') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Dividend Declaration" />
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="relative isolate overflow-hidden rounded-2xl border bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
                    <div className="absolute -top-20 -right-12 -z-10 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <CircleDollarSign className="size-7" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                            <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                Member dividends
                            </span>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Create dividend declaration
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Set the fiscal year, distribution rate, and
                                declaration date for your members.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="shrink-0">
                            <Link href={route('dividends.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to dividends
                            </Link>
                        </Button>
                    </div>
                </header>

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(route('dividends.store'));
                        }}
                        className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                    >
                        <section className="space-y-6 p-5 sm:p-7">
                            <div className="flex items-start gap-3 border-b pb-5">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <FileText className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-semibold tracking-tight">
                                        Declaration details
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Choose the financial period and set the
                                        proposed dividend rate.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="fiscal_year_id">
                                        Fiscal year
                                    </Label>
                                    <Select
                                        id="fiscal_year_id"
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
                                        <p className="text-sm text-destructive">
                                            {errors.fiscal_year_id}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        This declaration will apply to the
                                        selected financial year.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dividend_rate">
                                        Dividend rate
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="dividend_rate"
                                            type="number"
                                            min="0"
                                            step="0.0001"
                                            value={data.dividend_rate}
                                            onChange={(event) =>
                                                setData(
                                                    'dividend_rate',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-11 pr-12"
                                        />
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-sm font-medium text-muted-foreground">
                                            %
                                        </span>
                                    </div>
                                    {errors.dividend_rate && (
                                        <p className="text-sm text-destructive">
                                            {errors.dividend_rate}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Enter the approved rate for this
                                        declaration.
                                    </p>
                                </div>
                                <div className="space-y-2">
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
                                        <p className="text-sm text-destructive">
                                            {errors.declaration_date}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="note">
                                        Note{' '}
                                        <span className="font-normal text-muted-foreground">
                                            (optional)
                                        </span>
                                    </Label>
                                    <textarea
                                        id="note"
                                        value={data.note}
                                        onChange={(event) =>
                                            setData('note', event.target.value)
                                        }
                                        placeholder="Add context or a reference for this declaration."
                                        rows={3}
                                        className="flex min-h-24 w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                    {errors.note && (
                                        <p className="text-sm text-destructive">
                                            {errors.note}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <footer className="flex flex-col-reverse gap-3 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                            <Button asChild type="button" variant="outline">
                                <Link href={route('dividends.index')}>
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Creating...'
                                    : 'Create declaration'}
                            </Button>
                        </footer>
                    </form>

                    <aside className="space-y-4">
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <div className="border-b p-5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold">
                                        Declaration preview
                                    </h2>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Review the details as you enter them.
                                </p>
                            </div>
                            <div className="space-y-4 p-5">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <CircleDollarSign className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        {selectedFiscalYear?.name ??
                                            'Fiscal year'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedFiscalYear
                                            ? `${formatDate(selectedFiscalYear.start_date)} – ${formatDate(selectedFiscalYear.end_date)}`
                                            : 'Select a fiscal year'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-3">
                                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Percent className="size-4" />
                                        Dividend rate
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {data.dividend_rate || '0'}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-3">
                                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CalendarDays className="size-4" />
                                        Declaration date
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {data.declaration_date
                                            ? formatDate(data.declaration_date)
                                            : 'Not set'}
                                    </span>
                                </div>
                            </div>
                        </section>
                        <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Check className="size-4 text-primary" />
                                Before you create
                            </div>
                            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted-foreground">
                                <li>
                                    Confirm the fiscal year is the intended
                                    distribution period.
                                </li>
                                <li>
                                    Verify the rate has been approved by your
                                    organization.
                                </li>
                                <li>
                                    Creating a declaration starts its review
                                    workflow.
                                </li>
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
