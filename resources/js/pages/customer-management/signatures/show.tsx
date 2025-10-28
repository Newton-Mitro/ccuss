import { Head } from '@inertiajs/react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface Customer {
    id: number;
    name: string;
    customer_no?: string;
}

interface Signature {
    id: number;
    customer: Customer;
    signature_path: string;
    created_at: string;
    updated_at: string;
}

interface ViewSignatureProps {
    signature: Signature;
}

export default function View({ signature }: ViewSignatureProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Signatures', href: '/auth/signatures' },
        { title: 'View Signature', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="View Signature" />

            <div className="animate-in space-y-8 px-4 py-6 text-foreground fade-in">
                <HeadingSmall
                    title="View Signature"
                    description={`Signature of ${signature.customer.name}`}
                />

                <div className="space-y-6 rounded-xl border border-border bg-card/80 p-6 shadow-md backdrop-blur-sm">
                    {/* Customer Info */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Customer
                        </h3>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                            {signature.customer.name} (
                            {signature.customer.customer_no || '-'})
                        </p>
                    </div>

                    {/* Signature Image */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Signature
                        </h3>
                        <img
                            src={signature.signature_path}
                            alt={`Signature of ${signature.customer.name}`}
                            className="mt-2 max-h-48 w-auto rounded border border-border"
                        />
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground md:grid-cols-2">
                        <div>
                            <span className="font-medium">Created At: </span>
                            {new Date(signature.created_at).toLocaleString()}
                        </div>
                        <div>
                            <span className="font-medium">Updated At: </span>
                            {new Date(signature.updated_at).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
