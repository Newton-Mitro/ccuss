import axios from 'axios';
import { Search } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Label } from '../../../components/ui/label';
import { Customer } from '../../../types/customer';

interface CustomerSearchInputProps {
    onSelect: (customer: Customer) => void;
    label?: string;
    placeholder?: string; // <-- new prop
}

export const CustomerSearchInput: React.FC<CustomerSearchInputProps> = ({
    onSelect,
    label,
    placeholder = 'Search customer...', // default placeholder
}) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const searchCustomers = async () => {
        if (!query?.trim()) {
            setCustomers([]);
            setShowDropdown(false);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get('/api/search-customers', {
                params: { search: query },
            });

            setCustomers(res.data || []);
            setShowDropdown(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchCustomers();
        }
    };

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
            {label && <Label className="text-xs">{label}</Label>}

            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder} // <-- set placeholder
                    className="h-8 w-full rounded-md border border-border bg-background px-3 pr-10 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />

                <button
                    type="button"
                    onClick={searchCustomers}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-primary"
                    title="Search"
                >
                    {loading ? (
                        <span className="animate-spin text-xs">⏳</span>
                    ) : (
                        <Search size={16} />
                    )}
                </button>
            </div>

            {/* Dropdown Results */}
            {showDropdown && customers.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
                    {customers.map((customer) => (
                        <li
                            key={customer.id}
                            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs hover:bg-muted"
                            onClick={() => {
                                onSelect(customer);
                                setQuery(customer.name);
                                setShowDropdown(false);
                            }}
                        >
                            <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border bg-muted">
                                {customer.photo?.url ? (
                                    <img
                                        src={customer.photo.url}
                                        alt={customer.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-muted-foreground">
                                        {customer.name?.charAt(0) ?? '?'}
                                    </div>
                                )}
                            </div>
                            <span className="truncate font-medium">
                                {customer.name.trim()}
                            </span>
                            {customer.customer_no && (
                                <span className="truncate text-muted-foreground">
                                    | {customer.customer_no} | {customer.type} |{' '}
                                    {customer.status}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* Empty State */}
            {showDropdown && !loading && query && customers.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-gray-500">
                    No customers found.
                </div>
            )}
        </div>
    );
};
