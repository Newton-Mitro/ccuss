import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { Props } from '@/modules/general-accounting/types/parties/form.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BriefcaseBusiness,
    Check,
    CircleHelp,
    ContactRound,
    FileText,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

const partyTypes = [
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'SUPPLIER', label: 'Supplier' },
    { value: 'CUSTOMER_SUPPLIER', label: 'Customer and Supplier' },
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'OTHER', label: 'Other' },
];

const partyTypeDescriptions: Record<string, string> = {
    CUSTOMER: 'Use this party for customer-related accounting transactions.',
    SUPPLIER: 'Use this party for purchases, supplier balances, and payables.',
    CUSTOMER_SUPPLIER:
        'Use this party for both customer and supplier transactions.',
    EMPLOYEE: 'Use this party for employee-related accounting transactions.',
    OTHER: 'Use this party for other accounting relationships.',
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
            put(route('parties.update', party.id), {
                preserveScroll: true,
            });
        } else {
            post(route('parties.store'), {
                preserveScroll: true,
            });
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

    const selectedPartyType =
        partyTypes.find((type) => type.value === data.party_type)?.label ??
        'Other';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit Party' : 'Create Party'} />

            <div className="w-full min-w-0 space-y-5 pb-8 text-foreground">
                {/* Page header */}
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-card to-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                            <ContactRound className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                                    {editing ? 'Edit Party' : 'Create Party'}
                                </h1>

                                <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    General Accounting
                                </span>
                            </div>

                            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                {editing
                                    ? 'Update the party profile, contact information, and availability.'
                                    : 'Register a customer, supplier, employee, or other party for accounting transactions.'}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        asChild
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <Link href={route('parties.index')}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to parties
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="grid min-w-0 items-start gap-5 xl:grid-cols-3">
                        {/* Main form */}
                        <div className="min-w-0 space-y-5 xl:col-span-2">
                            {/* Party profile */}
                            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-4 py-4 sm:px-6">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <UserRound className="size-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-sm font-semibold">
                                            Party profile
                                        </h2>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Basic identity and accounting
                                            classification
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6 p-4 sm:p-6">
                                    <section className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-semibold">
                                                Basic information
                                            </h3>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Enter a unique code and a
                                                recognizable party name.
                                            </p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="min-w-0 space-y-1.5">
                                                <Label htmlFor="party-code">
                                                    Party code
                                                    <span className="ml-1 text-destructive">
                                                        *
                                                    </span>
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
                                                    aria-invalid={Boolean(
                                                        errors.code,
                                                    )}
                                                />

                                                <InputError
                                                    message={errors.code}
                                                />
                                            </div>

                                            <div className="min-w-0 space-y-1.5">
                                                <Label htmlFor="party-name">
                                                    Party name
                                                    <span className="ml-1 text-destructive">
                                                        *
                                                    </span>
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
                                                    aria-invalid={Boolean(
                                                        errors.name,
                                                    )}
                                                />

                                                <InputError
                                                    message={errors.name}
                                                />
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
                                                        setData(
                                                            'party_type',
                                                            value,
                                                        )
                                                    }
                                                    options={partyTypes}
                                                />

                                                <InputError
                                                    message={errors.party_type}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3.5 sm:p-4">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <BriefcaseBusiness className="size-4" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold">
                                                    {selectedPartyType}
                                                </p>
                                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                    {partyTypeDescriptions[
                                                        data.party_type
                                                    ] ??
                                                        partyTypeDescriptions.OTHER}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Contact details */}
                                    <section className="space-y-4 border-t border-border pt-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                <Phone className="size-4" />
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-semibold">
                                                    Contact information
                                                </h3>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Optional details for
                                                    communication and record
                                                    identification.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="min-w-0 space-y-1.5">
                                                <Label
                                                    htmlFor="party-phone"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Phone className="size-3.5 text-muted-foreground" />
                                                    Phone number
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
                                                    placeholder="Enter phone number"
                                                    className="h-10"
                                                    aria-invalid={Boolean(
                                                        errors.phone,
                                                    )}
                                                />

                                                <InputError
                                                    message={errors.phone}
                                                />
                                            </div>

                                            <div className="min-w-0 space-y-1.5">
                                                <Label
                                                    htmlFor="party-email"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Mail className="size-3.5 text-muted-foreground" />
                                                    Email address
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
                                                    aria-invalid={Boolean(
                                                        errors.email,
                                                    )}
                                                />

                                                <InputError
                                                    message={errors.email}
                                                />
                                            </div>

                                            <div className="min-w-0 space-y-1.5 sm:col-span-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <Label
                                                        htmlFor="party-address"
                                                        className="flex items-center gap-2"
                                                    >
                                                        <MapPin className="size-3.5 text-muted-foreground" />
                                                        Address
                                                    </Label>

                                                    <span className="text-[11px] text-muted-foreground tabular-nums">
                                                        {data.address.length}
                                                        /500
                                                    </span>
                                                </div>

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
                                                    className="flex min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
                                                    aria-invalid={Boolean(
                                                        errors.address,
                                                    )}
                                                />

                                                <InputError
                                                    message={errors.address}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Status is only editable on existing records */}
                                    {editing && (
                                        <section className="border-t border-border pt-5">
                                            <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <ShieldCheck className="size-4" />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            Party status
                                                        </p>
                                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                            Control whether this
                                                            party is available
                                                            for accounting
                                                            transactions.
                                                        </p>
                                                    </div>
                                                </div>

                                                <label className="flex cursor-pointer items-center gap-3 self-start rounded-lg border border-border bg-background px-3 py-2.5 sm:self-auto">
                                                    <Input
                                                        type="checkbox"
                                                        checked={data.status}
                                                        onChange={(event) =>
                                                            setData(
                                                                'status',
                                                                event.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="size-4 accent-primary"
                                                    />
                                                    <span className="text-sm font-medium">
                                                        Active
                                                    </span>
                                                </label>
                                            </div>

                                            <InputError
                                                message={errors.status}
                                            />
                                        </section>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <aside className="min-w-0 space-y-4 xl:sticky xl:top-5">
                            {/* Live preview */}
                            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <ContactRound className="size-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Live preview
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Party summary
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 p-4">
                                    <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                Party code
                                            </span>
                                            {editing && (
                                                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                    Editing
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-1.5 font-mono text-sm font-semibold break-all text-primary">
                                            {data.code || 'PARTY CODE'}
                                        </p>

                                        <div className="my-3 border-t border-primary/10" />

                                        <p className="text-base font-semibold break-words">
                                            {data.name || 'Party name'}
                                        </p>

                                        <span className="mt-2 inline-flex max-w-full items-center rounded-md border border-border bg-background/80 px-2 py-1 text-xs font-medium">
                                            {selectedPartyType}
                                        </span>
                                    </div>

                                    <div className="space-y-3 rounded-xl border border-border/70 bg-background/70 p-3.5">
                                        <p className="text-xs font-semibold text-muted-foreground">
                                            Contact details
                                        </p>

                                        <div className="flex min-w-0 items-start gap-2.5">
                                            <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                            <span className="min-w-0 text-sm break-all">
                                                {data.phone ||
                                                    'No phone provided'}
                                            </span>
                                        </div>

                                        <div className="flex min-w-0 items-start gap-2.5">
                                            <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                            <span className="min-w-0 text-sm break-all">
                                                {data.email ||
                                                    'No email provided'}
                                            </span>
                                        </div>

                                        <div className="flex min-w-0 items-start gap-2.5">
                                            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                            <span className="min-w-0 text-sm break-words whitespace-pre-wrap text-muted-foreground">
                                                {data.address ||
                                                    'No address provided'}
                                            </span>
                                        </div>
                                    </div>

                                    {editing && (
                                        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                                            <span className="text-xs text-muted-foreground">
                                                Current status
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                                    data.status
                                                        ? 'text-foreground'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                <span
                                                    className={`size-1.5 rounded-full ${
                                                        data.status
                                                            ? 'bg-primary'
                                                            : 'bg-muted-foreground'
                                                    }`}
                                                />
                                                {data.status
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Guidance */}
                            <section className="rounded-2xl border border-border bg-muted/20 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <CircleHelp className="size-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold">
                                            Party record tips
                                        </h3>

                                        <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                                Use a consistent, unique party
                                                code.
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                                Choose the correct accounting
                                                relationship.
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                                Keep contact information
                                                current.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Record context */}
                            <section className="rounded-2xl border border-border bg-card p-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                    <div>
                                        <h3 className="text-xs font-semibold">
                                            Record management
                                        </h3>
                                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                            {editing
                                                ? 'Review your changes before saving. Updated details will be used wherever this party is referenced.'
                                                : 'Review the party details before creating the record. You can update contact information later.'}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>

                    {/* Sticky form actions */}
                    <div
                        data-slot="page-sticky-action-bar"
                        className="sticky bottom-0 z-20 -mx-2 border-t border-border bg-background/95 px-2 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-4 sm:px-4"
                    >
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden text-xs text-muted-foreground md:block">
                                {editing
                                    ? 'Review your changes before saving.'
                                    : 'Required fields are marked with an asterisk.'}
                            </p>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    className="w-full sm:w-auto"
                                >
                                    <Link href={route('parties.index')}>
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full gap-2 sm:w-auto"
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
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
