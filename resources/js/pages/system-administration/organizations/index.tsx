import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    Check,
    Eye,
    Pencil,
    Plus,
    SwitchCamera,
} from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import DataTablePagination from '../../../components/data-table-pagination';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Organization } from '../../../types/organization';

export default function Index() {
    const { props } = usePage<
        SharedData & {
            organizations: {
                data: Organization[];
                links: { url: string | null; label: string; active: boolean }[];
                current_page: number;
                per_page: number;
            };
            filters: Record<string, string | number>;
        }
    >();

    const { organizations, filters } = props;

    useFlashToastHandler();

    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: Number(filters.per_page) || 18,
        page: Number(filters.page) || 1,
    });

    useEffect(() => {
        const handleSearch = () => {
            get('/organizations', {
                preserveState: true,
                replace: true,
            });
        };

        const delay = setTimeout(handleSearch, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page, get]);

    const handleSwitchOrganization = (organization: Organization) => {
        if (props.organization.activeId === organization.id) {
            return;
        }

        appSwal
            .fire({
                title: 'Switch organization?',
                text: `Switch your active workspace to "${organization.name}"?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, switch',
                cancelButtonText: 'Cancel',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.post(
                        route('organizations.select.store'),
                        { organization_id: organization.id },
                        { preserveScroll: true },
                    );
                }
            });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'System Administration', href: '' },
        { title: 'Organizations', href: route('organizations.index') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Organizations" />
            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Organizations"
                        description="Choose the workspace you want to use, or create a new organization."
                    />
                    <Button asChild>
                        <Link href={route('organizations.create')}>
                            <Plus className="h-4 w-4" />
                            Create organization
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                    <Building2 className="h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Active organization
                        </p>
                        <p className="truncate font-medium">
                            {props.organization.active?.name ||
                                'No organization selected'}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-60">
                        <Input
                            className="bg-card"
                            type="text"
                            placeholder="Search by name, code, email, or phone..."
                            value={data.search}
                            onChange={(e) => {
                                setData('search', e.target.value);
                                setData('page', 1);
                            }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border bg-card md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted text-sm text-muted-foreground">
                            <tr>
                                {[
                                    '#',
                                    'Code',
                                    'Name',
                                    'Email',
                                    'Phone',
                                    'Actions',
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="border-b p-2 text-left text-sm font-medium text-muted-foreground"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.data.length > 0 ? (
                                organizations.data.map((organization, i) => (
                                    <tr
                                        key={organization.id}
                                        className="border-b transition-colors even:bg-muted hover:bg-accent/20"
                                    >
                                        <td className="px-2 py-1">
                                            {(organizations.current_page - 1) *
                                                organizations.per_page +
                                                i +
                                                1}
                                        </td>
                                        <td className="px-2 py-1 font-medium">
                                            {organization.code}
                                        </td>
                                        <td className="px-2 py-1">
                                            {organization.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {organization.email || '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {organization.phone || '-'}
                                        </td>
                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex items-center gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant={
                                                                    props
                                                                        .organization
                                                                        .activeId ===
                                                                    organization.id
                                                                        ? 'secondary'
                                                                        : 'ghost'
                                                                }
                                                                onClick={() =>
                                                                    handleSwitchOrganization(
                                                                        organization,
                                                                    )
                                                                }
                                                                aria-label={
                                                                    props
                                                                        .organization
                                                                        .activeId ===
                                                                    organization.id
                                                                        ? 'Active organization'
                                                                        : 'Switch organization'
                                                                }
                                                            >
                                                                {props
                                                                    .organization
                                                                    .activeId ===
                                                                organization.id ? (
                                                                    <Check className="h-4 w-4" />
                                                                ) : (
                                                                    <SwitchCamera className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {props.organization
                                                                .activeId ===
                                                            organization.id
                                                                ? 'Active organization'
                                                                : 'Switch organization'}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                asChild
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                            >
                                                                <Link
                                                                    href={`/organizations/${organization.id}`}
                                                                    aria-label="View organization"
                                                                >
                                                                    <Eye className="h-4 w-4 text-info" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                asChild
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                            >
                                                                <Link
                                                                    href={`/organizations/${organization.id}/edit`}
                                                                    aria-label="Edit organization"
                                                                >
                                                                    <Pencil className="h-4 w-4 text-success" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Edit
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
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        <Building2 className="mx-auto h-8 w-8 text-primary/60" />
                                        <p className="mt-2">
                                            No organizations found.
                                        </p>
                                        <Button
                                            asChild
                                            size="sm"
                                            className="mt-4"
                                        >
                                            <Link
                                                href={route(
                                                    'organizations.create',
                                                )}
                                            >
                                                <Plus className="h-4 w-4" />
                                                Create organization
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <DataTablePagination
                    perPage={data.per_page}
                    onPerPageChange={function (value: number): void {
                        setData('per_page', value);
                        setData('page', 1);
                    }}
                    links={organizations.links}
                />
            </div>
        </CustomAuthLayout>
    );
}
