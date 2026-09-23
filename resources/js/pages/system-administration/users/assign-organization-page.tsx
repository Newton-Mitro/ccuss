import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    Mail,
    UserCircle2,
    Users,
} from 'lucide-react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Select } from '../../../components/ui/select';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Organization } from '../../../types/organization';
import { User } from '../../../types/user';

interface Props extends SharedData {
    user: User;
    organizations: Organization[];
}

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
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Assign Organization"
                        description="Select the organizations this user belongs to and choose the primary organization."
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
                                    Organization membership
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Users className="h-4 w-4 text-primary" />
                                    Select organizations
                                </label>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {organizations.map((organization) => (
                                        <label
                                            key={organization.id}
                                            className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3 text-sm hover:bg-accent/40"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={data.organization_ids.includes(
                                                    organization.id,
                                                )}
                                                onChange={() =>
                                                    toggleOrganization(
                                                        organization.id,
                                                    )
                                                }
                                                className="h-4 w-4 rounded border border-border"
                                            />
                                            <span className="font-medium text-foreground">
                                                {organization.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.organization_ids} />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    Primary organization
                                </label>
                                <Select
                                    value={data.organization_id}
                                    onChange={(value) =>
                                        setData('organization_id', value)
                                    }
                                    options={organizations
                                        .filter((organization) =>
                                            data.organization_ids.includes(
                                                organization.id,
                                            ),
                                        )
                                        .map((organization) => ({
                                            value: organization.id.toString(),
                                            label: organization.name,
                                        }))}
                                    placeholder="Choose a primary organization"
                                />
                                <InputError message={errors.organization_id} />
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto"
                            >
                                {processing
                                    ? 'Saving...'
                                    : 'Save organizations'}
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
                                        Primary organization
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {user.organization?.name ??
                                            'Not assigned'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                                <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground">
                                        Memberships
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {user.organizations?.length
                                            ? user.organizations
                                                  .map((org) => org.name)
                                                  .join(', ')
                                            : 'No organizations assigned'}
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
