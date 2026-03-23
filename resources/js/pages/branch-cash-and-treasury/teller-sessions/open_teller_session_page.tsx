import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface Props {
    tellers: { id: number; name: string }[];
    user_teller: { id: number; name: string } | null;
    branch_days: { id: number; business_date: string }[];
    flash?: { success?: string; error?: string };
}

export default function OpenTellerSession() {
    const { tellers, branch_days, user_teller, flash } = usePage()
        .props as unknown as Props;

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
                    className="w-full max-w-md space-y-4 rounded-md border bg-card p-6"
                >
                    {/* Teller */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Teller
                        </label>
                        <select
                            value={data.teller_id}
                            onChange={(e) =>
                                setData('teller_id', e.target.value)
                            }
                            className="w-full rounded-md border px-3 py-2"
                        >
                            <option value="">Select Teller</option>
                            {tellers?.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        {errors.teller_id && (
                            <p className="text-sm text-red-600">
                                {errors.teller_id}
                            </p>
                        )}
                    </div>

                    {/* Branch Day */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Branch Day
                        </label>
                        <select
                            value={data.branch_day_id}
                            onChange={(e) =>
                                setData('branch_day_id', e.target.value)
                            }
                            className="w-full rounded-md border px-3 py-2"
                        >
                            <option value="">Select Branch Day</option>
                            {branch_days?.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.business_date}
                                </option>
                            ))}
                        </select>
                        {errors.branch_day_id && (
                            <p className="text-sm text-red-600">
                                {errors.branch_day_id}
                            </p>
                        )}
                    </div>

                    {/* Opening Cash */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Opening Cash
                        </label>
                        <input
                            type="number"
                            value={data.opening_cash}
                            onChange={(e) =>
                                setData('opening_cash', e.target.value)
                            }
                            placeholder="Enter opening cash amount"
                            className="w-full rounded-md border px-3 py-2"
                        />
                        {errors.opening_cash && (
                            <p className="text-sm text-red-600">
                                {errors.opening_cash}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                        Open Session
                    </button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
