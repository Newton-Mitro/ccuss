import { formatBDTCurrency } from '../../../lib/bdtCurrencyFormatter';
import { formatDate } from '../../../lib/date_util';
import { Voucher } from '../../../types/accounting';

function VoucherQueueSection({ vouchers, onCollect, onCancel }: any) {
    return (
        <div className="flex flex-col gap-4 bg-card">
            <div className="flex h-[calc(100vh/3+50px)] flex-col overflow-hidden rounded-md border border-border">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                    <div>
                        <h2 className="text-sm font-medium text-primary">
                            Voucher Queue
                        </h2>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {vouchers.length} vouchers
                    </span>
                </div>

                <div className="flex-1 divide-y overflow-y-auto">
                    {vouchers.map((voucher: Voucher) => (
                        <div
                            key={voucher.id}
                            className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-3 bg-background px-3 py-2 transition odd:bg-muted/20 even:bg-muted/30 hover:bg-muted/40"
                        >
                            {/* Voucher Info */}
                            <div className="min-w-0">
                                <p className="truncate text-xs font-medium">
                                    #{voucher.voucher_no} —{' '}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {voucher.narration
                                        ? voucher.narration
                                        : 'N/A'}
                                    {formatDate(voucher.voucher_date)}
                                </p>
                            </div>

                            {/* Amount */}
                            <div className="text-right">
                                <p className="text-xs font-semibold">
                                    {formatBDTCurrency(0)}
                                </p>
                            </div>

                            {/* Status */}
                            <div>
                                <span
                                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                        voucher.status === 'DRAFT'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : voucher.status === 'POSTED'
                                              ? 'bg-green-100 text-green-700'
                                              : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {voucher.status}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1">
                                <button
                                    disabled={voucher.status !== 'DRAFT'}
                                    onClick={() => onCollect(voucher.id)}
                                    className="rounded bg-primary px-2 py-1 text-[10px] text-primary-foreground disabled:opacity-50"
                                >
                                    Collect
                                </button>
                                <button
                                    disabled={voucher.status !== 'POSTED'}
                                    onClick={() => onCancel(voucher.id)}
                                    className="rounded border px-2 py-1 text-[10px] text-destructive disabled:opacity-50"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="sticky bottom-0 flex justify-between border-t bg-muted/30 px-4 py-3 text-sm">
                    <span className="text-muted-foreground">
                        Total Pending Amount
                    </span>
                    <span className="font-semibold">
                        ৳{' '}
                        {vouchers
                            .filter((v) => v.status === 'PENDING')
                            .reduce((sum, v) => sum + v.amount, 0)
                            .toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default VoucherQueueSection;
