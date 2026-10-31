import InputError from '@/components/input-error';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { Props } from '@/modules/financial-services/types/accounts/edit.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function FinancialAccountEdit() {
    useFlashToastHandler();

    const { account, product } = usePage<Props>().props;
    const { data, setData, put, processing, errors } = useForm({
        name: account.name ?? '',
    });
    const indexHref = getIndexRoute(product);
    const showHref = getShowRoute(product, account.id);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '/financial-services' },
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
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Edit account details"
                        description={`${account.account_no} · ${account.holder?.name ?? account.product?.name ?? account.account_type}`}
                    />
                </div>
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
                    <footer
                        data-slot="form-actions"
                        className="flex flex-col-reverse gap-2 border-t pt-3 sm:flex-row sm:justify-end"
                    >
                        <Button asChild type="button" variant="outline">
                            <Link href={showHref}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </footer>
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
        case 'loan':
            return route('loan-accounts.index');
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
        case 'loan':
            return route('loan-accounts.show', id);
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
        case 'loan':
            return route('loan-accounts.update', id);
    }
}
