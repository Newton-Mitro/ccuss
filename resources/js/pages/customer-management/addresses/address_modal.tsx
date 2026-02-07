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
import { CustomerAddress } from '../../../types/customer';

type Mode = 'create' | 'edit' | 'view';

interface Props {
    open: boolean;
    onClose: () => void;
    mode: Mode;
    customerId: number;
    address?: CustomerAddress | null;
    onSaved?: () => void;
}

export default function CustomerAddressModal({
    open,
    onClose,
    mode,
    customerId,
    address,
    onSaved,
}: Props) {
    const isView = mode === 'view';

    const [form, setForm] = useState({
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
    });

    const [processing, setProcessing] = useState(false);

    // Reset form whenever address or customerId changes
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
    }, [address, customerId]);

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const submit = async () => {
        if (isView) return;

        setProcessing(true);
        try {
            if (mode === 'create') {
                await axios.post('/auth/addresses', {
                    customer_id: customerId,
                    ...form,
                });
                toast.success('Address created successfully');
            } else if (mode === 'edit' && address?.id) {
                await axios.put(`/auth/addresses/${address.id}`, {
                    customer_id: customerId,
                    ...form,
                });
                toast.success('Address updated successfully');
            }

            onSaved?.();
            onClose();
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.error) {
                toast.error(err.response.data.error);
            } else {
                toast.error('Something went wrong');
            }
        } finally {
            setProcessing(false);
        }
    };

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

                {/** ===== FORM FIELDS ===== **/}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <Label className="text-xs">Address Line 1</Label>
                        <Input
                            disabled={isView}
                            value={form.line1}
                            onChange={(e) =>
                                handleChange('line1', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label className="text-xs">Address Line 2</Label>
                        <Input
                            disabled={isView}
                            value={form.line2}
                            onChange={(e) =>
                                handleChange('line2', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label className="text-xs">Division</Label>
                        <Input
                            disabled={isView}
                            value={form.division}
                            onChange={(e) =>
                                handleChange('division', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label className="text-xs">District</Label>
                        <Input
                            disabled={isView}
                            value={form.district}
                            onChange={(e) =>
                                handleChange('district', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label className="text-xs">Upazila</Label>
                        <Input
                            disabled={isView}
                            value={form.upazila}
                            onChange={(e) =>
                                handleChange('upazila', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label className="text-xs">Union / Ward</Label>
                        <Input
                            disabled={isView}
                            value={form.union_ward}
                            onChange={(e) =>
                                handleChange('union_ward', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label className="text-xs">Postal Code</Label>
                        <Input
                            disabled={isView}
                            value={form.postal_code}
                            onChange={(e) =>
                                handleChange('postal_code', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label className="text-xs">Country</Label>
                        <Input
                            disabled={isView}
                            value={form.country}
                            onChange={(e) =>
                                handleChange('country', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label className="text-xs">Type</Label>
                        <Input
                            disabled={isView}
                            value={form.type}
                            onChange={(e) =>
                                handleChange('type', e.target.value)
                            }
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <Label className="text-xs">Remarks</Label>
                        <Input
                            disabled={isView}
                            value={form.remarks}
                            onChange={(e) =>
                                handleChange('remarks', e.target.value)
                            }
                        />
                    </div>
                </div>

                {/** ===== BUTTONS ===== **/}
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
