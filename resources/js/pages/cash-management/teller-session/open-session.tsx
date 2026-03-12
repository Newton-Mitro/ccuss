import { useForm } from '@inertiajs/react';
import React from 'react';

export default function OpenSession() {
    const { data, setData, post, processing, errors } = useForm({
        opening_cash: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('teller-session.open'));
    }

    return (
        <div className="p-6">
            <h1 className="mb-4 text-xl font-bold">Open Teller Session</h1>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label>Opening Cash</label>
                    <input
                        type="number"
                        className="w-full border p-2"
                        value={data.opening_cash}
                        onChange={(e) =>
                            setData('opening_cash', e.target.value)
                        }
                    />
                    {errors.opening_cash && (
                        <div className="text-red-500">
                            {errors.opening_cash}
                        </div>
                    )}
                </div>

                <button
                    disabled={processing}
                    className="rounded bg-blue-500 px-4 py-2 text-white"
                >
                    Open Session
                </button>
            </form>
        </div>
    );
}
