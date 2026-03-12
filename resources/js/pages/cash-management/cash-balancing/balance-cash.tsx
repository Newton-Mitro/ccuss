import { useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    expected_balance: number;
    drawer_id: number;
}

export default function BalanceCash({ expected_balance, drawer_id }: Props) {
    const { data, setData, post } = useForm({
        cash_drawer_id: drawer_id,
        actual_balance: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('cash.balance'));
    }

    return (
        <div className="p-6">
            <h1 className="mb-4 text-xl font-bold">Cash Balancing</h1>

            <div className="mb-4">
                Expected Balance: <strong>{expected_balance}</strong>
            </div>

            <form onSubmit={submit}>
                <input
                    type="number"
                    placeholder="Actual Balance"
                    className="mb-3 w-full border p-2"
                    onChange={(e) => setData('actual_balance', e.target.value)}
                />

                <button className="bg-blue-500 px-4 py-2 text-white">
                    Balance Cash
                </button>
            </form>
        </div>
    );
}
