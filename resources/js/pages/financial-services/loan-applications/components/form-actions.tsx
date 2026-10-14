import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Check, LoaderCircle } from 'lucide-react';

type Props = { cancelHref: string; processing: boolean; isEditing: boolean };

export default function FormActions({ cancelHref, processing, isEditing }: Props) {
    return (
        <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <div className="mx-auto flex max-w-5xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="hidden text-xs text-muted-foreground md:block">
                    Review the details before saving this application.
                </p>
                <div className="flex justify-end gap-2">
                    <Button asChild type="button" variant="outline">
                        <Link href={cancelHref}><ArrowLeft className="mr-1.5 size-4" /> Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing} className="min-w-32">
                        {processing ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Check className="mr-2 size-4" />}
                        {processing ? 'Saving…' : isEditing ? 'Save changes' : 'Save draft'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
