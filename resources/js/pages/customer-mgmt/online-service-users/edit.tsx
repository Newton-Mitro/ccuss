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
import { OnlineServiceUser } from '../../../types/customer';
import { CustomerSearchInput } from '../customers/customer-search-input';

interface EditOnlineUserProps {
    onlineServiceUser: OnlineServiceUser;
}

export default function EditOnlineUser({
    onlineServiceUser,
}: EditOnlineUserProps) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        customer_id: onlineServiceUser.customer_id || '',
        customer_name: onlineServiceUser.customer?.name || '',
        username: onlineServiceUser.username || '',
        email: onlineServiceUser.email || '',
        phone: onlineServiceUser.phone || '',
        password: '',
        status: onlineServiceUser.status || 'ACTIVE',
    });

    const [customerName, setCustomerName] = useState(data.customer_name || '');

    // Generic handler for input/select changes with immediate error reset
    const handleChange =
        (field: keyof OnlineServiceUser) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setData(field, e.target.value);
            if (errors[field]) clearErrors(field);
        };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Frontend validation: either email or phone required
        if (!data.email && !data.phone) {
            toast.error('Either email or phone must be provided.');
            return;
        }

        put(`/online-service-users/${onlineServiceUser.id}`, {
            preserveScroll: true,
            onError: () => toast.error('Please fix errors in the form.'),
            onSuccess: () => toast.success('Online user updated successfully!'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Online Clients', href: '/online-service-users' },
        { title: 'Edit Online Client', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Online Client" />

            <div className="animate-in space-y-6 text-foreground fade-in">
                <HeadingSmall
                    title="Edit Online Client"
                    description="Update customer account information, login credentials, and contact details."
                />

                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-border bg-card/90 p-6 shadow backdrop-blur-sm transition-all duration-300"
                >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {/* Customer Selection */}
                        <div className="col-span-full">
                            <Label>Linked Customer</Label>
                            <CustomerSearchInput
                                onSelect={(customer) => {
                                    setData('customer_id', customer.id);
                                    setCustomerName(customer.name);
                                    clearErrors('customer_id');
                                }}
                            />
                        </div>

                        <div>
                            <Label>Customer ID</Label>
                            <Input
                                value={data.customer_id}
                                disabled
                                className="h-8 text-sm"
                            />
                            <InputError message={errors.customer_id} />
                        </div>

                        <div>
                            <Label>Customer Name</Label>
                            <Input
                                value={customerName}
                                disabled
                                className="h-8 text-sm"
                            />
                        </div>

                        {/* Credentials */}
                        <div>
                            <Label>Username</Label>
                            <Input
                                placeholder="Username"
                                value={data.username}
                                onChange={handleChange('username')}
                                className="h-8 text-sm"
                            />
                            <InputError message={errors.username} />
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                placeholder="Email"
                                value={data.email}
                                onChange={handleChange('email')}
                                className="h-8 text-sm"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div>
                            <Label>Phone</Label>
                            <Input
                                placeholder="Phone"
                                value={data.phone}
                                onChange={handleChange('phone')}
                                className="h-8 text-sm"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div>
                            <Label>New Password</Label>
                            <Input
                                type="password"
                                placeholder="Leave blank to keep current password"
                                value={data.password}
                                onChange={handleChange('password')}
                                className="h-8 text-sm"
                            />
                            <InputError message={errors.password} />
                        </div>

                        {/* Status */}
                        <div>
                            <Label>Status</Label>
                            <select
                                value={data.status}
                                onChange={handleChange('status')}
                                className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="SUSPENDED">Suspended</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                            <InputError message={errors.status} />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-3">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-36 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing
                                ? 'Updating...'
                                : 'Update Online Client'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
