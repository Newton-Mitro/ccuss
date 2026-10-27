export interface CostCenter {
    id: number;
    code: string;
    name: string;
    parent_id: number | null;
    status: boolean;
}

export interface CostCenterParent {
    id: number;
    code: string;
    name: string;
}

export interface Props {
    costCenter?: CostCenter;
    parents?: CostCenterParent[];
}
