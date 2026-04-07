import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import { SharedData } from '../../../types';

interface Props extends SharedData {
    vaults: any[];
}

export default function VaultToVault({ vaults, flash }: Props) {
    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const { data, setData, post } = useForm({
        from_vault_id: '',
        to_vault_id: '',
        amount: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('vault.transfer.vault'));
    }

    return (
        <div className="p-6">
            <h1 className="mb-4 text-xl font-bold">Vault → Vault Transfer</h1>

            <form onSubmit={submit} className="space-y-4">
                <select
                    onChange={(e) => setData('from_vault_id', e.target.value)}
                    className="w-full border p-2"
                >
                    <option>From Vault</option>
                    {vaults.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name}
                        </option>
                    ))}
                </select>

                <select
                    onChange={(e) => setData('to_vault_id', e.target.value)}
                    className="w-full border p-2"
                >
                    <option>To Vault</option>
                    {vaults.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Amount"
                    className="w-full border p-2"
                    onChange={(e) => setData('amount', e.target.value)}
                />

                <button className="bg-purple-600 px-4 py-2 text-white">
                    Transfer
                </button>
            </form>
        </div>
    );
}
