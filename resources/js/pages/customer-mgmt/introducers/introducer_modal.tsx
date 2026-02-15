import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ModalMode } from '../../../types/base_types';
import { CustomerIntroducer } from '../../../types/customer';

interface Props {
    open: boolean;
    onClose: () => void;
    mode: ModalMode;
    customerId: number;
    introducer?: CustomerIntroducer | null;
    onSaved?: () => void;
}

const emptyForm = {
    introducer_customer_id: 0,
    introducer_account_id: 0,
    relationship_type: 'OTHER' as
        | 'FAMILY'
        | 'FRIEND'
        | 'BUSINESS'
        | 'COLLEAGUE'
        | 'OTHER',
    remarks: '',
};

type Form = typeof emptyForm;
type FormErrors = Partial<Record<keyof Form, string>>;

export default function IntroducerModal({
    open,
    onClose,
    mode,
    customerId,
    introducer,
    onSaved,
}: Props) {
    const isView = mode === 'view';

    const [form, setForm] = useState<Form>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setForm({
            introducer_customer_id: introducer?.introducer_customer_id ?? 0,
            introducer_account_id: introducer?.introducer_account_id ?? 0,
            relationship_type: introducer?.relationship_type ?? 'OTHER',
            remarks: introducer?.remarks ?? '',
        });
        setErrors({});
    }, [introducer, customerId, open]);

    const handleChange = <K extends keyof Form>(key: K, value: Form[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const submit = async () => {
        if (isView) return;
        setProcessing(true);

        try {
            const payload = {
                introduced_customer_id: customerId,
                ...form,
            };

            if (mode === 'create') {
                await axios.post('/introducers', payload);
                toast.success('Introducer added successfully');
            } else if (mode === 'edit' && introducer?.id) {
                await axios.put(`/introducers/${introducer.id}`, payload);
                toast.success('Introducer updated successfully');
            }

            onSaved?.();
            onClose();
        } catch (err: any) {
            if (err.response?.status === 422 && err.response.data?.errors) {
                const backendErrors: FormErrors = {};
                Object.entries(err.response.data.errors).forEach(
                    ([field, messages]: any) => {
                        backendErrors[field as keyof Form] = messages[0];
                    },
                );
                setErrors(backendErrors);
                return;
            }

            toast.error(err.response?.data?.error || err.message);
        } finally {
            setProcessing(false);
        }
    };

    const renderError = (field: keyof Form) =>
        errors[field] ? (
            <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
        ) : null;

    const errorClass = (field: keyof Form) =>
        errors[field] ? 'border-red-500' : '';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-md space-y-3">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' && 'Add Introducer'}
                        {mode === 'edit' && 'Edit Introducer'}
                        {mode === 'view' && 'View Introducer'}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-3">
                    <div>
                        <Label className="text-xs">
                            Introducer Customer ID
                        </Label>
                        <Input
                            type="number"
                            disabled={isView}
                            value={form.introducer_customer_id}
                            onChange={(e) =>
                                handleChange(
                                    'introducer_customer_id',
                                    Number(e.target.value),
                                )
                            }
                            className={`h-8 text-sm ${errorClass(
                                'introducer_customer_id',
                            )}`}
                        />
                        {renderError('introducer_customer_id')}
                    </div>

                    <div>
                        <Label className="text-xs">Introducer Account ID</Label>
                        <Input
                            type="number"
                            disabled={isView}
                            value={form.introducer_account_id}
                            onChange={(e) =>
                                handleChange(
                                    'introducer_account_id',
                                    Number(e.target.value),
                                )
                            }
                            className={`h-8 text-sm ${errorClass(
                                'introducer_account_id',
                            )}`}
                        />
                        {renderError('introducer_account_id')}
                    </div>

                    <div>
                        <Label className="text-xs">Relationship Type</Label>
                        <select
                            disabled={isView}
                            value={form.relationship_type}
                            onChange={(e) =>
                                handleChange(
                                    'relationship_type',
                                    e.target.value as Form['relationship_type'],
                                )
                            }
                            className={`h-8 w-full rounded-md border border-border bg-background px-2 text-sm ${errorClass(
                                'relationship_type',
                            )}`}
                        >
                            <option value="FAMILY">Family</option>
                            <option value="FRIEND">Friend</option>
                            <option value="BUSINESS">Business</option>
                            <option value="COLLEAGUE">Colleague</option>
                            <option value="OTHER">Other</option>
                        </select>
                        {renderError('relationship_type')}
                    </div>

                    <div>
                        <Label className="text-xs">Remarks</Label>
                        <Input
                            disabled={isView}
                            value={form.remarks}
                            onChange={(e) =>
                                handleChange('remarks', e.target.value)
                            }
                            className={`h-8 text-sm ${errorClass('remarks')}`}
                        />
                        {renderError('remarks')}
                    </div>
                </div>

                {!isView && (
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button disabled={processing} onClick={submit}>
                            {mode === 'create' ? 'Create' : 'Update'}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
