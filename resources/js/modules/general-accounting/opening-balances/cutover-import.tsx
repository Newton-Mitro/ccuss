import InputError from '@/components/input-error';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, FileArchive, FileUp } from 'lucide-react';
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

export default function CutoverImport() {
    const { fiscalPeriods, accounts } = usePage<PageProps>().props;
    const openPeriods = fiscalPeriods.filter(
        (period) => period.status === 'OPEN',
    );
    const { data, setData, post, processing, errors } = useForm<{
        fiscal_period_id: string;
        cutover_date: string;
        offset_account_id: string;
        file: File | null;
    }>({
        fiscal_period_id: openPeriods[0]?.id ? String(openPeriods[0].id) : '',
        cutover_date: '2026-10-28',
        offset_account_id: '',
        file: null,
    });

    useFlashToastHandler();

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('opening-balances.cutover-import.store'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Financial Services',
            href: route('financial-accounts.index'),
        },
        {
            title: 'Financial Accounts',
            href: route('financial-accounts.index'),
        },
        { title: 'Cutover Import', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cutover Import" />
            <div className="mx-auto max-w-4xl space-y-6">
                <header className="flex items-start gap-4 rounded-2xl border bg-card p-6 shadow-sm">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileArchive className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl font-semibold">
                            Import cutover data
                        </h1>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Import current customers, member and loan accounts,
                            remaining loan schedules, bank accounts, and cash
                            locations from one validated ZIP.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={route('financial-accounts.index')}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Link>
                    </Button>
                </header>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm sm:p-7"
                >
                    <section className="grid gap-4 sm:grid-cols-3">
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
                                    ...openPeriods.map((period) => ({
                                        value: String(period.id),
                                        label: `${period.name} · ${period.fiscal_year?.name ?? ''}`,
                                    })),
                                ]}
                            />
                            {openPeriods.length === 0 && (
                                <p className="text-xs text-destructive">
                                    Create an open fiscal period containing the
                                    cutover date first.
                                </p>
                            )}
                            <InputError message={errors.fiscal_period_id} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cutover_date">Cutover date</Label>
                            <AppDatePicker
                                id="cutover_date"
                                value={data.cutover_date}
                                onChange={(value) =>
                                    setData('cutover_date', value)
                                }
                            />
                            <InputError message={errors.cutover_date} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="offset_account_id">
                                Opening balance offset
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
                            <InputError message={errors.offset_account_id} />
                        </div>
                    </section>

                    <section className="space-y-4 border-t pt-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">ZIP bundle</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Download sample-filled CSVs, replace the
                                    example values with your configured codes
                                    and actual records, and upload them
                                    together.
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <a
                                    href={route(
                                        'opening-balances.cutover-import.template',
                                    )}
                                >
                                    Download sample CSV ZIP
                                </a>
                            </Button>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-6">
                            <p>
                                Required bundle files:{' '}
                                <code>
                                    customers.csv, accounts.csv,
                                    loan_schedules.csv, loan_arrears.csv,
                                    recurring_installments.csv,
                                    bank_accounts.csv, cash_locations.csv
                                </code>
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                                <li>
                                    Use branch codes, customer numbers, account
                                    numbers, and product codes already in your
                                    organization. New customer and account
                                    numbers are preserved from the CSV.
                                </li>
                                <li>
                                    Accounts require their preconfigured product
                                    and ledger account. Loans require the unpaid
                                    schedule; unpaid scheduled principal must
                                    match the imported loan balance. Arrears are
                                    linked by account and installment.
                                </li>
                                <li>
                                    Bank accounts link to BANK financial
                                    accounts. VAULT and TELLER cash locations
                                    require CASH accounts and create opening
                                    sessions on an open cutover branch day.
                                    Petty-cash balances are initialized from
                                    their CSV rows.
                                </li>
                                <li>
                                    Only new active records and cutover balances
                                    are imported; transaction history and closed
                                    records are not. Any invalid reference or
                                    row cancels the entire import.
                                </li>
                            </ul>
                            <details className="mt-3 border-t pt-3">
                                <summary className="cursor-pointer font-medium text-foreground">
                                    CSV formats and loan checks
                                </summary>
                                <div className="mt-2 space-y-2 text-muted-foreground">
                                    <p>
                                        Customer types are INDIVIDUAL or
                                        ORGANIZATION; identification types are
                                        NATIONAL_IDENTIFICATION_NUMBER,
                                        BIRTH_REGISTRATION_NUMBER,
                                        REGISTRATION_NO, PASSPORT, or
                                        DRIVING_LICENSE. Imported records must
                                        be ACTIVE.
                                    </p>
                                    <p>
                                        accounts.csv types are SAVINGS, SHARE,
                                        FIXED_DEPOSIT, RECURRING_DEPOSIT, LOAN,
                                        CASH, or BANK. Fixed deposits require
                                        principal, rate, term, start and
                                        maturity dates. Recurring deposits
                                        require installment amount/frequency,
                                        total and paid installment counts, and
                                        contract dates, plus a row for every
                                        installment in
                                        recurring_installments.csv. Loan rows
                                        require original principal/disbursed
                                        amounts, rate, interest and repayment
                                        terms, and maturity date.
                                    </p>
                                    <p>
                                        loan_schedules.csv contains each unpaid
                                        installment. Its four component due and
                                        paid columns must sum to total_due and
                                        total_paid; unpaid principal across the
                                        schedule must equal the loan account
                                        balance. Past-due unpaid installments
                                        need matching loan_arrears.csv rows
                                        dated exactly on the cutover date.
                                    </p>
                                    <p>
                                        Cash location types are VAULT, TELLER,
                                        PETTY_CASH, or OTHER. Teller rows use a
                                        preconfigured staff user email.
                                        Petty-cash and linked CASH account
                                        balances must agree. Bank account types
                                        are CURRENT, SAVINGS, FDR, or OTHER.
                                    </p>
                                </div>
                            </details>
                        </div>
                        <label
                            htmlFor="cutover-zip"
                            className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-background px-4 py-6 text-center hover:bg-muted/30"
                        >
                            <FileUp className="mb-2 size-6 text-primary" />
                            <span className="text-sm font-medium">
                                {data.file?.name ?? 'Choose the completed ZIP'}
                            </span>
                            <span className="mt-1 text-xs text-muted-foreground">
                                ZIP only, maximum 50 MB
                            </span>
                            <input
                                id="cutover-zip"
                                type="file"
                                accept=".zip,application/zip"
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

                    <footer
                        data-slot="form-actions"
                        className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end"
                    >
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !data.file ||
                                openPeriods.length === 0
                            }
                        >
                            <FileArchive className="mr-2 size-4" />
                            {processing
                                ? 'Validating and importing...'
                                : 'Validate and import ZIP'}
                        </Button>
                    </footer>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
