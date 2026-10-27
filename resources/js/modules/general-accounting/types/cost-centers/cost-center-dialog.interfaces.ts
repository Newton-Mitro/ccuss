export interface CostCenter {
    id: number;
    parent_id?: number | null;
    code: string;
    name: string;
    level: number;
    status: boolean;
    parent?: { code: string; name: string } | null;
}

export interface CostCenterDetailsDialogProps {
    costCenter: CostCenter | null;
    onOpenChange: (open: boolean) => void;
}
