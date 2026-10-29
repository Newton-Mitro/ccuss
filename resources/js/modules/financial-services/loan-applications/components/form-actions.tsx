import { Button } from '@/components/ui/button';
import type { Props } from '@/modules/financial-services/types/loan-applications/components/form-actions.types';
import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    LoaderCircle,
    Save,
    ShieldCheck,
} from 'lucide-react';

export default function FormActions({
    cancelHref,
    processing,
    isEditing,
}: Props) {
    return (
        <div className="mt-0 w-full border-t bg-background/95 px-4 py-3 sm:px-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Save guidance */}
                <div className="hidden items-center gap-3 sm:flex">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <ShieldCheck className="size-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                            Ready to save?
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Review the details before submitting.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                    <Button
                        asChild
                        type="button"
                        variant="outline"
                        disabled={processing}
                        className="w-full gap-2 sm:w-auto"
                    >
                        <Link href={cancelHref}>
                            <ArrowLeft className="size-4" />
                            Cancel
                        </Link>
                    </Button>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full min-w-36 gap-2 shadow-sm transition-all sm:w-auto"
                    >
                        {processing ? (
                            <>
                                <LoaderCircle className="size-4 animate-spin" />
                                Saving application…
                            </>
                        ) : isEditing ? (
                            <>
                                <Check className="size-4" />
                                Save changes
                            </>
                        ) : (
                            <>
                                <Save className="size-4" />
                                Save draft
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
