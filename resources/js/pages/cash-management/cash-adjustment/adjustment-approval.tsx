import { useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    drawer_id: number;
}

export default function AdjustmentApproval({ drawer_id }: Props) {
    const { data, setData, post } = useForm({
        cash_drawer_id: drawer_id,
        amount: '',
        type: 'SHORTAGE',
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
                    <option value="SHORTAGE">Shortage</option>
                    <option value="EXCESS">Excess</option>
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
