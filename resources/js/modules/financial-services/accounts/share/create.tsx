import InputError from '@/components/input-error';

import HeadingSmall from '@/components/heading-small';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { CustomerSearchInput } from '@/modules/customers-kyc/customers/components/customer-search-input';
import type { Props } from '@/modules/financial-services/types/accounts/share/create.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    CircleUserRound,
    CreditCard,
    Eye,
    FileText,
    Hash,
    LoaderCircle,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { route } from 'ziggy-js';

export default function ShareAccountCreate() {
    const { products, customers } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm({
        financial_product_id: '',
        holder_id: '',
        name: '',
        account_type: 'SHARE',
        membership_no: '',
        member_since: new Date().toISOString().slice(0, 10),
        membership_status: 'PENDING',
    });

    const selectedProduct = products.find(
        (item) => String(item.id) === data.financial_product_id,
    );

    const selectedCustomer = customers.find(
        (item) => String(item.id) === data.holder_id,
    );

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route('financial-accounts.share.store'), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Financial Services',
            href: '',
        },
        {
            title: 'Share Accounts',
            href: route('financial-accounts.share.index'),
        },
        {
            title: 'Register membership',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Register Share Membership" />

            <div className="w-full max-w-6xl space-y-4 pb-24 text-foreground">
                {/* Page header */}
                <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <HeadingSmall
                            title="Register Share Membership"
                            description="Register a member, assign a share product, and configure membership details."
                        />
                    </div>

                    <Button
                        asChild
                        type="button"
                        variant="outline"
                        className="w-full shrink-0 gap-2 sm:w-auto"
                    >
                        <Link href={route('financial-accounts.share.index')}>
                            <ArrowLeft className="size-4" />
                            Back to memberships
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={submit}
                    className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]"
                >
                    <div className="min-w-0 space-y-4">
                        {/* Member and product */}
                        <section className="overflow-hidden rounded-xl border bg-card">
                            <SectionHeader
                                icon={CircleUserRound}
                                title="Member and share product"
                                description="Choose the customer and share product associated with this membership."
                                step="01"
                            />

                            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                                <div className="space-y-2">
                                    <Label htmlFor="financial_product_id">
                                        Share product
                                        <RequiredMark />
                                    </Label>

                                    <Select
                                        id="financial_product_id"
                                        className="h-10 w-full"
                                        value={data.financial_product_id}
                                        onChange={(value) =>
                                            setData(
                                                'financial_product_id',
                                                value,
                                            )
                                        }
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select share product',
                                            },
                                            ...products.map((item) => ({
                                                value: String(item.id),
                                                label: `${item.code} — ${item.name}`,
                                            })),
                                        ]}
                                        required
                                    />

                                    <InputError
                                        message={errors.financial_product_id}
                                    />

                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Select the share product to associate
                                        with this member.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="holder_id">
                                        Member / Customer
                                        <RequiredMark />
                                    </Label>

                                    <CustomerSearchInput
                                        onSelect={(customer) =>
                                            setData(
                                                'holder_id',
                                                String(customer.id),
                                            )
                                        }
                                        clearSelectedCustomer={() =>
                                            setData('holder_id', '')
                                        }
                                        placeholder="Search member by name or customer number..."
                                    />

                                    <InputError message={errors.holder_id} />

                                    {selectedCustomer && (
                                        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                                            <CircleUserRound className="size-4 shrink-0 text-muted-foreground" />

                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-medium">
                                                    {selectedCustomer.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Customer No:{' '}
                                                    {
                                                        selectedCustomer.customer_no
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Membership details */}
                        <section className="overflow-hidden rounded-xl border bg-card">
                            <SectionHeader
                                icon={FileText}
                                title="Membership details"
                                description="Set the display name, membership number, and effective date."
                                step="02"
                            />

                            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Display name</Label>

                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        placeholder="Enter membership display name"
                                        maxLength={255}
                                        className="h-10"
                                    />

                                    <InputError message={errors.name} />

                                    <p className="text-xs text-muted-foreground">
                                        Optional name displayed for this share
                                        account.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="membership_no">
                                        Membership number
                                    </Label>

                                    <div className="relative">
                                        <Hash className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <Input
                                            id="membership_no"
                                            value={data.membership_no}
                                            onChange={(event) =>
                                                setData(
                                                    'membership_no',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Generated if blank"
                                            maxLength={100}
                                            className="h-10 pl-9"
                                        />
                                    </div>

                                    <InputError
                                        message={errors.membership_no}
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        Leave blank if your server generates the
                                        membership number automatically.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="member_since">
                                        Member since
                                        <RequiredMark />
                                    </Label>

                                    <div className="relative">
                                        <CalendarDays className="pointer-events-none absolute top-3 left-3 z-10 size-4 text-muted-foreground" />

                                        <div className="[&_button]:pl-9 [&>*]:w-full">
                                            <AppDatePicker
                                                value={data.member_since}
                                                onChange={(value) =>
                                                    setData(
                                                        'member_since',
                                                        value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <InputError message={errors.member_since} />

                                    <p className="text-xs text-muted-foreground">
                                        The effective date of membership.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="membership_status">
                                        Membership status
                                        <RequiredMark />
                                    </Label>

                                    <Select
                                        id="membership_status"
                                        className="h-10 w-full"
                                        value={data.membership_status}
                                        onChange={(value) =>
                                            setData('membership_status', value)
                                        }
                                        options={[
                                            {
                                                value: 'PENDING',
                                                label: 'Pending approval',
                                            },
                                            {
                                                value: 'ACTIVE',
                                                label: 'Active',
                                            },
                                            {
                                                value: 'SUSPENDED',
                                                label: 'Suspended',
                                            },
                                        ]}
                                        required
                                    />

                                    <InputError
                                        message={errors.membership_status}
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        Set the initial membership lifecycle
                                        status.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Registration notice */}
                        <div className="flex gap-3 rounded-xl border bg-muted/20 p-4">
                            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

                            <div className="space-y-1">
                                <p className="text-sm font-medium">
                                    Review before registration
                                </p>

                                <p className="text-xs leading-5 text-muted-foreground">
                                    Verify the customer, share product, and
                                    membership details before submitting. The
                                    server remains responsible for validating
                                    membership eligibility and assigning any
                                    generated membership number.
                                </p>
                            </div>
                        </div>
                    </div>

                    <aside className="min-w-0 space-y-3 rounded-xl border bg-card p-3.5 shadow-sm lg:sticky lg:top-4">
                        <div className="flex items-center gap-3 border-b pb-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Eye className="size-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                                    Membership summary
                                </p>
                                <h2 className="text-sm font-semibold">
                                    Live preview
                                </h2>
                            </div>
                            <span className="rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                LIVE
                            </span>
                        </div>

                        <div className="rounded-xl bg-gradient-to-br from-primary/[0.09] to-muted/30 p-3.5 ring-1 ring-primary/10">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        Member display name
                                    </p>
                                    <p className="mt-1 text-base font-semibold break-words">
                                        {data.name.trim() ||
                                            selectedCustomer?.name ||
                                            'Share membership'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {selectedCustomer?.customer_no ??
                                            'Select a member to begin'}
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full border bg-background/80 px-2 py-0.5 text-[10px] font-semibold">
                                    SHARE
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {[
                                {
                                    label: 'Share product',
                                    value: selectedProduct
                                        ? `${selectedProduct.code} · ${selectedProduct.name}`
                                        : 'Not selected',
                                    icon: CreditCard,
                                },
                                {
                                    label: 'Membership number',
                                    value:
                                        data.membership_no.trim() ||
                                        'Generated on registration',
                                    icon: Hash,
                                },
                                {
                                    label: 'Member since',
                                    value: data.member_since || 'Not set',
                                    icon: CalendarDays,
                                },
                            ].map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.label}
                                        className="flex min-w-0 items-center justify-between gap-2 rounded-lg border bg-muted/20 px-2.5 py-2"
                                    >
                                        <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <Icon className="size-3.5 shrink-0" />
                                            <span className="truncate">
                                                {item.label}
                                            </span>
                                        </span>
                                        <span className="min-w-0 text-right text-[11px] font-medium break-words">
                                            {item.value}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between rounded-lg border px-2.5 py-2">
                            <span className="text-[11px] text-muted-foreground">
                                Initial status
                            </span>
                            <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold">
                                {data.membership_status}
                            </span>
                        </div>

                        <p className="flex items-start gap-1.5 border-t pt-3 text-[11px] leading-relaxed text-muted-foreground">
                            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                            Preview updates as you enter membership details.
                        </p>
                    </aside>

                    {/* Sticky form actions */}
                    <div
                        data-slot="page-sticky-action-bar"
                        className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6 lg:col-span-2 lg:-mx-8"
                    >
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
                                <ShieldCheck className="size-4" />
                                Membership details will be validated on
                                submission.
                            </p>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                >
                                    <Link
                                        href={route(
                                            'financial-accounts.share.index',
                                        )}
                                        className="gap-2"
                                    >
                                        <ArrowLeft className="size-4" />
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
                                        ? 'Registering membership...'
                                        : 'Register membership'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

function SectionHeader({
    icon: Icon,
    title,
    description,
    step,
}: {
    icon: typeof Users;
    title: string;
    description: string;
    step: string;
}) {
    return (
        <div className="flex items-start gap-3 border-b px-4 py-4 sm:px-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                <Icon className="size-[18px] text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold tracking-tight">
                        {title}
                    </h2>

                    <span className="rounded-md border bg-muted/30 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {step}
                    </span>
                </div>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function RequiredMark() {
    return <span className="ml-1 text-destructive">*</span>;
}
