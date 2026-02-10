import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { OnlineClient } from '../../../types/online_client';
import { CustomerSearchInput } from '../customers/customer-search-input';

export default function CreateOnlineUser() {
    // Form only contains real OnlineUser fields
    const { data, setData, post, processing, errors } = useForm<
        Partial<OnlineClient>
    >({
        customer_id: null,
        username: '',
        email: '',
        phone: '',
        password: '',
        last_login_at: '',
        status: 'ACTIVE',
    });

    // UI-only fields
    const [customerName, setCustomerName] = useState('');
    const [customerQuery, setCustomerQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/auth/online-clients', {
            preserveScroll: true,
            onSuccess: () => toast.success('Online user created successfully!'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Online Clients', href: '/auth/online-clients' },
        { title: 'Add Online Client', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Online Client" />

            <div className="animate-in space-y-8 text-foreground fade-in">
                <HeadingSmall
                    title="Add Online Client"
                    description="Select a customer and fill in credentials, login info, and status."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl border border-border bg-card/80 p-8 shadow backdrop-blur-sm transition-all duration-300"
                >
                    {/* Customer Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Customer
                        </h3>
                        <div className="mt-2">
                            <CustomerSearchInput
                                query={customerQuery}
                                onQueryChange={setCustomerQuery}
                                onSelect={(customer) => {
                                    setData('customer_id', customer.id);
                                    setCustomerName(customer.name); // UI-only
                                    setCustomerQuery(customer.name); // search input
                                }}
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <Label>Customer ID</Label>
                                <Input
                                    value={data.customer_id || ''}
                                    disabled
                                    className="bg-disabled mt-1 cursor-not-allowed"
                                />
                                <InputError message={errors.customer_id} />
                            </div>
                            <div>
                                <Label>Customer Name</Label>
                                <Input
                                    value={customerName}
                                    disabled
                                    className="bg-disabled mt-1 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* User Credentials */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <Label>Username</Label>
                            <Input
                                placeholder="Enter username"
                                value={data.username || ''}
                                onChange={(e) =>
                                    setData('username', e.target.value)
                                }
                            />
                            <InputError message={errors.username} />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                placeholder="Enter email"
                                value={data.email || ''}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <Label>Phone</Label>
                            <Input
                                placeholder="Enter phone number"
                                value={data.phone || ''}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                            />
                            <InputError message={errors.phone} />
                        </div>
                        <div>
                            <Label>Password</Label>
                            <Input
                                type="password"
                                placeholder="Enter password"
                                value={data.password || ''}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />
                            <InputError message={errors.password} />
                        </div>
                    </div>

                    {/* Status & Last Login */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <Label>Status</Label>
                            <select
                                value={data.status}
                                onChange={(e) =>
                                    setData(
                                        'status',
                                        e.target
                                            .value as OnlineClient['status'],
                                    )
                                }
                                className="mt-1 w-full rounded border border-border bg-background p-2"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="SUSPENDED">Suspended</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                            <InputError message={errors.status} />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing ? 'Saving...' : 'Save User'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
