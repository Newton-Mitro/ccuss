import type { FiscalYearFormPageProps } from '@/modules/general-accounting/types/general-accounting';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCheck,
    Clock3,
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
import {
    ToggleGroup,
    ToggleGroupItem,
} from '@/components/ui/toggle-group';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';

export default function FiscalYearForm() {
    const { fiscalYear } = usePage<FiscalYearFormPageProps>().props;

    useFlashToastHandler();

    const isEditing = Boolean(fiscalYear?.id);

    const { data, setData, post, put, processing, errors } = useForm({
        name: fiscalYear?.name || '',
        start_date: fiscalYear?.start_date?.split('T')[0] || '',
        end_date: fiscalYear?.end_date?.split('T')[0] || '',
        status: fiscalYear?.status ?? 'OPEN',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEditing && fiscalYear?.id) {
            put(`/fiscal-years/${fiscalYear.id}`, {
                preserveScroll: true,
            });
        } else {
            post('/fiscal-years', {
                preserveScroll: true,
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Fiscal Years', href: route('fiscal-years.index') },
        { title: isEditing ? 'Edit' : 'Create', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${isEditing ? 'Edit' : 'Create'} Fiscal Year`} />

            <div className="w-full max-w-4xl space-y-6 pb-10">
                {/* Page header */}
                <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-primary">
                            <CalendarDays className="size-5" />
                        </div>

                        <div className="min-w-0 space-y-1">
                            <HeadingSmall
                                title={
                                    isEditing
                                        ? 'Edit Fiscal Year'
                                        : 'Create Fiscal Year'
                                }
                                description={
                                    isEditing
                                        ? 'Update the accounting period and its operational status.'
                                        : 'Define a fiscal period for your organization’s accounting activities.'
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
                    {/* Fiscal year details */}
                    <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                        <div className="flex items-start gap-3 border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CalendarDays className="size-4.5" />
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-sm font-semibold tracking-tight">
                                    Fiscal Year Details
                                </h2>
                                <p className="text-xs leading-5 text-muted-foreground">
                                    Set the name and date range for this
                                    accounting period.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-6">
                            {/* Name */}
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="name">
                                    Fiscal Year Name
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
                                    placeholder="e.g. Fiscal Year 2026–2027"
                                    autoComplete="off"
                                    aria-invalid={Boolean(errors.name)}
                                    className="h-10"
                                    required
                                />

                                <InputError message={errors.name} />
                                <p className="text-xs text-muted-foreground">
                                    Use a clear, recognizable name for reports
                                    and accounting records.
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
                                    First day of the fiscal period.
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
                                    Last day of the fiscal period.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Status */}
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
                                    Choose whether this fiscal year is open for
                                    accounting operations.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 sm:p-6">
                            <div className="space-y-2">
                                <Label>Operational Status</Label>

                                <ToggleGroup
                                    type="single"
                                    value={data.status}
                                    onValueChange={(value) => {
                                        if (
                                            value === 'OPEN' ||
                                            value === 'CLOSED'
                                        ) {
                                            setData('status', value);
                                        }
                                    }}
                                    size="lg"
                                    variant="outline"
                                    className="grid w-full max-w-md grid-cols-2"
                                    aria-label="Fiscal year status"
                                >
                                    <ToggleGroupItem
                                        value="OPEN"
                                        className="h-11 gap-2 data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                                    >
                                        <Clock3 className="size-4" />
                                        Open
                                    </ToggleGroupItem>

                                    <ToggleGroupItem
                                        value="CLOSED"
                                        className="h-11 gap-2 data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                                    >
                                        <LockKeyhole className="size-4" />
                                        Closed
                                    </ToggleGroupItem>
                                </ToggleGroup>
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
                                        {data.status === 'OPEN'
                                            ? 'Fiscal year is open'
                                            : 'Fiscal year is closed'}
                                    </p>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        {data.status === 'OPEN'
                                            ? 'This period is marked as open. Actual transaction permissions depend on your accounting rules.'
                                            : 'This period is marked as closed. Confirm that closing procedures have been completed before saving.'}
                                    </p>
                                </div>
                            </div>

                            <InputError message={errors.status} />
                        </div>
                    </section>

                    {/* Form actions */}
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
                                onClick={() =>
                                    window.history.length > 1
                                        ? window.history.back()
                                        : (window.location.href =
                                              route('fiscal-years.index'))
                                }
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
                                      ? 'Update Fiscal Year'
                                      : 'Create Fiscal Year'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
