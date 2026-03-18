import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Media } from '@/types/media';
import { FolderOpen, Trash2 } from 'lucide-react';
import * as React from 'react';
import InputError from './input-error';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface MediaSelectorProps {
    media?: Media | null;
    onSelect: () => void;
    onRemove?: () => void;
    label?: string;
    className?: string;
    error?: string;
}

const MediaSelector: React.FC<MediaSelectorProps> = ({ media, onSelect, onRemove, label = 'Media', className = 'grid gap-2 w-48', error }) => {
    const renderPreview = () => {
        if (!media) {
            return (
                <div className="flex w-48 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
                    <p className="p-4 text-sm text-gray-400 dark:text-gray-300">No media selected</p>
                </div>
            );
        }

        // Defensive fallback
        const fileType = media.file_type || '';
        const [mainType] = fileType.split('/');

        // Default placeholder if no type is found
        if (!fileType) {
            return (
                <div className="flex w-48 flex-col items-center justify-center rounded border bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-400">Unknown file type</p>
                    <a href={media.url} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs text-blue-600 underline dark:text-blue-400">
                        View File
                    </a>
                </div>
            );
        }

        if (mainType === 'image') {
            return <img src={media.url} alt={media.alt_text || 'Selected image'} className="w-48 rounded object-cover" />;
        }

        if (mainType === 'video') {
            return (
                <video controls className="w-48 rounded bg-black object-cover">
                    <source src={media.url} type={fileType} />
                    Your browser does not support the video tag.
                </video>
            );
        }

        if (mainType === 'audio') {
            return (
                <div className="flex w-48 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                    <audio controls className="w-full">
                        <source src={media.url} type={fileType} />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            );
        }

        return (
            <div className="flex w-48 flex-col items-center justify-center rounded border bg-gray-50 dark:bg-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-300">{fileType}</span>
                <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs text-blue-600 underline sm:text-sm dark:text-blue-400"
                >
                    View File
                </a>
            </div>
        );
    };

    return (
        <div className={className}>
            <Label>{label}</Label>
            {renderPreview()}

            <div className="flex gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                onClick={onSelect}
                                variant="outline"
                                className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                                <FolderOpen className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Browse Media</TooltipContent>
                    </Tooltip>

                    {media && onRemove && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    onClick={onRemove}
                                    variant="outline"
                                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove Media</TooltipContent>
                        </Tooltip>
                    )}
                </TooltipProvider>
            </div>

            {error && <InputError message={error} />}
        </div>
    );
};

export { MediaSelector };
