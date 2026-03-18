import { useForm } from '@inertiajs/react';

interface Props {
    drawer: any;
}

export default function TransactionPage({ drawer }: Props) {
    const { data, setData, post } = useForm({
        amount: '',
        reference: '',
    });

    function cashIn() {
        post(route('cash.transaction.in'));
    }

    function cashOut() {
        post(route('cash.transaction.out'));
    }

    return (
        <div className="p-6">
            <h1 className="mb-4 text-xl font-bold">Cash Transaction</h1>

            <input
                type="number"
                placeholder="Amount"
                className="mb-3 w-full border p-2"
                onChange={(e) => setData('amount', e.target.value)}
            />

            <input
                type="text"
                placeholder="Reference"
                className="mb-3 w-full border p-2"
                onChange={(e) => setData('reference', e.target.value)}
            />

            <div className="flex gap-4">
                <button
                    onClick={cashIn}
                    className="bg-green-500 px-4 py-2 text-white"
                >
                    Cash In
                </button>

                <button
                    onClick={cashOut}
                    className="bg-red-500 px-4 py-2 text-white"
                >
                    Cash Out
                </button>
            </div>
        </div>
    );
}
