import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';

export default function TellerSessionShow() {
    const { session, message } = usePage().props;
    const [closingCash, setClosingCash] = useState('');

    const closeSession = () => {
        router.post(route('teller-sessions.close', session.id), {
            closing_cash: closingCash,
        });
    };

    return (
        <div className="p-6">
            {message && (
                <div className="mb-4 rounded bg-green-100 p-2 text-green-800">
                    {message}
                </div>
            )}

            <h1 className="mb-4 text-2xl font-bold">Teller Session Details</h1>

            <div className="mb-4">
                <p>
                    <strong>Teller:</strong> {session.teller.name}
                </p>
                <p>
                    <strong>Branch Date:</strong>{' '}
                    {session.branch_day.business_date}
                </p>
                <p>
                    <strong>Opening Cash:</strong> {session.opening_cash}
                </p>
                <p>
                    <strong>Closing Cash:</strong> {session.closing_cash ?? '-'}
                </p>
                <p>
                    <strong>Status:</strong> {session.status}
                </p>
                <p>
                    <strong>Opened At:</strong> {session.opened_at}
                </p>
                <p>
                    <strong>Closed At:</strong> {session.closed_at ?? '-'}
                </p>
            </div>

            {session.status === 'OPEN' && (
                <div className="mt-4">
                    <input
                        type="number"
                        placeholder="Enter closing cash"
                        value={closingCash}
                        onChange={(e) => setClosingCash(e.target.value)}
                        className="mr-2 rounded border p-2"
                    />
                    <button
                        onClick={closeSession}
                        className="rounded bg-red-500 px-4 py-2 text-white"
                    >
                        Close Session
                    </button>
                </div>
            )}
        </div>
    );
}
