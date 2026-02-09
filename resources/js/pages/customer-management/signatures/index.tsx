import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import { CustomerSearch } from '../../../components/customer-search';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { useCustomerSignature } from './hooks/useCustomerSignature';
import UploadSignatureModal from './signature_modal';

export default function CustomerSignatureIndex() {
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

    const [query, setQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { signature, loading, fetchSignature } = useCustomerSignature();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Signatures', href: '/customer-management/signatures' },
    ];

    /* ================= Customer Select ================= */
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
        fetchSignature(customer.id);
    };

    /* ================= Modal ================= */
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleSignatureUploaded = () => {
        if (!data.id) return;
        fetchSignature(data.id);
        closeModal();
    };

    /* ================= Delete ================= */
    const handleDelete = async (id: number) => {
        const isDark = document.documentElement.classList.contains('dark');

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This signature will be permanently deleted!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: 'Yes, delete it!',
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`/auth/api/customer/signature/${id}`);
            toast.success('Signature deleted successfully!');
            if (data.id) fetchSignature(data.id);
        } catch {
            toast.error('Failed to delete the signature.');
        }
    };

    /* ================= Render ================= */
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
                        <Button
                            onClick={openModal}
                            disabled={signature ? true : false}
                            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden md:inline-block">
                                Upload Signature
                            </span>
                        </Button>
                    )}
                </div>

                {/* ================= Signature Preview ================= */}
                {signature && (
                    <div className="relative inline-block">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Signature Preview
                        </h3>

                        {loading ? (
                            <p className="mt-2 text-sm text-muted-foreground">
                                Loading signature…
                            </p>
                        ) : !signature.url ? (
                            <p className="mt-1 text-lg font-semibold">
                                No signature uploaded
                            </p>
                        ) : (
                            <div className="relative mt-1 inline-block">
                                <img
                                    src={signature.url}
                                    alt="Customer signature"
                                    className="rounded border border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleDelete(signature.id)}
                                    className="absolute -top-2 -right-2 rounded-full bg-red-600 p-3 text-white shadow hover:bg-red-700"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ================= Modal ================= */}
                {data.id && isModalOpen && (
                    <UploadSignatureModal
                        open={isModalOpen}
                        customerId={data.id}
                        onClose={closeModal}
                        onUploaded={handleSignatureUploaded}
                    />
                )}
            </div>
        </CustomAuthLayout>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-muted-foreground">{label}</span>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}
