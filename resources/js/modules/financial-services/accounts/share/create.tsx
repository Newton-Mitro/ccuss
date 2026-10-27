import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { CustomerSearchInput } from '@/modules/customers-kyc/customers/components/customer-search-input';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    CircleUserRound,
    CreditCard,
    FileText,
    Hash,
    LoaderCircle,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { route } from 'ziggy-js';
import type { Props } from '@/modules/financial-services/types/accounts/share/create.interfaces';


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

            <div className="w-full max-w-5xl space-y-5 pb-8 text-foreground">
                {/* Page header */}
                <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <ResourcePageHeader
                        variant="account"
                        title="Register Share Membership"
                        description="Register a member, assign a share product, and configure membership details."
                    />

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

                {/* Registration overview */}
                <div className="grid gap-3 sm:grid-cols-3">
                    <OverviewItem
                        icon={Users}
                        label="Membership"
                        value="Share account"
                        description="Member registration"
                    />

                    <OverviewItem
                        icon={CreditCard}
                        label="Selected product"
                        value={selectedProduct?.code ?? 'Not selected'}
                        description={
                            selectedProduct?.name ??
                            'Choose a share product below'
                        }
                    />

                    <OverviewItem
                        icon={ShieldCheck}
                        label="Initial status"
                        value={data.membership_status}
                        description="Membership lifecycle"
                    />
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Member and product */}
                    <section className="overflow-hidden rounded-xl border bg-card">
                        <SectionHeader
                            icon={CircleUserRound}
                            title="Member and share product"
                            description="Choose the customer and share product associated with this membership."
                            step="01"
                        />

                        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
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
                                        setData('financial_product_id', value)
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
                                    Select the share product to associate with
                                    this member.
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
                                                {selectedCustomer.customer_no}
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

                        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
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

                                <InputError message={errors.membership_no} />

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
                                                setData('member_since', value)
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
                                    Set the initial membership lifecycle status.
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
                                membership details before submitting. The server
                                remains responsible for validating membership
                                eligibility and assigning any generated
                                membership number.
                            </p>
                        </div>
                    </div>

                    {/* Sticky form actions */}
                    <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6 lg:-mx-8">
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

function OverviewItem({
    icon: Icon,
    label,
    value,
    description,
}: {
    icon: typeof Users;
    label: string;
    value: string;
    description: string;
}) {
    return (
        <section className="flex min-w-0 items-start gap-3 rounded-xl border bg-card p-3.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                <Icon className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>

                <p className="mt-1 truncate text-sm font-semibold">{value}</p>

                <p className="mt-1 truncate text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
        </section>
    );
}

function RequiredMark() {
    return <span className="ml-1 text-destructive">*</span>;
}
