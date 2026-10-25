import { StatusBadge } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export interface Party {
    id: number;
    code: string;
    name: string;
    party_type: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    status: boolean;
}

interface PartyDetailsDialogProps {
    party: Party | null;
    onOpenChange: (open: boolean) => void;
}

export function PartyDetailsDialog({
    party,
    onOpenChange,
}: PartyDetailsDialogProps) {
    const details = [
        { label: 'Party code', value: party?.code },
        {
            label: 'Party type',
            value: party?.party_type.replaceAll('_', ' '),
        },
        { label: 'Phone', value: party?.phone },
        { label: 'Email', value: party?.email },
        { label: 'Address', value: party?.address },
    ];

    return (
        <Dialog
            open={party !== null}
            onOpenChange={(open) => {
                if (!open) onOpenChange(false);
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                <DialogHeader className="rounded-lg border bg-linear-to-br from-sky-500/10 via-background to-indigo-500/10 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                Accounting party
                            </p>
                            <DialogTitle className="text-2xl">
                                {party?.name}
                            </DialogTitle>
                            <DialogDescription>
                                Party profile and contact information.
                            </DialogDescription>
                        </div>
                        {party && (
                            <StatusBadge
                                tone={party.status ? 'success' : 'danger'}
                            >
                                {party.status ? 'Active' : 'Inactive'}
                            </StatusBadge>
                        )}
                    </div>
                </DialogHeader>
                <div className="grid gap-3 sm:grid-cols-2">
                    {details.map((detail) => (
                        <div
                            key={detail.label}
                            className="min-w-0 rounded-lg border bg-card p-3"
                        >
                            <p className="text-xs font-medium text-muted-foreground">
                                {detail.label}
                            </p>
                            <p className="mt-1 text-sm font-medium wrap-break-word">
                                {detail.value || '—'}
                            </p>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
