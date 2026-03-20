import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Trash2, Users } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';
import { KycProfile } from '../../../types/customer_kyc_module';

export default function KycProfilesIndex() {
    const { props } = usePage<
        SharedData & {
            profiles: {
                data: KycProfile[];
                links: any[];
            };
            filters: Record<string, string>;
        }
    >();

    const { profiles, filters } = props;

    const { data, setData, get } = useForm({
        search: filters.search || '',
        verification_status: filters.verification_status || 'all',
        per_page: Number(filters.per_page) || 10,
        page: Number(filters.page) || 1,
    });

    // Fetch filtered data on input change
    useEffect(() => {
        const delay = setTimeout(() => {
            get('/kyc-profiles', { preserveState: true });
        }, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.verification_status, data.per_page, data.page]);

    const handleDelete = (id: number) => {
        appSwal
            .fire({
                title: 'Delete KYC profile?',
                text: 'This KYC profile will be permanently removed.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((res) => {
                if (res.isConfirmed) {
                    router.delete(`/kyc-profiles/${id}`, {
                        preserveScroll: true,
                        onSuccess: () =>
                            toast.success('KYC profile deleted successfully'),
                        onError: () =>
                            toast.error('Failed to delete KYC profile'),
                    });
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'KYC Profiles', href: '/kyc-profiles' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="KYC Profiles" />

            <div className="space-y-4 p-2">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="KYC Profiles"
                        description="Manage customer KYC profiles."
                    />
                    <Link
                        href="/kyc-profiles/create"
                        className="flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm text-primary-foreground transition hover:bg-primary/90"
                    >
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">
                            New KYC Profile
                        </span>
                    </Link>
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

                    <select
                        value={data.verification_status}
                        onChange={(e) => {
                            setData('verification_status', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm sm:max-w-xs"
                    >
                        <option value="all">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>

                {/* ================= Desktop Table ================= */}
                <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border md:block">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'ID',
                                    'Customer',
                                    'KYC Level',
                                    'Risk Level',
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
                            {profiles.data.map((i) => (
                                <tr
                                    key={i.id}
                                    className="border-b even:bg-muted/30"
                                >
                                    <td className="px-2 py-1">{i.id}</td>
                                    <td className="px-2 py-1">
                                        {i.customer?.name ?? '—'}
                                    </td>
                                    <td className="px-2 py-1">{i.kyc_level}</td>
                                    <td className="px-2 py-1">
                                        {i.risk_level}
                                    </td>
                                    <td className="px-2 py-1">
                                        {i.verification_status}
                                    </td>
                                    <td className="px-2 py-1">
                                        <TooltipProvider>
                                            <div className="flex gap-2">
                                                {/* View */}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={`/kyc-profiles/${i.id}`}
                                                            className="text-primary"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        View
                                                    </TooltipContent>
                                                </Tooltip>

                                                {/* Edit */}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={`/kyc-profiles/${i.id}/edit`}
                                                            className="text-accent"
                                                        >
                                                            ✏️
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Edit
                                                    </TooltipContent>
                                                </Tooltip>

                                                {/* Delete */}
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
                    {profiles.data.map((i) => (
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
                                        KYC Level: {i.kyc_level}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Risk Level: {i.risk_level}
                                    </p>
                                </div>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                    {i.verification_status}
                                </span>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link
                                    href={`/kyc-profiles/${i.id}`}
                                    className="text-primary"
                                >
                                    <Eye className="h-5 w-5" />
                                </Link>
                                <Link
                                    href={`/kyc-profiles/${i.id}/edit`}
                                    className="text-accent"
                                >
                                    ✏️
                                </Link>
                                <button
                                    onClick={() => handleDelete(i.id)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-end gap-1">
                    {profiles.links.map((link, i) => (
                        <a
                            key={i}
                            href={link.url || '#'}
                            className={`rounded-full px-3 py-1 text-sm ${
                                link.active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
