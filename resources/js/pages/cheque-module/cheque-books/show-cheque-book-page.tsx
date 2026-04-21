import HeadingSmall from '@/components/heading-small';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { Badge } from '@/lib/statusConfig';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function Show() {
    const { cheque_book } = usePage<any>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cheque Books', href: route('cheque-books.index') },
        { title: cheque_book.book_no, href: '#' },
    ];

    const total = cheque_book.end_number - cheque_book.start_number + 1;

    const used = cheque_book.cheques.length;
    const unused = total - used;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cheque Book ${cheque_book.book_no}`} />

            <div className="space-y-6">
                {/* HEADER */}
                <div className="flex items-center justify-between gap-3">
                    <HeadingSmall
                        title={`Cheque Book #${cheque_book.book_no}`}
                        description="Manage cheque range & usage"
                    />
                </div>

                {/* ================= OVERVIEW ================= */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-md border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Range</p>
                        <p className="font-semibold">
                            {cheque_book.start_number} -{' '}
                            {cheque_book.end_number}
                        </p>
                    </div>

                    <div className="rounded-md border bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                            Total Cheques
                        </p>
                        <p className="font-semibold">{total}</p>
                    </div>

                    <div className="rounded-md border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Used</p>
                        <p className="font-semibold text-green-600">{used}</p>
                    </div>

                    <div className="rounded-md border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Unused</p>
                        <p className="font-semibold text-blue-600">{unused}</p>
                    </div>
                </div>

                {/* ================= ACCOUNT ================= */}
                <div className="rounded-md border bg-card p-4">
                    <h3 className="mb-3 font-medium">Linked Account</h3>

                    <p>{cheque_book.subledger_account?.name ?? 'N/A'}</p>
                </div>

                {/* ================= CHEQUES LIST ================= */}
                <div className="rounded-md border bg-card">
                    <div className="border-b p-4 font-medium">
                        Cheques in this Book
                    </div>

                    <div className="overflow-auto">
                        <table className="w-full">
                            <thead className="bg-muted/10 text-sm">
                                <tr>
                                    <th className="p-2 text-left">Cheque No</th>
                                    <th className="p-2 text-left">Amount</th>
                                    <th className="p-2 text-left">Status</th>
                                    <th className="p-2 text-left">Payee</th>
                                    <th className="p-2 text-left">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {cheque_book.cheques.map((c: any) => (
                                    <tr key={c.id} className="border-b">
                                        <td className="p-2 font-medium">
                                            {c.cheque_number}
                                        </td>

                                        <td className="p-2">
                                            {formatBDTCurrency(c.amount)}
                                        </td>

                                        <td className="p-2">
                                            <Badge text={c.status} />
                                        </td>

                                        <td className="p-2">
                                            {c.payee_name || '-'}
                                        </td>

                                        <td className="p-2">
                                            <Link
                                                href={route(
                                                    'cheques.show',
                                                    c.id,
                                                )}
                                                className="text-primary underline"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!cheque_book.cheques.length && (
                        <p className="p-4 text-sm text-muted-foreground">
                            No cheques issued from this book yet
                        </p>
                    )}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
