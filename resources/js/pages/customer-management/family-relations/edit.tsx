import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface Customer {
    id: number;
    name: string;
    customer_no: string;
}

interface FamilyRelation {
    id: number;
    customer_id: number;
    relative_id: number;
    relation_type: string;
}

interface EditFamilyRelationProps {
    customers: Customer[];
    relation: FamilyRelation;
}

export default function Edit({ customers, relation }: EditFamilyRelationProps) {
    const { data, setData, put, processing, errors } = useForm({
        customer_id: relation.customer_id,
        relative_id: relation.relative_id,
        relation_type: relation.relation_type,
    });

    const [customerSearch, setCustomerSearch] = useState(
        customers.find((c) => c.id === relation.customer_id)?.name || '',
    );
    const [relativeSearch, setRelativeSearch] = useState(
        customers.find((c) => c.id === relation.relative_id)?.name || '',
    );

    const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>(
        [],
    );
    const [relativeSuggestions, setRelativeSuggestions] = useState<Customer[]>(
        [],
    );
    const [activeCustomerIndex, setActiveCustomerIndex] = useState(-1);
    const [activeRelativeIndex, setActiveRelativeIndex] = useState(-1);

    const customerRef = useRef<HTMLDivElement>(null);
    const relativeRef = useRef<HTMLDivElement>(null);

    const relations = [
        'FATHER',
        'MOTHER',
        'SON',
        'DAUGHTER',
        'BROTHER',
        'COUSIN_BROTHER',
        'COUSIN_SISTER',
        'SISTER',
        'HUSBAND',
        'WIFE',
        'GRANDFATHER',
        'GRANDMOTHER',
        'GRANDSON',
        'GRANDDAUGHTER',
        'UNCLE',
        'AUNT',
        'NEPHEW',
        'NIECE',
        'FATHER-IN-LAW',
        'MOTHER-IN-LAW',
        'SON-IN-LAW',
        'DAUGHTER-IN-LAW',
        'BROTHER-IN-LAW',
        'SISTER-IN-LAW',
    ];

    const filterSuggestions = (value: string) =>
        customers.filter((c) =>
            c.name.toLowerCase().includes(value.toLowerCase()),
        );

    const handleCustomerSearch = (value: string) => {
        setCustomerSearch(value);
        setCustomerSuggestions(filterSuggestions(value));
        setActiveCustomerIndex(-1);
    };

    const handleRelativeSearch = (value: string) => {
        setRelativeSearch(value);
        setRelativeSuggestions(filterSuggestions(value));
        setActiveRelativeIndex(-1);
    };

    const handleKeyDown = (
        e: React.KeyboardEvent,
        type: 'customer' | 'relative',
    ) => {
        const suggestions =
            type === 'customer' ? customerSuggestions : relativeSuggestions;
        const activeIndex =
            type === 'customer' ? activeCustomerIndex : activeRelativeIndex;
        const setActive =
            type === 'customer'
                ? setActiveCustomerIndex
                : setActiveRelativeIndex;
        const setValue =
            type === 'customer' ? setCustomerSearch : setRelativeSearch;
        const setId = (id: number) =>
            setData(type === 'customer' ? 'customer_id' : 'relative_id', id);

        if (!suggestions.length) return;

        if (e.key === 'ArrowDown') {
            setActive(
                activeIndex < suggestions.length - 1 ? activeIndex + 1 : 0,
            );
        } else if (e.key === 'ArrowUp') {
            setActive(
                activeIndex > 0 ? activeIndex - 1 : suggestions.length - 1,
            );
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            setValue(suggestions[activeIndex].name);
            setId(suggestions[activeIndex].id);
            type === 'customer'
                ? setCustomerSuggestions([])
                : setRelativeSuggestions([]);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                customerRef.current &&
                !customerRef.current.contains(event.target as Node)
            ) {
                setCustomerSuggestions([]);
            }
            if (
                relativeRef.current &&
                !relativeRef.current.contains(event.target as Node)
            ) {
                setRelativeSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('family-relations.update', relation.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: '/auth/family-relations' },
        { title: 'Edit Relation', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Family Relation" />
            <div className="animate-in space-y-8 px-4 py-6 text-foreground fade-in">
                <HeadingSmall
                    title="Edit Family Relation"
                    description="Update a customer-family relation."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-10 rounded-xl border border-border bg-card/80 p-8 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                >
                    {/* Customer Autocomplete */}
                    <div className="relative" ref={customerRef}>
                        <Label>Customer</Label>
                        <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) =>
                                handleCustomerSearch(e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, 'customer')}
                            placeholder="Type customer name..."
                            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        />
                        <InputError message={errors.customer_id} />

                        {customerSuggestions.length > 0 && (
                            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
                                {customerSuggestions.map((c, idx) => (
                                    <li
                                        key={c.id}
                                        className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${idx === activeCustomerIndex ? 'bg-gray-200' : ''}`}
                                        onClick={() => {
                                            setCustomerSearch(c.name);
                                            setData('customer_id', c.id);
                                            setCustomerSuggestions([]);
                                        }}
                                    >
                                        {c.name} ({c.customer_no})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Relative Autocomplete */}
                    <div className="relative" ref={relativeRef}>
                        <Label>Relative</Label>
                        <input
                            type="text"
                            value={relativeSearch}
                            onChange={(e) =>
                                handleRelativeSearch(e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, 'relative')}
                            placeholder="Type relative name..."
                            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        />
                        <InputError message={errors.relative_id} />

                        {relativeSuggestions.length > 0 && (
                            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
                                {relativeSuggestions.map((c, idx) => (
                                    <li
                                        key={c.id}
                                        className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${idx === activeRelativeIndex ? 'bg-gray-200' : ''}`}
                                        onClick={() => {
                                            setRelativeSearch(c.name);
                                            setData('relative_id', c.id);
                                            setRelativeSuggestions([]);
                                        }}
                                    >
                                        {c.name} ({c.customer_no})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Relation Type */}
                    <div>
                        <Label>Relation Type</Label>
                        <select
                            value={data.relation_type}
                            onChange={(e) =>
                                setData('relation_type', e.target.value)
                            }
                            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        >
                            <option value="">Select Relation Type</option>
                            {relations.map((r) => (
                                <option key={r} value={r}>
                                    {r.replaceAll('_', ' ')}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.relation_type} />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing ? 'Saving...' : 'Update Relation'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
