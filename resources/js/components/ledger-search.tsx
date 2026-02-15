import { Input } from '@/components/ui/input'; // <-- using your component
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import InputError from './input-error';

interface LedgerItem {
    id: number;
    name: string;
    code?: string;
    full_display?: string;
}

interface LedgerSearchProps {
    query: string;
    onQueryChange: (value: string) => void;
    onSelect: (ledger: LedgerItem) => void;
    api?: string;
    error?: string;
    placeholder?: string;
}

export const LedgerSearch: React.FC<LedgerSearchProps> = ({
    query,
    onQueryChange,
    onSelect,
    api = '/api/search-ledger',
    error,
    placeholder = 'Search ledger...',
}) => {
    const [results, setResults] = useState<LedgerItem[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Debounced fetch
    useEffect(() => {
        if (!query?.trim()) {
            queueMicrotask(() => {
                setResults([]);
                setShowDropdown(false);
            });
            return;
        }

        const timeout = setTimeout(() => {
            axios
                .get(api, { params: { search: query } })
                .then((res) => {
                    setResults(res.data || []);
                    setShowDropdown(true);
                })
                .catch(console.error);
        }, 300);

        return () => clearTimeout(timeout);
    }, [query, api]);

    // Outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Modern shadcn Input */}
            <Input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={placeholder}
                className="mt-1 h-9"
            />

            <InputError message={error} />

            {showDropdown && results.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
                    {results.map((ledger) => (
                        <li
                            key={ledger.id}
                            className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
                                onSelect(ledger);
                                onQueryChange(ledger.name);
                                setShowDropdown(false);
                            }}
                        >
                            {ledger.code && (
                                <span className="font-mono text-xs text-gray-500">
                                    {ledger.name}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {showDropdown && query && results.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-gray-500">
                    No ledger matches found.
                </div>
            )}
        </div>
    );
};
