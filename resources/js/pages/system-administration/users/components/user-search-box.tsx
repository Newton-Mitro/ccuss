import { Link } from '@inertiajs/react';
import axios from 'axios';
import { Search } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import { InfoItem } from '../../../../components/info-block';
import { Label } from '../../../../components/ui/label';
import { User } from '../../../../types/user';

interface UserSearchBoxProps {
    onSelect: (user: User) => void;
    label?: string;
    selectedUser?: User;
    placeholder?: string;
}

export const UserSearchBox: React.FC<UserSearchBoxProps> = ({
    onSelect,
    label,
    selectedUser,
    placeholder = 'Search User',
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [user, setUser] = useState<User | null>(selectedUser);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');

    console.log(users);

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // ----------------------- API SEARCH
    const searchUsers = async () => {
        if (!query?.trim()) {
            setUsers([]);
            setShowDropdown(false);
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(route('users.search'), {
                params: { search: query },
            });
            setUsers(res.data || []);
            setShowDropdown(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ----------------------- ENTER KEY HANDLER
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchUsers();
        }
    };

    // ----------------------- OUTSIDE CLICK
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
            <div className="relative w-full">
                {label && <Label>{label}</Label>}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="h-8 w-full rounded-md border bg-background px-3 pr-10 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
                <button
                    type="button"
                    onClick={searchUsers}
                    className="absolute inset-y-0 right-1 flex items-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-primary"
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
            {showDropdown && users.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-sm">
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs hover:bg-muted"
                            onClick={() => {
                                onSelect(user);
                                setUser(user);
                                setQuery(user.name);
                                setShowDropdown(false);
                            }}
                        >
                            {/* Avatar */}
                            <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border bg-muted">
                                {user?.avatar ? (
                                    <img
                                        src={user?.avatar}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-muted-foreground">
                                        {user.name?.charAt(0) ?? '?'}
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <span className="truncate font-medium">
                                {user.name.trim()}
                            </span>

                            {/* User No */}
                            {user.id && (
                                <span className="text-muted-foreground">
                                    | {user.id} | {user.status}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* EMPTY STATE */}
            {showDropdown && !loading && query && users.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-background px-3 py-2 text-xs text-info">
                    No users found.
                </div>
            )}

            {/* USER DETAILS / SKELETON */}
            {user?.id ? (
                // Loaded user
                <div className="mt-3 flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                    <div className="flex items-center justify-center">
                        {/* Avatar */}
                        <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                            {user?.avatar ? (
                                <img
                                    src={user?.avatar}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-1">
                        <div>
                            <Link
                                href={route('users.show', user.id)}
                                className="cursor-pointer text-sm font-semibold text-info underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {`${user.name} • ${user.id}`}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                {user.status} • {user.email_verified_at}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-1 text-xs md:grid-cols-4">
                            <InfoItem label="Phone" value={user.phone} />
                            <InfoItem label="Email" value={user.email} />
                        </div>
                    </div>
                </div>
            ) : (
                // Skeleton with exact same height
                <div className="mt-3 flex flex-col gap-4 rounded-md border bg-background/60 p-3 md:flex-row">
                    <div className="flex items-center justify-center">
                        {/* Avatar */}
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-muted" />
                    </div>

                    {/* Right side */}
                    <div className="flex flex-1 flex-col justify-between space-y-2">
                        {/* Name & type row */}
                        <div className="space-y-1">
                            <div className="h-4 w-3/5 rounded bg-muted" />{' '}
                            {/* name */}
                            <div className="h-3 w-2/5 rounded bg-muted" />{' '}
                            {/* type/status */}
                        </div>

                        {/* Grid info row */}
                        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-4">
                            <div className="h-8 w-full rounded bg-muted" />
                            <div className="h-8 w-full rounded bg-muted" />
                            <div className="h-8 w-full rounded bg-muted" />
                            <div className="h-8 w-full rounded bg-muted" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
