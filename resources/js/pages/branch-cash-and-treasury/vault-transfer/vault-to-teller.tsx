import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import { SharedData } from '../../../types';

interface Props extends SharedData {
    vaults: any[];
    sessions: any[];
}

export default function VaultToTeller({ vaults, sessions, flash }: Props) {
    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const { data, setData, post } = useForm({
        vault_id: '',
        teller_session_id: '',
        amount: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('vault.transfer.teller'));
    }

    return (
        <div className="p-6">
            <h1 className="mb-4 text-xl font-bold">Vault → Teller Transfer</h1>

            <form onSubmit={submit} className="space-y-4">
                <select
                    onChange={(e) => setData('vault_id', e.target.value)}
                    className="w-full border p-2"
                >
                    <option>Select Vault</option>
                    {vaults.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name}
                        </option>
                    ))}
                </select>

                <select
                    onChange={(e) =>
                        setData('teller_session_id', e.target.value)
                    }
                    className="w-full border p-2"
                >
                    <option>Select Teller</option>
                    {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.id}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Amount"
                    className="w-full border p-2"
                    onChange={(e) => setData('amount', e.target.value)}
                />

                <button className="bg-blue-600 px-4 py-2 text-white">
                    Transfer
                </button>
            </form>
        </div>
    );
}
