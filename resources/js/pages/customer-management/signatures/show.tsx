import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Edit2 } from 'lucide-react';
import HeadingSmall from '../../../components/heading-small';
import ImageZoom from '../../../components/image-zoom';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { SignatureWithDetails } from '../../../types/signature';

interface ViewSignatureProps {
    signature: SignatureWithDetails;
}

export default function View({ signature }: ViewSignatureProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Signatures', href: '/auth/signatures' },
        { title: 'View Signature', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="View Signature" />

            <div className="animate-in space-y-8 text-foreground fade-in">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="View Signature"
                        description={`Signature of ${signature.customer.name}`}
                    />

                    <div className="flex gap-2">
                        {/* Back Button */}
                        <button
                            type="button"
                            onClick={() => router.get('/auth/signatures')}
                            className="flex items-center gap-1 rounded bg-gray-200 px-3 py-1 text-gray-700 transition hover:bg-gray-300"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>

                        {/* Edit Button */}
                        <button
                            type="button"
                            onClick={() =>
                                router.get(
                                    `/auth/signatures/${signature.id}/edit`,
                                )
                            }
                            className="flex items-center gap-1 rounded bg-primary px-3 py-1 text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Edit2 size={16} />
                            Edit
                        </button>
                    </div>
                </div>

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
                        {!signature?.signature?.url ? (
                            <p className="mt-1 text-lg font-semibold text-foreground">
                                No signature uploaded
                            </p>
                        ) : (
                            <ImageZoom
                                src={signature.signature.url}
                                alt={`Signature of ${signature.customer.name}`}
                                maxHeight="300px"
                                maxWidth="400px"
                            />
                        )}
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
