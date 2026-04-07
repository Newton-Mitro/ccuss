import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import InputError from '../../../components/input-error';
import { Select } from '../../../components/ui/select';
import { SharedData } from '../../../types';

interface Props extends SharedData {
    vault?: any;
    branches: { id: number; name: string }[];
}

export default function VaultForm({ vault, branches, flash }: Props) {
    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

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
                <Select
                    value={data.branch_id}
                    onChange={(value) => setData('branch_id', value)}
                    options={branches.map((b) => ({
                        value: b.id.toString(),
                        label: b.name,
                    }))}
                />
                <InputError message={errors.branch_id} />
            </div>

            <div>
                <label>Name</label>
                <input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                <InputError message={errors.name} />
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
