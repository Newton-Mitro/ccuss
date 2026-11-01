import InputError from '@/components/input-error';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { ChequeBookCreatePageProps } from '@/modules/treasury-cash/types/forms';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CalendarDays,
    Check,
    Eye,
    FileCheck2,
    Info,
    Landmark,
    NotebookPen,
    ShieldCheck,
} from 'lucide-react';
import { route } from 'ziggy-js';

export default function CreateChequeBook() {
    const { financial_accounts } = usePage<ChequeBookCreatePageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        financial_account_id: '',
        bank_account_id: '',
        book_no: '',
        prefix: '',
        start_number: '',
        end_number: '',
        issued_date: new Date().toISOString().slice(0, 10),
    });
    const selectedAccount = financial_accounts.find(
        (account) => String(account.id) === data.financial_account_id,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cheque Management', href: '' },
        { title: 'Cheque Books', href: route('cheque-books.index') },
        { title: 'Create', href: '' },
    ];

    const startNumber = Number(data.start_number);
    const endNumber = Number(data.end_number);

    const hasValidRange =
        data.start_number !== '' &&
        data.end_number !== '' &&
        Number.isInteger(startNumber) &&
        Number.isInteger(endNumber) &&
        startNumber >= 1 &&
        endNumber > startNumber;

    const leafCount = hasValidRange ? endNumber - startNumber + 1 : null;

    const canSubmit =
        !processing &&
        financial_accounts.length > 0 &&
        Boolean(data.financial_account_id) &&
        Boolean(data.book_no.trim()) &&
        data.start_number !== '' &&
        data.end_number !== '' &&
        data.issued_date !== '' &&
        hasValidRange;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Cheque Book" />

            <div className="w-full max-w-7xl space-y-3 pb-4 text-foreground">
                {/* Page heading */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-0.5">
                        <p className="text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                            Treasury &amp; cash · Cheque management
                        </p>
                        <div className="flex items-center gap-2">
                            <BookOpen className="size-4 shrink-0 text-primary" />
                            <h1 className="text-xl leading-tight font-semibold tracking-tight">
                                Create cheque book
                            </h1>
                        </div>
                        <p className="text-[11px] leading-4 text-muted-foreground">
                            Assign a savings account and define the cheque
                            sequence.
                        </p>
                    </div>

                    <Button
                        asChild
                        type="button"
                        variant="outline"
                        className="h-9 gap-2 self-start"
                    >
                        <Link href={route('cheque-books.index')}>
                            <ArrowLeft className="size-4" />
                            Back to cheque books
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        post(route('cheque-books.store'));
                    }}
                    className="space-y-3"
                >
                    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="min-w-0 space-y-3">
                            {/* Account and book details */}
                            <section className="overflow-hidden rounded-xl border border-border/80 bg-card">
                                <div className="flex items-center gap-2.5 border-b px-3 py-2.5">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                                        <Landmark className="size-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm leading-5 font-semibold">
                                            Account and book details
                                        </h2>
                                        <p className="text-[11px] leading-4 text-muted-foreground">
                                            Select the account and identify the
                                            cheque book.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-x-3 gap-y-3 p-3 sm:grid-cols-2">
                                    <div className="space-y-1 sm:col-span-2">
                                        <Label htmlFor="financial_account_id">
                                            Savings account{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>

                                        <Select
                                            id="financial_account_id"
                                            className="mt-1 h-9 w-full"
                                            value={data.financial_account_id}
                                            onChange={(value) =>
                                                setData(
                                                    'financial_account_id',
                                                    value,
                                                )
                                            }
                                            placeholder="Select savings account"
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Select savings account',
                                                },
                                                ...financial_accounts.map(
                                                    (account) => ({
                                                        value: String(
                                                            account.id,
                                                        ),
                                                        label: `${account.account_no} · ${account.name ?? 'Savings Account'}`,
                                                    }),
                                                ),
                                            ]}
                                        />

                                        <InputError
                                            message={
                                                errors.financial_account_id
                                            }
                                        />

                                        {financial_accounts.length === 0 && (
                                            <p className="text-xs leading-5 text-muted-foreground">
                                                No financial accounts are
                                                available for cheque book
                                                assignment.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="book_no">
                                            Book number{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>

                                        <Input
                                            id="book_no"
                                            value={data.book_no}
                                            onChange={(event) =>
                                                setData(
                                                    'book_no',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. CB-2026-001"
                                            autoComplete="off"
                                            required
                                            maxLength={255}
                                            aria-invalid={Boolean(
                                                errors.book_no,
                                            )}
                                            className="mt-1 h-9"
                                        />

                                        <InputError message={errors.book_no} />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="prefix">
                                            Cheque prefix
                                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                (Optional)
                                            </span>
                                        </Label>

                                        <Input
                                            id="prefix"
                                            value={data.prefix}
                                            onChange={(event) =>
                                                setData(
                                                    'prefix',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. CHQ"
                                            autoComplete="off"
                                            maxLength={50}
                                            aria-invalid={Boolean(
                                                errors.prefix,
                                            )}
                                            className="mt-1 h-9"
                                        />

                                        <InputError message={errors.prefix} />
                                        <p className="text-xs leading-5 text-muted-foreground">
                                            Used as the prefix for cheque
                                            identifiers, if applicable.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Number range and issue date */}
                            <section className="overflow-hidden rounded-xl border border-border/80 bg-card">
                                <div className="flex items-center gap-2.5 border-b px-3 py-2.5">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                                        <FileCheck2 className="size-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm leading-5 font-semibold">
                                            Cheque sequence and issue date
                                        </h2>
                                        <p className="text-[11px] leading-4 text-muted-foreground">
                                            Define the first and last cheque
                                            numbers included in this book.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-x-3 gap-y-3 p-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="start_number">
                                            Start number{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>

                                        <Input
                                            id="start_number"
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={data.start_number}
                                            onChange={(event) =>
                                                setData(
                                                    'start_number',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. 100001"
                                            required
                                            aria-invalid={Boolean(
                                                errors.start_number,
                                            )}
                                            className="mt-1 h-9 tabular-nums"
                                        />

                                        <InputError
                                            message={errors.start_number}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="end_number">
                                            End number{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>

                                        <Input
                                            id="end_number"
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={data.end_number}
                                            onChange={(event) =>
                                                setData(
                                                    'end_number',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. 100050"
                                            required
                                            aria-invalid={Boolean(
                                                errors.end_number,
                                            )}
                                            className="mt-1 h-9 tabular-nums"
                                        />

                                        <InputError
                                            message={errors.end_number}
                                        />
                                    </div>

                                    {data.start_number !== '' &&
                                        data.end_number !== '' &&
                                        !hasValidRange && (
                                            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:col-span-2">
                                                <Info className="mt-0.5 size-4 shrink-0 text-destructive" />
                                                <p className="text-xs leading-5 text-destructive">
                                                    The end number must be
                                                    greater than the start
                                                    number, and both numbers
                                                    must be positive integers.
                                                </p>
                                            </div>
                                        )}

                                    {leafCount !== null && (
                                        <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3.5 sm:col-span-2">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card">
                                                <Check className="size-4 text-primary" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">
                                                    {leafCount.toLocaleString()}{' '}
                                                    cheque
                                                    {leafCount === 1
                                                        ? ''
                                                        : 's'}{' '}
                                                    in this book
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                    Sequence:{' '}
                                                    {data.prefix.trim()
                                                        ? `${data.prefix.trim()}-`
                                                        : ''}
                                                    {data.start_number} to{' '}
                                                    {data.prefix.trim()
                                                        ? `${data.prefix.trim()}-`
                                                        : ''}
                                                    {data.end_number}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1 sm:col-span-2">
                                        <Label htmlFor="issued_date">
                                            Issued date{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>

                                        <div className="max-w-sm">
                                            <AppDatePicker
                                                id="issued_date"
                                                value={data.issued_date}
                                                className="mt-1 h-9"
                                                onChange={(value) =>
                                                    setData(
                                                        'issued_date',
                                                        value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <InputError
                                            message={errors.issued_date}
                                        />
                                        <p className="flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
                                            <CalendarDays className="mt-0.5 size-3.5 shrink-0" />
                                            Select the date this cheque book was
                                            issued.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
                            <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-md shadow-primary/[0.04]">
                                <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-3.5 py-3">
                                    <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                    <div className="relative flex items-center gap-2.5">
                                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                                            <Eye className="size-3.5" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-sm font-semibold">
                                                Cheque book preview
                                            </h2>
                                        </div>
                                        <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[9px] font-semibold tracking-wide text-primary">
                                            LIVE
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2.5 p-3">
                                    <div className="rounded-lg bg-gradient-to-br from-primary/[0.08] to-muted/30 p-3 ring-1 ring-primary/10">
                                        <p className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Book number
                                        </p>
                                        <p className="mt-0.5 text-sm font-semibold break-words">
                                            {data.book_no.trim() ||
                                                'Book number'}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5">
                                        <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            <Landmark className="size-3" />
                                            Savings account
                                        </div>
                                        {selectedAccount ? (
                                            <div className="mt-2">
                                                <p className="text-sm font-semibold">
                                                    {selectedAccount.name ??
                                                        'Savings account'}
                                                </p>
                                                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                    {selectedAccount.account_no}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Select an account to preview it.
                                            </p>
                                        )}
                                    </div>

                                    <div className="rounded-lg border border-primary/15 bg-primary/[0.06] p-3">
                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <FileCheck2 className="size-3.5 text-primary" />
                                            Cheque leaves
                                        </div>
                                        <p className="mt-1 text-xl font-semibold tracking-tight text-primary tabular-nums">
                                            {leafCount !== null
                                                ? leafCount.toLocaleString()
                                                : '—'}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5">
                                        <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            <NotebookPen className="size-3" />
                                            Cheque sequence
                                        </div>
                                        <p className="mt-1.5 font-mono text-xs font-medium break-all">
                                            {data.start_number &&
                                            data.end_number
                                                ? `${data.prefix.trim() ? `${data.prefix.trim()}-` : ''}${data.start_number} – ${data.prefix.trim() ? `${data.prefix.trim()}-` : ''}${data.end_number}`
                                                : 'Enter a cheque number range'}
                                        </p>
                                        {data.start_number !== '' &&
                                            data.end_number !== '' &&
                                            !hasValidRange && (
                                                <p className="mt-1.5 text-xs text-destructive">
                                                    End number must exceed the
                                                    start.
                                                </p>
                                            )}
                                    </div>

                                    <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5">
                                        <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            <CalendarDays className="size-3" />
                                            Issued date
                                        </div>
                                        <p className="mt-1.5 text-xs font-medium">
                                            {data.issued_date || 'Not selected'}
                                        </p>
                                    </div>

                                    <p className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/[0.04] px-2.5 py-2 text-[11px] text-muted-foreground">
                                        <ShieldCheck className="size-3.5 shrink-0 text-primary" />
                                        Review the account and cheque sequence
                                        before creating the book.
                                    </p>
                                </div>
                            </section>
                        </aside>
                    </div>

                    {/* Form actions */}
                    <div
                        data-slot="page-action-bar"
                        className="flex flex-col gap-3 border-t bg-background/95 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex min-w-0 items-start gap-2">
                            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <p className="text-xs leading-5 text-muted-foreground">
                                Verify the account and cheque-number range
                                before creating the book.
                            </p>
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                disabled={processing}
                                className="h-10 gap-2 sm:min-w-24"
                            >
                                <Link href={route('cheque-books.index')}>
                                    Cancel
                                </Link>
                            </Button>

                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                className="h-10 gap-2 sm:min-w-48"
                            >
                                {processing ? (
                                    <>
                                        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Check className="size-4" />
                                        Create cheque book
                                        <ArrowRight className="ml-auto size-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
