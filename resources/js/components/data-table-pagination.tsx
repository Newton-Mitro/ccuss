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

const DataTablePagination: React.FC<Props> = ({
    perPage,
    onPerPageChange,
    links,
    perPageOptions = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000],
}) => {
    return (
        <div className="flex items-center justify-between">
            {/* Per Page Selector */}
            <div className="w-24">
                <Select
                    value={perPage.toString()}
                    onChange={(value) => onPerPageChange(Number(value))}
                    options={perPageOptions.map((n) => ({
                        value: n.toString(),
                        label: n.toString(),
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
