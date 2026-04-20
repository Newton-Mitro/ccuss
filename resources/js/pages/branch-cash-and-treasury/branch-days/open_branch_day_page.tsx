import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Branch } from '../../../types/branch';

interface Props extends SharedData {
    branch: Branch;
    business_date: string;
}

const OpenBranchDay = ({ branch, business_date }: Props) => {
    const { data, setData, post, processing, errors } = useForm({
        branch_id: branch.id,
        business_date: business_date ?? '',
    });

    useFlashToastHandler();

    const handleBack = () => window.history.back();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('branch-days.store'), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Branch Days', href: route('branch-days.index') },
        { title: 'Open Branch Day', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open Branch Day" />
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title="Open Branch Day"
                    description="Start a new branch day for operations."
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-4 rounded-md border bg-card p-4 sm:p-6"
            >
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                    {/* Branch Selection */}
                    <div>
                        <Label className="text-xs">Select Branch</Label>
                        <Input value={branch?.name} disabled></Input>
                        <InputError message={errors.branch_id} />
                    </div>

                    {/* Business Date */}
                    <div>
                        <Label className="text-xs">Business Date</Label>
                        <AppDatePicker
                            label=""
                            value={data.business_date}
                            onChange={(val) => setData('business_date', val)}
                        />
                        <InputError message={errors.business_date} />
                    </div>
                </div>

                {/* Submit */}
                <div className="mt-4 flex justify-end">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Opening...
                            </>
                        ) : (
                            <>
                                <CheckCheck className="h-4 w-4" />
                                Open Branch Day
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CustomAuthLayout>
    );
};

export default OpenBranchDay;
