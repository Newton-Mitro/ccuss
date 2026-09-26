import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Banknote } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import { ResourcePageHeader } from '../../../components/resource-page-shell';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';

export default function CreateTellerSessionPage() {
    const { branch_day, tellers, user_branch_id } = usePage<any>().props;
    const userHasBranch = !!user_branch_id;

    const { data, setData, post, processing, errors } = useForm({
        teller_id: '',
        opening_cash: '',
        opening_note: '',
    });

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Teller Sessions', href: route('teller-sessions.index') },
        { title: 'Open teller session', href: '' },
    ];

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!branch_day) {
            router.visit(route('branch-days.index'));
            return;
        }

        post(route('teller-sessions.open'), {
            preserveScroll: true,
        });
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open Teller Session" />

            <div className="mx-auto max-w-2xl space-y-6 text-foreground">
                <ResourcePageHeader
                    title="Open teller session"
                    description="Create a session for the active branch day and assigned teller."
                />

                {!userHasBranch && (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                        Assign a branch to your user
                    </div>
                )}

                {!branch_day && userHasBranch && (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                        Open a branch day before creating a teller session.
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-xl border bg-card"
                >
                    <section className="p-5 sm:p-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label
                                    htmlFor="teller_id"
                                    className="text-sm font-medium"
                                >
                                    Teller
                                </label>
                                <select
                                    id="teller_id"
                                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                    value={data.teller_id}
                                    onChange={(event) =>
                                        setData('teller_id', event.target.value)
                                    }
                                    disabled={!branch_day || !userHasBranch}
                                    required
                                >
                                    <option value="">
                                        Select active teller
                                    </option>
                                    {tellers.map((teller: any) => (
                                        <option
                                            key={teller.id}
                                            value={teller.id}
                                        >
                                            {teller.name} ({teller.code})
                                        </option>
                                    ))}
                                </select>
                                {errors.teller_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.teller_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="opening_cash"
                                    className="text-sm font-medium"
                                >
                                    Opening cash
                                </label>
                                <Input
                                    id="opening_cash"
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={data.opening_cash}
                                    onChange={(event) =>
                                        setData(
                                            'opening_cash',
                                            event.target.value,
                                        )
                                    }
                                    disabled={!branch_day || !userHasBranch}
                                    required
                                />
                                {errors.opening_cash && (
                                    <p className="text-sm text-destructive">
                                        {errors.opening_cash}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="opening_note"
                                    className="text-sm font-medium"
                                >
                                    Opening note
                                </label>
                                <Input
                                    id="opening_note"
                                    value={data.opening_note}
                                    onChange={(event) =>
                                        setData(
                                            'opening_note',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Optional note"
                                    disabled={!branch_day || !userHasBranch}
                                    maxLength={2000}
                                />
                                {errors.opening_note && (
                                    <p className="text-sm text-destructive">
                                        {errors.opening_note}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-col-reverse gap-3 border-t bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <a
                            href={route('teller-sessions.index')}
                            className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to teller
                            sessions
                        </a>
                        <Button
                            type="submit"
                            disabled={
                                processing || !branch_day || !userHasBranch
                            }
                            className="min-w-40"
                        >
                            <Banknote className="h-4 w-4" />
                            {processing ? 'Opening...' : 'Open teller session'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
