import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import type { LoanProtectionProduct } from '@/types/financial-services';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { route } from 'ziggy-js';

interface FormPageProps extends SharedData {
    product: LoanProtectionProduct | null;
}

export default function LoanProtectionProductForm() {
    const { product } = usePage<FormPageProps>().props;
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
            <div className="max-w-3xl space-y-4">
                <ResourcePageHeader
                    title={
                        editing
                            ? 'Edit credit-life product'
                            : 'New credit-life product'
                    }
                    description="Set the monthly premium rate and availability for loan applications."
                />

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-md border bg-card p-4 sm:p-6"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
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
                                maxLength={60}
                                required
                            />
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
                                maxLength={180}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="protection-rate">
                                Monthly premium rate (%)
                            </Label>
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
                                required
                            />
                            <InputError message={errors.monthly_rate_percent} />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="protection-description">
                                Description
                            </Label>
                            <textarea
                                id="protection-description"
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                                maxLength={2000}
                                rows={4}
                                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <label className="flex items-center gap-2 text-sm sm:col-span-2">
                            <Input
                                type="checkbox"
                                checked={data.status}
                                onChange={(event) =>
                                    setData('status', event.target.checked)
                                }
                            />
                            Available for new loan applications
                        </label>
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-between">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route('loan-protection-products.index')}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to products
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing
                                ? 'Saving...'
                                : editing
                                  ? 'Save changes'
                                  : 'Create product'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
