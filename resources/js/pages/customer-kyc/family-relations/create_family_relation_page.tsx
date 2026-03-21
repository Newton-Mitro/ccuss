import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, ListFilter, Loader2 } from 'lucide-react';

import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

const Create = () => {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleBack = () => window.history.back();

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        relative_id: '',
        relation_type: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/customer-family-relations');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: '/customer-family-relations' },
        { title: 'Add Relation', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Family Relation" />

            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title="Create Family Relation"
                    description="Link customer relatives."
                />

                <div className="flex gap-2">
                    <button onClick={handleBack} className="btn-muted">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <Link
                        href="/customer-family-relations"
                        className="btn-secondary"
                    >
                        <ListFilter className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-md border bg-card p-6"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label className="text-xs">Customer</Label>
                        <Input
                            onChange={(e) =>
                                setData('customer_id', e.target.value)
                            }
                        />
                        <InputError message={errors.customer_id} />
                    </div>

                    <div>
                        <Label className="text-xs">Relative</Label>
                        <Input
                            onChange={(e) =>
                                setData('relative_id', e.target.value)
                            }
                        />
                        <InputError message={errors.relative_id} />
                    </div>

                    <div>
                        <Label className="text-xs">Relation Type</Label>
                        <select
                            onChange={(e) =>
                                setData('relation_type', e.target.value)
                            }
                            className="h-8 w-full rounded-md border bg-background px-2 text-sm"
                        >
                            <option value="">Select</option>
                            <option>FATHER</option>
                            <option>MOTHER</option>
                            <option>SON</option>
                            <option>DAUGHTER</option>
                            <option>HUSBAND</option>
                            <option>WIFE</option>
                        </select>
                        <InputError message={errors.relation_type} />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button disabled={processing}>
                        {processing ? <Loader2 /> : <CheckCheck />}
                        Save Relation
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default Create;
