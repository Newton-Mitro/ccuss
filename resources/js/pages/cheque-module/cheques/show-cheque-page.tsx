import HeadingSmall from '@/components/heading-small';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { Badge } from '@/lib/statusConfig';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function Show() {
    const { cheque } = usePage<any>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cheques', href: route('cheques.index') },
        { title: cheque.cheque_number, href: '#' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cheque ${cheque.cheque_number}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <HeadingSmall
                        title={`Cheque #${cheque.cheque_number}`}
                        description="Full cheque lifecycle & tracking"
                    />
                </div>

                {/* ================= OVERVIEW ================= */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-md border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-xl font-semibold">
                            {formatBDTCurrency(cheque.amount)}
                        </p>
                    </div>

                    <div className="rounded-md border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge text={cheque.status} />
                    </div>

                    <div className="rounded-md border bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                            Cheque Date
                        </p>
                        <p>{cheque.cheque_date || '-'}</p>
                    </div>
                </div>

                {/* ================= PAYEE ================= */}
                <div className="rounded-md border bg-card p-4">
                    <h3 className="mb-3 font-medium">Payee Information</h3>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Payee Name
                            </p>
                            <p>{cheque.payee_name || '-'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Remarks
                            </p>
                            <p>{cheque.remarks || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* ================= ISSUER ================= */}
                <div className="rounded-md border bg-card p-4">
                    <h3 className="mb-3 font-medium">Issuer Details</h3>

                    <div className="grid gap-3 md:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Bank
                            </p>
                            <p>{cheque.issuer_bank_name || '-'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Branch
                            </p>
                            <p>{cheque.issuer_branch || '-'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Account
                            </p>
                            <p>{cheque.issuer_account?.name || 'External'}</p>
                        </div>
                    </div>
                </div>

                {/* ================= CHEQUE BOOK ================= */}
                <div className="rounded-md border bg-card p-4">
                    <h3 className="mb-3 font-medium">Cheque Book</h3>

                    <p>
                        {cheque.cheque_book
                            ? `Book No: ${cheque.cheque_book.book_no}`
                            : 'External Cheque'}
                    </p>
                </div>

                {/* ================= DEPOSIT ================= */}
                <div className="rounded-md border bg-card p-4">
                    <h3 className="mb-3 font-medium">Deposit Details</h3>

                    {cheque.deposit ? (
                        <div className="grid gap-3 md:grid-cols-3">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Deposit Account
                                </p>
                                <p>{cheque.deposit.deposit_account?.name}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Deposit Date
                                </p>
                                <p>{cheque.deposit.deposit_date}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Status
                                </p>
                                <Badge text={cheque.deposit.status} />
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">
                            Not deposited yet
                        </p>
                    )}
                </div>

                {/* ================= CLEARING ================= */}
                <div className="rounded-md border bg-card p-4">
                    <h3 className="mb-3 font-medium">Clearing Lifecycle</h3>

                    {cheque.clearing_items?.length ? (
                        <div className="space-y-3">
                            {cheque.clearing_items.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="rounded-md border p-3"
                                >
                                    <div className="flex justify-between">
                                        <p>
                                            Batch:{' '}
                                            {item.clearing_batch?.batch_number}
                                        </p>

                                        <Badge text={item.status} />
                                    </div>

                                    {item.return_reason && (
                                        <p className="text-sm text-destructive">
                                            Reason: {item.return_reason}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">
                            Not sent to clearing
                        </p>
                    )}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
