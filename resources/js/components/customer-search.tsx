import axios from 'axios';
import { Search } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Customer } from '../types/customer';
import InputError from './input-error';

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
    const [loading, setLoading] = useState(false);

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    /**
     * -----------------------
     * API SEARCH
     * -----------------------
     */
    const searchCustomers = async () => {
        if (!query?.trim()) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get('/auth/api/search-customers', {
                params: { search: query },
            });

            setResults(res.data || []);
            setShowDropdown(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * -----------------------
     * ENTER KEY HANDLER
     * -----------------------
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchCustomers();
        }
    };

    /**
     * -----------------------
     * OUTSIDE CLICK
     * -----------------------
     */
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
            {/* INPUT + SEARCH BUTTON */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="h-8 w-full rounded-md border border-border bg-background px-3 pr-10 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />

                <button
                    type="button"
                    onClick={searchCustomers}
                    className="absolute top-1/2 right-1 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-primary"
                    title="Search"
                >
                    {loading ? (
                        <span className="animate-spin text-xs">⏳</span>
                    ) : (
                        <Search size={14} />
                    )}
                </button>
            </div>

            <InputError message={error} />

            {/* RESULTS */}
            {showDropdown && results.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
                    {results.map((customer) => (
                        <li
                            key={customer.id}
                            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
                                onSelect(customer);
                                onQueryChange(customer.name);
                                setShowDropdown(false);
                            }}
                        >
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

            {/* EMPTY STATE */}
            {showDropdown && !loading && query && results.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-gray-500">
                    No customers found.
                </div>
            )}
        </div>
    );
};
