import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Props extends SharedData {
    product: 'savings' | 'share' | 'fixed' | 'recurring';
    account: {
        id: number;
        account_no: string;
        name?: string | null;
        account_type: string;
        holder?: { name?: string } | null;
        product?: { name?: string } | null;
    };
}

export default function FinancialAccountEdit() {
    const { account, product } = usePage<Props>().props;
    const { data, setData, put, processing, errors } = useForm({
        name: account.name ?? '',
    });
    const indexHref = getIndexRoute(product);
    const showHref = getShowRoute(product, account.id);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: `${account.account_type.replaceAll('_', ' ')} Accounts`,
            href: indexHref,
        },
        { title: account.account_no, href: showHref },
        { title: 'Edit details', href: '' },
    ];

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        put(getUpdateRoute(product, account.id));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${account.account_no}`} />
            <div className="max-w-2xl space-y-4">
                <ResourcePageHeader
                    title="Edit account details"
                    description={`${account.account_no} · ${account.holder?.name ?? account.product?.name ?? account.account_type}`}
                />
                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-lg border bg-card p-4"
                >
                    <div>
                        <Label htmlFor="account-name">
                            Account display name
                        </Label>
                        <Input
                            id="account-name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            maxLength={200}
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <Label>Account number</Label>
                            <Input value={account.account_no} readOnly />
                        </div>
                        <div>
                            <Label>Account type</Label>
                            <Input
                                value={account.account_type.replaceAll(
                                    '_',
                                    ' ',
                                )}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-3">
                        <Button asChild type="button" variant="outline">
                            <Link href={showHref}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

function getIndexRoute(product: Props['product']): string {
    switch (product) {
        case 'savings':
            return route('financial-accounts.savings.index');
        case 'share':
            return route('financial-accounts.share.index');
        case 'fixed':
            return route('financial-accounts.fixed.index');
        case 'recurring':
            return route('financial-accounts.recurring.index');
    }
}

function getShowRoute(product: Props['product'], id: number): string {
    switch (product) {
        case 'savings':
            return route('financial-accounts.savings.show', id);
        case 'share':
            return route('financial-accounts.share.show', id);
        case 'fixed':
            return route('financial-accounts.fixed.show', id);
        case 'recurring':
            return route('financial-accounts.recurring.show', id);
    }
}

function getUpdateRoute(product: Props['product'], id: number): string {
    switch (product) {
        case 'savings':
            return route('financial-accounts.savings.update', id);
        case 'share':
            return route('financial-accounts.share.update', id);
        case 'fixed':
            return route('financial-accounts.fixed.update', id);
        case 'recurring':
            return route('financial-accounts.recurring.update', id);
    }
}
