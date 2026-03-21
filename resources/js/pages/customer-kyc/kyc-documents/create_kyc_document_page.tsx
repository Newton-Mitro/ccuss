import { Head, useForm } from '@inertiajs/react';
import { CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';

export default function Create() {
    const { data, setData, post, processing } = useForm({
        customer_id: '',
        document_type: '',
        file: null as File | null,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('customer_id', data.customer_id);
        formData.append('document_type', data.document_type);
        if (data.file) formData.append('file', data.file);

        post('/kyc-documents', { data: formData });
    };

    return (
        <CustomAuthLayout>
            <Head title="Upload KYC Document" />

            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-md border bg-card p-6"
            >
                <Input
                    placeholder="Customer ID"
                    onChange={(e) => setData('customer_id', e.target.value)}
                />

                <select
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
