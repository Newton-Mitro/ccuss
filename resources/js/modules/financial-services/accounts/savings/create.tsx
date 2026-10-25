import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    CheckCircle2,
    CircleDollarSign,
    FileText,
    Info,
    Landmark,
    LoaderCircle,
    ShieldCheck,
    UserRound,
    Wallet,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Props extends SharedData {
    products: Array<{
        id: number;
        code: string;
        name: string;
        policy?: {
            minimum_opening_amount?: string | number;
        } | null;
    }>;
    customers: Array<{
        id: number;
        customer_no: string;
        name: string;
    }>;
}

function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Wallet;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                <Icon className="size-5" />
            </div>
            <div className="space-y-1">
                <h2 className="text-sm font-semibold tracking-tight">
                    {title}
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default function SavingsAccountCreate() {
    const { products, customers } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm({
        financial_product_id: '',
        holder_id: '',
        name: '',
        account_type: 'SAVINGS',
        minimum_balance: '0',
    });

    const product = products.find(
        (item) => String(item.id) === data.financial_product_id,
    );

    const minimumOpeningAmount = product?.policy?.minimum_opening_amount;

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('financial-accounts.savings.store'));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Savings Accounts',
            href: route('financial-accounts.savings.index'),
        },
        { title: 'Open savings account', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open savings account" />

            <div className="w-full max-w-6xl space-y-6 pb-24">
                <ResourcePageHeader variant="account"
                    title="Open savings account"
                    description="Create a savings account and configure its minimum-balance requirement."
                />

                <form onSubmit={submit} className="space-y-5">
                    <div className="overflow-hidden rounded-xl border bg-card">
                        {/* Policy notice */}
                        <div className="border-b p-4 sm:p-5">
                            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/[0.04] p-4">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Info className="size-5" />
                                </div>

                                <div className="min-w-0 flex-1 space-y-1">
                                    <h2 className="text-sm font-semibold">
                                        Product minimum-balance policy
                                    </h2>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        Select a savings product to view its
                                        minimum opening amount. Make sure the
                                        minimum balance complies with the
                                        product policy.
                                    </p>
                                </div>

                                <ShieldCheck className="mt-1 hidden size-5 shrink-0 text-primary sm:block" />
                            </div>
                        </div>

                        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_270px] lg:gap-6">
                            {/* Main form */}
                            <div className="min-w-0 space-y-6">
                                <section className="space-y-5">
                                    <SectionHeading
                                        icon={Wallet}
                                        title="Account details"
                                        description="Enter the customer and product information for this new savings account."
                                    />

                                    <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                                        <div className="min-w-0 space-y-2">
                                            <Label htmlFor="financial-product">
                                                Savings product
                                                <span className="ml-1 text-destructive">
                                                    *
                                                </span>
                                            </Label>

                                            <Select
                                                value={
                                                    data.financial_product_id
                                                }
                                                onChange={(value) =>
                                                    setData(
                                                        'financial_product_id',
                                                        value,
                                                    )
                                                }
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'Select savings product',
                                                    },
                                                    ...products.map((item) => ({
                                                        value: String(item.id),
                                                        label: `${item.code} - ${item.name}`,
                                                    })),
                                                ]}
                                            />

                                            <InputError
                                                message={
                                                    errors.financial_product_id
                                                }
                                            />

                                            <p className="text-xs text-muted-foreground">
                                                Choose the savings scheme for
                                                this account.
                                            </p>
                                        </div>

                                        <div className="min-w-0 space-y-2">
                                            <Label htmlFor="holder-id">
                                                Primary customer
                                                <span className="ml-1 text-destructive">
                                                    *
                                                </span>
                                            </Label>

                                            <Select
                                                value={data.holder_id}
                                                onChange={(value) =>
                                                    setData('holder_id', value)
                                                }
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'Select customer',
                                                    },
                                                    ...customers.map(
                                                        (item) => ({
                                                            value: String(
                                                                item.id,
                                                            ),
                                                            label: `${item.customer_no} - ${item.name}`,
                                                        }),
                                                    ),
                                                ]}
                                            />

                                            <InputError
                                                message={errors.holder_id}
                                            />

                                            <p className="text-xs text-muted-foreground">
                                                Select the registered account
                                                holder.
                                            </p>
                                        </div>

                                        <div className="min-w-0 space-y-2">
                                            <Label htmlFor="account-name">
                                                Account display name
                                                <span className="ml-1 text-destructive">
                                                    *
                                                </span>
                                            </Label>

                                            <div className="relative">
                                                <FileText className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="account-name"
                                                    className="pl-9"
                                                    value={data.name}
                                                    onChange={(event) =>
                                                        setData(
                                                            'name',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter account display name"
                                                    aria-invalid={Boolean(
                                                        errors.name,
                                                    )}
                                                />
                                            </div>

                                            <InputError message={errors.name} />

                                            <p className="text-xs text-muted-foreground">
                                                A recognizable name for account
                                                listings.
                                            </p>
                                        </div>

                                        <div className="min-w-0 space-y-2">
                                            <Label htmlFor="minimum-balance">
                                                Minimum balance
                                                <span className="ml-1 text-destructive">
                                                    *
                                                </span>
                                            </Label>

                                            <div className="relative">
                                                <CircleDollarSign className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="minimum-balance"
                                                    type="number"
                                                    min="0"
                                                    step="0.0001"
                                                    className="pl-9 tabular-nums"
                                                    value={data.minimum_balance}
                                                    onChange={(event) =>
                                                        setData(
                                                            'minimum_balance',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    aria-invalid={Boolean(
                                                        errors.minimum_balance,
                                                    )}
                                                />
                                            </div>

                                            <InputError
                                                message={errors.minimum_balance}
                                            />

                                            <p className="text-xs text-muted-foreground">
                                                Enter the required minimum
                                                balance for the account.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Product information sidebar */}
                            <aside className="min-w-0 space-y-4 rounded-xl border bg-muted/20 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                                        <Landmark className="size-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-sm font-semibold">
                                            Product information
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Selected savings scheme
                                        </p>
                                    </div>
                                </div>

                                {product ? (
                                    <div className="space-y-4">
                                        <div className="rounded-lg border bg-background p-3">
                                            <p className="text-xs text-muted-foreground">
                                                Product code
                                            </p>
                                            <p className="mt-1 text-sm font-semibold break-words">
                                                {product.code}
                                            </p>

                                            <p className="mt-3 text-xs text-muted-foreground">
                                                Product name
                                            </p>
                                            <p className="mt-1 text-sm font-medium break-words">
                                                {product.name}
                                            </p>
                                        </div>

                                        <div className="space-y-2 rounded-lg border bg-background p-3">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <CircleDollarSign className="size-4" />
                                                <span className="text-xs font-medium">
                                                    Minimum opening amount
                                                </span>
                                            </div>

                                            <p className="text-lg font-semibold tabular-nums">
                                                {minimumOpeningAmount != null
                                                    ? minimumOpeningAmount
                                                    : 'Not specified'}
                                            </p>

                                            <p className="text-xs leading-relaxed text-muted-foreground">
                                                {minimumOpeningAmount != null
                                                    ? 'Refer to this product policy when setting the minimum balance.'
                                                    : 'No minimum opening amount is specified in the product policy.'}
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                            <p className="text-xs leading-relaxed text-muted-foreground">
                                                Product selected. Review the
                                                policy before opening the
                                                account.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed bg-background/70 px-4 py-6 text-center">
                                        <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted">
                                            <FileText className="size-6 text-muted-foreground" />
                                        </div>

                                        <p className="text-sm font-medium">
                                            No product selected
                                        </p>

                                        <p className="mt-1 max-w-48 text-xs leading-relaxed text-muted-foreground">
                                            Choose a savings product to view its
                                            code and minimum opening amount.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3 border-t pt-4">
                                    <p className="text-xs font-semibold">
                                        Before you continue
                                    </p>

                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            Verify the selected customer and
                                            product.
                                        </p>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            Confirm the account display name and
                                            minimum balance.
                                        </p>
                                    </div>
                                </div>
                            </aside>
                        </div>

                        {/* Form actions */}
                        <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-2 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                disabled={processing}
                            >
                                <Link
                                    href={route(
                                        'financial-accounts.savings.index',
                                    )}
                                >
                                    <ArrowLeft className="mr-2 size-4" />
                                    Cancel
                                </Link>
                            </Button>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto"
                            >
                                {processing ? (
                                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <Landmark className="mr-2 size-4" />
                                )}

                                {processing
                                    ? 'Opening account...'
                                    : 'Open savings account'}

                                {!processing && (
                                    <ArrowRight className="ml-2 size-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
