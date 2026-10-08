import type { Customer } from '@/types/customer_kyc_module';
import axios from 'axios';
import { Search, WalletCards, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';

export interface FinancialAccountSearchResult {
    id: number;
    account_no: string;
    name: string | null;
    account_type: string;
    balance: number;
    available_balance: number;
    holder: Customer | null;
    holders: Array<{
        id: number;
        name: string;
        customer_no: string;
        type: string;
    }>;
}

export type FinancialAccountSearchScope =
    | 'all'
    | 'deposit'
    | 'loan'
    | 'teller'
    | 'vault'
    | 'petty_cash'
    | 'bank';

interface FinancialAccountSearchInputProps {
    onSelect: (account: FinancialAccountSearchResult) => void;
    clearSelectedAccount?: () => void;
    initialAccount?: FinancialAccountSearchResult | null;
    scope?: FinancialAccountSearchScope;
    placeholder?: string;
}

export function FinancialAccountSearchInput({
    onSelect,
    clearSelectedAccount,
    initialAccount,
    scope = 'all',
    placeholder = 'Search customer or account',
}: FinancialAccountSearchInputProps) {
    const [query, setQuery] = useState(() =>
        initialAccount
            ? `${initialAccount.account_no} - ${initialAccount.holder?.name ?? initialAccount.name ?? ''}`
            : '',
    );
    const [accounts, setAccounts] = useState<FinancialAccountSearchResult[]>(
        [],
    );
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (initialAccount) {
            setQuery(
                `${initialAccount.account_no} - ${initialAccount.holder?.name ?? initialAccount.name ?? ''}`,
            );
        }
    }, [initialAccount]);

    useEffect(() => {
        const closeResults = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', closeResults);
        return () => document.removeEventListener('mousedown', closeResults);
    }, []);

    const search = async () => {
        const term = query.trim();
        if (term.length < 2) {
            setAccounts([]);
            setShowResults(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get<FinancialAccountSearchResult[]>(
                route('teller-transactions.deposit.accounts.search'),
                { params: { search: term, scope } },
            );
            setAccounts(response.data);
            setShowResults(true);
        } catch (error) {
            console.error(error);
            setAccounts([]);
            setShowResults(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setShowResults(false);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            void search();
                        }
                    }}
                    placeholder={placeholder}
                    aria-label="Search financial accounts"
                    className="h-9 w-full rounded-md border bg-background px-3 pr-16 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />

                <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
                    {query && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setAccounts([]);
                                setShowResults(false);
                                onSelect(null as any);
                            }}
                            aria-label="Clear account search"
                            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <X
                                className="h-4 w-4"
                                onClick={clearSelectedAccount}
                            />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => void search()}
                        disabled={loading}
                        aria-label="Search accounts"
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>
            {showResults && (
                <div className="absolute z-30 mt-1 max-h-80 w-full overflow-auto rounded-md border bg-background shadow-lg">
                    {accounts.length > 0 ? (
                        <ul className="divide-y">
                            {accounts.map((account) => {
                                const otherHolders = account.holders
                                    .filter(
                                        (holder) =>
                                            holder.id !== account.holder?.id,
                                    )
                                    .map((holder) => holder.name)
                                    .join(', ');

                                return (
                                    <li key={account.id}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onSelect(account);
                                                setQuery(
                                                    `${account.account_no} - ${account.holder?.name ?? account.name ?? ''}`,
                                                );
                                                setShowResults(false);
                                            }}
                                            className="w-full px-3 py-2 text-left hover:bg-muted/70 focus-visible:bg-muted/70 focus-visible:outline-none"
                                        >
                                            <div className="flex items-start gap-2">
                                                <WalletCards className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                                                        <span className="font-medium">
                                                            {account.account_no}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {account.account_type.replaceAll(
                                                                '_',
                                                                ' ',
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="truncate text-xs text-muted-foreground">
                                                        {account.name ??
                                                            'Unnamed account'}
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-xs">
                                                        <span className="truncate">
                                                            {account.holder
                                                                ?.name ??
                                                                otherHolders ??
                                                                'No customer holder'}
                                                            {account.holder
                                                                ?.customer_no
                                                                ? ` · ${account.holder.customer_no}`
                                                                : ''}
                                                            {otherHolders &&
                                                            account.holder
                                                                ? ` · ${otherHolders}`
                                                                : ''}
                                                        </span>
                                                        <span className="shrink-0 text-muted-foreground tabular-nums">
                                                            Available BDT{' '}
                                                            {Number(
                                                                account.available_balance,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No matching customer accounts found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
