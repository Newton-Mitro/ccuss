import { router } from '@inertiajs/react';
import {
    Copy,
    File,
    FileArchive,
    FileText,
    HeadphonesIcon,
    Tv2Icon,
    Upload,
    X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../components/heading-small';
import { Select } from '../../components/ui/select';
import { Media } from '../../types/media';
import { PaginatedData } from '../../types/paginated_data';

interface MediaBrowserModalProps {
    actionType: 'create' | 'edit' | 'company' | 'select';
    isOpen: boolean;
    onClose: () => void;
    media: PaginatedData<Media>;
    onSelect: (media: Media) => void;
}

const MediaBrowserModal: React.FC<MediaBrowserModalProps> = ({
    actionType,
    isOpen,
    onClose,
    media,
    onSelect,
}) => {
    const [filter, setFilter] = useState<string>('all');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        router.post(route('media.store'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setUploading(false),
        });
    };

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm">
            <div className="flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border bg-background shadow-lg md:h-[70vh] md:w-3/4 dark:bg-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                    <HeadingSmall
                        title="Media Browser"
                        description="Select media from the library"
                    />
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
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>

                    <Select
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            router.get(
                                `${actionType}`,
                                { type: e.target.value },
                                { preserveScroll: true, preserveState: true },
                            );
                        }}
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
                        {media.data.map((item) => (
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

                                {/* Copy URL */}
                                <button
                                    onClick={() => handleCopy(item.url)}
                                    className="absolute top-2 right-2 flex items-center gap-1 rounded bg-gray-900 p-1 shadow hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                                >
                                    <Copy className="h-3 w-3 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-gray-200 px-2 py-2 md:px-4 dark:border-gray-700">
                    {media.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            className={`rounded px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm ${
                                link.active
                                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                            } disabled:opacity-50`}
                            onClick={() => {
                                if (!link.url) return;
                                if (link.url)
                                    router.get(
                                        link.url,
                                        {},
                                        {
                                            preserveScroll: true,
                                            preserveState: true,
                                        },
                                    );
                            }}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MediaBrowserModal;
