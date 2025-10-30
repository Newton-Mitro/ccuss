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
    };
    filters: {
        type: string;
    };
}

const Index: React.FC<PageProps> = ({ mediaItems, filters }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [filter, setFilter] = useState(filters.type || 'all');

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
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        router.post(route('media.store'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Media uploaded successfully.'),
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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Medias', href: '/media' },
    ];

    const handleCopy = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            alert('URL copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const renderPreview = (item: Media) => {
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
                <div className="flex h-32 w-full items-center justify-center rounded bg-red-100 dark:bg-red-800/30">
                    <FileText className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
            );
        } else if (
            item.file_type.includes('word') ||
            item.file_type.includes('excel') ||
            item.file_type.includes('presentation')
        ) {
            return (
                <div className="flex h-32 w-full items-center justify-center rounded bg-blue-100 dark:bg-blue-800/30">
                    <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
            );
        } else if (
            item.file_type.includes('zip') ||
            item.file_type.includes('rar')
        ) {
            return (
                <div className="flex h-32 w-full items-center justify-center rounded bg-yellow-100 dark:bg-yellow-800/30">
                    <FileArchive className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                </div>
            );
        } else if (item.file_type.includes('audio')) {
            return (
                <div className="flex h-32 w-full items-center justify-center rounded bg-green-100 dark:bg-green-800/30">
                    <HeadphonesIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
            );
        } else if (item.file_type.includes('video')) {
            return (
                <div className="flex h-32 w-full items-center justify-center rounded bg-purple-100 dark:bg-purple-800/30">
                    <Tv2Icon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
            );
        } else {
            return (
                <div className="flex h-32 w-full items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                    <File className="h-12 w-12 text-gray-600 dark:text-gray-300" />
                </div>
            );
        }
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Media Files" />
            <div className="p-6">
                {/* Heading */}
                <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Media Files"
                        description="Manage media files"
                    />
                </div>

                {/* Upload & Filter */}
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    {/* Upload Button */}
                    <label className="flex cursor-pointer items-center gap-2 rounded bg-blue-700 px-3 py-1 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500">
                        <Upload className="h-4 w-4" />
                        <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={uploading}
                            accept="image/*,video/*,application/pdf,audio/*"
                        />
                    </label>

                    {/* Filter */}
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

                {/* Media Table */}
                <div className="h-[calc(100vh-320px)] space-y-8 overflow-auto">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {mediaItems.data.map((item) => (
                            <div
                                key={item.id}
                                className="relative rounded border border-gray-200 bg-white p-2 hover:border-blue-500 dark:border-gray-700 dark:bg-neutral-900 dark:hover:border-blue-400"
                            >
                                <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                        router.visit(
                                            route('media.show', item.id),
                                        );
                                    }}
                                >
                                    {renderPreview(item)}
                                    <p className="mt-2 truncate text-center text-xs text-gray-900 sm:text-sm dark:text-gray-100">{`ID #${item.id}`}</p>
                                    <p className="mt-1 truncate text-center text-xs text-gray-700 sm:text-sm dark:text-gray-300">
                                        {item.file_type}
                                    </p>
                                </div>

                                {/* Copy URL + Delete */}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {/* Copy Button */}
                                    <button
                                        onClick={() => handleCopy(item.url)}
                                        className="flex items-center gap-1 rounded bg-gray-900 p-1 shadow hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    >
                                        <Copy className="h-3 w-3 text-white" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => deleteMedia(item.id)}
                                        className="flex items-center gap-1 rounded bg-red-600 p-1 shadow hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600"
                                    >
                                        <span className="sr-only">Delete</span>
                                        <Trash2Icon className="h-3 w-3 text-white" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex flex-col items-center justify-between gap-2 md:flex-row">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Showing {mediaItems.data.length} results
                    </span>
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
