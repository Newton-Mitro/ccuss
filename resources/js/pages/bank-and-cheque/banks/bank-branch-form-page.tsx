import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const BankForm = ({ bank, flash }) => {
    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const isEdit = !!bank;
    const handleBack = () => window.history.back();

    const { data, setData, post, put, processing, errors } = useForm({
        name: bank?.name || '',
        short_name: bank?.short_name || '',
        swift_code: bank?.swift_code || '',
        routing_number: bank?.routing_number || '',
        status: bank?.status || 'active',

        branches: bank?.branches || [
            { name: '', routing_number: '', address: '' },
        ],
    });

    // ------------------------
    // Branch Handlers
    // ------------------------
    const addBranch = () => {
        setData('branches', [
            ...data.branches,
            { name: '', routing_number: '', address: '' },
        ]);
    };

    const removeBranch = (index) => {
        const updated = [...data.branches];
        updated.splice(index, 1);
        setData('branches', updated);
    };

    const updateBranch = (index, field, value) => {
        const updated = [...data.branches];
        updated[index][field] = value;
        setData('branches', updated);
    };

    // ------------------------
    // Submit
    // ------------------------
    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(`/banks/${bank.id}`, { preserveScroll: true });
        } else {
            post('/banks', { preserveScroll: true });
        }
    };

    return (
        <CustomAuthLayout>
            <Head title={isEdit ? 'Edit Bank' : 'Create Bank'} />

            {/* Header */}
            <div className="flex justify-between pb-4">
                <HeadingSmall
                    title={isEdit ? `Edit: ${bank?.name}` : 'Create Bank'}
                    description="Manage bank and branch details."
                />
                <button
                    onClick={handleBack}
                    className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-md border bg-card p-6"
            >
                {/* ---------------- BANK INFO ---------------- */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label className="text-xs">Bank Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <Label className="text-xs">Short Name</Label>
                        <Input
                            value={data.short_name}
                            onChange={(e) =>
                                setData('short_name', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label className="text-xs">SWIFT Code</Label>
                        <Input
                            value={data.swift_code}
                            onChange={(e) =>
                                setData('swift_code', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label className="text-xs">Routing Number</Label>
                        <Input
                            value={data.routing_number}
                            onChange={(e) =>
                                setData('routing_number', e.target.value)
                            }
                        />
                    </div>
                </div>

                {/* STATUS */}
                <ToggleGroup
                    type="single"
                    value={data.status}
                    onValueChange={(val) => setData('status', val)}
                >
                    <ToggleGroupItem value="active">Active</ToggleGroupItem>
                    <ToggleGroupItem value="inactive">Inactive</ToggleGroupItem>
                </ToggleGroup>

                {/* ---------------- BRANCHES ---------------- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Branches</h3>
                        <Button type="button" onClick={addBranch} size="sm">
                            <Plus className="mr-1 h-4 w-4" />
                            Add Branch
                        </Button>
                    </div>

                    <div className="space-y-2 border p-3">
                        {data.branches.map((branch, index) => (
                            <div key={index} className="flex gap-3 rounded-md">
                                <div className="w-3/12">
                                    <Input
                                        placeholder="Branch Name"
                                        value={branch.name}
                                        onChange={(e) =>
                                            updateBranch(
                                                index,
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="w-3/12">
                                    <Input
                                        placeholder="Routing Number"
                                        value={branch.routing_number}
                                        onChange={(e) =>
                                            updateBranch(
                                                index,
                                                'routing_number',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex w-6/12 gap-2">
                                    <div className="w-11/12">
                                        <Input
                                            placeholder="Address"
                                            value={branch.address}
                                            onChange={(e) =>
                                                updateBranch(
                                                    index,
                                                    'address',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="1/12 flex items-center justify-end">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeBranch(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SUBMIT */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCheck className="mr-2 h-4 w-4" />
                                {isEdit ? 'Update' : 'Create'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default BankForm;
