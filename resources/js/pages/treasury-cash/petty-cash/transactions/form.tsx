import { Head, useForm, usePage } from '@inertiajs/react';
import { HandCoins } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../../components/heading-small';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import useFlashToastHandler from '../../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../../types';

interface PettyCashFundOption {
    id: number;
    code: string;
    name: string;
    current_balance: string | number;
    fund_limit: string | number;
}

interface PettyCashTransactionProps extends SharedData {
    transaction_type: 'FUNDING' | 'EXPENSE';
    branch_day: { business_date: string; status: string } | null;
    funds: PettyCashFundOption[];
}

export default function Form() {
    const { transaction_type, branch_day, funds } =
        usePage<PettyCashTransactionProps>().props;
    const isFunding = transaction_type === 'FUNDING';
    const routeType = isFunding ? 'funding' : 'expense';
    const { data, setData, post, processing, errors } = useForm({
        petty_cash_fund_id: '',
        amount: '',
        payee: '',
        description: '',
    });

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Petty Cash', href: '' },
        {
            title: isFunding ? 'Fund Petty Cash' : 'Petty Cash Expense',
            href: route('petty-cash-transactions.' + routeType),
        },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('petty-cash-transactions.' + routeType + '.store'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={isFunding ? 'Fund Petty Cash' : 'Petty Cash Expense'}
            />
            <div className="max-w-2xl space-y-6 text-foreground">
                <HeadingSmall
                    title={isFunding ? 'Fund Petty Cash' : 'Petty Cash Expense'}
                    description={`Create a pending petty cash ${isFunding ? 'funding' : 'expense'} transaction.`}
                />
                <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
                    {branch_day
                        ? `Business day: ${branch_day.business_date} (${branch_day.status})`
                        : 'No open branch day'}
                </div>
                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-md border bg-card p-4"
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="petty_cash_fund_id"
                            className="text-sm font-medium"
                        >
                            Petty cash fund
                        </label>
                        <select
                            id="petty_cash_fund_id"
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                            value={data.petty_cash_fund_id}
                            onChange={(event) =>
                                setData(
                                    'petty_cash_fund_id',
                                    event.target.value,
                                )
                            }
                            required
                        >
                            <option value="">Select fund</option>
                            {funds.map((fund) => (
                                <option key={fund.id} value={fund.id}>
                                    {fund.name} ({fund.code}) - Balance{' '}
                                    {fund.current_balance}
                                </option>
                            ))}
                        </select>
                        {errors.petty_cash_fund_id && (
                            <p className="text-sm text-destructive">
                                {errors.petty_cash_fund_id}
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
                    {!isFunding && (
                        <div className="space-y-2">
                            <label
                                htmlFor="payee"
                                className="text-sm font-medium"
                            >
                                Payee
                            </label>
                            <Input
                                id="payee"
                                value={data.payee}
                                onChange={(event) =>
                                    setData('payee', event.target.value)
                                }
                                maxLength={255}
                                placeholder="Optional payee"
                            />
                            {errors.payee && (
                                <p className="text-sm text-destructive">
                                    {errors.payee}
                                </p>
                            )}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label
                            htmlFor="description"
                            className="text-sm font-medium"
                        >
                            Description
                        </label>
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(event) =>
                                setData('description', event.target.value)
                            }
                            maxLength={2000}
                            placeholder="Optional transaction description"
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">
                                {errors.description}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={
                            processing || !branch_day || funds.length === 0
                        }
                    >
                        <HandCoins className="h-4 w-4" />
                        Create pending {isFunding ? 'funding' : 'expense'}
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
