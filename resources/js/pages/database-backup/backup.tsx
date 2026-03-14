import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, DatabaseBackup, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';

const Backup = ({ backUrl = '/dashboard' }: { backUrl?: string }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const handleBack = () => {
        router.visit(backUrl, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const runBackup = async () => {
        setLoading(true);
        setMessage(null);
        setFileUrl(null);

        try {
            const response = await axios.post(
                route('database.backup.run'),
                {},
                {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        Accept: 'application/json',
                    },
                },
            );

            const data = response.data;

            if (data.success) {
                setMessage(data.message);
                setFileUrl(data.file);
                toast.success(data.message);
            } else {
                const msg =
                    data.message + (data.error ? ': ' + data.error : '');
                setMessage(msg);
                toast.error(msg);
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err.message ||
                'Backup failed';

            setMessage(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'System', href: '#' },
        { title: 'Database Backup', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Database Backup" />

            {/* Header */}
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Database Backup"
                    description="Generate a full system database backup."
                />

                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/90"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back</span>
                </button>
            </div>

            {/* Backup Card */}
            <div className="w-full rounded-md border border-border bg-card p-6 lg:w-xl">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Generate a full backup of the system database. Once the
                        process completes, you can download the backup file.
                    </p>

                    <Button
                        onClick={runBackup}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Running Backup...
                            </>
                        ) : (
                            <>
                                <DatabaseBackup />
                                Run Database Backup
                            </>
                        )}
                    </Button>

                    {/* Result */}
                    {message && (
                        <div className="rounded-md border bg-muted p-4 text-sm">
                            <p>{message}</p>

                            {fileUrl && (
                                <a
                                    href={fileUrl}
                                    download
                                    className="mt-2 flex items-center gap-2 text-primary underline"
                                >
                                    <Download size={16} />
                                    Download Backup
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </CustomAuthLayout>
    );
};

export default Backup;
