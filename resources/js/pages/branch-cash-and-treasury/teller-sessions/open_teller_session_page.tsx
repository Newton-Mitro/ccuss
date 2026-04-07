import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDate } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { BranchDay, Teller } from '../../../types/cash_treasury_module';

interface Props extends SharedData {
    teller: Teller;
    branch_day: BranchDay;
}

export default function OpenTellerSession() {
    const { branch_day, teller, flash } = usePage<Props>().props;

    console.log({ branch_day, teller, flash });

    const { post, processing, errors, reset } = useForm({
        teller_id: teller?.id || '',
        branch_day_id: branch_day?.id || '',
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('teller-sessions.store'), {});
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
                        <Input value={teller?.name || ''} disabled></Input>
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
                        <Input
                            value={formatDate(branch_day?.business_date || '')}
                            disabled
                        ></Input>
                        {errors.branch_day_id && (
                            <p className="text-sm text-destructive">
                                {errors.branch_day_id}
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
