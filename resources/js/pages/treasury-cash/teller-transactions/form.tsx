import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';

interface TellerSessionOption {
    id: number;
    teller?: { name: string; code: string } | null;
    branch_day?: { business_date: string } | null;
}

interface TellerCashTransactionProps extends SharedData {
    transaction_type: 'DEPOSIT' | 'WITHDRAWAL';
    teller_sessions: TellerSessionOption[];
}

export default function Form() {
    const { transaction_type, teller_sessions } =
        usePage<TellerCashTransactionProps>().props;
    const isDeposit = transaction_type === 'DEPOSIT';
    const routeType = isDeposit ? 'deposit' : 'withdrawal';
    const { data, setData, post, processing, errors } = useForm({
        teller_session_id: '',
        amount: '',
        reference: '',
        note: '',
    });

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        {
            title: isDeposit ? 'Cash Deposit' : 'Cash Withdrawal',
            href: route('teller-transactions.' + routeType),
        },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('teller-transactions.' + routeType + '.store'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={isDeposit ? 'Cash Deposit' : 'Cash Withdrawal'} />
            <div className="max-w-2xl space-y-6 text-foreground">
                <HeadingSmall
                    title={isDeposit ? 'Cash Deposit' : 'Cash Withdrawal'}
                    description={`Create a pending ${isDeposit ? 'deposit' : 'withdrawal'} for an open teller session.`}
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
                        <label
                            htmlFor="reference"
                            className="text-sm font-medium"
                        >
                            Reference
                        </label>
                        <Input
                            id="reference"
                            value={data.reference}
                            onChange={(event) =>
                                setData('reference', event.target.value)
                            }
                            maxLength={255}
                            placeholder="Optional reference"
                        />
                        {errors.reference && (
                            <p className="text-sm text-destructive">
                                {errors.reference}
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
                            placeholder="Optional note"
                        />
                        {errors.note && (
                            <p className="text-sm text-destructive">
                                {errors.note}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={processing || teller_sessions.length === 0}
                    >
                        {isDeposit ? (
                            <ArrowDownToLine className="h-4 w-4" />
                        ) : (
                            <ArrowUpFromLine className="h-4 w-4" />
                        )}
                        Create pending {isDeposit ? 'deposit' : 'withdrawal'}
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
