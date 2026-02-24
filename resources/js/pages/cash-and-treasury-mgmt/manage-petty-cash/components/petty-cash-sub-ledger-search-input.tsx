import axios from 'axios';
import { Search } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

export interface SubLedger {
    id: number;
    name: string;
    ledger_code?: string;
    ledger_type?: string;
    status?: string;
}

interface PettyCashSubLedgerSearchInputProps {
    onSelect: (ledger: SubLedger) => void;
    label?: string;
    placeholder?: string;
}

export const PettyCashSubLedgerSearchInput: React.FC<
    PettyCashSubLedgerSearchInputProps
> = ({ onSelect, label, placeholder = 'Petty Cash Subledger' }) => {
    const [ledgers, setLedgers] = useState<SubLedger[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const searchLedgers = async () => {
        if (!query.trim()) {
            setLedgers([]);
            setShowDropdown(false);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get('/api/search-personal-ledgers', {
                params: { search: query },
            });

            setLedgers(res.data || []);
            setShowDropdown(true);
        } catch (error) {
            console.error(error);
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
            searchLedgers();
        }
    };

    /**
     * -----------------------
     * OUTSIDE CLICK HANDLER
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
            {/* INPUT */}
            <div className="relative">
                <Label className="text-xs">{label}</Label>
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || 'Search ledgers...'}
                    className="h-8 w-full rounded-md border border-border bg-background px-3 pr-10 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />

                <button
                    type="button"
                    onClick={searchLedgers}
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

            {/* DROPDOWN RESULTS */}
            {showDropdown && ledgers.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
                    {ledgers.map((ledger) => (
                        <li
                            key={ledger.id}
                            className="cursor-pointer px-3 py-2 text-xs hover:bg-muted"
                            onClick={() => {
                                onSelect(ledger);
                                setQuery(ledger.name);
                                setShowDropdown(false);
                            }}
                        >
                            <div className="truncate font-medium">
                                {ledger.name}
                            </div>

                            <div className="text-[10px] text-muted-foreground">
                                {ledger.ledger_code && (
                                    <span>{ledger.ledger_code}</span>
                                )}
                                {ledger.ledger_type && (
                                    <span> | {ledger.ledger_type}</span>
                                )}
                                {ledger.status && (
                                    <span> | {ledger.status}</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* EMPTY STATE */}
            {showDropdown && !loading && query && ledgers.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    No personal ledgers found.
                </div>
            )}
        </div>
    );
};
