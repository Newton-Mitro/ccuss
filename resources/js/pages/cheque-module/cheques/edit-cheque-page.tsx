import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function Edit() {
    const { cheque, cheque_books, subledger_accounts } = usePage<any>().props;

    const isLocked = ['cleared', 'cancelled'].includes(cheque.status);

    const { data, setData, put, processing, errors } = useForm({
        cheque_number: cheque.cheque_number || '',
        cheque_date: cheque.cheque_date || '',
        amount: cheque.amount || '',
        payee_name: cheque.payee_name || '',
        remarks: cheque.remarks || '',
        issuer_bank_name: cheque.issuer_bank_name || '',
        issuer_branch: cheque.issuer_branch || '',
        cheque_book_id: cheque.cheque_book_id || '',
        issuer_account_id: cheque.issuer_account_id || '',
        status: cheque.status,
        stop_payment: cheque.stop_payment || false,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cheques', href: route('cheques.index') },
        { title: cheque.cheque_number, href: route('cheques.show', cheque.id) },
        { title: 'Edit', href: '#' },
    ];

    const submit = (e: any) => {
        e.preventDefault();

        put(route('cheques.update', cheque.id));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Cheque ${cheque.cheque_number}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <HeadingSmall
                        title="Edit Cheque"
                        description="Modify cheque details carefully"
                    />
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-md border bg-card p-6"
                >
                    {/* ================= BASIC ================= */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label>Cheque Number</label>
                            <Input
                                value={data.cheque_number}
                                disabled={isLocked}
                                onChange={(e) =>
                                    setData('cheque_number', e.target.value)
                                }
                            />
                            {errors.cheque_number && (
                                <p className="text-sm text-destructive">
                                    {errors.cheque_number}
                                </p>
                            )}
                        </div>

                        <div>
                            <label>Date</label>
                            <Input
                                type="date"
                                value={data.cheque_date}
                                disabled={isLocked}
                                onChange={(e) =>
                                    setData('cheque_date', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label>Amount</label>
                            <Input
                                type="number"
                                value={data.amount}
                                disabled={isLocked}
                                onChange={(e) =>
                                    setData('amount', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* ================= PAYEE ================= */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label>Payee Name</label>
                            <Input
                                value={data.payee_name}
                                disabled={isLocked}
                                onChange={(e) =>
                                    setData('payee_name', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label>Remarks</label>
                            <Input
                                value={data.remarks}
                                onChange={(e) =>
                                    setData('remarks', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* ================= ISSUER ================= */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label>Issuer Bank</label>
                            <Input
                                value={data.issuer_bank_name}
                                disabled={!!data.issuer_account_id}
                                onChange={(e) =>
                                    setData('issuer_bank_name', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label>Branch</label>
                            <Input
                                value={data.issuer_branch}
                                disabled={!!data.issuer_account_id}
                                onChange={(e) =>
                                    setData('issuer_branch', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label>Internal Account</label>
                            <Select
                                value={data.issuer_account_id}
                                onChange={(v) => {
                                    setData('issuer_account_id', v);
                                    if (v) {
                                        setData('issuer_bank_name', '');
                                        setData('issuer_branch', '');
                                    }
                                }}
                                options={subledger_accounts.map((a: any) => ({
                                    value: a.id,
                                    label: a.name,
                                }))}
                            />
                        </div>
                    </div>

                    {/* ================= CHEQUE BOOK ================= */}
                    <div>
                        <label>Cheque Book</label>
                        <Select
                            value={data.cheque_book_id}
                            disabled={isLocked}
                            onChange={(v) => setData('cheque_book_id', v)}
                            options={cheque_books.map((b: any) => ({
                                value: b.id,
                                label: b.book_no,
                            }))}
                        />
                    </div>

                    {/* ================= STATUS ================= */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label>Status</label>
                            <Select
                                value={data.status}
                                onChange={(v) => setData('status', v)}
                                options={[
                                    'issued',
                                    'presented',
                                    'cleared',
                                    'bounced',
                                    'cancelled',
                                ].map((s) => ({
                                    value: s,
                                    label: s,
                                }))}
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                checked={data.stop_payment}
                                onChange={(e) =>
                                    setData('stop_payment', e.target.checked)
                                }
                            />
                            <label>Stop Payment</label>
                        </div>
                    </div>

                    {/* ================= ACTION ================= */}
                    <div className="flex justify-end gap-3">
                        <Link href={route('cheques.index')}>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </Link>

                        <Button disabled={processing || isLocked}>
                            Update Cheque
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
