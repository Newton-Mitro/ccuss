import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCheck, Loader2 } from 'lucide-react';
import { route } from 'ziggy-js';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';

export default function Create() {
    const { customer, flash } = usePage().props as any;

    const { data, setData, post, processing } = useForm({
        customer_id: customer.id,
        document_type: '',
        file: null as File | null,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('customer_id', data.customer_id);
        formData.append('document_type', data.document_type);
        if (data.file) formData.append('file', data.file);

        post(route('kyc-documents.store'), { data: formData });
    };

    return (
        <CustomAuthLayout>
            <Head title="Upload KYC Document" />

            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-md border bg-card p-6"
            >
                <Input
                    value={data.customer_id}
                    placeholder="Customer ID"
                    onChange={(e) => setData('customer_id', e.target.value)}
                />

                <select
                    value={data.document_type}
                    onChange={(e) => setData('document_type', e.target.value)}
                >
                    <option>NID_FRONT</option>
                    <option>NID_BACK</option>
                    <option>PASSPORT</option>
                </select>

                <input
                    type="file"
                    onChange={(e) =>
                        setData('file', e.target.files?.[0] || null)
                    }
                />

                <Button disabled={processing}>
                    {processing ? <Loader2 /> : <CheckCheck />}
                    Upload
                </Button>
            </form>
        </CustomAuthLayout>
    );
}
