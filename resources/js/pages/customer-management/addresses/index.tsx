import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import { CustomerSearch } from '../../../components/customer-search';
import HeadingSmall from '../../../components/heading-small';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { CustomerAddress } from '../../../types/customer';
import CustomerAddressModal from './address_modal';

export default function Index() {
    const { data, setData } = useForm({
        id: null as number | null,
        customer_no: '',
        type: '',
        name: '',
        phone: '',
        email: '',
        identification_type: '',
        identification_number: '',
        photo: null as any,
        status: '',
    });

    const [query, setQuery] = useState('');
    const [addresses, setAddresses] = useState<CustomerAddress[]>([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>(
        'create',
    );
    const [selectedAddress, setSelectedAddress] =
        useState<CustomerAddress | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer Addresses', href: '/auth/addresses' },
    ];

    /* ================= FETCH ADDRESSES ================= */
    const fetchAddresses = async (customerId: number) => {
        try {
            const res = await axios.get('/auth/api/customer-addresses', {
                params: { customer_id: customerId },
                withCredentials: true,
            });
            setAddresses(res.data || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch addresses');
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = (id: number) => {
        const isDark = document.documentElement.classList.contains('dark');

        Swal.fire({
            title: 'Are you sure?',
            text: 'This address will be permanently deleted!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/auth/addresses/${id}`, {
                        withCredentials: true,
                    });
                    toast.success('Address deleted successfully');
                    if (data.id) fetchAddresses(data.id);
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to delete address');
                }
            }
        });
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Addresses" />

            <div className="space-y-6 text-foreground">
                {/* ================= CUSTOMER SEARCH ================= */}
                <div className="space-y-4 rounded-md border border-border bg-card/80 p-4">
                    <Label className="text-xs">Search Customer</Label>
                    <CustomerSearch
                        query={query}
                        onQueryChange={setQuery}
                        onSelect={(customer) => {
                            setData({
                                id: customer.id,
                                customer_no: customer.customer_no,
                                type: customer.type,
                                name: customer.name,
                                phone: customer.phone,
                                email: customer.email,
                                identification_type:
                                    customer.identification_type,
                                identification_number:
                                    customer.identification_number,
                                photo: customer.photo ?? null,
                                status: customer.status,
                            });
                            setQuery(customer.name);

                            fetchAddresses(customer.id);
                        }}
                    />

                    {/* ================= PROFILE CARD ================= */}
                    {data.id && (
                        <div className="mt-4 flex flex-col rounded-md border bg-background/60 p-3 md:flex-row md:gap-4">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border bg-muted">
                                {data.photo ? (
                                    <img
                                        src={data.photo?.url}
                                        alt={data.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                        {data.name?.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="mt-2 flex-1 space-y-2 md:mt-0">
                                <div>
                                    <p className="text-sm font-semibold">
                                        {data.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {data.type} • {data.status}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                                    <div>
                                        <span className="text-muted-foreground">
                                            Customer No
                                        </span>
                                        <p className="font-medium">
                                            {data.customer_no}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Phone
                                        </span>
                                        <p className="font-medium">
                                            {data.phone}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Email
                                        </span>
                                        <p className="font-medium">
                                            {data.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ================= HEADER ================= */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Customer Addresses"
                        description="Manage all customer addresses"
                    />

                    <button
                        disabled={!data.id}
                        onClick={() => {
                            setModalMode('create');
                            setSelectedAddress(null);
                            setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus className="h-4 w-4" />
                        Add Address
                    </button>
                </div>

                {/* ================= RESPONSIVE TABLE / CARDS ================= */}
                {addresses.length ? (
                    <div className="grid gap-4">
                        {/* Desktop Table */}
                        <div className="hidden overflow-x-auto rounded-md border md:block">
                            <table className="w-full border-collapse">
                                <thead className="bg-muted">
                                    <tr>
                                        {[
                                            '#',
                                            'Address',
                                            'District',
                                            'Type',
                                            'Actions',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {addresses.map((a, i) => (
                                        <tr
                                            key={a.id}
                                            className="border-t even:bg-muted/30"
                                        >
                                            <td className="px-3 py-2">
                                                {i + 1}
                                            </td>
                                            <td className="px-3 py-2">
                                                {a.line1}
                                            </td>
                                            <td className="px-3 py-2">
                                                {a.district}
                                            </td>
                                            <td className="px-3 py-2">
                                                {a.type}
                                            </td>
                                            <td className="px-3 py-2">
                                                <TooltipProvider>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    onClick={() => {
                                                                        setModalMode(
                                                                            'view',
                                                                        );
                                                                        setSelectedAddress(
                                                                            {
                                                                                ...a,
                                                                            },
                                                                        );
                                                                        setModalOpen(
                                                                            true,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Eye className="h-5 w-5 text-primary" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                View
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    onClick={() => {
                                                                        setModalMode(
                                                                            'edit',
                                                                        );
                                                                        setSelectedAddress(
                                                                            {
                                                                                ...a,
                                                                            },
                                                                        );
                                                                        setModalOpen(
                                                                            true,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Pencil className="h-5 w-5 text-green-600" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Edit
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            a.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-5 w-5 text-destructive" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Delete
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TooltipProvider>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="flex flex-col gap-3 md:hidden">
                            {addresses.map((a, i) => (
                                <div
                                    key={a.id}
                                    className="rounded-md border bg-card p-3 shadow-sm"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 text-sm">
                                            <p className="font-semibold">
                                                {i + 1}. {a.line1}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {a.district} • {a.type}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() => {
                                                                setModalMode(
                                                                    'view',
                                                                );
                                                                setSelectedAddress(
                                                                    { ...a },
                                                                );
                                                                setModalOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Eye className="h-5 w-5 text-primary" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        View
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() => {
                                                                setModalMode(
                                                                    'edit',
                                                                );
                                                                setSelectedAddress(
                                                                    { ...a },
                                                                );
                                                                setModalOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Pencil className="h-5 w-5 text-green-600" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Edit
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    a.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-5 w-5 text-destructive" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Delete
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="py-6 text-center text-muted-foreground">
                        No addresses found
                    </p>
                )}

                {/* ================= MODAL ================= */}
                <CustomerAddressModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    mode={modalMode}
                    customerId={data.id!}
                    address={selectedAddress}
                    onSaved={() => {
                        if (data.id) fetchAddresses(data.id);
                        setModalOpen(false);
                    }}
                />
            </div>
        </CustomAuthLayout>
    );
}
