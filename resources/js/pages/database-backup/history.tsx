import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, DatabaseBackup, Download, XCircle } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

interface BackupLog {
    id: number;
    file_name: string;
    file_size: number;
    status: string;
    created_at: string;
    error?: string;
}

export default function History({ logs }: any) {
    const formatSize = (bytes: number) => {
        if (!bytes) return '-';

        const mb = bytes / 1024 / 1024;
        return mb.toFixed(2) + ' MB';
    };

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['logs'] });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

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
            </div>

            <div className="rounded-md border bg-card">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted">
                        <tr>
                            <th className="px-4 py-2 text-left">File</th>
                            <th className="px-4 py-2 text-left">Size</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-right">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {logs.data.map((log: BackupLog) => (
                            <tr key={log.id} className="border-b">
                                <td className="flex items-center gap-2 px-4 py-3">
                                    <DatabaseBackup size={16} />
                                    {log.file_name ?? 'Processing...'}
                                </td>

                                <td className="px-4 py-3">
                                    {formatSize(log.file_size)}
                                </td>

                                <td className="px-4 py-3">
                                    {log.status === 'SUCCESS' && (
                                        <span className="flex items-center gap-1 text-green-600">
                                            <CheckCircle size={16} />
                                            Success
                                        </span>
                                    )}

                                    {log.status === 'FAILED' && (
                                        <span className="flex items-center gap-1 text-red-600">
                                            <XCircle size={16} />
                                            Failed
                                        </span>
                                    )}

                                    {log.status === 'RUNNING' && (
                                        <span className="text-yellow-600">
                                            Running
                                        </span>
                                    )}
                                </td>

                                <td className="px-4 py-3">
                                    {new Date(log.created_at).toLocaleString()}
                                </td>

                                <td className="px-4 py-3 text-right">
                                    {log.status === 'SUCCESS' && (
                                        <Link
                                            href={route(
                                                'backup.download',
                                                log.id,
                                            )}
                                        >
                                            <Button size="sm">
                                                <Download size={16} />
                                                Download
                                            </Button>
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {logs.data.length === 0 && (
                    <div className="p-6 text-center text-muted-foreground">
                        No backups available.
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
