import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface FiscalYearProps {
    fiscalYear?: {
        id: number;
        code: string;
        start_date: string;
        end_date: string;
        is_active: boolean;
        is_closed: boolean;
    };
    flash: { success?: string; error?: string };
    errors: Record<string, string>;
    backUrl: string;
}

export default function FiscalYearForm({ backUrl }: { backUrl: string }) {
    const { fiscalYear, flash, errors } = usePage()
        .props as unknown as FiscalYearProps;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleBack = () => {
        router.visit(backUrl, { preserveState: true, preserveScroll: true });
    };

    const { data, setData, post, put, processing } = useForm({
        code: fiscalYear?.code || '',
        start_date: fiscalYear?.start_date || '',
        end_date: fiscalYear?.end_date || '',
        is_active: fiscalYear?.is_active || false,
        is_closed: fiscalYear?.is_closed || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fiscalYear?.id) {
            put(`/fiscal-years/${fiscalYear.id}`, { preserveScroll: true });
        } else {
            post('/fiscal-years', { preserveScroll: true });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Fiscal Years', href: '/fiscal-years' },
        { title: fiscalYear?.id ? 'Edit' : 'Create', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    fiscalYear?.id ? 'Edit Fiscal Year' : 'Create Fiscal Year'
                }
            />
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
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-4 max-w-md space-y-6 rounded-md border border-border bg-card p-4 sm:p-6"
            >
                <div>
                    <Label className="text-xs">Fiscal Year Code</Label>
                    <Input
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value)}
                        className="h-8 text-sm"
                    />
                    <InputError message={errors.code} />
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
                </div>

                <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) =>
                                setData('is_active', e.target.checked)
                            }
                            className="h-4 w-4"
                        />
                        Active
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.is_closed}
                            onChange={(e) =>
                                setData('is_closed', e.target.checked)
                            }
                            className="h-4 w-4"
                        />
                        Closed
                    </label>
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
                    {fiscalYear?.id ? 'Update' : 'Create'}
                </Button>
            </form>
        </CustomAuthLayout>
    );
}
