import type { ReactNode } from 'react';

export type RepeatableRowProps = {
    index: number;
    title: string;
    children: ReactNode;
    onRemove: () => void;
    columns?: string;
};
