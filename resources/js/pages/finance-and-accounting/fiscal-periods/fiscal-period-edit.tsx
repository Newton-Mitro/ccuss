import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, ListFilter, Loader2 } from 'lucide-react';
import React from 'react';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';

interface FiscalPeriodProps extends SharedData {
    fiscalPeriod?: {
        id: number;
        period_name: string;
        fiscal_year_id: number;
        start_date: string;
        end_date: string;
        status: 'open' | 'closed' | 'locked'; // ✅ FIXED
    };
    fiscalYears: { id: number; code: string }[];
}

export default function FiscalPeriodForm() {
    const { fiscalPeriod, fiscalYears } = usePage<FiscalPeriodProps>().props;

    useFlashToastHandler();

    const handleBack = () => window.history.back();

    const { data, setData, post, put, processing, errors } = useForm({
        period_name: fiscalPeriod?.period_name || '',
        fiscal_year_id: fiscalPeriod?.fiscal_year_id || undefined,
        start_date: fiscalPeriod?.start_date?.split('T')[0] || '',
        end_date: fiscalPeriod?.end_date?.split('T')[0] || '',
        status: fiscalPeriod?.status || 'open', // ✅ FIXED
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (fiscalPeriod?.id) {
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
        { title: 'Fiscal Periods', href: '/fiscal-periods' },
        { title: fiscalPeriod?.id ? 'Edit' : 'Create', href: '' },
    ];

    const statusOptions = [
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' },
        { value: 'locked', label: 'Locked' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    fiscalPeriod?.id
                        ? 'Edit Fiscal Period'
                        : 'Create Fiscal Period'
                }
            />

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={
                        fiscalPeriod?.id
                            ? 'Edit Fiscal Period'
                            : 'Create Fiscal Period'
                    }
                    description="Manage fiscal period details."
                />

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <Link
                        href="/fiscal-periods"
                        className="flex items-center gap-1 rounded bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/90"
                    >
                        <ListFilter className="h-4 w-4" />
                        <span className="hidden sm:inline">Fiscal Periods</span>
                    </Link>
                </div>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="mt-4 max-w-md space-y-6 rounded-md border bg-card p-4 sm:p-6"
            >
                {/* Period Name */}
                <div>
                    <Label className="text-xs">Period Name</Label>
                    <Input
                        value={data.period_name}
                        onChange={(e) => setData('period_name', e.target.value)}
                        className="h-8 text-sm"
                    />
                    <InputError message={errors.period_name} />
                </div>

                {/* Fiscal Year */}
                <div>
                    <Label className="text-xs">Fiscal Year</Label>
                    <Select
                        value={data.fiscal_year_id?.toString()}
                        onChange={(value) =>
                            setData('fiscal_year_id', Number(value))
                        }
                        options={fiscalYears.map((fy) => ({
                            value: fy.id.toString(),
                            label: fy.code,
                        }))}
                    />
                    <InputError message={errors.fiscal_year_id} />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-xs">Start Date</Label>
                        <AppDatePicker
                            value={data.start_date}
                            onChange={(value) => setData('start_date', value)}
                        />
                        <InputError message={errors.start_date} />
                    </div>

                    <div>
                        <Label className="text-xs">End Date</Label>
                        <AppDatePicker
                            value={data.end_date}
                            onChange={(value) => setData('end_date', value)}
                        />
                        <InputError message={errors.end_date} />
                    </div>
                </div>

                {/* 🔥 Status (NEW) */}
                <div>
                    <Label className="text-xs">Status</Label>
                    <Select
                        value={data.status}
                        onChange={(value) =>
                            setData(
                                'status',
                                value as 'open' | 'closed' | 'locked',
                            )
                        }
                        options={statusOptions}
                    />
                    <InputError message={errors.status} />
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2"
                >
                    {processing ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <CheckCheck />
                    )}
                    {fiscalPeriod?.id ? 'Update' : 'Create'}
                </Button>
            </form>
        </CustomAuthLayout>
    );
}
