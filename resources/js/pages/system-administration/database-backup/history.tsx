import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    DatabaseBackup,
    Hourglass,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { appSwal } from '../../../lib/appSwal';

interface BackupLog {
    id: number;
    file_name: string;
    file_size: number;
    backup_type: 'full' | 'database_only' | 'files_only';
    status: 'running' | 'success' | 'failed';
    started_at: string;
    completed_at?: string;
    duration_seconds?: number;
    message?: string;
    error?: string;
}

interface BackupPageProps {
    logs: {
        data: BackupLog[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string; per_page?: number; page?: number };
}

export default function History() {
    const { logs, filters, flash } = usePage().props as BackupPageProps & {
        flash?: { success?: string; error?: string };
    };

    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: filters.per_page || 10,
        page: filters.page || 1,
    });

    // Auto-refresh every minute
    useEffect(() => {
        const interval = setInterval(() => {
            get(route('backup.history'), { preserveState: true });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Flash messages
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Auto-search
    useEffect(() => {
        const delay = setTimeout(() => {
            get(route('backup.history'), { preserveState: true });
        }, 400);
        return () => clearTimeout(delay);
    }, [data.search, data.per_page, data.page]);

    const formatSize = (bytes?: number) =>
        bytes ? (bytes / 1024 / 1024).toFixed(2) + ' MB' : '-';

    // Trigger backup
    const createBackup = () => {
        router.post(route('backup.run'), {}, { preserveState: true });
    };

    // Delete backup
    const handleDelete = (log: BackupLog) => {
        appSwal
            .fire({
                title: 'Are you sure?',
                text: `Backup "${log.file_name}" will be permanently deleted!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.delete(route('backup.destroy', log.id), {
                        preserveState: true,
                    });
                }
            });
    };

    return (
        <CustomAuthLayout
            breadcrumbs={[
                { title: 'System', href: '#' },
                { title: 'Database Backups', href: '' },
            ]}
        >
            <Head title="Database Backup History" />

            <div className="flex items-center justify-between pb-4">
                <HeadingSmall
                    title="Database Backup History"
                    description="All generated system backups."
                />
                <button
                    onClick={createBackup}
                    className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <DatabaseBackup className="h-4 w-4" /> Create Backup Now
                </button>
            </div>

            <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search backups..."
                        value={data.search}
                        onChange={(e) => {
                            setData('search', e.target.value);
                            setData('page', 1);
                        }}
                        className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                </div>

                {/* Table */}
                <div className="hidden h-[calc(100vh-320px)] overflow-auto rounded-md border md:block">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted">
                            <tr>
                                {[
                                    'File',
                                    'Size',
                                    'Type',
                                    'Status',
                                    'Started',
                                    'Completed',
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
                            {logs.data.length > 0 ? (
                                logs.data.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="border-b even:bg-muted/30"
                                    >
                                        <td className="flex items-center gap-2 px-2 py-1">
                                            <DatabaseBackup size={16} />
                                            {log.file_name ?? 'Processing...'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {formatSize(log.file_size)}
                                        </td>
                                        <td className="px-2 py-1">
                                            {log.backup_type}
                                        </td>
                                        <td className="px-2 py-1">
                                            {log.status === 'success' && (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle size={16} />{' '}
                                                    Success
                                                </span>
                                            )}
                                            {log.status === 'failed' && (
                                                <span className="flex items-center gap-1 text-red-600">
                                                    <XCircle size={16} /> Failed
                                                </span>
                                            )}
                                            {log.status === 'running' && (
                                                <span className="flex items-center gap-1 text-yellow-600">
                                                    <Hourglass size={16} />{' '}
                                                    Running
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1">
                                            {new Date(
                                                log.started_at,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-2 py-1">
                                            {log.completed_at
                                                ? new Date(
                                                      log.completed_at,
                                                  ).toLocaleString()
                                                : '-'}
                                        </td>

                                        <td className="px-2 py-1">
                                            <TooltipProvider>
                                                <div className="flex gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        log,
                                                                    )
                                                                }
                                                                className="text-destructive hover:text-destructive/80"
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
                                        colSpan={8}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        No backups available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Show
                        </span>
                        <select
                            value={data.per_page}
                            onChange={(e) => {
                                setData('per_page', Number(e.target.value));
                                setData('page', 1);
                            }}
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                        >
                            {[5, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-1 overflow-x-auto">
                        {logs.links.map((link: any, i: number) => (
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
            </div>
        </CustomAuthLayout>
    );
}
