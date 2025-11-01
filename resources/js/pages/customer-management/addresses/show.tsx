import { Head } from '@inertiajs/react';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Address } from '../../../types/address';

interface ShowProps {
    address: Address;
}

export default function Show({ address }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Addresses', href: '/auth/addresses' },
        { title: `Address #${address.id}`, href: '' },
    ];

    const fields = [
        { label: 'Customer ID', value: address.customer_id },
        { label: 'Address Line 1', value: address.line1 },
        { label: 'Address Line 2', value: address.line2 || '-' },
        { label: 'Division', value: address.division },
        { label: 'District', value: address.district },
        { label: 'Upazila', value: address.upazila || '-' },
        { label: 'Union/Ward', value: address.union_ward || '-' },
        { label: 'Village/Locality', value: address.village_locality || '-' },
        { label: 'Postal Code', value: address.postal_code || '-' },
        { label: 'Country Code', value: address.country_code },
        { label: 'Type', value: address.type },
        {
            label: 'Created At',
            value: new Date(address.created_at).toLocaleString(),
        },
        {
            label: 'Last Updated',
            value: new Date(address.updated_at).toLocaleString(),
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Address #${address.id}`} />

            <div className="animate-in space-y-6 text-foreground">
                <h1 className="text-2xl font-semibold">Address Details</h1>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2">
                    {fields.map((field, idx) => (
                        <div
                            key={idx}
                            className="flex justify-between border-b border-border py-2"
                        >
                            <span className="font-medium text-muted-foreground">
                                {field.label}
                            </span>
                            <span className="font-semibold text-foreground">
                                {field.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
