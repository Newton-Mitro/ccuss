import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface Customer {
    id: number;
    name: string;
    customer_no?: string;
}

interface CreateSignatureProps {
    customers: Customer[];
}

export default function Create({ customers }: CreateSignatureProps) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        signature_file: null as File | null,
    });

    const [customerSearch, setCustomerSearch] = useState('');
    const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>(
        [],
    );

    const handleCustomerSearch = (value: string) => {
        setCustomerSearch(value);
        const filtered = customers.filter((c) =>
            c.name.toLowerCase().includes(value.toLowerCase()),
        );
        setCustomerSuggestions(filtered);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('signature_file', e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('customer_id', String(data.customer_id));
        if (data.signature_file) {
            formData.append('signature_file', data.signature_file);
        }
        post('/auth/signatures', { data: formData, preserveScroll: true });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Signatures', href: '/auth/signatures' },
        { title: 'Add Signature', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Signature" />
            <div className="animate-in space-y-8 px-4 py-6 text-foreground fade-in">
                <HeadingSmall
                    title="Add Signature"
                    description="Upload a signature for a customer."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-10 rounded-xl border border-border bg-card/80 p-8 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                >
                    {/* Customer Autocomplete */}
                    <div className="relative">
                        <Label>Customer</Label>
                        <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) =>
                                handleCustomerSearch(e.target.value)
                            }
                            placeholder="Type customer name..."
                            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        />
                        <InputError message={errors.customer_id} />

                        {customerSuggestions.length > 0 && customerSearch && (
                            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
                                {customerSuggestions.map((c) => (
                                    <li
                                        key={c.id}
                                        className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                        onClick={() => {
                                            setData('customer_id', c.id);
                                            setCustomerSearch(c.name);
                                            setCustomerSuggestions([]);
                                        }}
                                    >
                                        {c.name} ({c.customer_no})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Signature File Upload */}
                    <div>
                        <Label>Signature File</Label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        />
                        <InputError message={errors.signature_file} />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing ? 'Saving...' : 'Save Signature'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
