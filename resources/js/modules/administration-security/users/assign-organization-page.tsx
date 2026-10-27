import { Input } from '@/components/ui/input';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    Mail,
    Sparkles,
    Users,
} from 'lucide-react';
import { route } from 'ziggy-js';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';


import type { Props } from '@/modules/administration-security/types/users/assign-organization-page.interfaces';


export default function AssignOrganizationPage() {
    const { user, organizations } = usePage<Props>().props;

    const selectedOrganizationIds = Array.isArray(user.organizations)
        ? user.organizations.map((organization) => organization.id)
        : user.organization_id
          ? [user.organization_id]
          : [];

    const { data, setData, post, processing, errors } = useForm({
        organization_ids: selectedOrganizationIds,
        organization_id:
            user.organization_id?.toString() ||
            selectedOrganizationIds[0]?.toString() ||
            '',
    });
    const selectedOrganizations = organizations.filter((organization) =>
        data.organization_ids.includes(organization.id),
    );
    const primaryOrganization = organizations.find(
        (organization) => organization.id === Number(data.organization_id),
    );
    const initials =
        user.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || 'U';

    const toggleOrganization = (organizationId: number) => {
        const current = Array.isArray(data.organization_ids)
            ? [...data.organization_ids]
            : [];
        const next = current.includes(organizationId)
            ? current.filter((id) => id !== organizationId)
            : [...current, organizationId];

        setData('organization_ids', next);

        if (!next.length) {
            setData('organization_id', '');
            return;
        }

        const currentPrimary = Number(data.organization_id) || next[0];
        const primaryExists = next.includes(Number(currentPrimary));
        setData(
            'organization_id',
            primaryExists ? String(currentPrimary) : String(next[0]),
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administrative Tasks', href: '' },
        { title: 'Users', href: route('users.index') },
        { title: `Assign Organization: ${user.name}`, href: '' },
    ];

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('users.organization.update', user.id));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Assign Organization - ${user.name}`} />
            <div className="mx-auto max-w-6xl space-y-6 pb-8">
                <header className="relative isolate overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="absolute -top-24 right-8 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
                    <div className="flex flex-col gap-5 p-5 sm:p-8 md:flex-row md:items-center">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <Building2 className="size-7" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                    User administration
                                </span>
                                <span className="rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    Organization access
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                Manage organization access
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Choose the organizations {user.name} can access
                                and select their primary organization.
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
                                <Users className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="font-semibold tracking-tight">
                                    Organization memberships
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Select one or more organizations for this
                                    user.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={submit}
                            className="space-y-6 p-5 sm:p-7"
                        >
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <label className="text-sm font-medium">
                                        Available organizations
                                    </label>
                                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                        {selectedOrganizations.length} of{' '}
                                        {organizations.length} selected
                                    </span>
                                </div>
                                {organizations.length ? (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {organizations.map((organization) => {
                                            const selected =
                                                data.organization_ids.includes(
                                                    organization.id,
                                                );
                                            return (
                                                <label
                                                    key={organization.id}
                                                    className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                                                        selected
                                                            ? 'border-primary/40 bg-primary/5'
                                                            : 'bg-background hover:bg-muted/50'
                                                    }`}
                                                >
                                                    <Input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() =>
                                                            toggleOrganization(
                                                                organization.id,
                                                            )
                                                        }
                                                        className="size-4"
                                                    />
                                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                        <Building2 className="size-4" />
                                                    </span>
                                                    <span className="min-w-0 truncate text-sm font-medium">
                                                        {organization.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed px-4 py-8 text-center">
                                        <Building2 className="mx-auto size-7 text-muted-foreground" />
                                        <p className="mt-2 text-sm font-medium">
                                            No organizations available
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Create an organization before
                                            assigning access.
                                        </p>
                                    </div>
                                )}
                                <InputError message={errors.organization_ids} />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <CheckCircle2 className="size-4 text-primary" />
                                    Primary organization
                                </label>
                                <Select
                                    value={data.organization_id}
                                    onChange={(value) =>
                                        setData('organization_id', value)
                                    }
                                    options={selectedOrganizations.map(
                                        (organization) => ({
                                            value: organization.id.toString(),
                                            label: organization.name,
                                        }),
                                    )}
                                    placeholder="Choose a primary organization"
                                />
                                <p className="text-xs leading-5 text-muted-foreground">
                                    The primary organization is the user’s
                                    default organization context.
                                </p>
                                <InputError message={errors.organization_id} />
                            </div>

                            {primaryOrganization && (
                                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                                            <Building2 className="size-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                Primary organization
                                            </p>
                                            <p className="mt-1 truncate font-semibold">
                                                {primaryOrganization.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Select at least one organization and set a
                                    primary organization.
                                </p>
                                <Button
                                    type="submit"
                                    disabled={
                                        processing || !organizations.length
                                    }
                                    className="h-10 gap-2 rounded-lg px-5"
                                >
                                    {processing ? (
                                        'Saving...'
                                    ) : (
                                        <>
                                            <CheckCircle2 className="size-4" />
                                            Save access
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
                                    Review current access before saving.
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
                                                {initials}
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
                                                Current primary
                                            </p>
                                            <p className="font-medium">
                                                {user.organization?.name ??
                                                    'Not assigned'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t pt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Selected memberships
                                        </span>
                                        <span className="font-semibold">
                                            {selectedOrganizations.length}
                                        </span>
                                    </div>
                                    {selectedOrganizations.length ? (
                                        <div className="space-y-2">
                                            {selectedOrganizations
                                                .slice(0, 4)
                                                .map((organization) => (
                                                    <div
                                                        key={organization.id}
                                                        className="flex min-w-0 items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs"
                                                    >
                                                        <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                                                        <span className="truncate font-medium">
                                                            {organization.name}
                                                        </span>
                                                        {organization.id ===
                                                            Number(
                                                                data.organization_id,
                                                            ) && (
                                                            <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            {selectedOrganizations.length >
                                                4 && (
                                                <p className="text-xs text-muted-foreground">
                                                    +
                                                    {selectedOrganizations.length -
                                                        4}{' '}
                                                    more organizations
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                                            No organizations selected.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                <p className="text-xs leading-5 text-muted-foreground">
                                    Organization membership determines which
                                    organizational data and workspaces are
                                    available to this user.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
