import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { route } from 'ziggy-js';

export default function OpeningBalancesIndex() {
    const { fiscalPeriods } = usePage().props as any;
    useFlashToastHandler();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Opening Balances', href: route('opening-balances.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Opening Balances" />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Opening Balances"
                        description="Post opening balances into an open fiscal period."
                    />
                    <Link href={route('opening-balances.create')}>
                        <Button size="sm">
                            <Plus className="mr-1 h-4 w-4" /> Apply balances
                        </Button>
                    </Link>
                </div>
                <div className="rounded-md border bg-card p-5">
                    <h2 className="font-medium">Available fiscal periods</h2>
                    <div className="mt-3 divide-y">
                        {fiscalPeriods.length === 0 && (
                            <p className="py-3 text-sm text-muted-foreground">
                                No fiscal periods found.
                            </p>
                        )}
                        {fiscalPeriods.map((period: any) => (
                            <div
                                key={period.id}
                                className="flex justify-between py-3 text-sm"
                            >
                                <span>{period.name}</span>
                                <span className="text-muted-foreground">
                                    {period.fiscal_year?.name ?? ''} ·{' '}
                                    {period.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
