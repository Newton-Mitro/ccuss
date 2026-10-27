export type Detail = {
    label: string;
    value: string | number | boolean | null | undefined;
};

export type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kind: 'ledger' | 'group';
    title: string;
    description: string;
    details: Detail[];
};
