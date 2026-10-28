import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';

import type { FormPageProps } from '@/modules/financial-services/types/loan-protection-products/form.interfaces';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgePercent,
    Check,
    FileText,
    Info,
    Save,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { route } from 'ziggy-js';

export default function LoanProtectionProductForm() {
    const { product, can_manage: canManage } = usePage<FormPageProps>().props;
    const editing = product !== null;
    const { data, setData, post, put, processing, errors } = useForm({
        code: product?.code ?? '',
        name: product?.name ?? '',
        description: product?.description ?? '',
        monthly_rate_percent: String(product?.monthly_rate_percent ?? ''),
        status: product?.status ?? true,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Loan Protection Products',
            href: route('loan-protection-products.index'),
        },
        { title: editing ? 'Edit product' : 'New product', href: '' },
    ];

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canManage) {
            return;
        }

        if (product) {
            put(route('loan-protection-products.update', product.id));
            return;
        }

        post(route('loan-protection-products.store'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    editing
                        ? 'Edit Credit-life Product'
                        : 'New Credit-life Product'
                }
            />
            <div className="w-full max-w-none space-y-5">
                <header className="space-y-2 py-2">
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                Protection products
                            </span>
                            <span className="rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                {editing ? 'Edit product' : 'New setup'}
                            </span>
                        </div>
                        <h1 className="text-xl leading-tight font-semibold tracking-tight text-foreground">
                            {editing
                                ? 'Edit credit-life product'
                                : 'Create a credit-life product'}
                        </h1>
                        <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
                            Set the premium rate and availability for the
                            protection offered with loan applications.
                        </p>
                    </div>
                </header>

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <form
                        onSubmit={submit}
                        className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                    >
                        <section className="space-y-6 p-5 sm:p-7">
                            <div className="flex items-start gap-3 border-b pb-5">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <FileText className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-semibold tracking-tight">
                                        Product details
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Add the identifying information and
                                        pricing for this product.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="protection-code">
                                        Product code
                                    </Label>
                                    <Input
                                        id="protection-code"
                                        value={data.code}
                                        onChange={(event) =>
                                            setData('code', event.target.value)
                                        }
                                        disabled={!canManage}
                                        maxLength={60}
                                        placeholder="e.g. CLP-001"
                                        className="h-11"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        A unique reference used to identify this
                                        product.
                                    </p>
                                    <InputError message={errors.code} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="protection-name">
                                        Product name
                                    </Label>
                                    <Input
                                        id="protection-name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        disabled={!canManage}
                                        maxLength={180}
                                        placeholder="e.g. Standard Credit Life"
                                        className="h-11"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Use a clear name customers will
                                        recognize.
                                    </p>
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="protection-rate">
                                        Monthly premium rate
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="protection-rate"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={data.monthly_rate_percent}
                                            onChange={(event) =>
                                                setData(
                                                    'monthly_rate_percent',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={!canManage}
                                            placeholder="0.00"
                                            className="h-11 pr-12"
                                            required
                                        />
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-sm font-medium text-muted-foreground">
                                            %
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Enter the percentage used to calculate
                                        the monthly premium.
                                    </p>
                                    <InputError
                                        message={errors.monthly_rate_percent}
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="protection-description">
                                        Description{' '}
                                        <span className="font-normal text-muted-foreground">
                                            (optional)
                                        </span>
                                    </Label>
                                    <textarea
                                        id="protection-description"
                                        value={data.description}
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        disabled={!canManage}
                                        maxLength={2000}
                                        rows={4}
                                        placeholder="Describe the protection and any details staff should know."
                                        className="flex min-h-28 w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm shadow-xs transition outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                        <Info className="mt-0.5 size-3.5 shrink-0" />
                                        <span>
                                            This description helps staff
                                            understand when the product applies.
                                        </span>
                                    </div>
                                    <InputError message={errors.description} />
                                </div>

                                <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/30 p-4 transition hover:bg-muted/60 sm:col-span-2">
                                    <Input
                                        type="checkbox"
                                        checked={data.status}
                                        onChange={(event) =>
                                            setData(
                                                'status',
                                                event.target.checked,
                                            )
                                        }
                                        disabled={!canManage}
                                        className="mt-0.5"
                                    />
                                    <span className="space-y-1">
                                        <span className="block text-sm font-medium">
                                            Available for new loan applications
                                        </span>
                                        <span className="block text-xs leading-5 text-muted-foreground">
                                            When enabled, staff can select this
                                            product on eligible applications.
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </section>

                        <footer className="flex flex-col-reverse gap-3 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <Button asChild type="button" variant="outline">
                                <Link
                                    href={route(
                                        'loan-protection-products.index',
                                    )}
                                >
                                    <ArrowLeft className="mr-2 size-4" />
                                    Back to products
                                </Link>
                            </Button>
                            {canManage ? (
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="sm:min-w-40"
                                >
                                    <Save className="mr-2 size-4" />
                                    {processing
                                        ? 'Saving...'
                                        : editing
                                          ? 'Save changes'
                                          : 'Create product'}
                                </Button>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    You have view-only access to this product.
                                </p>
                            )}
                        </footer>
                    </form>

                    <aside className="space-y-4">
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <div className="border-b p-5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold">
                                        Product preview
                                    </h2>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Updates as you complete the form.
                                </p>
                            </div>
                            <div className="space-y-4 p-5">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <ShieldCheck className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold break-words">
                                        {data.name || 'Product name'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {data.code || 'Product code'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-3">
                                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <BadgePercent className="size-4" />
                                        Monthly rate
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {data.monthly_rate_percent || '0.00'}%
                                    </span>
                                </div>
                                <div
                                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${
                                        data.status
                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <span
                                        className={`size-1.5 rounded-full ${
                                            data.status
                                                ? 'bg-emerald-500'
                                                : 'bg-muted-foreground'
                                        }`}
                                    />
                                    {data.status
                                        ? 'Available for new applications'
                                        : 'Unavailable for new applications'}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Check className="size-4 text-primary" />
                                Before you save
                            </div>
                            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted-foreground">
                                <li>
                                    Choose a product code that is unique and
                                    easy to recognize.
                                </li>
                                <li>
                                    Confirm the rate follows your organization’s
                                    pricing policy.
                                </li>
                                <li>
                                    Only make the product available when it is
                                    ready to be offered.
                                </li>
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
