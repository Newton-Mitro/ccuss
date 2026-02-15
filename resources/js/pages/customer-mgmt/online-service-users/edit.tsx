import { Head, useForm } from '@inertiajs/react';
import React from 'react';
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
    onlineClient: OnlineServiceUser;
}

export default function EditOnlineUser({ onlineClient }: EditOnlineUserProps) {
    console.log(onlineClient);
    const { data, setData, put, processing, errors } = useForm({
        customer_id: onlineClient.customer_id || '',
        customer_name: onlineClient?.customer?.name || '',
        username: onlineClient.username || '',
        email: onlineClient.email || '',
        phone: onlineClient.phone || '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/online-service-users/${onlineClient.id}`, {
            preserveScroll: true,
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

            <div className="animate-in space-y-8 text-foreground fade-in">
                <HeadingSmall
                    title="Edit Online Client"
                    description="Update customer account information, login credentials, and contact details."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl border border-border bg-card/80 p-8 shadow backdrop-blur-sm transition-all duration-300"
                >
                    {/* Customer Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Linked Customer
                        </h3>
                        <div className="mt-2">
                            <CustomerSearchInput
                                onSelect={(customer) => {
                                    setData('customer_id', customer.id);
                                    setData('customer_name', customer.name);
                                }}
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
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
                                    value={data.customer_name}
                                    disabled
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <Label>Username</Label>
                            <Input
                                type="text"
                                value={data.username}
                                onChange={(e) =>
                                    setData('username', e.target.value)
                                }
                                className="h-8 text-sm"
                                placeholder="Enter username"
                            />
                            <InputError message={errors.username} />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className="h-8 text-sm"
                                placeholder="Enter email address"
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <Label>Phone</Label>
                            <Input
                                type="text"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                className="h-8 text-sm"
                                placeholder="Enter phone number"
                            />
                            <InputError message={errors.phone} />
                        </div>
                        <div>
                            <Label>New Password</Label>
                            <Input
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="h-8 text-sm"
                                placeholder="Leave blank to keep current password"
                            />
                            <InputError message={errors.password} />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-48 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
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
