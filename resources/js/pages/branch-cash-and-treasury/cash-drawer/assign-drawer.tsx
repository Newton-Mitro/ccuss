import { useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    sessions: any[];
    vaults: any[];
}

export default function AssignDrawer({ sessions, vaults }: Props) {
    const { data, setData, post, processing } = useForm({
        teller_session_id: '',
        vault_id: '',
        opening_balance: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('cash-drawer.assign'));
    }

    return (
        <div className="p-6">
            <h1 className="mb-4 text-xl font-bold">Assign Cash Drawer</h1>

            <form onSubmit={submit} className="space-y-4">
                <select
                    className="w-full border p-2"
                    onChange={(e) =>
                        setData('teller_session_id', e.target.value)
                    }
                >
                    <option>Select Teller Session</option>
                    {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.id}
                        </option>
                    ))}
                </select>

                <select
                    className="w-full border p-2"
                    onChange={(e) => setData('vault_id', e.target.value)}
                >
                    <option>Select Vault</option>
                    {vaults.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    className="w-full border p-2"
                    placeholder="Opening Balance"
                    onChange={(e) => setData('opening_balance', e.target.value)}
                />

                <button
                    disabled={processing}
                    className="bg-green-500 px-4 py-2 text-white"
                >
                    Assign Drawer
                </button>
            </form>
        </div>
    );
}
