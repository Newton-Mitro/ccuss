import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDate } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { BranchDay, Teller } from '../../../types/cash_treasury_module';

interface Props extends SharedData {
    teller: Teller;
    branch_day: BranchDay;
    cash_accounts: any[];
}
export default function OpenTellerSession() {
    const { branch_day, teller, cash_accounts } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm({
        teller_id: teller?.id || '',
        branch_day_id: branch_day?.id || '',
        cash_account_id: '',
        remarks: '',
    });

    useFlashToastHandler();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('teller-sessions.store'));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Teller Sessions', href: route('teller-sessions.index') },
        { title: 'Open Session', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Open Teller Session" />

            <div className="space-y-4">
                <HeadingSmall
                    title="Open Teller Session"
                    description="Start a new teller session for your branch"
                />

                <form
                    onSubmit={handleSubmit}
                    className="w-full space-y-4 rounded-md border bg-card p-6 md:p-10"
                >
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                        {/* Teller */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Teller
                            </label>
                            <Input value={teller?.name || ''} disabled />
                            {errors.teller_id && (
                                <p className="text-sm text-destructive">
                                    {errors.teller_id}
                                </p>
                            )}
                        </div>

                        {/* Branch Day */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Branch Day
                            </label>
                            <Input
                                value={formatDate(
                                    branch_day?.business_date || '',
                                )}
                                disabled
                            />
                            {errors.branch_day_id && (
                                <p className="text-sm text-destructive">
                                    {errors.branch_day_id}
                                </p>
                            )}
                        </div>

                        {/* 💰 Cash Account (NEW - CRITICAL) */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Cash Account
                            </label>

                            <Select
                                value={data.cash_account_id}
                                onChange={(val) =>
                                    setData('cash_account_id', val)
                                }
                                options={cash_accounts.map((acc) => ({
                                    value: acc.id.toString(),
                                    label: acc.name,
                                }))}
                                placeholder="Select Cash Account"
                            />

                            {errors.cash_account_id && (
                                <p className="text-sm text-destructive">
                                    {errors.cash_account_id}
                                </p>
                            )}
                        </div>

                        {/* 📝 Remarks */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Remarks (Optional)
                            </label>
                            <Input
                                value={data.remarks}
                                onChange={(e) =>
                                    setData('remarks', e.target.value)
                                }
                                placeholder="Enter remarks"
                            />
                            {errors.remarks && (
                                <p className="text-sm text-destructive">
                                    {errors.remarks}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing ? 'Opening Session...' : 'Open Session'}
                        </button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
