import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { SharedData } from '../../../types';

interface Props extends SharedData {
    drawer_id: number;
}

export default function AdjustmentApproval({ drawer_id, flash }: Props) {
    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const { data, setData, post } = useForm({
        cash_drawer_id: drawer_id,
        amount: '',
        type: 'shortage',
        reason: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('cash.adjustment.approve'));
    }

    return (
        <div className="p-6">
            <h1 className="mb-4 text-xl font-bold">Cash Adjustment Approval</h1>

            <form onSubmit={submit} className="space-y-3">
                <select
                    className="w-full border p-2"
                    onChange={(e) => setData('type', e.target.value)}
                >
                    <option value="shortage">Shortage</option>
                    <option value="excess">Excess</option>
                </select>

                <input
                    type="number"
                    placeholder="Amount"
                    className="w-full border p-2"
                    onChange={(e) => setData('amount', e.target.value)}
                />

                <textarea
                    placeholder="Reason"
                    className="w-full border p-2"
                    onChange={(e) => setData('reason', e.target.value)}
                />

                <button className="bg-orange-500 px-4 py-2 text-white">
                    Approve Adjustment
                </button>
            </form>
        </div>
    );
}
