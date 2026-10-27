import type { Branch } from '@/modules/branch-operations/types/branch';

export interface BranchFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branch?: Branch | null;
}

export interface BranchDetailsDialogProps {
    branch: Branch | null;
    onOpenChange: (open: boolean) => void;
}
