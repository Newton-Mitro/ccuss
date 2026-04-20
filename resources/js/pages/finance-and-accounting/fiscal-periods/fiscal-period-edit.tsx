import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, ListFilter, Loader2 } from 'lucide-react';
import React from 'react';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import {
    ToggleGroup,
    ToggleGroupItem,
} from '../../../components/ui/toggle-group';
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
        is_open: boolean;
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
        start_date: fiscalPeriod?.start_date || '',
        end_date: fiscalPeriod?.end_date || '',
        is_open: fiscalPeriod?.is_open ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fiscalPeriod?.id) {
            put(`/fiscal-periods/${fiscalPeriod.id}`, { preserveScroll: true });
        } else {
            post('/fiscal-periods', { preserveScroll: true });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Fiscal Periods', href: '/fiscal-periods' },
        { title: fiscalPeriod?.id ? 'Edit' : 'Create', href: '' },
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
                    <div className="">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    </div>

                    <Link
                        href="/fiscal-periods"
                        className="flex items-center gap-1 rounded bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/90"
                    >
                        <ListFilter className="h-4 w-4" />
                        <span className="hidden sm:inline">Fiscal Periods</span>
                    </Link>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-4 max-w-md space-y-6 rounded-md border bg-card p-4 sm:p-6"
            >
                <div>
                    <Label className="text-xs">Period Name</Label>
                    <Input
                        value={data.period_name}
                        onChange={(e) => setData('period_name', e.target.value)}
                        className="h-8 text-sm"
                    />
                    <InputError message={errors.period_name} />
                </div>

                <div>
                    <Label className="text-xs">Fiscal Year</Label>
                    <Select
                        value={data.fiscal_year_id?.toString()}
                        onChange={(value) =>
                            setData('fiscal_year_id', Number(value))
                        }
                        options={fiscalYears.map((fiscalYear) => ({
                            value: fiscalYear.id.toString(),
                            label: `${fiscalYear.code}`,
                        }))}
                    />

                    <InputError message={errors.fiscal_year_id} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-xs">Start Date</Label>
                        <Input
                            type="date"
                            value={data.start_date}
                            onChange={(e) =>
                                setData('start_date', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.start_date} />
                    </div>
                    <div>
                        <Label className="text-xs">End Date</Label>
                        <Input
                            type="date"
                            value={data.end_date}
                            onChange={(e) =>
                                setData('end_date', e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.end_date} />
                    </div>

                    <div className="">
                        <Label className="text-xs">Closed</Label>
                        <ToggleGroup
                            type="single"
                            value={data.is_open ? 'true' : 'false'}
                            onValueChange={(val) =>
                                setData('is_open', val === 'true')
                            }
                            size="sm"
                            variant="outline"
                        >
                            <ToggleGroupItem value="true">
                                False
                            </ToggleGroupItem>
                            <ToggleGroupItem value="false">
                                True
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>

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
