import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';

import { BreadcrumbItem, SharedData } from '@/types';

interface Advance {
    id: number;
    employee_name: string;
    amount: number;
    remaining_amount: number;
}

interface Props extends SharedData {
    advances: Advance[];
}

export default function AdvanceReturn({ advances }: Props) {
    useFlashToastHandler();

    const { data, setData, post, processing, errors } = useForm({
        advance_id: '',
        return_amount: '',
        return_date: '',
        remarks: '',
    });

    const selectedAdvance = useMemo(() => {
        return advances.find((a) => a.id.toString() === data.advance_id);
    }, [data.advance_id, advances]);

    const remaining = Number(selectedAdvance?.remaining_amount || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('advance-returns.store'), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Advance Returns',
            href: route('advance-returns.index'),
        },
        {
            title: 'Create',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Advance Return Entry" />

            {/* HEADER */}
            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title="Advance Return Entry"
                    description="Receive unused advance from employee"
                />

                <div className="">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                </div>
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-md border bg-card p-6"
            >
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Advance Selection */}
                    <div>
                        <label className="text-xs">Advance</label>
                        <Select
                            value={data.advance_id}
                            onChange={(v) => setData('advance_id', v)}
                            options={advances.map((a) => ({
                                value: a.id.toString(),
                                label: `${a.employee_name} (${a.remaining_amount})`,
                            }))}
                        />
                        <InputError message={errors.advance_id} />
                    </div>

                    {/* Return Amount */}
                    <div>
                        <label className="text-xs">Return Amount</label>
                        <Input
                            type="number"
                            value={data.return_amount}
                            onChange={(e) =>
                                setData('return_amount', e.target.value)
                            }
                        />
                        <InputError message={errors.return_amount} />
                    </div>

                    {/* Return Date */}
                    <div>
                        <label className="text-xs">Return Date</label>
                        <Input
                            type="date"
                            value={data.return_date}
                            onChange={(e) =>
                                setData('return_date', e.target.value)
                            }
                        />
                    </div>

                    {/* Remarks */}
                    <div className="md:col-span-2">
                        <label className="text-xs">Remarks</label>
                        <Input
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                        />
                    </div>
                </div>

                {/* INFO BOX */}
                {selectedAdvance && (
                    <div className="rounded-md border bg-muted/20 p-4 text-sm">
                        <p>
                            <strong>Employee:</strong>{' '}
                            {selectedAdvance.employee_name}
                        </p>
                        <p>
                            <strong>Remaining Advance:</strong> {remaining}
                        </p>
                        <p>
                            <strong>After Return:</strong>{' '}
                            {remaining - Number(data.return_amount || 0)}
                        </p>
                    </div>
                )}

                {/* SUBMIT */}
                <div className="flex justify-end">
                    <Button disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCheck className="mr-2 h-4 w-4" />
                                Save Return
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
}
