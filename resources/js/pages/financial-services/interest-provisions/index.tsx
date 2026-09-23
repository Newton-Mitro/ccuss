import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Provision = {
    id: number;
    period_start: string;
    period_end: string;
    basis_amount: string | number;
    annual_rate: string | number;
    provisioned_amount: string | number;
    status: string;
    financial_account?: { account_no?: string; name?: string };
    product?: { code?: string; name?: string };
};
type Props = { provisions: { data: Provision[] } };

export default function InterestProvisionsIndex() {
    const { provisions } = usePage<Props>().props;
    const { data, setData, post, processing } = useForm({
        period_start: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
        )
            .toISOString()
            .slice(0, 10),
        period_end: new Date().toISOString().slice(0, 10),
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Interest Provisions',
            href: route('interest-provisions.index'),
        },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Interest Provisions" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Interest Provisions"
                    description="Calculate, review, approve, and reject account interest provisions."
                />
                <section className="rounded-lg border bg-card p-4">
                    <form
                        className="flex flex-wrap items-end gap-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(route('interest-provisions.calculate'));
                        }}
                    >
                        <div>
                            <Label>Period start</Label>
                            <Input
                                type="date"
                                value={data.period_start}
                                onChange={(event) =>
                                    setData('period_start', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Period end</Label>
                            <Input
                                type="date"
                                value={data.period_end}
                                onChange={(event) =>
                                    setData('period_end', event.target.value)
                                }
                            />
                        </div>
                        <Button type="submit" disabled={processing}>
                            Calculate provisions
                        </Button>
                    </form>
                </section>
                <section className="rounded-lg border bg-card">
                    <div className="divide-y">
                        {provisions.data.map((provision) => (
                            <div
                                key={provision.id}
                                className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
                            >
                                <div>
                                    <p className="font-medium">
                                        {provision.financial_account
                                            ?.account_no ?? '-'}{' '}
                                        · {provision.product?.code ?? '-'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {provision.period_start} to{' '}
                                        {provision.period_end} · Basis{' '}
                                        {provision.basis_amount} · Rate{' '}
                                        {provision.annual_rate}% · Amount{' '}
                                        {provision.provisioned_amount}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge
                                        tone={
                                            provision.status === 'APPROVED'
                                                ? 'success'
                                                : 'neutral'
                                        }
                                    >
                                        {provision.status}
                                    </StatusBadge>
                                    {provision.status === 'CALCULATED' && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    router.post(
                                                        route(
                                                            'interest-provisions.approve',
                                                            provision.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    router.post(
                                                        route(
                                                            'interest-provisions.reject',
                                                            provision.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
