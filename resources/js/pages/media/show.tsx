import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../components/heading-small';
import { Button } from '../../components/ui/button';
import AppLayout from '../../layouts/app-layout';
import { BreadcrumbItem } from '../../types';
import { Media } from '../../types/media';

interface ShowProps {
    media: Media;
}

export default function Show({ media }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Medias', href: route('media.index') },
        { title: media.alt_text || 'View Media', href: '' },
    ];

    const renderMediaPreview = () => {
        const [mainType, subType] = media.file_type.split('/');

        if (mainType === 'image') {
            return (
                <img
                    src={media.url}
                    alt={media.alt_text || 'Preview'}
                    className="h-96 rounded"
                />
            );
        } else if (mainType === 'video') {
            return (
                <video controls className="h-96 rounded">
                    <source src={media.url} type={media.file_type} />
                    Your browser does not support the video tag.
                </video>
            );
        } else if (mainType === 'audio') {
            return (
                <audio controls className="w-full">
                    <source src={media.url} type={media.file_type} />
                    Your browser does not support the audio element.
                </audio>
            );
        } else if (mainType === 'application' && subType === 'pdf') {
            return (
                <iframe
                    src={media.url}
                    title="PDF Preview"
                    className="h-[600px] w-full rounded border"
                />
            );
        } else {
            return (
                <div className="flex flex-col gap-2">
                    <a
                        href={media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        Open document
                    </a>
                    <Button asChild>
                        <a href={media.url} download>
                            Download
                        </a>
                    </Button>
                </div>
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Media: ${media.alt_text || media.file_type}`} />
            <div className="h-[calc(100vh-100px)] space-y-8 overflow-auto p-6 md:w-4xl">
                {/* Header */}
                <HeadingSmall
                    title={media.alt_text || 'Media Details'}
                    description="Media file details and preview"
                />

                <div className="space-y-6">
                    {/* Preview */}
                    <div className="">
                        <p className="mb-1 text-sm font-medium text-muted-foreground">
                            Preview
                        </p>
                        {renderMediaPreview()}
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            ID
                        </p>
                        <p>{media.id}</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            File Type
                        </p>
                        <p>{media.file_type}</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Alt Text
                        </p>
                        <p>{media.alt_text || '—'}</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            URL
                        </p>
                        <p className="break-all">{media.url}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
