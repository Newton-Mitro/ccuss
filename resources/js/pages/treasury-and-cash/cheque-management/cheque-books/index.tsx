import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../../components/heading-small';
import CustomAuthLayout from '../../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../../types';

export default function ChequeBooksIndexPage() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cheque Management', href: route('cheque-books.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Cheque Books" />
            <div className="space-y-4 rounded-md border bg-card p-6">
                <HeadingSmall
                    title="Cheque Books"
                    description="Manage cheque books and issued cheque records."
                />

                <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                    This module is now attached to the Treasury cheque route and
                    is ready for the cheque-book list workflow.
                </div>
            </div>
        </CustomAuthLayout>
    );
}
