import type { FiscalYearFormPageProps } from '@/types/general-accounting';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
    ToggleGroup,
    ToggleGroupItem,
} from '../../../components/ui/toggle-group';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

export default function FiscalYearForm() {
    const { fiscalYear } = usePage<FiscalYearFormPageProps>().props;

    useFlashToastHandler();

    const handleBack = () => window.history.back();

    const { data, setData, post, put, processing, errors } = useForm({
        name: fiscalYear?.name || '',
        start_date: fiscalYear?.start_date?.split('T')[0] || '',
        end_date: fiscalYear?.end_date?.split('T')[0] || '',
        status: fiscalYear?.status ?? 'OPEN',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (fiscalYear?.id) {
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
        { title: fiscalYear?.id ? 'Edit' : 'Create', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    fiscalYear?.id ? 'Edit Fiscal Year' : 'Create Fiscal Year'
                }
            />

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={
                        fiscalYear?.id
                            ? 'Edit Fiscal Year'
                            : 'Create Fiscal Year'
                    }
                    description="Manage fiscal year details."
                />

                <button
                    onClick={handleBack}
                    className="flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-sm text-card-foreground transition-all hover:bg-card/50"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back</span>
                </button>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="mt-4 space-y-6 rounded-md border bg-card p-4 sm:p-6"
            >
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                        <Label className="text-xs">Fiscal Year Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.name} />
                    </div>

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

                    {/* 🔥 Status (ONLY ONE CONTROL NOW) */}
                    <div>
                        <Label className="text-xs">Closed Status</Label>

                        <ToggleGroup
                            type="single"
                            value={data.status}
                            onValueChange={(val) =>
                                setData('status', val as 'OPEN' | 'CLOSED')
                            }
                            size="sm"
                            variant="outline"
                        >
                            <ToggleGroupItem
                                value="OPEN"
                                className="border-2 border-border"
                            >
                                Open
                            </ToggleGroupItem>

                            <ToggleGroupItem
                                value="CLOSED"
                                className="border-2 border-border"
                            >
                                Closed
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
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
                    {fiscalYear?.id ? 'Update' : 'Create'}
                </Button>
            </form>
        </CustomAuthLayout>
    );
}
