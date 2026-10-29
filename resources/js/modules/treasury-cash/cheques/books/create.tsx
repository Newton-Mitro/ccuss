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
        endNumber >= startNumber;

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

            <div className="w-full max-w-7xl space-y-5 pb-28 text-foreground">
                {/* Page heading */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card shadow-sm">
                            <BookOpen className="size-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-xl font-semibold tracking-tight">
                                Create cheque book
                            </h1>
                            <p className="mt-1 max-w-xl text-sm leading-5 text-muted-foreground">
                                Register a cheque book, assign it to a savings
                                account, and configure its cheque-number range.
                            </p>
                        </div>
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

                {/* Overview */}
                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-start gap-3 p-4 sm:p-5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ShieldCheck className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold">
                                Cheque book registration
                            </h2>
                            <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                Provide the account and book details carefully
                                to maintain accurate cheque tracking.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-px border-t bg-border sm:grid-cols-3">
                        <div className="flex items-center gap-3 bg-muted/20 p-3.5 sm:p-4">
                            <Landmark className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Account
                                </p>
                                <p className="mt-1 text-sm font-medium">
                                    {data.financial_account_id
                                        ? 'Account selected'
                                        : 'Not selected'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-muted/20 p-3.5 sm:p-4">
                            <NotebookPen className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Book number
                                </p>
                                <p className="mt-1 truncate text-sm font-medium">
                                    {data.book_no.trim() || 'Not entered'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-muted/20 p-3.5 sm:p-4">
                            <FileCheck2 className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Cheque leaves
                                </p>
                                <p className="mt-1 text-sm font-medium tabular-nums">
                                    {leafCount !== null
                                        ? `${leafCount.toLocaleString()} leaves`
                                        : 'Not configured'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        post(route('cheque-books.store'));
                    }}
                    className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
                >
                    <div className="min-w-0 space-y-4">
                        {/* Account and book details */}
                        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="flex items-start gap-3 border-b px-4 py-4 sm:px-5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Landmark className="size-4.5" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Account and book details
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Select the account and identify the
                                        cheque book.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-x-5 gap-y-5 p-4 sm:grid-cols-2 sm:p-5">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="financial_account_id">
                                        Savings account{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>

                                    <Select
                                        id="financial_account_id"
                                        className="h-10 w-full"
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
                                                    value: String(account.id),
                                                    label: `${account.account_no} · ${account.name ?? 'Savings Account'}`,
                                                }),
                                            ),
                                        ]}
                                    />

                                    <InputError
                                        message={errors.financial_account_id}
                                    />

                                    {financial_accounts.length === 0 && (
                                        <p className="text-xs leading-5 text-muted-foreground">
                                            No financial accounts are available
                                            for cheque book assignment.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
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
                                        aria-invalid={Boolean(errors.book_no)}
                                        className="h-10"
                                    />

                                    <InputError message={errors.book_no} />
                                </div>

                                <div className="space-y-2">
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
                                        aria-invalid={Boolean(errors.prefix)}
                                        className="h-10"
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
                        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="flex items-start gap-3 border-b px-4 py-4 sm:px-5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FileCheck2 className="size-4.5" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Cheque sequence and issue date
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Define the first and last cheque numbers
                                        included in this book.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-x-5 gap-y-5 p-4 sm:grid-cols-2 sm:p-5">
                                <div className="space-y-2">
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
                                        className="h-10 tabular-nums"
                                    />

                                    <InputError message={errors.start_number} />
                                </div>

                                <div className="space-y-2">
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
                                        className="h-10 tabular-nums"
                                    />

                                    <InputError message={errors.end_number} />
                                </div>

                                {data.start_number !== '' &&
                                    data.end_number !== '' &&
                                    !hasValidRange && (
                                        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:col-span-2">
                                            <Info className="mt-0.5 size-4 shrink-0 text-destructive" />
                                            <p className="text-xs leading-5 text-destructive">
                                                The end number must be greater
                                                than or equal to the start
                                                number, and both numbers must be
                                                positive integers.
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
                                                {leafCount === 1 ? '' : 's'} in
                                                this book
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

                                <div className="space-y-2 sm:col-span-2">
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
                                            onChange={(value) =>
                                                setData('issued_date', value)
                                            }
                                        />
                                    </div>

                                    <InputError message={errors.issued_date} />
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
                        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg ring-1 shadow-primary/[0.04] ring-foreground/[0.02]">
                            <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-4 py-4">
                                <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                <div className="relative flex items-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                        <Eye className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                                            Cheque management
                                        </p>
                                        <h2 className="text-sm font-semibold">
                                            Cheque book preview
                                        </h2>
                                    </div>
                                    <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[10px] font-semibold text-primary">
                                        LIVE
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 p-3">
                                <div className="rounded-xl bg-gradient-to-br from-primary/[0.08] to-muted/30 p-3.5 ring-1 ring-primary/10">
                                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        Book number
                                    </p>
                                    <p className="mt-1 text-base font-semibold break-words">
                                        {data.book_no.trim() || 'Book number'}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        <Landmark className="size-3.5" />
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

                                <div className="rounded-xl border border-primary/15 bg-primary/[0.06] p-3.5">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <FileCheck2 className="size-4 text-primary" />
                                        Cheque leaves
                                    </div>
                                    <p className="mt-1.5 text-2xl font-semibold tracking-tight text-primary tabular-nums">
                                        {leafCount !== null
                                            ? leafCount.toLocaleString()
                                            : '—'}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        <NotebookPen className="size-3.5" />
                                        Cheque sequence
                                    </div>
                                    <p className="mt-2 font-mono text-sm font-medium break-all">
                                        {data.start_number && data.end_number
                                            ? `${data.prefix.trim() ? `${data.prefix.trim()}-` : ''}${data.start_number} – ${data.prefix.trim() ? `${data.prefix.trim()}-` : ''}${data.end_number}`
                                            : 'Enter a cheque number range'}
                                    </p>
                                    {data.start_number !== '' &&
                                        data.end_number !== '' &&
                                        !hasValidRange && (
                                            <p className="mt-1.5 text-xs text-destructive">
                                                Enter a valid positive range.
                                            </p>
                                        )}
                                </div>

                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        <CalendarDays className="size-3.5" />
                                        Issued date
                                    </div>
                                    <p className="mt-2 text-sm font-medium">
                                        {data.issued_date || 'Not selected'}
                                    </p>
                                </div>

                                <p className="flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/[0.04] px-3 py-2.5 text-xs text-muted-foreground">
                                    <ShieldCheck className="size-4 shrink-0 text-primary" />
                                    Review the account and cheque sequence
                                    before creating the book.
                                </p>
                            </div>
                        </section>
                    </aside>

                    {/* Form actions */}
                    <div className="fixed inset-x-4 bottom-0 z-30 w-auto max-w-7xl border-t bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:inset-x-auto md:left-[calc(var(--app-sidebar-offset,0px)+1.5rem)] md:w-[calc(100%-var(--app-sidebar-offset,0px)-3rem)]">
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
