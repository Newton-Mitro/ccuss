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
    links?: LinkItem[];
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    onPageChange?: (value: number) => void;
    onNext?: () => void;
    onPrevious?: () => void;
    perPageOptions?: { value: number; label: number | string }[];
}

const recordPerPage = [
    {
        value: 999999999,
        label: 'All',
    },
    {
        value: 10,
        label: 10,
    },
    {
        value: 18,
        label: 18,
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
    links = [],
    currentPage,
    totalPages,
    onPageChange,
    onNext,
    onPrevious,
    perPageOptions = recordPerPage,
}) => {
    const usesNumericPagination =
        links.length === 0 &&
        currentPage !== undefined &&
        totalPages !== undefined;

    return (
        <div className="flex items-center justify-between">
            {/* Per Page Selector */}
            <div className="w-32">
                <Select
                    className="bg-card"
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
                {usesNumericPagination ? (
                    <>
                        <button
                            type="button"
                            onClick={onPrevious}
                            disabled={currentPage <= 1}
                            className="rounded bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80 disabled:pointer-events-none disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {Array.from(
                            { length: totalPages },
                            (_, index) => index + 1,
                        ).map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => onPageChange?.(page)}
                                className={`rounded px-3 py-1 text-sm ${
                                    page === currentPage
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={onNext}
                            disabled={currentPage >= totalPages}
                            className="rounded bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80 disabled:pointer-events-none disabled:opacity-50"
                        >
                            Next
                        </button>
                    </>
                ) : (
                    links.map((link, i) => (
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
                    ))
                )}
            </div>
        </div>
    );
};

export default DataTablePagination;
