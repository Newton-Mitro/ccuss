import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { TellerSession } from '../../../types/cash_treasury_module';

interface Props extends SharedData {
    session: TellerSession | null;
}

export default function CloseTellerSession() {
    const { session } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm({
        counted_balance: '',
    });

    // ✅ System balance (fallback safe)
    const systemBalance = Number(session?.teller?.current_balance || 0);

    // ✅ Difference calculation
    const difference = Number(data.counted_balance || 0) - systemBalance;

    useFlashToastHandler();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirm('Are you sure you want to close this session?')) {
            return;
        }

        post(route('teller-sessions.close'), {});
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teller Sessions', href: route('teller-sessions.index') },
        { title: 'Close Session', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Close Teller Session" />

            <div className="space-y-4 p-2">
                <HeadingSmall
                    title="Close Teller Session"
                    description="End the current teller session for your branch"
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
                        <Input value={session?.teller?.name || ''} disabled />
                    </div>

                    {/* System Balance */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            System Balance
                        </label>
                        <Input value={systemBalance} disabled />
                    </div>

                    {/* Counted Balance */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Counted Balance
                        </label>
                        <Input
                            type="number"
                            value={data.counted_balance}
                            onChange={(e) =>
                                setData('counted_balance', e.target.value)
                            }
                        />
                        {errors.counted_balance && (
                            <p className="text-sm text-destructive">
                                {errors.counted_balance}
                            </p>
                        )}
                    </div>

                    {/* Difference */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Difference
                        </label>
                        <Input value={difference} disabled />
                    </div>

                    {/* Warning */}
                    {difference !== 0 && (
                        <p className="text-sm text-yellow-600">
                            ⚠️ Balance mismatch detected
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-4 w-full rounded-md bg-destructive px-4 py-2 text-white hover:bg-destructive/90 disabled:opacity-50"
                    >
                        Close Session
                    </button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
