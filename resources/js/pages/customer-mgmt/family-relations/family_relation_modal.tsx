import InputError from '@/components/input-error';
import AppDatePicker from '@/components/ui/app_date_picker';
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
import { Customer, CustomerFamilyRelation } from '../../../types/customer';
import { CustomerSearchInput } from '../customers/customer-search-input';

const relationTypes = [
    'FATHER',
    'MOTHER',
    'SON',
    'DAUGHTER',
    'BROTHER',
    'SISTER',
    'HUSBAND',
    'WIFE',
    'UNCLE',
    'AUNT',
    'NEPHEW',
    'NIECE',
];

interface Props {
    open: boolean;
    onClose: () => void;
    mode: ModalMode;
    customerId: number;
    relation?: CustomerFamilyRelation | null;
    onSaved?: () => void;
}

const emptyForm = {
    relative_id: null as number | null,
    relative_name: '',
    relation_type: '',
    phone: '',
    email: '',
    dob: '',
    gender: '',
    religion: '',
    identification_type: '',
    identification_number: '',
};

type Form = typeof emptyForm;
type Errors = Partial<Record<keyof Form, string>>;

export default function CustomerFamilyRelationModal({
    open,
    onClose,
    mode,
    customerId,
    relation,
    onSaved,
}: Props) {
    const isView = mode === 'view';

    const [form, setForm] = useState<Form>(emptyForm);
    const [errors, setErrors] = useState<Errors>({});
    const [processing, setProcessing] = useState(false);

    /* -------------------- Init -------------------- */
    useEffect(() => {
        setForm({
            relative_id: relation?.relative_id ?? null,
            relative_name: relation?.name ?? '',
            relation_type: relation?.relation_type ?? '',
            phone: relation?.phone ?? '',
            email: relation?.email ?? '',
            dob: relation?.dob ?? '',
            gender: relation?.gender ?? '',
            religion: relation?.religion ?? '',
            identification_type: relation?.identification_type ?? '',
            identification_number: relation?.identification_number ?? '',
        });
        setErrors({});
    }, [relation, open]);

    /* -------------------- Helpers -------------------- */
    const change = <K extends keyof Form>(key: K, value: Form[K]) => {
        setForm((p) => ({ ...p, [key]: value }));
        setErrors((p) => ({ ...p, [key]: undefined }));
    };

    const handleRelativeSelect = (relative: Customer) => {
        change('relative_id', relative.id);
        change('relative_name', relative.name);
        change('phone', relative.phone);
        change('email', relative.email);
        change('dob', relative.dob);
        change('gender', relative.gender);
        change('religion', relative.religion);
        change('identification_type', relative.identification_type);
        change('identification_number', relative.identification_number);
    };

    /* -------------------- Submit -------------------- */
    const submit = async () => {
        if (isView) return;

        setProcessing(true);

        try {
            const payload = {
                customer_id: customerId,
                ...form,
            };

            if (mode === 'create') {
                await axios.post('/family-relations', payload);
                toast.success('Family relation added');
            } else if (mode === 'edit' && relation?.id) {
                await axios.put(`/family-relations/${relation.id}`, payload);
                toast.success('Family relation updated');
            }

            onSaved?.();
            onClose();
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                return;
            }
            toast.error('Something went wrong');
        } finally {
            setProcessing(false);
        }
    };

    /* -------------------- UI -------------------- */
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' && 'Add Family Relation'}
                        {mode === 'edit' && 'Edit Family Relation'}
                        {mode === 'view' && 'View Family Relation'}
                    </DialogTitle>
                </DialogHeader>

                {/* Relative */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <CustomerSearchInput
                        disabled={isView}
                        onSelect={handleRelativeSelect}
                    />

                    <Field
                        label="Name"
                        value={form.relative_name}
                        disabled={isView}
                        onChange={(v) => change('relative_name', v)}
                        error={errors.relative_name}
                    />

                    <Select
                        label="Relation Type"
                        value={form.relation_type}
                        options={relationTypes}
                        disabled={isView}
                        onChange={(v) => change('relation_type', v)}
                        error={errors.relation_type}
                    />

                    <Field
                        label="Phone"
                        value={form.phone}
                        disabled={isView}
                        onChange={(v) => change('phone', v)}
                        error={errors.phone}
                    />

                    <Field
                        label="Email"
                        value={form.email}
                        disabled={isView}
                        onChange={(v) => change('email', v)}
                        error={errors.email}
                    />

                    <div>
                        <Label className="text-xs">DOB</Label>
                        <AppDatePicker
                            value={form.dob}
                            onChange={(v) => change('dob', v)}
                        />
                        <InputError message={errors.dob} />
                    </div>

                    <Select
                        label="Gender"
                        value={form.gender}
                        options={['MALE', 'FEMALE', 'OTHER']}
                        disabled={isView}
                        onChange={(v) => change('gender', v)}
                        error={errors.gender}
                    />

                    <Select
                        label="Religion"
                        value={form.religion}
                        options={[
                            'ISLAM',
                            'HINDUISM',
                            'CHRISTIANITY',
                            'BUDDHISM',
                            'OTHER',
                        ]}
                        disabled={isView}
                        onChange={(v) => change('religion', v)}
                        error={errors.religion}
                    />

                    <Field
                        label="ID Type"
                        value={form.identification_type}
                        disabled={isView}
                        onChange={(v) => change('identification_type', v)}
                        error={errors.identification_type}
                    />

                    <Field
                        label="ID Number"
                        value={form.identification_number}
                        disabled={isView}
                        onChange={(v) => change('identification_number', v)}
                        error={errors.identification_number}
                    />
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

/* -------------------- Small Inputs -------------------- */
function Field({ label, value, disabled, onChange, error }: any) {
    return (
        <div>
            <Label className="text-xs">{label}</Label>
            <Input
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 text-sm"
            />
            <InputError message={error} />
        </div>
    );
}

function Select({ label, value, options, disabled, onChange, error }: any) {
    return (
        <div>
            <Label className="text-xs">{label}</Label>
            <select
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 w-full rounded-md border px-2 text-sm"
            >
                <option value="">Select</option>
                {options.map((o: string) => (
                    <option key={o} value={o}>
                        {o.replaceAll('_', ' ')}
                    </option>
                ))}
            </select>
            <InputError message={error} />
        </div>
    );
}
