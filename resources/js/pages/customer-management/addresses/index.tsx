import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { CustomerSearch } from '../../../components/customer-search';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';

export default function Index() {
    const { props } = usePage<
        SharedData & {
            addresses: {
                data: any[];
                links: {
                    url: string | null;
                    label: string;
                    active: boolean;
                }[];
            };
        }
    >();

    const { addresses } = props;
    const [query, setQuery] = useState('');

    const { data, setData } = useForm({
        id: 0,
        customer_no: '',
        type: '',
        name: '',
        phone: '',
        email: '',
        identification_type: '',
        identification_number: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Addresses', href: '/auth/addresses' },
    ];

    const handleDelete = (id: number, name: string) => {
        const isDark = document.documentElement.classList.contains('dark');

        Swal.fire({
            title: 'Are you sure?',
            text: `Address of "${name}" will be permanently deleted!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/auth/addresses/${id}`, {
                    preserveScroll: true,
                    onSuccess: () =>
                        toast.success('Address deleted successfully'),
                });
            }
        });
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Addresses" />

            <div className="space-y-6 text-foreground">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Customer Addresses"
                        description="Manage all customer addresses"
                    />

                    <Link
                        href="/auth/addresses/create"
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Add Address
                    </Link>
                </div>

                {/* Filters */}
                <form className="space-y-5 rounded-md border border-border bg-card/80 p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
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
                                    });
                                    setQuery(customer.name);
                                }}
                            />
                        </div>

                        {[
                            ['Customer No', data.customer_no],
                            ['Type', data.type],
                            ['Name', data.name],
                            ['Phone', data.phone],
                            ['Email', data.email],
                            ['Identification Type', data.identification_type],
                            [
                                'Identification Number',
                                data.identification_number,
                            ],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <Label className="text-xs">{label}</Label>
                                <Input
                                    value={value}
                                    disabled
                                    className="h-8 text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </form>

                {/* ================= TABLE (Desktop) ================= */}
                <div className="hidden overflow-x-auto rounded-md border border-border md:block">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                {[
                                    '#',
                                    'Customer No',
                                    'Name',
                                    'Address',
                                    'District',
                                    'Type',
                                    'Actions',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-3 py-2 text-left text-sm font-medium text-muted-foreground"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {addresses.data.length > 0 ? (
                                addresses.data.map((a, i) => (
                                    <tr
                                        key={a.id}
                                        className="border-t even:bg-muted/30"
                                    >
                                        <td className="px-3 py-2">{i + 1}</td>
                                        <td className="px-3 py-2 font-medium">
                                            {a.customer?.customer_no}
                                        </td>
                                        <td className="px-3 py-2 font-medium">
                                            {a.customer?.name}
                                        </td>
                                        <td className="px-3 py-2">{a.line1}</td>
                                        <td className="hidden px-3 py-2 lg:table-cell">
                                            {a.district}
                                        </td>
                                        <td className="hidden px-3 py-2 xl:table-cell">
                                            {a.type}
                                        </td>
                                        <td className="px-3 py-2">
                                            <TooltipProvider>
                                                <div className="flex gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/auth/addresses/${a.id}`}
                                                                className="text-primary"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/auth/addresses/${a.id}/edit`}
                                                                className="text-green-600"
                                                            >
                                                                <Pencil className="h-5 w-5" />
                                                            </Link>
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
                                                                        a
                                                                            .customer
                                                                            ?.name ||
                                                                            '',
                                                                    )
                                                                }
                                                                className="text-destructive"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
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
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-6 text-center text-muted-foreground"
                                    >
                                        No addresses found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ================= MOBILE CARDS ================= */}
                <div className="space-y-3 md:hidden">
                    {addresses.data.map((a) => (
                        <div
                            key={a.id}
                            className="space-y-3 rounded-md border border-border bg-card p-4"
                        >
                            <div className="flex justify-between">
                                <div className="font-medium">
                                    {a.customer?.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    #{a.customer?.customer_no}
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                {a.line1}
                            </div>

                            <div className="text-xs text-muted-foreground">
                                {a.district} • {a.type}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Link
                                    href={`/auth/addresses/${a.id}`}
                                    className="text-primary"
                                >
                                    <Eye className="h-5 w-5" />
                                </Link>

                                <Link
                                    href={`/auth/addresses/${a.id}/edit`}
                                    className="text-green-600"
                                >
                                    <Pencil className="h-5 w-5" />
                                </Link>

                                <button
                                    onClick={() =>
                                        handleDelete(
                                            a.id,
                                            a.customer?.name || '',
                                        )
                                    }
                                    className="text-destructive"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
