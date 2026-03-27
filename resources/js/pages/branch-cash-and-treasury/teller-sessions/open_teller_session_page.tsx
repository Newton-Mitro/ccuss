import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';

interface Props extends SharedData {
    tellers: { id: number; name: string }[];
    user_teller: { id: number; name: string } | null;
    branch_days: { id: number; business_date: string }[];
    flash?: { success?: string; error?: string };
}

export default function OpenTellerSession() {
    const { tellers, branch_days, user_teller, flash } = usePage<Props>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        teller_id: user_teller?.id || '',
        branch_day_id: '',
        opening_cash: '',
    });

    console.log({ tellers, branch_days, flash });
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('teller-sessions.store'), {
            onSuccess: () => {
                toast.success('Teller session opened successfully!');
                reset();
            },
            onError: () => {
                toast.error('Failed to open teller session.');
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teller Sessions', href: route('teller-sessions.index') },
        { title: 'Open Session', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open Teller Session" />

            <div className="space-y-4 p-2">
                <HeadingSmall
                    title="Open Teller Session"
                    description="Start a new teller session for your branch"
                />

                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md space-y-2 rounded-md border bg-card p-6 md:p-10"
                >
                    {/* Teller */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Teller
                        </label>
                        <Select
                            value={data.teller_id?.toString() || ''}
                            onChange={(value) => setData('teller_id', value)}
                            options={tellers?.map((teller) => ({
                                value: teller.id.toString(),
                                label: teller.name,
                            }))}
                        ></Select>
                        {errors.teller_id && (
                            <p className="text-sm text-destructive">
                                {errors.teller_id}
                            </p>
                        )}
                    </div>

                    {/* Branch Day */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Branch Day
                        </label>
                        <Select
                            value={data.branch_day_id}
                            onChange={(value) =>
                                setData('branch_day_id', value)
                            }
                            options={branch_days?.map((branch_day) => ({
                                value: branch_day.id.toString(),
                                label: branch_day.business_date,
                            }))}
                        ></Select>
                        {errors.branch_day_id && (
                            <p className="text-sm text-destructive">
                                {errors.branch_day_id}
                            </p>
                        )}
                    </div>

                    {/* Opening Cash */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Opening Cash
                        </label>
                        <Input
                            type="number"
                            value={data.opening_cash}
                            onChange={(e) =>
                                setData('opening_cash', e.target.value)
                            }
                            placeholder="Enter opening cash amount"
                            className="w-full rounded-md border px-3 py-2"
                        />
                        {errors.opening_cash && (
                            <p className="text-sm text-destructive">
                                {errors.opening_cash}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                        Open Session
                    </button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
