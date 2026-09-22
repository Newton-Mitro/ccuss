import type { CashAdjustmentFormPageProps } from '@/types/treasury-cash/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import { SlidersHorizontal } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

export default function TellerCashAdjustment() {
    const { teller_sessions } = usePage<CashAdjustmentFormPageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        teller_session_id: '',
        amount: '',
        type: 'SHORTAGE',
        reason: '',
    });

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        {
            title: 'Cash Adjustment',
            href: route('cash-adjustments.teller-cash-adjustment'),
        },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('cash-adjustments.teller-cash-adjustment.store'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cash Adjustment" />
            <div className="max-w-2xl space-y-6 text-foreground">
                <HeadingSmall
                    title="Cash Adjustment"
                    description="Record a pending shortage or excess for an open teller session."
                />
                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-md border bg-card p-4"
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="teller_session_id"
                            className="text-sm font-medium"
                        >
                            Teller session
                        </label>
                        <select
                            id="teller_session_id"
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                            value={data.teller_session_id}
                            onChange={(event) =>
                                setData('teller_session_id', event.target.value)
                            }
                            required
                        >
                            <option value="">Select open teller session</option>
                            {teller_sessions.map((session) => (
                                <option key={session.id} value={session.id}>
                                    {session.teller?.name ?? 'Teller'} (
                                    {session.teller?.code ?? '-'}) -{' '}
                                    {session.branch_day?.business_date ?? '-'}
                                </option>
                            ))}
                        </select>
                        {errors.teller_session_id && (
                            <p className="text-sm text-destructive">
                                {errors.teller_session_id}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="type"
                                className="text-sm font-medium"
                            >
                                Adjustment type
                            </label>
                            <select
                                id="type"
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.type}
                                onChange={(event) =>
                                    setData('type', event.target.value)
                                }
                            >
                                <option value="SHORTAGE">Shortage</option>
                                <option value="EXCESS">Excess</option>
                            </select>
                            {errors.type && (
                                <p className="text-sm text-destructive">
                                    {errors.type}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="amount"
                                className="text-sm font-medium"
                            >
                                Amount
                            </label>
                            <Input
                                id="amount"
                                type="number"
                                min="0.01"
                                step="0.0001"
                                value={data.amount}
                                onChange={(event) =>
                                    setData('amount', event.target.value)
                                }
                                required
                            />
                            {errors.amount && (
                                <p className="text-sm text-destructive">
                                    {errors.amount}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="reason" className="text-sm font-medium">
                            Reason
                        </label>
                        <Input
                            id="reason"
                            value={data.reason}
                            onChange={(event) =>
                                setData('reason', event.target.value)
                            }
                            maxLength={2000}
                            placeholder="Describe the cash count difference"
                            required
                        />
                        {errors.reason && (
                            <p className="text-sm text-destructive">
                                {errors.reason}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={processing || teller_sessions.length === 0}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Create pending adjustment
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
