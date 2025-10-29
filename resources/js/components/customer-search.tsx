import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import InputError from './input-error';

interface Customer {
    id: number;
    name: string;
    customer_no?: string;
    photo_url?: string | null;
}

interface CustomerSearchProps {
    query: string;
    onQueryChange: (value: string) => void;
    onSelect: (customer: Customer) => void;
    error?: string;
    placeholder?: string;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({
    query,
    onQueryChange,
    onSelect,
    error,
    placeholder = 'Search customer...',
}) => {
    const [results, setResults] = useState<Customer[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Fetch customers when query changes (debounced)
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
                .get('/auth/api/search-customers', {
                    params: { search: query },
                })
                .then((res) => {
                    setResults(res.data || []);
                    setShowDropdown(true);
                })
                .catch(console.error);
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    // Close dropdown on outside click
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
            <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={placeholder}
                className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
            />
            <InputError message={error} />

            {showDropdown && results.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
                    {results.map((customer) => (
                        <li
                            key={customer.id}
                            className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
                                onSelect(customer);
                                onQueryChange(customer.name);
                                setShowDropdown(false);
                            }}
                        >
                            {customer.photo_url && (
                                <img
                                    src={customer.photo_url}
                                    alt={customer.name}
                                    className="h-6 w-6 rounded-full object-cover"
                                />
                            )}
                            <span>{customer.name}</span>
                            {customer.customer_no && (
                                <span className="ml-auto text-xs text-gray-500">
                                    ({customer.customer_no})
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {showDropdown && query && results.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-gray-500">
                    No customers found.
                </div>
            )}
        </div>
    );
};
