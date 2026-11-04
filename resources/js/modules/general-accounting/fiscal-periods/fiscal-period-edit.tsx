import type { FiscalPeriodFormPageProps } from '@/modules/general-accounting/types/general-accounting';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCheck,
    Clock3,
    FileClock,
    Info,
    Loader2,
    LockKeyhole,
    Save,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { periodStatuses } from '@/modules/general-accounting/fiscal-periods/data/period_statuses';
import type { BreadcrumbItem } from '@/types';

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

            <div className="w-full min-w-0 space-y-3 pb-4">
                {/* Page header */}
                <div className="flex flex-col gap-2 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                        <FileClock className="size-4 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
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

                    <div className="flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
                        {isEditing ? (
                            <LockKeyhole className="size-3.5" />
                        ) : (
                            <Clock3 className="size-3.5" />
                        )}
                        {isEditing ? 'Editing record' : 'New fiscal period'}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid min-w-0 grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
                        {/* Period details */}
                        <section className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card xl:col-span-1">
                            <div className="flex items-center gap-2.5 border-b border-border/60 bg-muted/20 px-3 py-2.5">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <CalendarDays className="size-4" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold tracking-tight">
                                        Period Details
                                    </h2>
                                    <p className="text-[11px] leading-4 text-muted-foreground">
                                        Configure the period name, parent fiscal
                                        year, and date range.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-x-3 gap-y-3 p-3 sm:grid-cols-2">
                                {/* Period name */}
                                <div className="space-y-1">
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
                                        className="mt-1 h-9 w-full"
                                        required
                                    />

                                    <InputError message={errors.name} />

                                    <p className="text-[11px] leading-4 text-muted-foreground">
                                        Use a clear name for reports and
                                        accounting records.
                                    </p>
                                </div>

                                {/* Parent fiscal year */}
                                <div className="space-y-1">
                                    <Label htmlFor="fiscal_year_id">
                                        Parent Fiscal Year
                                        <span className="ml-1 text-destructive">
                                            *
                                        </span>
                                    </Label>

                                    <Select
                                        className="mt-1 h-9 w-full"
                                        value={data.fiscal_year_id}
                                        onChange={(value) =>
                                            setData('fiscal_year_id', value)
                                        }
                                        options={fiscalYears.map((fy) => ({
                                            value: String(fy.id),
                                            label: fy.name,
                                        }))}
                                        placeholder="Select a fiscal year"
                                        aria-label="Parent fiscal year"
                                    />

                                    <InputError
                                        message={errors.fiscal_year_id}
                                    />

                                    <p className="text-[11px] leading-4 text-muted-foreground">
                                        Select the fiscal year this accounting
                                        period belongs to.
                                    </p>
                                </div>

                                {/* Date range */}
                                <div className="grid min-w-0 grid-cols-1 gap-3 sm:col-span-2 md:grid-cols-2">
                                    <div className="min-w-0 space-y-1">
                                        <Label htmlFor="start_date">
                                            Start Date
                                            <span className="ml-1 text-destructive">
                                                *
                                            </span>
                                        </Label>

                                        <AppDatePicker
                                            id="start_date"
                                            value={data.start_date}
                                            className="mt-1 h-9"
                                            onChange={(value) =>
                                                setData('start_date', value)
                                            }
                                        />

                                        <InputError
                                            message={errors.start_date}
                                        />

                                        <p className="text-[11px] leading-4 text-muted-foreground">
                                            First day of the accounting period.
                                        </p>
                                    </div>

                                    <div className="min-w-0 space-y-1">
                                        <Label htmlFor="end_date">
                                            End Date
                                            <span className="ml-1 text-destructive">
                                                *
                                            </span>
                                        </Label>

                                        <AppDatePicker
                                            id="end_date"
                                            value={data.end_date}
                                            className="mt-1 h-9"
                                            onChange={(value) =>
                                                setData('end_date', value)
                                            }
                                        />

                                        <InputError message={errors.end_date} />

                                        <p className="text-[11px] leading-4 text-muted-foreground">
                                            Last day of the accounting period.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 sm:col-span-2">
                                    <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                    <p className="text-[11px] leading-4 text-muted-foreground">
                                        Ensure the period dates fall within the
                                        selected fiscal year and follow your
                                        organization’s accounting calendar.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Period status */}
                        <section className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card">
                            <div className="flex items-center gap-2.5 border-b border-border/60 bg-muted/20 px-3 py-2.5">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <LockKeyhole className="size-4" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold tracking-tight">
                                        Period Status
                                    </h2>
                                    <p className="text-[11px] leading-4 text-muted-foreground">
                                        Manage the operational status of this
                                        accounting period.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 p-3">
                                <div className="space-y-1">
                                    <Label htmlFor="status">
                                        Operational Status
                                    </Label>

                                    <Select
                                        className="mt-1 h-9 w-full"
                                        value={data.status}
                                        onChange={(value) =>
                                            setData('status', value)
                                        }
                                        options={periodStatuses}
                                        aria-label="Period status"
                                    />

                                    <InputError message={errors.status} />
                                </div>

                                {/* Dynamic status information */}
                                <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5">
                                    <div className="flex items-start gap-2">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground">
                                            {data.status === 'OPEN' ? (
                                                <Clock3 className="size-4" />
                                            ) : (
                                                <LockKeyhole className="size-4" />
                                            )}
                                        </div>

                                        <div className="min-w-0 space-y-1">
                                            <p className="text-xs font-semibold">
                                                {selectedStatus?.label ??
                                                    data.status ??
                                                    'No status selected'}
                                            </p>

                                            <p className="text-[11px] leading-4 text-muted-foreground">
                                                {data.status === 'OPEN'
                                                    ? 'This period is marked as open. Transaction availability depends on your accounting rules.'
                                                    : data.status === 'CLOSED'
                                                      ? 'This period is marked as closed. Verify that the required closing procedures are complete.'
                                                      : 'The selected status determines how this period is identified in accounting workflows.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-border/60 pt-3">
                                    <div className="flex items-center justify-between gap-3 text-xs">
                                        <span className="text-muted-foreground">
                                            Record type
                                        </span>
                                        <span className="font-medium">
                                            Fiscal Period
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 text-xs">
                                        <span className="text-muted-foreground">
                                            Parent fiscal year
                                        </span>
                                        <span className="max-w-[60%] truncate text-right font-medium">
                                            {fiscalYears.find(
                                                (fy) =>
                                                    String(fy.id) ===
                                                    data.fiscal_year_id,
                                            )?.name ?? 'Not selected'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 text-xs">
                                        <span className="text-muted-foreground">
                                            Form action
                                        </span>
                                        <span className="font-medium">
                                            {isEditing ? 'Update' : 'Create'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sticky action bar */}
                    <div className="sticky bottom-2 z-10 flex flex-col gap-2 rounded-lg border border-border/70 bg-background/95 p-2.5 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:flex-row sm:items-center sm:justify-between sm:px-3">
                        <p className="hidden text-xs text-muted-foreground sm:block">
                            <span className="text-destructive">*</span> Required
                            fields
                        </p>

                        <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
                                className="w-full sm:w-auto"
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
                                className="h-9 w-full gap-2 sm:w-auto sm:min-w-40"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : isEditing ? (
                                    <>
                                        <Save className="size-4" />
                                        Update Period
                                    </>
                                ) : (
                                    <>
                                        <CheckCheck className="size-4" />
                                        Create Period
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
