import { Head, router, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { BreadcrumbItem, SharedData } from '../../../types';
import { TellerSession } from '../../../types/cash_treasury_module';

interface Props extends SharedData {
    session: TellerSession | null;
}

export default function CloseTellerSession() {
    const { session } = usePage<Props>().props;

    const { data, setData, processing, errors } = useForm({
        counted_balance: '',
        remarks: '',
    });

    useFlashToastHandler();

    // ✅ Correct system balance (source of truth)
    const systemBalance = Number(session?.expected_balance || 0);

    // ✅ Safe numeric parsing
    const counted = Number(data.counted_balance || 0);

    // ✅ Difference
    const difference = counted - systemBalance;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) return;

        if (!data.counted_balance) {
            alert('Please enter counted balance');
            return;
        }

        if (!confirm('Are you sure you want to close this session?')) {
            return;
        }

        router.post(route('teller-sessions.close', session.id), {
            data: {
                counted_balance: counted,
                difference,
                remarks: data.remarks,
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Teller Sessions', href: route('teller-sessions.index') },
        { title: 'Close Session', href: '' },
    ];

    const getDifferenceColor = () => {
        if (difference === 0) return 'text-green-600';
        if (difference < 0) return 'text-red-600'; // shortage
        return 'text-blue-600'; // excess
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Close Teller Session" />

            <div className="space-y-4">
                <HeadingSmall
                    title="Close Teller Session"
                    description="Finalize session with cash reconciliation"
                />

                <form
                    onSubmit={handleSubmit}
                    className="w-full space-y-4 rounded-md border bg-card p-6 md:p-10"
                >
                    {!session ? (
                        <p className="text-center text-gray-600">
                            No active session found.
                        </p>
                    ) : (
                        <>
                            {/* Teller */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Teller
                                </label>
                                <Input
                                    value={session.teller?.name || ''}
                                    disabled
                                />
                            </div>

                            {/* System Balance */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Expected Balance (System)
                                </label>
                                <Input
                                    value={formatBDTCurrency(systemBalance)}
                                    disabled
                                />
                            </div>

                            {/* Counted Balance */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Counted Balance (Physical)
                                </label>
                                <Input
                                    type="number"
                                    value={data.counted_balance}
                                    onChange={(e) =>
                                        setData(
                                            'counted_balance',
                                            e.target.value,
                                        )
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
                                <Input
                                    value={formatBDTCurrency(difference)}
                                    className={getDifferenceColor()}
                                    disabled
                                />
                            </div>

                            {/* Insight */}
                            {difference !== 0 && (
                                <p
                                    className={`text-sm ${getDifferenceColor()}`}
                                >
                                    {difference < 0
                                        ? '⚠️ Cash shortage detected'
                                        : 'ℹ️ Excess cash detected'}
                                </p>
                            )}

                            {difference === 0 && data.counted_balance && (
                                <p className="text-sm text-green-600">
                                    ✅ Perfect balance match
                                </p>
                            )}

                            {/* Remarks */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Remarks (optional)
                                </label>
                                <Input
                                    value={data.remarks}
                                    onChange={(e) =>
                                        setData('remarks', e.target.value)
                                    }
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-4 w-full rounded-md bg-destructive px-4 py-2 text-white hover:bg-destructive/90 disabled:opacity-50"
                            >
                                Close Session
                            </button>
                        </>
                    )}
                </form>
            </div>
        </CustomAuthLayout>
    );
}
