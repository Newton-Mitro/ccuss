import type { ReactNode } from 'react';

export type RepeatableSectionProps = {
    title: string;
    description?: string;
    count: number;
    addLabel: string;
    onAdd: () => void;
    children: ReactNode;
};
