import { cn } from '@/lib/utils';
import { ResourcePageHeader } from './resource-page-shell';

export default function HeadingSmall({
    title,
    description,
    className,
}: {
    title: string;
    description?: string;
    className?: string;
}) {
    return (
        <ResourcePageHeader
            title={title}
            description={description}
            className={cn('space-y-1', className)}
        />
    );
}
