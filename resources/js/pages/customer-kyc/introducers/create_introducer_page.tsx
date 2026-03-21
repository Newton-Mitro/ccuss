import { Head, useForm } from '@inertiajs/react';
import { CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';

export default function Create() {
    const { data, setData, post, processing } = useForm({
        introduced_customer_id: '',
        introducer_customer_id: '',
        relationship_type: 'OTHER',
    });

    return (
        <CustomAuthLayout>
            <Head title="Create Introducer" />

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/customer-introducers');
                }}
                className="space-y-4 rounded-md border bg-card p-6"
            >
                <Input
                    placeholder="Introduced Customer"
                    onChange={(e) =>
                        setData('introduced_customer_id', e.target.value)
                    }
                />

                <Input
                    placeholder="Introducer Customer"
                    onChange={(e) =>
                        setData('introducer_customer_id', e.target.value)
                    }
                />

                <select
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
