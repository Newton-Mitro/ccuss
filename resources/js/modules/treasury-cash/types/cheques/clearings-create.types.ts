export type Props = {
    cheques: {
        id: number;
        cheque_no: string;
        amount: string | number;
    }[];
    branches: {
        id: number;
        code: string;
        name: string;
    }[];
    default_branch_id?: number | null;
};
