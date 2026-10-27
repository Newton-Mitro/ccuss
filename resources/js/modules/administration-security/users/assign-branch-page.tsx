import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    GitBranch,
    Mail,
    MapPin,
    Sparkles,
    UserCircle2,
} from 'lucide-react';
import { route } from 'ziggy-js';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';


import type { Props } from '@/modules/administration-security/types/users/assign-branch-page.interfaces';


export default function AssignBranchPage() {
    const { user, branches } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        branch_id: user.branch_id?.toString() || '',
    });

    const currentBranch = branches.find(
        (branch) => branch.id === Number(user.branch_id ?? 0),
    );
    const selectedBranch = branches.find(
        (branch) => branch.id === Number(data.branch_id),
    );
    const initials =
        user.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || 'U';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administrative Tasks', href: '' },
        { title: 'Users', href: route('users.index') },
        { title: `Assign Branch: ${user.name}`, href: '' },
    ];

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('users.branch.update', user.id));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Assign Branch - ${user.name}`} />
            <div className="mx-auto max-w-6xl space-y-6 pb-8">
                <header className="relative isolate overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="absolute -top-24 right-8 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
                    <div className="flex flex-col gap-5 p-5 sm:p-8 md:flex-row md:items-center">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <GitBranch className="size-7" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                    User administration
                                </span>
                                <span className="rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    Branch assignment
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                Assign a branch
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Choose the branch where {user.name} will be
                                associated within the active organization.
                            </p>
                        </div>
                        <Link
                            href={route('users.index')}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted"
                        >
                            <ArrowLeft className="size-4" />
                            Back to users
                        </Link>
                    </div>
                </header>

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <div className="flex items-start gap-3 border-b px-5 py-5 sm:px-7">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                                <MapPin className="size-5 text-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="font-semibold tracking-tight">
                                    Branch details
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Select one branch from the active
                                    organization.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={submit}
                            className="space-y-6 p-5 sm:p-7"
                        >
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <GitBranch className="size-4 text-primary" />
                                    Assigned branch
                                </label>
                                <Select
                                    value={data.branch_id}
                                    onChange={(value) =>
                                        setData('branch_id', value)
                                    }
                                    options={branches.map((branch) => ({
                                        value: branch.id.toString(),
                                        label: `${branch.code} — ${branch.name}`,
                                    }))}
                                    placeholder="Choose a branch"
                                />
                                <p className="text-xs leading-5 text-muted-foreground">
                                    The selected branch becomes this user’s
                                    branch assignment.
                                </p>
                                <InputError message={errors.branch_id} />
                            </div>

                            {selectedBranch ? (
                                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                                            <Building2 className="size-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                Selected branch
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {selectedBranch.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedBranch.code}
                                                {selectedBranch.address
                                                    ? ` · ${selectedBranch.address}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
                                    Select a branch to preview the assignment.
                                </div>
                            )}

                            {!branches.length && (
                                <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                                    No branches are available for this
                                    organization yet.
                                </p>
                            )}

                            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-muted-foreground">
                                    {currentBranch
                                        ? `Current assignment: ${currentBranch.name}`
                                        : 'This user does not currently have a branch.'}
                                </p>
                                <Button
                                    type="submit"
                                    disabled={processing || !branches.length}
                                    className="h-10 gap-2 rounded-lg px-5"
                                >
                                    {processing ? (
                                        'Assigning...'
                                    ) : (
                                        <>
                                            <CheckCircle2 className="size-4" />
                                            Save branch
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </section>

                    <aside className="space-y-4 lg:sticky lg:top-6">
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <div className="border-b px-5 py-4">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Sparkles className="size-4 text-primary" />
                                    User summary
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Confirm the account before saving.
                                </p>
                            </div>
                            <div className="space-y-5 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg font-semibold">
                                                {initials || (
                                                    <UserCircle2 className="size-7" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t pt-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">
                                                Email address
                                            </p>
                                            <p className="font-medium break-all">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">
                                                Organization
                                            </p>
                                            <p className="font-medium">
                                                {user.organization?.name ??
                                                    'Not assigned'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <GitBranch className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">
                                                Current branch
                                            </p>
                                            <p className="font-medium">
                                                {currentBranch
                                                    ? `${currentBranch.code} — ${currentBranch.name}`
                                                    : 'Not assigned'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                <p className="text-xs leading-5 text-muted-foreground">
                                    Branch assignment helps keep staff access
                                    aligned with their operating location.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
