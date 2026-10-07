import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Props extends SharedData {
    products: Array<{
        id: number;
        code: string;
        name: string;
    }>;
    customers: Array<{ id: number; customer_no: string; name: string }>;
}

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
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('financial-accounts.share.store'));
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Share Accounts',
            href: route('financial-accounts.share.index'),
        },
        { title: 'Register membership', href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Register share membership" />
            <div className="max-w-3xl space-y-4">
                <ResourcePageHeader
                    title="Register share membership"
                    description="Open a share account and record the member identity and membership lifecycle."
                />
                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border bg-card p-5"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Share product</Label>
                            <Select
                                value={data.financial_product_id}
                                onChange={(value) => {
                                    setData('financial_product_id', value);
                                    const selected = products.find(
                                        (item) => String(item.id) === value,
                                    );
                                }}
                                options={[
                                    { value: '', label: 'Select product' },
                                    ...products.map((item) => ({
                                        value: String(item.id),
                                        label: `${item.code} - ${item.name}`,
                                    })),
                                ]}
                            />
                            <InputError message={errors.financial_product_id} />
                        </div>
                        <div>
                            <Label>Member</Label>
                            <Select
                                value={data.holder_id}
                                onChange={(value) =>
                                    setData('holder_id', value)
                                }
                                options={[
                                    { value: '', label: 'Select customer' },
                                    ...customers.map((item) => ({
                                        value: String(item.id),
                                        label: `${item.customer_no} - ${item.name}`,
                                    })),
                                ]}
                            />
                            <InputError message={errors.holder_id} />
                        </div>
                        <div>
                            <Label>Display name</Label>
                            <Input
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Membership number</Label>
                            <Input
                                value={data.membership_no}
                                onChange={(event) =>
                                    setData('membership_no', event.target.value)
                                }
                                placeholder="Generated if blank"
                            />
                            <InputError message={errors.membership_no} />
                        </div>
                        <div>
                            <Label>Member since</Label>
                            <AppDatePicker
                                value={data.member_since}
                                onChange={(value) =>
                                    setData('member_since', value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Membership status</Label>
                            <Select
                                value={data.membership_status}
                                onChange={(value) =>
                                    setData('membership_status', value)
                                }
                                options={['PENDING', 'ACTIVE', 'SUSPENDED'].map(
                                    (value) => ({ value, label: value }),
                                )}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route('financial-accounts.share.index')}
                            >
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Register membership
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
