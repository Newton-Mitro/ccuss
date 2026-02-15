import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Customer } from '../../../types/customer';
import { CustomerSearchBox } from '../customers/customer-search-box';
import { useCustomerSignature } from './hooks/useCustomerSignature';
import UploadSignatureModal from './signature_modal';

export default function CustomerSignatureIndex() {
    const { data, setData } = useForm<Customer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { signature, loading, fetchSignature } = useCustomerSignature();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Signatures', href: '/customer-mgmt/signatures' },
    ];

    /* ================= Customer Select ================= */
    const handleCustomerSelect = (customer: Customer) => {
        setData(customer);
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
            await axios.delete(`/api/customer/signature/${id}`);
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
                <CustomerSearchBox onSelect={handleCustomerSelect} />

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
