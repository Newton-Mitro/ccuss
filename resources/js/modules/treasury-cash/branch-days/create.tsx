import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CalendarPlus,
    Check,
    Clock3,
    FileText,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';

export default function CreateBranchDayPage() {
    const { auth } = usePage<any>().props;
    const userHasBranch = !!auth?.user?.branch_id;

    const { data, setData, post, processing, errors } = useForm({
        business_date: new Date().toISOString().slice(0, 10),
        opening_note: '',
    });

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Branch Days', href: route('branch-days.index') },
        { title: 'Open branch day', href: '' },
    ];

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!userHasBranch) {
            router.visit(route('branch-days.index'));
            return;
        }

        post(route('branch-days.open'), {
            preserveScroll: true,
        });
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open Branch Day" />

            <div className="w-full max-w-none space-y-5">
                <header className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                Treasury &amp; cash
                            </span>
                            <span className="px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                Branch operations
                            </span>
                        </div>
                        <h1 className="text-xl leading-tight font-semibold tracking-tight text-foreground">
                            Open a branch day
                        </h1>
                        <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
                            Start a new business-day record for your branch and
                            prepare it for daily operations.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="shrink-0">
                        <a href={route('branch-days.index')}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to branch days
                        </a>
                    </Button>
                </header>

                {!userHasBranch && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200"
                    >
                        <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                        <div>
                            <p className="font-semibold">
                                Branch assignment required
                            </p>
                            <p className="mt-1 leading-5 opacity-90">
                                Assign a branch to your user before opening a
                                business day.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <form
                        onSubmit={handleSubmit}
                        className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                    >
                        <section className="space-y-6 p-5 sm:p-7">
                            <div className="flex items-start gap-3 border-b pb-5">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <FileText className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-semibold tracking-tight">
                                        Opening details
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Choose the business date and add any
                                        context for the opening record.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="business_date"
                                        className="text-sm font-medium"
                                    >
                                        Business date
                                        <span className="ml-1 text-destructive">
                                            *
                                        </span>
                                    </label>
                                    <AppDatePicker
                                        id="business_date"
                                        value={data.business_date}
                                        onChange={(value) =>
                                            setData('business_date', value)
                                        }
                                        disabled={!userHasBranch}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Transactions posted during this session
                                        will be associated with this date.
                                    </p>
                                    {errors.business_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.business_date}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="opening_note"
                                        className="text-sm font-medium"
                                    >
                                        Opening note{' '}
                                        <span className="font-normal text-muted-foreground">
                                            (optional)
                                        </span>
                                    </label>
                                    <textarea
                                        id="opening_note"
                                        value={data.opening_note}
                                        onChange={(event) =>
                                            setData(
                                                'opening_note',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Add any opening observations or handover details."
                                        disabled={!userHasBranch}
                                        maxLength={2000}
                                        rows={4}
                                        className="flex min-h-28 w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                            Keep notes brief and relevant to
                                            today’s operations.
                                        </span>
                                        <span>
                                            {data.opening_note.length}/2000
                                        </span>
                                    </div>
                                    {errors.opening_note && (
                                        <p className="text-sm text-destructive">
                                            {errors.opening_note}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <footer
                            data-slot="form-actions"
                            className="flex flex-col-reverse gap-3 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-7"
                        >
                            <Button asChild variant="outline">
                                <a href={route('branch-days.index')}>Cancel</a>
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || !userHasBranch}
                                className="sm:min-w-44"
                            >
                                <CalendarPlus className="mr-2 size-4" />
                                {processing ? 'Opening...' : 'Open branch day'}
                            </Button>
                        </footer>
                    </form>

                    <aside className="space-y-4">
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <div className="border-b p-5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold">
                                        Opening overview
                                    </h2>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Check the session details before opening.
                                </p>
                            </div>
                            <div className="space-y-4 p-5">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <CalendarDays className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Business date
                                    </p>
                                    <p className="font-semibold">
                                        {data.business_date || 'Not selected'}
                                    </p>
                                </div>
                                <div
                                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${
                                        userHasBranch
                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-amber-500/10 text-amber-800 dark:text-amber-200'
                                    }`}
                                >
                                    <span
                                        className={`size-1.5 rounded-full ${
                                            userHasBranch
                                                ? 'bg-emerald-500'
                                                : 'bg-amber-500'
                                        }`}
                                    />
                                    {userHasBranch
                                        ? 'Branch assigned'
                                        : 'Branch assignment needed'}
                                </div>
                                <div className="flex items-start gap-2 border-t pt-4 text-xs leading-5 text-muted-foreground">
                                    <Clock3 className="mt-0.5 size-4 shrink-0" />
                                    Opening the day creates a record for this
                                    branch and date.
                                </div>
                            </div>
                        </section>
                        <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Check className="size-4 text-primary" />
                                Before you open
                            </div>
                            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted-foreground">
                                <li>
                                    Confirm the business date is correct for
                                    your branch.
                                </li>
                                <li>
                                    Check handover notes before starting
                                    transactions.
                                </li>
                                <li>
                                    Make sure your user is assigned to the
                                    correct branch.
                                </li>
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
