import { Head, Link, router } from '@inertiajs/react';
import {
    Copy,
    File,
    FileArchive,
    FileText,
    HeadphonesIcon,
    Trash2Icon,
    Tv2Icon,
    Upload,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { route } from 'ziggy-js';
import HeadingSmall from '../../components/heading-small';
import { Select } from '../../components/ui/select';
import CustomAuthLayout from '../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../types';
import { Media } from '../../types/media';
import { PaginationLink } from '../../types/pagination_link';

interface PageProps extends SharedData {
    mediaItems: {
        data: Media[];
        links: PaginationLink[];
        meta?: {
            per_page?: number;
        };
    };
    filters: {
        type?: string;
    };
}

const Index: React.FC<PageProps> = ({ mediaItems, filters }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [filter, setFilter] = useState(filters.type || 'all');
    const [perPage, setPerPage] = useState(mediaItems.meta?.per_page || 10);

    const deleteMedia = (id: number) => {
        const isDark = document.documentElement.classList.contains('dark');

        Swal.fire({
            title: 'Are you sure?',
            text: 'This media file will be permanently deleted.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('media.destroy', id), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        toast.success('Media file deleted successfully.');
                    },
                    onError: (errors) => {
                        Object.values(errors).forEach((fieldErrors: any) => {
                            if (Array.isArray(fieldErrors)) {
                                fieldErrors.forEach((msg: string) =>
                                    toast.error(msg),
                                );
                            } else {
                                toast.error(fieldErrors);
                            }
                        });
                    },
                });
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const formData = new FormData();
        // ✅ Append all selected files
        Array.from(e.target.files).forEach((file) => {
            formData.append('files[]', file);
        });

        setUploading(true);

        router.post(route('media.store'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Files uploaded successfully.'),
            onError: (errors) => {
                Object.values(errors).forEach((fieldErrors: any) => {
                    if (Array.isArray(fieldErrors)) {
                        fieldErrors.forEach((msg: string) => toast.error(msg));
                    } else {
                        toast.error(fieldErrors);
                    }
                });
            },
            onFinish: () => setUploading(false),
        });
    };

    const handleFilterChange = (value: string) => {
        setFilter(value);
        router.get(
            route('media.index'),
            { type: value },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleCopy = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('URL copied to clipboard!');
        } catch (err) {
            toast.error(err);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Media', href: '/media' },
    ];

    const renderPreview = (item: Media) => {
        const baseClasses =
            'flex h-32 w-full items-center justify-center rounded';

        if (item.file_type.startsWith('image/')) {
            return (
                <img
                    src={item.url}
                    alt={item.alt_text || 'media'}
                    className="h-32 w-full rounded object-cover"
                />
            );
        } else if (item.file_type === 'application/pdf') {
            return (
                <div className={`${baseClasses} bg-red-100 dark:bg-red-800/30`}>
                    <FileText className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
            );
        } else if (
            item.file_type.includes('word') ||
            item.file_type.includes('excel') ||
            item.file_type.includes('presentation')
        ) {
            return (
                <div
                    className={`${baseClasses} bg-blue-100 dark:bg-blue-800/30`}
                >
                    <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
            );
        } else if (
            item.file_type.includes('zip') ||
            item.file_type.includes('rar')
        ) {
            return (
                <div
                    className={`${baseClasses} bg-yellow-100 dark:bg-yellow-800/30`}
                >
                    <FileArchive className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                </div>
            );
        } else if (item.file_type.includes('audio')) {
            return (
                <div
                    className={`${baseClasses} bg-green-100 dark:bg-green-800/30`}
                >
                    <HeadphonesIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
            );
        } else if (item.file_type.includes('video')) {
            return (
                <div
                    className={`${baseClasses} bg-purple-100 dark:bg-purple-800/30`}
                >
                    <Tv2Icon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
            );
        } else {
            return (
                <div className={`${baseClasses} bg-gray-100 dark:bg-gray-800`}>
                    <File className="h-12 w-12 text-gray-600 dark:text-gray-300" />
                </div>
            );
        }
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Media Files" />
            <div>
                <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Media Files"
                        description="Manage all uploaded media files"
                    />
                </div>

                {/* Upload + Filter */}
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex cursor-pointer items-center gap-2 rounded bg-blue-700 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500">
                        <Upload className="h-4 w-4" />
                        <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            multiple // ✅ allow selecting multiple files
                            onChange={handleFileChange}
                            disabled={uploading}
                            accept="image/*,video/*,application/pdf,audio/*"
                        />
                    </label>

                    <Select
                        value={filter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            handleFilterChange(e.target.value)
                        }
                        className="w-40 rounded border bg-white px-2 text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        options={[
                            { value: 'all', label: 'All Types' },
                            { value: 'images', label: 'Images' },
                            { value: 'videos', label: 'Videos' },
                            { value: 'audio', label: 'Audio' },
                            { value: 'pdf', label: 'PDFs' },
                        ]}
                    />
                </div>

                {/* Media Grid */}
                <div className="h-[calc(100vh-320px)] space-y-8 overflow-auto rounded border p-2">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {mediaItems.data.map((item) => (
                            <div
                                key={item.id}
                                className="relative rounded border border-gray-200 bg-white p-2 hover:border-blue-500 dark:border-gray-700 dark:bg-neutral-900 dark:hover:border-blue-400"
                            >
                                <div
                                    className="cursor-pointer"
                                    onClick={() =>
                                        router.visit(
                                            route('media.show', item.id),
                                        )
                                    }
                                >
                                    {renderPreview(item)}
                                    <p className="mt-2 truncate text-center text-xs text-gray-900 dark:text-gray-100">{`ID #${item.id}`}</p>
                                    <p className="mt-1 truncate text-center text-xs text-gray-700 dark:text-gray-300">
                                        {item.file_type}
                                    </p>
                                </div>

                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button
                                        onClick={() => handleCopy(item.url)}
                                        className="flex items-center gap-1 rounded bg-gray-900 p-1 shadow hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    >
                                        <Copy className="h-3 w-3 text-white" />
                                    </button>

                                    <button
                                        onClick={() => deleteMedia(item.id)}
                                        className="flex items-center gap-1 rounded bg-red-600 p-1 shadow hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600"
                                    >
                                        <Trash2Icon className="h-3 w-3 text-white" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex flex-col items-center justify-between gap-2 md:flex-row">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Show
                        </span>
                        <select
                            value={perPage}
                            onChange={(e) => {
                                const newPerPage = Number(e.target.value);
                                setPerPage(newPerPage);
                                router.get(
                                    route('media.index'),
                                    { per_page: newPerPage, type: filter },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        >
                            {[5, 10, 20, 50, 100, 500].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-muted-foreground">
                            records
                        </span>
                    </div>
                    <div className="flex gap-1">
                        {mediaItems.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded-full px-3 py-1 text-sm transition-colors duration-150 ${
                                    link.active
                                        ? 'bg-blue-700 text-white dark:bg-blue-600 dark:text-white'
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
};

export default Index;
