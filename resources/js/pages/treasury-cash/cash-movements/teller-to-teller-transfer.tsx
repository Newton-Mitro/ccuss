import type { TellerTransferPageProps } from '@/types/treasury-cash/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowRightLeft } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

export default function TellerToTellerTransfer() {
    const { branch_day, cash_locations } =
        usePage<TellerTransferPageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        from_cash_location_id: '',
        to_cash_location_id: '',
        amount: '',
        note: '',
    });

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        {
            title: 'Cash Transfers',
            href: route('cash-movements.teller-to-teller-transfer'),
        },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('cash-movements.teller-to-teller-transfer.store'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cash Transfer" />
            <div className="max-w-2xl space-y-6 text-foreground">
                <HeadingSmall
                    title="Cash Transfer"
                    description="Create a pending transfer between active cash locations in your branch."
                />

                <div className="rounded-md border bg-card p-4 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        Business day
                    </div>
                    <div className="mt-1 text-muted-foreground">
                        {branch_day
                            ? `${branch_day.business_date} (${branch_day.status})`
                            : 'No open branch day'}
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-md border bg-card p-4"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="from_cash_location_id"
                                className="text-sm font-medium"
                            >
                                From location
                            </label>
                            <select
                                id="from_cash_location_id"
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.from_cash_location_id}
                                onChange={(event) =>
                                    setData(
                                        'from_cash_location_id',
                                        event.target.value,
                                    )
                                }
                                required
                            >
                                <option value="">Select source</option>
                                {cash_locations.map((location) => (
                                    <option
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.name} ({location.code})
                                    </option>
                                ))}
                            </select>
                            {errors.from_cash_location_id && (
                                <p className="text-sm text-destructive">
                                    {errors.from_cash_location_id}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="to_cash_location_id"
                                className="text-sm font-medium"
                            >
                                To location
                            </label>
                            <select
                                id="to_cash_location_id"
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                value={data.to_cash_location_id}
                                onChange={(event) =>
                                    setData(
                                        'to_cash_location_id',
                                        event.target.value,
                                    )
                                }
                                required
                            >
                                <option value="">Select destination</option>
                                {cash_locations.map((location) => (
                                    <option
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.name} ({location.code})
                                    </option>
                                ))}
                            </select>
                            {errors.to_cash_location_id && (
                                <p className="text-sm text-destructive">
                                    {errors.to_cash_location_id}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="amount" className="text-sm font-medium">
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
                    <div className="space-y-2">
                        <label htmlFor="note" className="text-sm font-medium">
                            Note
                        </label>
                        <Input
                            id="note"
                            value={data.note}
                            onChange={(event) =>
                                setData('note', event.target.value)
                            }
                            maxLength={2000}
                            placeholder="Optional transfer note"
                        />
                        {errors.note && (
                            <p className="text-sm text-destructive">
                                {errors.note}
                            </p>
                        )}
                    </div>
                    <Button type="submit" disabled={processing || !branch_day}>
                        Create pending transfer
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
