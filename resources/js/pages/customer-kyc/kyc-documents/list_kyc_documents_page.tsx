import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { Badge } from '../../../lib/statusConfig';
import { BreadcrumbItem, SharedData } from '../../../types';
import { KycDocument } from '../../../types/customer_kyc_module';

export default function KycDocumentsIndex() {
    const { props } = usePage<
        SharedData & {
            documents: {
                data: KycDocument[];
                links: any[];
            };
            filters: Record<string, string>;
        }
    >();

    const { documents, filters } = props;

    const { data, setData, get } = useForm({
        search: filters.search || '',
        document_type: filters.document_type || 'all',
        verification_status: filters.verification_status || 'all',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('kyc-documents.index'), { preserveState: true });
        }, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.document_type, data.verification_status, data.page]);

    const handleDelete = (id: number) => {
        appSwal
            .fire({
                title: 'Delete document?',
                text: 'This document will be permanently removed.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((res) => {
                if (res.isConfirmed) {
                    router.delete(route('kyc-documents.destroy', id), {
                        preserveScroll: true,
                        onSuccess: () =>
                            toast.success('Document deleted successfully'),
                        onError: () => toast.error('Failed to delete document'),
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'KYC Documents', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="KYC Documents" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="KYC Documents"
                        description="Manage customer verification documents."
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search customer…"
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm"
                    />

                    <div className="flex gap-2">
                        <select
                            value={data.document_type}
                            onChange={(e) => {
                                setData('document_type', e.target.value);
                                setData('page', 1);
                            }}
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                        >
                            <option value="all">All Types</option>
                            <option>nid</option>
                            <option>nid</option>
                            <option>passport</option>
                            <option>driving_license</option>
                            <option>utility_bill</option>
                        </select>

                        <select
                            value={data.verification_status}
                            onChange={(e) => {
                                setData('verification_status', e.target.value);
                                setData('page', 1);
                            }}
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option>pending</option>
                            <option>verified</option>
                            <option>rejected</option>
                        </select>
                    </div>
                </div>

                {/* ================= Desktop Table ================= */}
                <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border md:block">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'ID',
                                    'Customer',
                                    'Document Type',
                                    'Status',
                                    'Actions',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="border-b p-2 text-left text-sm text-muted-foreground"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {documents.data.map((i) => (
                                <tr
                                    key={i.id}
                                    className="border-b even:bg-muted/30"
                                >
                                    <td className="px-2 py-1">{i.id}</td>
                                    <td className="px-2 py-1">
                                        {i.customer?.name ?? '—'}
                                    </td>
                                    <td className="px-2 py-1">
                                        {i.document_type}
                                    </td>
                                    <td className="px-2 py-1">
                                        <Badge text={i.verification_status} />
                                    </td>
                                    <td className="px-2 py-1">
                                        <TooltipProvider>
                                            <div className="flex gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={route(
                                                                'kyc-documents.show',
                                                                i.id,
                                                            )}
                                                            className="text-info"
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
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    i.id,
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
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ================= Mobile Cards ================= */}
                <div className="space-y-3 md:hidden">
                    {documents.data.map((i) => (
                        <div
                            key={i.id}
                            className="space-y-2 rounded-md border bg-card p-3"
                        >
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-medium">
                                        {i.customer?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {i.document_type}
                                    </p>
                                </div>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                    <Badge text={i.verification_status} />
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <a
                                    href={i.file_path}
                                    target="_blank"
                                    className="text-sm text-primary underline"
                                >
                                    View File
                                </a>

                                <div className="flex gap-4">
                                    <Link
                                        href={route('kyc-documents.show', i.id)}
                                        className="text-info"
                                    >
                                        <Eye className="h-5 w-5" />
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(i.id)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <DataTablePagination
                    perPage={data.per_page}
                    onPerPageChange={function (value: number): void {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={documents.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
