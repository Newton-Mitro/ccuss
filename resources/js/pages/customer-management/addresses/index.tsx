import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, useForm } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { CustomerSearch } from '../../../components/customer-search';
import HeadingSmall from '../../../components/heading-small';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { CustomerAddress } from '../../../types/customer';

import { ModalMode } from '../../../types/base_types';
import CustomerAddressModal from './address_modal';
import { useCustomerAddresses } from './hooks/useCustomerAddresses';
import { confirmDelete } from './utils/confirmDelete';

/* =========================================================
 * Component
 * =======================================================*/
export default function CustomerAddressIndex() {
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [selectedAddress, setSelectedAddress] =
        useState<CustomerAddress | null>(null);

    /* ----------------------------- Data ------------------------------ */
    const { addresses, loading, fetchAddresses, deleteAddress } =
        useCustomerAddresses();

    /* --------------------------- Breadcrumb -------------------------- */
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer Addresses', href: '/auth/addresses' },
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
        fetchAddresses(customer.id);
    };

    const handleDelete = async (addressId: number) => {
        const result = await confirmDelete();
        if (!result.isConfirmed || !data.id) return;

        try {
            await deleteAddress(addressId);
            toast.success('Address deleted successfully');
            fetchAddresses(data.id);
        } catch {
            toast.error('Failed to delete address');
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedAddress(null);
        setIsModalOpen(true);
    };

    const openViewModal = (address: CustomerAddress) => {
        setModalMode('view');
        setSelectedAddress(address);
        setIsModalOpen(true);
    };

    const openEditModal = (address: CustomerAddress) => {
        setModalMode('edit');
        setSelectedAddress(address);
        setIsModalOpen(true);
    };

    /* =========================================================
     * Render
     * =======================================================*/
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Addresses" />

            <div className="space-y-6 text-foreground">
                {/* ================= Customer Search ================= */}
                <div className="min-h-56 space-y-4 rounded-md border bg-card/80 p-4">
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
                                        {data.name.charAt(0)}
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
                        title="Customer Addresses"
                        description="Manage all customer addresses"
                    />

                    <button
                        disabled={!data.id}
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
                    >
                        <Plus className="h-4 w-4" />
                        Add Address
                    </button>
                </div>

                {/* ================= Address List ================= */}
                {addresses.length ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {addresses.map((address, index) => (
                            <div
                                key={address.id}
                                className="rounded-md border bg-card p-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 text-sm">
                                        <p className="font-semibold">
                                            {index + 1}. {address.line1},{' '}
                                            {address.line2} – {address.district}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {address.type} |{' '}
                                            {address.verification_status}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {address.division},{' '}
                                            {address.upazila},{' '}
                                            {address.union_ward},{' '}
                                            {address.postal_code},{' '}
                                            {address.country}
                                        </p>
                                    </div>

                                    <TooltipProvider>
                                        <div className="flex gap-2">
                                            <Action
                                                label="View"
                                                onClick={() =>
                                                    openViewModal(address)
                                                }
                                            >
                                                <Eye className="h-5 w-5 text-primary" />
                                            </Action>

                                            <Action
                                                label="Edit"
                                                onClick={() =>
                                                    openEditModal(address)
                                                }
                                            >
                                                <Pencil className="h-5 w-5 text-green-600" />
                                            </Action>

                                            <Action
                                                label="Delete"
                                                onClick={() =>
                                                    handleDelete(address.id)
                                                }
                                            >
                                                <Trash2 className="h-5 w-5 text-destructive" />
                                            </Action>
                                        </div>
                                    </TooltipProvider>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="py-6 text-center text-muted-foreground">
                        {loading ? 'Loading addresses…' : 'No addresses found'}
                    </p>
                )}

                {/* ================= Modal ================= */}
                {data.id && (
                    <CustomerAddressModal
                        open={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        mode={modalMode}
                        customerId={data.id}
                        address={selectedAddress}
                        onSaved={() => {
                            fetchAddresses(data.id);
                            setIsModalOpen(false);
                        }}
                    />
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
            <p className="font-medium">{value}</p>
        </div>
    );
}

function Action({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button onClick={onClick}>{children}</button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}
