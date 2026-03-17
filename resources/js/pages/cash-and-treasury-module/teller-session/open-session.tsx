// resources/js/Pages/BranchTreasury/TellerSessions/OpenTellerSession.jsx
import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

export default function OpenTellerSession() {
    const { branch } = usePage().props; // current user branch info if needed

    const { data, setData, post, processing, errors, reset } = useForm({
        opening_cash: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('teller-sessions.open'), {
            onSuccess: () => {
                toast.success('Teller session opened successfully!');
                reset('opening_cash');
            },
            onError: () => {
                toast.error('Failed to open teller session.');
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teller Sessions', href: '/teller-sessions' },
        { title: 'Open Session', href: route('teller-sessions.open') },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open Teller Session" />
            <div className="p-6">
                <HeadingSmall
                    title="Open Teller Session"
                    description="Start a new teller session for your branch"
                />

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 max-w-md space-y-4"
                >
                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                            Opening Cash
                        </label>
                        <input
                            type="number"
                            value={data.opening_cash}
                            onChange={(e) =>
                                setData('opening_cash', e.target.value)
                            }
                            placeholder="Enter opening cash amount"
                            className="w-full rounded-md border border-border px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                        />
                        {errors.opening_cash && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.opening_cash}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                        Open Session
                    </button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
