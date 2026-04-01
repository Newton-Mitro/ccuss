import { Link } from '@inertiajs/react';
import React from 'react';
import { Select } from './ui/select';

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    perPage: number;
    onPerPageChange: (value: number) => void;
    links: LinkItem[];
    perPageOptions?: number[];
}
const recordPerPage = [
    {
        value: -1,
        label: 'All',
    },
    {
        value: 10,
        label: 10,
    },
    {
        value: 25,
        label: 25,
    },
    {
        value: 50,
        label: 50,
    },
    {
        value: 100,
        label: 100,
    },
    {
        value: 200,
        label: 200,
    },
    {
        value: 500,
        label: 500,
    },
    {
        value: 1000,
        label: 1000,
    },
];

const DataTablePagination: React.FC<Props> = ({
    perPage,
    onPerPageChange,
    links,
    perPageOptions = recordPerPage,
}) => {
    return (
        <div className="flex items-center justify-between">
            {/* Per Page Selector */}
            <div className="w-24">
                <Select
                    value={perPage.toString()}
                    onChange={(value) => onPerPageChange(Number(value))}
                    options={perPageOptions.map((n) => ({
                        value: n.value.toString(),
                        label: n.label.toString(),
                    }))}
                />
            </div>

            {/* Pagination Links */}
            <div className="flex gap-1">
                {links.map((link, i) => (
                    <Link
                        key={i}
                        href={link.url || '#'}
                        preserveScroll
                        className={`rounded px-3 py-1 text-sm ${
                            link.active
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
};

export default DataTablePagination;
