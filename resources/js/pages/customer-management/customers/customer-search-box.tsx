import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Search } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Label } from '../../../components/ui/label';
import { Customer } from '../../../types/customer';
import CustomerViewModal from './customer_view_modal';

interface CustomerSearchBoxProps {
    onSelect: (customer: Customer) => void;
    label?: string;
}

export const CustomerSearchBox: React.FC<CustomerSearchBoxProps> = ({
    onSelect,
    label = 'Search Customer',
}) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const { data, setData } = useForm<Customer | null>(null);

    const onSelectCustomer = async (customer: Customer) => {
        setData(customer);
        try {
            setLoading(true);
            const res = await axios.get(
                `/auth/api/find-customers/${customer.id}`,
            );
            console.log(res.data);
            onSelect(res.data || null);
            setCustomer(res.data || null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * -----------------------
     * API SEARCH
     * -----------------------
     */
    const searchCustomers = async () => {
        if (!query?.trim()) {
            setCustomers([]);
            setShowDropdown(false);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get('/auth/api/search-customers', {
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
        <div
            className="relative w-full rounded-md border bg-card p-4"
            ref={dropdownRef}
        >
            {/* INPUT + SEARCH BUTTON */}
            <div className="relative">
                <Label className="text-xs">{label}</Label>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={label}
                    className="h-8 w-full rounded-md border border-border bg-background px-3 pr-10 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />

                <button
                    type="button"
                    onClick={searchCustomers}
                    className="absolute top-8/11 right-1 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-primary"
                    title="Search"
                >
                    {loading ? (
                        <span className="animate-spin text-xs">⏳</span>
                    ) : (
                        <Search size={14} />
                    )}
                </button>
            </div>
            {/* RESULTS */}
            {showDropdown && customers.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
                    {customers.map((customer) => (
                        <li
                            key={customer.id}
                            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs hover:bg-muted"
                            onClick={() => {
                                onSelectCustomer(customer);
                                setQuery(customer.name);
                                setShowDropdown(false);
                            }}
                        >
                            {/* Avatar */}
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

                            {/* Name */}
                            <span className="truncate font-medium">
                                {customer.name.trim()}
                            </span>

                            {/* Customer No */}
                            {customer.customer_no && (
                                <span className="text-muted-foreground">
                                    | {customer.customer_no} | {customer.type} |{' '}
                                    {customer.status}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {/* EMPTY STATE */}
            {showDropdown && !loading && query && customers.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-gray-500">
                    No customers found.
                </div>
            )}
            {data.id && (
                <div className="mt-3 flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                    <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                        {data.photo?.url ? (
                            <img
                                src={data.photo.url}
                                alt={data.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                {data.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2">
                        <div>
                            <button
                                onClick={() => setOpen(true)}
                                className="text-sm font-semibold underline hover:cursor-pointer"
                            >
                                {data.name}
                            </button>
                            <p className="text-xs text-muted-foreground">
                                {data.type} • {data.status}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                            <Info
                                label="Customer No"
                                value={data.customer_no}
                            />
                            <Info label="Phone" value={data.phone} />
                            <Info label="Email" value={data.email} />
                            <Info
                                label="Identification Type"
                                value={data.identification_type}
                            />
                            <Info
                                label="Identification Number"
                                value={data.identification_number}
                            />
                        </div>
                    </div>
                </div>
            )}
            <CustomerViewModal
                open={open}
                onOpenChange={setOpen}
                customer={customer}
            />
        </div>
    );
};

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-muted-foreground">{label}</span>
            <p className="font-medium">{value}</p>
        </div>
    );
}
