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

export interface CostCenter {
    id: number;
    parent_id?: number | null;
    code: string;
    name: string;
    level: number;
    status: boolean;
    parent?: { code: string; name: string } | null;
}

interface CostCenterDetailsDialogProps {
    costCenter: CostCenter | null;
    onOpenChange: (open: boolean) => void;
}

export function CostCenterDetailsDialog({
    costCenter,
    onOpenChange,
}: CostCenterDetailsDialogProps) {
    const details = [
        { label: 'Code', value: costCenter?.code },
        {
            label: 'Parent',
            value: costCenter?.parent
                ? `${costCenter.parent.code} - ${costCenter.parent.name}`
                : 'Top-level cost center',
        },
        { label: 'Hierarchy level', value: costCenter?.level },
    ];

    return (
        <Dialog
            open={costCenter !== null}
            onOpenChange={(open) => {
                if (!open) onOpenChange(false);
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                <DialogHeader className="rounded-lg border bg-linear-to-br from-emerald-500/10 via-background to-teal-500/10 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                Cost center
                            </p>
                            <DialogTitle className="text-2xl">
                                {costCenter?.name}
                            </DialogTitle>
                            <DialogDescription>
                                Organization unit and hierarchy details.
                            </DialogDescription>
                        </div>
                        {costCenter && (
                            <StatusBadge
                                tone={costCenter.status ? 'success' : 'danger'}
                            >
                                {costCenter.status ? 'Active' : 'Inactive'}
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
                                {detail.value ?? '—'}
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
