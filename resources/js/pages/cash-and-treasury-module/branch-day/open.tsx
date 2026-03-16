import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface Branch {
    id: number;
    name: string;
}

interface Props {
    branches: Branch[];
    backUrl: string;
}

const OpenBranchDay = ({
    branches,
    business_date,
    branch_id,
    backUrl,
}: Props) => {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        branch_id: branch_id ?? '',
        business_date: business_date ?? '',
    });

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleBack = () => {
        router.visit(backUrl, { preserveState: true, preserveScroll: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/branch-cash/branch-day/open', {
            preserveScroll: true,
            onError: (e) => toast.error('Error: ' + JSON.stringify(e)),
            onSuccess: () => toast.success('Branch day opened successfully!'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Branch Day', href: '/branch-cash/branch-day/status' },
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
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1 rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full space-y-4 rounded-md border border-border bg-card p-4 sm:p-6 lg:w-4/12"
            >
                {/* Branch Selection */}
                <div>
                    <Label className="text-xs">Select Branch</Label>
                    <select
                        value={data.branch_id}
                        onChange={(e) => setData('branch_id', e.target.value)}
                        className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    >
                        <option value="">Select Branch</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
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

                {/* Submit */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg"
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
