import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    GitBranch,
    Mail,
    UserCircle2,
} from 'lucide-react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Branch } from '../../../types/branch';
import { User } from '../../../types/user';

interface Props extends SharedData {
    user: User;
    branches: Branch[];
}

export default function AssignBranchPage() {
    const { user, branches } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        branch_id: user.branch_id?.toString() || '',
    });

    const currentBranch = branches.find(
        (branch) => branch.id === Number(user.branch_id ?? 0),
    );

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
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Assign Branch"
                        description="Select the branch for this user in the active organization."
                    />
                    <Button asChild variant="outline">
                        <Link href={route('users.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserCircle2 className="h-8 w-8" />
                                )}
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-foreground">
                                    {user.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    User assignment
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <GitBranch className="h-4 w-4 text-primary" />
                                    Select branch
                                </label>
                                <Select
                                    value={data.branch_id}
                                    onChange={(value) =>
                                        setData('branch_id', value)
                                    }
                                    options={branches.map((branch) => ({
                                        value: branch.id.toString(),
                                        label: branch.name,
                                    }))}
                                    placeholder="Choose a branch"
                                />
                                <InputError message={errors.branch_id} />
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto"
                            >
                                {processing ? 'Assigning...' : 'Assign branch'}
                            </Button>
                        </form>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            User details
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground">
                                        Email
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                                <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground">
                                        Organization
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {user.organization?.name ??
                                            'Not assigned'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                                <GitBranch className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground">
                                        Current branch
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {currentBranch?.name ?? 'Not assigned'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
