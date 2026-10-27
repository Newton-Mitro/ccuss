import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, FileSpreadsheet, FileUp } from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

type FiscalPeriod = {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
    fiscal_year?: { name: string };
};

type LedgerAccount = {
    id: number;
    code: string;
    name: string;
    normal_balance: string;
};

type PageProps = {
    fiscalPeriods: FiscalPeriod[];
    accounts: LedgerAccount[];
};

export default function MemberOpeningBalanceImport() {
    const { fiscalPeriods, accounts } = usePage<PageProps>().props;
    const openFiscalPeriods = fiscalPeriods.filter(
        (period) => period.status === 'OPEN',
    );
    const { data, setData, post, processing, errors } = useForm<{
        fiscal_period_id: string;
        cutover_date: string;
        offset_account_id: string;
        file: File | null;
    }>({
        fiscal_period_id: openFiscalPeriods[0]?.id
            ? String(openFiscalPeriods[0].id)
            : '',
        cutover_date: '2026-10-28',
        offset_account_id: '',
        file: null,
    });

    useFlashToastHandler();

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('opening-balances.member-import.store'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Opening Balances', href: route('opening-balances.index') },
        { title: 'Import member balances', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Import member opening balances" />
            <div className="mx-auto max-w-3xl space-y-6">
                <header className="flex items-start gap-4 rounded-2xl border bg-card p-6 shadow-sm">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileSpreadsheet className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl font-semibold">
                            Import member opening balances
                        </h1>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Import starting balances for existing savings,
                            share, fixed-deposit, and recurring-deposit
                            accounts. The import records member-account opening
                            activity and posts one balanced general ledger
                            voucher.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={route('opening-balances.index')}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Link>
                    </Button>
                </header>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm sm:p-7"
                >
                    <section className="space-y-4">
                        <div>
                            <h2 className="font-semibold">Cutover details</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Choose the open period containing your first
                                software date.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fiscal_period_id">
                                    Fiscal period
                                </Label>
                                <Select
                                    id="fiscal_period_id"
                                    value={data.fiscal_period_id}
                                    onChange={(value) =>
                                        setData('fiscal_period_id', value)
                                    }
                                    options={[
                                        { value: '', label: 'Select period' },
                                        ...openFiscalPeriods.map((period) => ({
                                            value: String(period.id),
                                            label: `${period.name} · ${period.fiscal_year?.name ?? ''}`,
                                        })),
                                    ]}
                                />
                                {openFiscalPeriods.length === 0 && (
                                    <p className="text-xs text-destructive">
                                        Create or open a fiscal period that
                                        includes the cutover date first.
                                    </p>
                                )}
                                <InputError message={errors.fiscal_period_id} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cutover_date">
                                    Cutover date
                                </Label>
                                <input
                                    id="cutover_date"
                                    type="date"
                                    value={data.cutover_date}
                                    onChange={(event) =>
                                        setData(
                                            'cutover_date',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                />
                                <InputError message={errors.cutover_date} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="offset_account_id">
                                Opening balance offset account
                            </Label>
                            <Select
                                id="offset_account_id"
                                value={data.offset_account_id}
                                onChange={(value) =>
                                    setData('offset_account_id', value)
                                }
                                options={[
                                    { value: '', label: 'Select account' },
                                    ...accounts.map((account) => ({
                                        value: String(account.id),
                                        label: `${account.code} · ${account.name} (${account.normal_balance})`,
                                    })),
                                ]}
                            />
                            <p className="text-xs leading-5 text-muted-foreground">
                                The voucher uses this account only for the net
                                amount needed to balance the imported
                                control-account totals.
                            </p>
                            <InputError message={errors.offset_account_id} />
                        </div>
                    </section>

                    <section className="space-y-4 border-t pt-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">CSV file</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    One row per member account; do not include
                                    thousands separators in amounts.
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <a
                                    href={route(
                                        'opening-balances.member-import.template',
                                    )}
                                >
                                    Download CSV template
                                </a>
                            </Button>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-4 text-xs leading-6 text-muted-foreground">
                            Required columns:{' '}
                            <code className="font-mono text-foreground">
                                account_no,opening_balance,ledger_account_code
                            </code>
                            <br />
                            Example:{' '}
                            <code className="font-mono text-foreground">
                                SAV-00000001,1250.00,2100
                            </code>
                            <br />
                            The account must already exist, belong to a member,
                            be active, and have its account-type details but no
                            balance or transaction history. Map savings,
                            fixed-deposit, and recurring-deposit balances to a
                            credit-normal liability account; map shares to a
                            credit-normal equity account.
                        </div>
                        <label
                            htmlFor="member-opening-file"
                            className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-background px-4 py-6 text-center hover:bg-muted/30"
                        >
                            <FileUp className="mb-2 size-6 text-primary" />
                            <span className="text-sm font-medium">
                                {data.file?.name ?? 'Choose a CSV file'}
                            </span>
                            <span className="mt-1 text-xs text-muted-foreground">
                                CSV only, maximum 10 MB
                            </span>
                            <input
                                id="member-opening-file"
                                type="file"
                                accept=".csv,text/csv"
                                className="sr-only"
                                onChange={(event) =>
                                    setData(
                                        'file',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                        </label>
                        <InputError message={errors.file} />
                    </section>

                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-6">
                        <strong>Current scope:</strong> this import initializes
                        existing active savings, share, fixed-deposit, and
                        recurring-deposit accounts only. Share memberships must
                        already be active. Customer records and financial
                        accounts/contracts must exist before importing. Loan
                        contracts and their remaining repayment schedules, as
                        well as bank and cash-location setup, are not included
                        in this CSV import yet. Imports are atomic: any invalid
                        row prevents all changes.
                    </div>

                    <footer className="flex justify-end border-t pt-5">
                        <Button
                            type="submit"
                            disabled={processing || !data.file}
                        >
                            <FileUp className="mr-2 size-4" />
                            {processing
                                ? 'Validating and importing...'
                                : 'Validate and import balances'}
                        </Button>
                    </footer>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
