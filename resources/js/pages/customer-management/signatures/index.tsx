import { Head, Link, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { CustomerSearch } from '../../../components/customer-search';
import HeadingSmall from '../../../components/heading-small';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { useCustomerSignature } from './hooks/useCustomerSignature';

export default function CustomerSignatureIndex() {
    /* ----------------------------- Form ----------------------------- */
    const { data, setData } = useForm({
        id: null as number | null,
        customer_no: '',
        type: '',
        name: '',
        phone: '',
        email: '',
        identification_type: '',
        identification_number: '',
        photo: null as { url?: string } | null,
        status: '',
    });

    /* ----------------------------- State ----------------------------- */
    const [query, setQuery] = useState('');

    /* -------------------------- Signature Hook ---------------------- */
    const { signature, loading, fetchSignature } = useCustomerSignature();

    console.log('Signature:', signature);
    /* --------------------------- Breadcrumb -------------------------- */
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Signatures', href: '/customer-management/signatures' },
    ];

    /* =========================================================
     * Handlers
     * =======================================================*/
    const handleCustomerSelect = (customer: any) => {
        setData({
            id: customer.id,
            customer_no: customer.customer_no,
            type: customer.type,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            identification_type: customer.identification_type,
            identification_number: customer.identification_number,
            photo: customer.photo ?? null,
            status: customer.status,
        });

        setQuery(customer.name);

        // 🔑 Fetch signature immediately
        fetchSignature(customer.id);
    };

    /* =========================================================
     * Render
     * =======================================================*/
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Signatures" />

            <div className="space-y-6 text-foreground">
                {/* ================= Customer Search ================= */}
                <div className="space-y-4 rounded-md border bg-card/80 p-4">
                    <Label className="text-xs">Search Customer</Label>

                    <CustomerSearch
                        query={query}
                        onQueryChange={setQuery}
                        onSelect={handleCustomerSelect}
                    />

                    {/* ================= Profile Card ================= */}
                    {data.id && (
                        <div className="flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                            <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                                {data.photo?.url ? (
                                    <img
                                        src={data.photo.url}
                                        alt={data.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                        {data.name?.charAt(0) ?? '-'}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div>
                                    <p className="text-sm font-semibold">
                                        {data.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {data.type} • {data.status}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                                    <Info
                                        label="Customer No"
                                        value={data.customer_no}
                                    />
                                    <Info label="Phone" value={data.phone} />
                                    <Info label="Email" value={data.email} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ================= Header ================= */}
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Customer Signature"
                        description="Upload, verify, and manage signature for the selected customer"
                    />

                    {data.id && (
                        <Link
                            href="/customer-management/signatures/create"
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden md:inline-block">
                                Upload Signature
                            </span>
                        </Link>
                    )}
                </div>

                {/* ================= Signature Image ================= */}
                {signature && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Signature Preview
                        </h3>

                        {loading ? (
                            <p className="mt-2 text-sm text-muted-foreground">
                                Loading signature…
                            </p>
                        ) : !signature?.url ? (
                            <p className="mt-1 text-lg font-semibold">
                                No signature uploaded
                            </p>
                        ) : (
                            <img
                                src={signature.url}
                                alt={`Signature of ${signature.id}`}
                                className="mt-1"
                            />
                        )}
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}

/* =========================================================
 * Small UI helpers
 * =======================================================*/
function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-muted-foreground">{label}</span>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}
