import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { CustomerSearchBox } from '../customers/customer-search-box';

export default function CreateFamilyRelation() {
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

    const { data, setData, post, processing, errors } = useForm({
        customer_id: null as number | null,
        customer_name: '',
        relative_id: null as number | null,
        relative_name: '',
        relation_type: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/auth/family-relations', {
            preserveScroll: true,
            onSuccess: () =>
                toast.success('Family relation saved successfully!'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: '/auth/family-relations' },
        { title: 'Add Relation', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Family Relation" />

            <div className="animate-in space-y-8 text-foreground fade-in">
                <HeadingSmall
                    title="Add Family Relation"
                    description="Select a customer and a relative, then choose the relationship."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl border border-border bg-card/80 p-8 shadow backdrop-blur-sm transition-all duration-300"
                >
                    {/* Customer Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Customer
                        </h3>
                        <div className="mt-2">
                            <CustomerSearchBox
                                onSelect={(customer) => {
                                    setData('customer_id', customer.id);
                                    setData('customer_name', customer.name);
                                }}
                            />
                        </div>
                    </div>

                    {/* Relative Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Relative
                        </h3>
                        <div className="mt-2">
                            <CustomerSearchBox
                                onSelect={(relative) => {
                                    setData('relative_id', relative.id);
                                    setData('relative_name', relative.name);
                                }}
                            />
                        </div>
                    </div>

                    {/* Relation Type Dropdowns */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <Label>Relation Type</Label>
                            <select
                                value={data.relation_type}
                                onChange={(e) =>
                                    setData('relation_type', e.target.value)
                                }
                                className="mt-1 w-full rounded border border-border bg-background p-2"
                            >
                                <option value="">Select Relation Type</option>
                                {relations.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.relation_type} />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing ? 'Saving...' : 'Save Relation'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
