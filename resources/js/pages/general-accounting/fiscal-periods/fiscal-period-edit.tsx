import type { FiscalPeriodFormPageProps } from '@/types/general-accounting';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCheck,
    Clock3,
    FileClock,
    Loader2,
    LockKeyhole,
    Save,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import type { BreadcrumbItem } from '../../../types';
import { periodStatuses } from './data/period_statuses';

export default function FiscalPeriodForm() {
    const { fiscalPeriod, fiscalYears } =
        usePage<FiscalPeriodFormPageProps>().props;

    useFlashToastHandler();

    const isEditing = Boolean(fiscalPeriod?.id);

    const { data, setData, post, put, processing, errors } = useForm({
        name: fiscalPeriod?.name || '',
        fiscal_year_id: fiscalPeriod?.fiscal_year_id
            ? String(fiscalPeriod.fiscal_year_id)
            : '',
        start_date: fiscalPeriod?.start_date?.split('T')[0] || '',
        end_date: fiscalPeriod?.end_date?.split('T')[0] || '',
        status: fiscalPeriod?.status || 'OPEN',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEditing && fiscalPeriod?.id) {
            put(`/fiscal-periods/${fiscalPeriod.id}`, {
                preserveScroll: true,
            });
        } else {
            post('/fiscal-periods', {
                preserveScroll: true,
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Fiscal Periods', href: route('fiscal-periods.index') },
        { title: isEditing ? 'Edit' : 'Create', href: '' },
    ];

    const selectedStatus = periodStatuses.find(
        (item) => item.value === data.status,
    );

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${isEditing ? 'Edit' : 'Create'} Fiscal Period`} />

            <div className="w-full max-w-4xl space-y-6 pb-10">
                {/* Page header */}
                <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-primary">
                            <FileClock className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <HeadingSmall
                                title={
                                    isEditing
                                        ? 'Edit Fiscal Period'
                                        : 'Create Fiscal Period'
                                }
                                description={
                                    isEditing
                                        ? 'Update the accounting period, dates, and operational status.'
                                        : 'Define an accounting period within a fiscal year.'
                                }
                            />
                        </div>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        {isEditing ? (
                            <LockKeyhole className="size-3.5" />
                        ) : (
                            <Clock3 className="size-3.5" />
                        )}
                        {isEditing ? 'Editing record' : 'New fiscal period'}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Period details */}
                    <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                        <div className="flex items-start gap-3 border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CalendarDays className="size-4.5" />
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-sm font-semibold tracking-tight">
                                    Period Details
                                </h2>
                                <p className="text-xs leading-5 text-muted-foreground">
                                    Configure the period name, parent fiscal
                                    year, and date range.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-6">
                            {/* Period name */}
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="name">
                                    Period Name
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>

                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g. July 2026"
                                    autoComplete="off"
                                    aria-invalid={Boolean(errors.name)}
                                    className="h-10"
                                    required
                                />

                                <InputError message={errors.name} />
                            </div>

                            {/* Fiscal year */}
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="fiscal_year_id">
                                    Parent Fiscal Year
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>

                                <Select
                                    value={data.fiscal_year_id}
                                    onChange={(value) =>
                                        setData('fiscal_year_id', value)
                                    }
                                    options={fiscalYears.map((fy) => ({
                                        value: String(fy.id),
                                        label: fy.code,
                                    }))}
                                    placeholder="Select a fiscal year"
                                    aria-label="Parent fiscal year"
                                />

                                <InputError message={errors.fiscal_year_id} />

                                <p className="text-xs leading-5 text-muted-foreground">
                                    Choose the fiscal year this period belongs
                                    to.
                                </p>
                            </div>

                            {/* Start date */}
                            <div className="space-y-2">
                                <Label htmlFor="start_date">
                                    Start Date
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>

                                <AppDatePicker
                                    value={data.start_date}
                                    onChange={(value) =>
                                        setData('start_date', value)
                                    }
                                />

                                <InputError message={errors.start_date} />

                                <p className="text-xs text-muted-foreground">
                                    First day of the accounting period.
                                </p>
                            </div>

                            {/* End date */}
                            <div className="space-y-2">
                                <Label htmlFor="end_date">
                                    End Date
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>

                                <AppDatePicker
                                    value={data.end_date}
                                    onChange={(value) =>
                                        setData('end_date', value)
                                    }
                                />

                                <InputError message={errors.end_date} />

                                <p className="text-xs text-muted-foreground">
                                    Last day of the accounting period.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Period status */}
                    <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                        <div className="flex items-start gap-3 border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <LockKeyhole className="size-4.5" />
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-sm font-semibold tracking-tight">
                                    Period Status
                                </h2>
                                <p className="text-xs leading-5 text-muted-foreground">
                                    Set the current operational status of this
                                    accounting period.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 sm:p-6">
                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    Operational Status
                                </Label>

                                <Select
                                    value={data.status}
                                    onChange={(value) =>
                                        setData('status', value)
                                    }
                                    options={periodStatuses}
                                    aria-label="Period status"
                                />

                                <InputError message={errors.status} />
                            </div>

                            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3.5">
                                <div className="mt-0.5 text-muted-foreground">
                                    {data.status === 'OPEN' ? (
                                        <Clock3 className="size-4" />
                                    ) : (
                                        <LockKeyhole className="size-4" />
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        {selectedStatus?.label ??
                                            data.status ??
                                            'No status selected'}
                                    </p>

                                    <p className="text-xs leading-5 text-muted-foreground">
                                        {data.status === 'OPEN'
                                            ? 'This period is marked as open. Transaction availability depends on your accounting rules.'
                                            : data.status === 'CLOSED'
                                              ? 'This period is marked as closed. Verify that the required closing procedures are complete.'
                                              : 'The selected status determines how this period is identified in accounting workflows.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-xl border border-border/70 bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <p className="hidden text-xs text-muted-foreground sm:block">
                            <span className="text-destructive">*</span> Required
                            fields
                        </p>

                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
                                onClick={() => {
                                    window.location.href = route(
                                        'fiscal-periods.index',
                                    );
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="min-w-36 gap-2"
                            >
                                {processing ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : isEditing ? (
                                    <Save className="size-4" />
                                ) : (
                                    <CheckCheck className="size-4" />
                                )}

                                {processing
                                    ? 'Saving...'
                                    : isEditing
                                      ? 'Update Period'
                                      : 'Create Period'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
