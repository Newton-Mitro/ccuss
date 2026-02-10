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
import { CustomerAddress } from '../../../types/customer';

const addressTypes = [
    'CURRENT',
    'PERMANENT',
    'MAILING',
    'WORK',
    'REGISTERED',
    'OTHER',
];

interface Props {
    open: boolean;
    onClose: () => void;
    mode: ModalMode;
    customerId: number;
    address?: CustomerAddress | null;
    onSaved?: () => void;
}

const emptyForm = {
    line1: '',
    line2: '',
    division: '',
    district: '',
    upazila: '',
    union_ward: '',
    postal_code: '',
    country: '',
    type: '',
    remarks: '',
};

type Form = typeof emptyForm;
type FormErrors = Partial<Record<keyof Form, string>>;

export default function CustomerAddressModal({
    open,
    onClose,
    mode,
    customerId,
    address,
    onSaved,
}: Props) {
    const isView = mode === 'view';

    const [form, setForm] = useState<Form>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [processing, setProcessing] = useState(false);

    // Reset form & errors
    useEffect(() => {
        setForm({
            line1: address?.line1 ?? '',
            line2: address?.line2 ?? '',
            division: address?.division ?? '',
            district: address?.district ?? '',
            upazila: address?.upazila ?? '',
            union_ward: address?.union_ward ?? '',
            postal_code: address?.postal_code ?? '',
            country: address?.country ?? '',
            type: address?.type ?? '',
            remarks: address?.remarks ?? '',
        });
        setErrors({});
    }, [address, customerId, open]);

    const handleChange = <K extends keyof Form>(key: K, value: Form[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const submit = async () => {
        if (isView) return;
        setProcessing(true);

        try {
            const payload = {
                customer_id: customerId,
                ...form,
            };

            if (mode === 'create') {
                await axios.post('/auth/addresses', payload);
                toast.success('Address created successfully');
            } else if (mode === 'edit' && address?.id) {
                await axios.put(`/auth/addresses/${address.id}`, payload);
                toast.success('Address updated successfully');
            }

            onSaved?.();
            onClose();
        } catch (err: any) {
            // SERVER-SIDE LARAVEL VALIDATION
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
                        {mode === 'create' && 'Add Address'}
                        {mode === 'edit' && 'Edit Address'}
                        {mode === 'view' && 'View Address'}
                    </DialogTitle>
                </DialogHeader>

                {/* FORM */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <Label className="text-xs">Address Type</Label>
                        <select
                            disabled={isView}
                            value={form.type}
                            onChange={(e) =>
                                handleChange('type', e.target.value)
                            }
                            className={`h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none ${errorClass('type')}`}
                        >
                            <option value="">Select Address Type</option>
                            {addressTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type.charAt(0) +
                                        type.slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>
                        {renderError('type')}
                    </div>

                    <div>
                        <Label className="text-xs">Address Line 1</Label>
                        <Input
                            disabled={isView}
                            value={form.line1}
                            onChange={(e) =>
                                handleChange('line1', e.target.value)
                            }
                            className={`h-8 text-sm ${errorClass('line1')}`}
                        />
                        {renderError('line1')}
                    </div>

                    <div>
                        <Label className="text-xs">Address Line 2</Label>
                        <Input
                            disabled={isView}
                            value={form.line2}
                            onChange={(e) =>
                                handleChange('line2', e.target.value)
                            }
                            className={`h-8 text-sm ${errorClass('line2')}`}
                        />
                        {renderError('line2')}
                    </div>

                    <div>
                        <Label className="text-xs">District/City</Label>
                        <Input
                            disabled={isView}
                            value={form.district}
                            onChange={(e) =>
                                handleChange('district', e.target.value)
                            }
                            className={`h-8 text-sm ${errorClass('district')}`}
                        />
                        {renderError('district')}
                    </div>

                    <div>
                        <Label className="text-xs">Division/State</Label>
                        <Input
                            disabled={isView}
                            value={form.division}
                            onChange={(e) =>
                                handleChange('division', e.target.value)
                            }
                            className={`h-8 text-sm ${errorClass('division')}`}
                        />
                        {renderError('division')}
                    </div>

                    <div>
                        <Label className="text-xs">Upazila</Label>
                        <Input
                            disabled={isView}
                            value={form.upazila}
                            onChange={(e) =>
                                handleChange('upazila', e.target.value)
                            }
                            className={`h-8 text-sm ${errorClass('upazila')}`}
                        />
                        {renderError('upazila')}
                    </div>

                    <div>
                        <Label className="text-xs">Union / Ward</Label>
                        <Input
                            disabled={isView}
                            value={form.union_ward}
                            onChange={(e) =>
                                handleChange('union_ward', e.target.value)
                            }
                            className={`h-8 text-sm ${errorClass('union_ward')}`}
                        />
                        {renderError('union_ward')}
                    </div>

                    <div>
                        <Label className="text-xs">Postal Code</Label>
                        <Input
                            disabled={isView}
                            value={form.postal_code}
                            onChange={(e) =>
                                handleChange('postal_code', e.target.value)
                            }
                            className={`h-8 text-sm ${errorClass('postal_code')}`}
                        />
                        {renderError('postal_code')}
                    </div>

                    <div>
                        <Label className="text-xs">Country</Label>
                        <Input
                            disabled={isView}
                            value={form.country}
                            onChange={(e) =>
                                handleChange('country', e.target.value)
                            }
                            className={`h-8 text-sm ${errorClass('country')}`}
                        />
                        {renderError('country')}
                    </div>
                </div>

                {/* ACTIONS */}
                {!isView && (
                    <div className="flex flex-col justify-end gap-2 pt-4 sm:flex-row">
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
