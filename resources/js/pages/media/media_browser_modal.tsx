import { router } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import {
    Copy,
    File,
    FileArchive,
    FileText,
    HeadphonesIcon,
    Trash2Icon,
    Tv2Icon,
    Upload,
    X,
} from 'lucide-react';

import { route } from 'ziggy-js';
import HeadingSmall from '../../components/heading-small';
import { Select } from '../../components/ui/select';
import { Media } from '../../types/media';

interface MediaBrowserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (media: Media) => void;
}

const MediaBrowserModal: React.FC<MediaBrowserModalProps> = ({
    isOpen,
    onClose,
    onSelect,
}) => {
    const [filter, setFilter] = useState<string>('all');
    const [perPage, setPerPage] = useState<number>(20);
    const [uploading, setUploading] = useState(false);
    const [media, setMedia] = useState<any>({
        data: [],
        links: [],
    });
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Fetch media from backend
    const fetchMedia = async (
        type = filter,
        pageUrl?: string,
        perPageValue = perPage,
    ) => {
        try {
            const baseUrl = `/auth/api/media?type=${type}&per_page=${perPageValue}`;
            const url = pageUrl || baseUrl;
            const res = await axios.get(url);
            setMedia(res.data);
        } catch (err) {
            console.error('Failed to fetch media:', err);
        }
    };

    useEffect(() => {
        if (isOpen) fetchMedia();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) fetchMedia(filter, undefined, perPage);
    }, [perPage]);

    if (!isOpen) return null;

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
                        fetchMedia(); // refresh after delete
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const files = Array.from(e.target.files);
        const formData = new FormData();

        // ✅ Append multiple files
        files.forEach((file) => formData.append('files[]', file));

        setUploading(true);

        try {
            const token = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const res = await axios.post('/auth/media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': token || '',
                },
                withCredentials: true,
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) /
                            (progressEvent.total || 1),
                    );
                    toast.loading(`Uploading... ${percent}%`, {
                        id: 'upload-progress',
                    });
                },
            });

            toast.dismiss('upload-progress');

            if (![200, 201].includes(res.status)) {
                throw new Error('Upload failed');
            }

            await fetchMedia();
            toast.success(`${files.length} file(s) uploaded successfully!`);
        } catch (err) {
            console.error('Upload error:', err);
            toast.dismiss('upload-progress');
            toast.error('Upload failed — please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // ✅ reset file input
        }
    };

    const handleCopy = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('URL copied to clipboard!');
        } catch (err) {
            console.error('Copy failed:', err);
            toast.error('Failed to copy URL.');
        }
    };

    const handleFilterChange = (value: string) => {
        setFilter(value);
        fetchMedia(value);
    };

    const handlePageClick = (url: string) => {
        if (!url) return;
        fetchMedia(filter, url);
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
        }
        if (item.file_type === 'application/pdf') {
            return (
                <div className="flex h-32 w-full items-center justify-center rounded bg-red-100 dark:bg-red-800/30">
                    <FileText className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
            );
        }
        if (
            item.file_type.includes('word') ||
            item.file_type.includes('excel') ||
            item.file_type.includes('presentation')
        ) {
            return (
                <div className="flex h-32 w-full items-center justify-center rounded bg-blue-100 dark:bg-blue-800/30">
                    <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
            );
        }
        if (item.file_type.includes('zip') || item.file_type.includes('rar')) {
            return (
                <div className="flex h-32 w-full items-center justify-center rounded bg-yellow-100 dark:bg-yellow-800/30">
                    <FileArchive className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                </div>
            );
        }
        if (item.file_type.includes('audio')) {
            return (
                <div className="flex h-32 w-full items-center justify-center rounded bg-green-100 dark:bg-green-800/30">
                    <HeadphonesIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
            );
        }
        if (item.file_type.includes('video')) {
            return (
                <div className="flex h-32 w-full items-center justify-center rounded bg-purple-100 dark:bg-purple-800/30">
                    <Tv2Icon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
            );
        }
        return (
            <div className="flex h-32 w-full items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                <File className="h-12 w-12 text-gray-600 dark:text-gray-300" />
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm">
            <div className="flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border bg-background shadow-lg md:h-[70vh] md:w-3/4 dark:bg-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                    <HeadingSmall title="Media Browser" />
                    <button
                        onClick={onClose}
                        className="text-gray-600 transition-colors duration-150 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Upload & Filter */}
                <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-2 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
                    <label className="flex cursor-pointer items-center gap-2 rounded bg-blue-700 px-3 py-1 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500">
                        <Upload className="h-4 w-4" />
                        <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*,video/*,application/pdf,audio/*"
                            ref={fileInputRef}
                            multiple // ✅ allow multiple file selection
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>

                    <Select
                        value={filter}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="w-64 rounded border px-2 text-sm dark:bg-gray-800 dark:text-gray-100"
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
                <div className="flex-1 overflow-y-auto p-3 md:p-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {media.data.map((item: Media) => (
                            <div
                                key={item.id}
                                className="relative rounded border border-gray-200 bg-white p-2 hover:border-blue-500 dark:border-gray-700 dark:bg-neutral-900 dark:hover:border-blue-400"
                            >
                                <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                >
                                    {renderPreview(item)}
                                    <p className="mt-2 truncate text-center text-xs text-gray-900 sm:text-sm dark:text-gray-100">{`ID #${item.id}`}</p>
                                    <p className="mt-1 truncate text-center text-xs text-gray-700 sm:text-sm dark:text-gray-300">
                                        {item.file_type}
                                    </p>
                                </div>

                                {/* Copy URL / Delete */}
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
                <div className="flex flex-col items-center justify-between gap-2 border-t border-gray-200 px-2 py-3 md:flex-row md:px-4 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                            Show
                        </span>
                        <select
                            value={perPage}
                            onChange={(e) => setPerPage(Number(e.target.value))}
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                        >
                            {[5, 10, 20, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                        <span className="text-gray-600 dark:text-gray-300">
                            records
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1">
                        {media.links.map((link: any, i: number) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                className={`rounded px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm ${
                                    link.active
                                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                } disabled:opacity-50`}
                                onClick={() => handlePageClick(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaBrowserModal;
