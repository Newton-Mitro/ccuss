import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCheck, Loader2 } from 'lucide-react';
import { route } from 'ziggy-js';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';

export default function Create() {
    const { customer, flash } = usePage().props as any;

    const { data, setData, post, processing } = useForm({
        introduced_customer_id: customer.id,
        introducer_customer_id: '',
        relationship_type: 'OTHER',
    });

    return (
        <CustomAuthLayout>
            <Head title="Create Introducer" />

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post(route('introducers.store'));
                }}
                className="space-y-4 rounded-md border bg-card p-6"
            >
                <Input
                    value={data.introduced_customer_id}
                    placeholder="Introduced Customer"
                    onChange={(e) =>
                        setData('introduced_customer_id', e.target.value)
                    }
                />

                <Input
                    value={data.introducer_customer_id}
                    placeholder="Introducer Customer"
                    onChange={(e) =>
                        setData('introducer_customer_id', e.target.value)
                    }
                />

                <select
                    value={data.relationship_type}
                    onChange={(e) =>
                        setData('relationship_type', e.target.value)
                    }
                >
                    <option>FAMILY</option>
                    <option>FRIEND</option>
                    <option>BUSINESS</option>
                    <option>COLLEAGUE</option>
                </select>

                <Button disabled={processing}>
                    {processing ? <Loader2 /> : <CheckCheck />}
                    Save Introducer
                </Button>
            </form>
        </CustomAuthLayout>
    );
}
