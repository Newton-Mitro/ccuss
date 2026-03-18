import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Props = {
    vault?: any;
    branches: { id: number; name: string }[];
};

export default function VaultForm({ vault, branches }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        branch_id: vault?.branch_id || '',
        name: vault?.name || '',
        is_active: vault?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (vault) {
            put(route('vaults.update', vault.id));
        } else {
            post(route('vaults.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label>Branch</label>
                <select
                    value={data.branch_id}
                    onChange={(e) => setData('branch_id', e.target.value)}
                >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>
                {errors.branch_id && <div>{errors.branch_id}</div>}
            </div>

            <div>
                <label>Name</label>
                <input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <div>{errors.name}</div>}
            </div>

            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                    />
                    Active
                </label>
            </div>

            <button disabled={processing}>{vault ? 'Update' : 'Create'}</button>
        </form>
    );
}
