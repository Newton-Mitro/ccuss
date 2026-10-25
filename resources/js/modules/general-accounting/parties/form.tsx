import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BriefcaseBusiness,
    Check,
    CircleHelp,
    ContactRound,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

interface Party {
    id: number;
    code: string;
    name: string;
    party_type: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    status: boolean;
}

interface Props {
    party?: Party;
}

const partyTypes = [
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'SUPPLIER', label: 'Supplier' },
    { value: 'CUSTOMER_SUPPLIER', label: 'Customer and Supplier' },
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'OTHER', label: 'Other' },
];

const partyTypeDescriptions: Record<string, string> = {
    CUSTOMER: 'A customer party can be referenced in accounting transactions.',
    SUPPLIER: 'A supplier party can be referenced for purchases and payables.',
    CUSTOMER_SUPPLIER:
        'This party can be used as both a customer and a supplier.',
    EMPLOYEE: 'An employee party can be referenced for internal transactions.',
    OTHER: 'A general party for other accounting relationships.',
};

export default function PartyForm({ party }: Props) {
    const editing = Boolean(party);
    const { data, setData, post, put, processing, errors } = useForm({
        code: party?.code ?? '',
        name: party?.name ?? '',
        party_type: party?.party_type ?? 'OTHER',
        phone: party?.phone ?? '',
        email: party?.email ?? '',
        address: party?.address ?? '',
        status: party?.status ?? true,
    });
    useFlashToastHandler();

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editing && party) {
            put(route('parties.update', party.id), { preserveScroll: true });
        } else {
            post(route('parties.store'), { preserveScroll: true });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Parties', href: route('parties.index') },
        {
            title: editing ? 'Edit Party' : 'Create Party',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit Party' : 'Create Party'} />

            <div className="mx-auto w-full max-w-6xl space-y-6 pb-8 text-foreground">
                <ResourcePageHeader
                    title={editing ? 'Edit Party' : 'Create Party'}
                    description="Maintain a customer, supplier, employee, or other party for accounting transactions."
                    action={
                        <Button variant="outline" asChild>
                            <Link href={route('parties.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to parties
                            </Link>
                        </Button>
                    }
                    className="rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:p-6"
                />

                <form
                    onSubmit={submit}
                    className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"
                >
                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-5 py-4 sm:px-6">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ContactRound className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Party profile
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Configure the party identity and contact
                                    information.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 p-5 sm:p-6">
                            <section className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Basic information
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Identify this party in your accounting
                                        records.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="party-code">
                                            Party code
                                        </Label>
                                        <Input
                                            id="party-code"
                                            value={data.code}
                                            onChange={(event) =>
                                                setData(
                                                    'code',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. P-001"
                                            className="h-10"
                                            required
                                            aria-invalid={Boolean(errors.code)}
                                        />
                                        <InputError message={errors.code} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="party-name">
                                            Party name
                                        </Label>
                                        <Input
                                            id="party-name"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. Acme Supplies"
                                            className="h-10"
                                            required
                                            aria-invalid={Boolean(errors.name)}
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="party-type">
                                            Party type
                                        </Label>
                                        <Select
                                            id="party-type"
                                            className="h-10 w-full"
                                            value={data.party_type}
                                            onChange={(value) =>
                                                setData('party_type', value)
                                            }
                                            options={partyTypes}
                                        />
                                        <InputError
                                            message={errors.party_type}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4">
                                    <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        {partyTypeDescriptions[
                                            data.party_type
                                        ] ?? partyTypeDescriptions.OTHER}
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-4 border-t border-border pt-5">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Contact information
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Contact details are optional and can be
                                        updated later.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="party-phone"
                                            className="flex items-center gap-2"
                                        >
                                            <Phone className="size-3.5 text-muted-foreground" />
                                            Phone
                                        </Label>
                                        <Input
                                            id="party-phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(event) =>
                                                setData(
                                                    'phone',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Phone number"
                                            className="h-10"
                                            aria-invalid={Boolean(errors.phone)}
                                        />
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="party-email"
                                            className="flex items-center gap-2"
                                        >
                                            <Mail className="size-3.5 text-muted-foreground" />
                                            Email
                                        </Label>
                                        <Input
                                            id="party-email"
                                            type="email"
                                            value={data.email}
                                            onChange={(event) =>
                                                setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="name@example.com"
                                            className="h-10"
                                            aria-invalid={Boolean(errors.email)}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label
                                            htmlFor="party-address"
                                            className="flex items-center gap-2"
                                        >
                                            <MapPin className="size-3.5 text-muted-foreground" />
                                            Address
                                        </Label>
                                        <textarea
                                            id="party-address"
                                            value={data.address}
                                            onChange={(event) =>
                                                setData(
                                                    'address',
                                                    event.target.value,
                                                )
                                            }
                                            maxLength={500}
                                            rows={3}
                                            placeholder="Street, city, and other address details"
                                            className="flex min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                                            aria-invalid={Boolean(
                                                errors.address,
                                            )}
                                        />
                                        <div className="flex items-center justify-between gap-3">
                                            <InputError
                                                message={errors.address}
                                            />
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                {data.address.length}/500
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {editing && (
                                <section className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/80 bg-background/70 px-4 py-3">
                                        <Input
                                            type="checkbox"
                                            checked={data.status}
                                            onChange={(event) =>
                                                setData(
                                                    'status',
                                                    event.target.checked,
                                                )
                                            }
                                            className="size-4 accent-primary"
                                        />
                                        <span>
                                            <span className="block text-sm font-medium">
                                                Active party
                                            </span>
                                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                                Available for accounting
                                                transactions
                                            </span>
                                        </span>
                                    </label>
                                </section>
                            )}

                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('parties.index')}>
                                        Cancel
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="gap-2"
                                >
                                    {processing ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <Check className="size-4" />
                                    )}
                                    {processing
                                        ? 'Saving...'
                                        : editing
                                          ? 'Save changes'
                                          : 'Create party'}
                                </Button>
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-4 lg:sticky lg:top-4">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <ContactRound className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Live preview
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Party identity
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3 p-4">
                                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                                    <p className="font-mono text-xs font-semibold text-primary">
                                        {data.code || 'PARTY CODE'}
                                    </p>
                                    <p className="mt-1.5 text-sm font-semibold">
                                        {data.name || 'Party name'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {partyTypes.find(
                                            (type) =>
                                                type.value === data.party_type,
                                        )?.label ?? 'Other'}
                                    </p>
                                </div>
                                <div className="space-y-2 rounded-xl border border-border/70 bg-background/70 p-3.5">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Contact
                                    </p>
                                    <p className="flex min-w-0 items-center gap-2 text-sm">
                                        <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                                        <span className="truncate">
                                            {data.phone || 'No phone provided'}
                                        </span>
                                    </p>
                                    <p className="flex min-w-0 items-center gap-2 text-sm">
                                        <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                                        <span className="truncate">
                                            {data.email || 'No email provided'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-muted/20 p-4">
                            <div className="flex items-start gap-2.5">
                                <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" />
                                <div>
                                    <h3 className="text-xs font-semibold">
                                        About party records
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Party records identify people or
                                        organizations referenced by accounting
                                        transactions. Use the appropriate party
                                        type to keep records easy to find.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
