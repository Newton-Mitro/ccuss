import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import { ResourcePageHeader } from '../../../components/resource-page-shell';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';

export default function CreateBranchDayPage() {
    const { auth, organization } = usePage<any>().props;
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

            <div className="mx-auto max-w-2xl space-y-6 text-foreground">
                <ResourcePageHeader
                    title="Open branch day"
                    description="Create a new opening record for the current branch and business date."
                />

                {!userHasBranch && (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                        Assign a branch to your user
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
                                    htmlFor="business_date"
                                    className="text-sm font-medium"
                                >
                                    Business date
                                </label>
                                <Input
                                    id="business_date"
                                    type="date"
                                    value={data.business_date}
                                    onChange={(event) =>
                                        setData(
                                            'business_date',
                                            event.target.value,
                                        )
                                    }
                                    disabled={!userHasBranch}
                                    required
                                />
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
                                    disabled={!userHasBranch}
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
                            href={route('branch-days.index')}
                            className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to branch
                            days
                        </a>
                        <Button
                            type="submit"
                            disabled={processing || !userHasBranch}
                            className="min-w-40"
                        >
                            <CalendarPlus className="h-4 w-4" />
                            {processing ? 'Opening...' : 'Open branch day'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
