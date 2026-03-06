import { Eye } from 'lucide-react';
import { useMemo } from 'react';
import { formatBDTCurrency } from '../../../../lib/bdtCurrencyFormatter';
import { formatDate } from '../../../../lib/date_util';
import { Voucher } from '../../../../types/accounting';

interface Props {
    vouchers: Voucher[];
    onCollect: (id: number) => void;
    onCancel: (id: number) => void;
}

function VoucherQueueSection({ vouchers, onCollect, onCancel }: Props) {
    const { pendingAmount, postedAmount } = useMemo(() => {
        return vouchers.reduce(
            (acc, voucher) => {
                const amount = Number(voucher.total_amount) || 0;

                if (voucher.status === 'PENDING') {
                    acc.pendingAmount += amount;
                }

                if (voucher.status === 'POSTED') {
                    acc.postedAmount += amount;
                }

                return acc;
            },
            { pendingAmount: 0, postedAmount: 0 },
        );
    }, [vouchers]);

    return (
        <div className="flex flex-col gap-4 bg-card">
            <div className="flex h-[calc(100vh/3+6px)] flex-col overflow-hidden rounded-md border border-border">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-destructive/5 px-4 py-3">
                    <h2 className="text-sm font-medium">Voucher Queue</h2>
                    <span className="text-xs text-muted-foreground">
                        {vouchers.length} vouchers
                    </span>
                </div>

                {/* Voucher List */}
                <div className="flex-1 divide-y overflow-y-auto">
                    {vouchers.map((voucher: Voucher) => {
                        const isLastUpdated =
                            Math.max(
                                ...vouchers.map((v) =>
                                    new Date(v.updated_at).getTime(),
                                ),
                            ) === new Date(voucher.updated_at).getTime();
                        return (
                            <div
                                key={voucher.id}
                                className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-3 bg-background px-3 py-1 transition odd:bg-primary/10 even:bg-accent/10 hover:bg-muted/40"
                            >
                                {/* Info */}
                                <div className="min-w-0">
                                    <p className="flex gap-x-2 truncate text-xs font-medium">
                                        <span>
                                            {formatDate(voucher.voucher_date)}
                                        </span>
                                        •
                                        <span className="text-orange-700">
                                            #{voucher.voucher_no}
                                        </span>
                                        •
                                        <span className="text-yellow-700">
                                            {voucher.reference}
                                        </span>
                                    </p>
                                    <p
                                        className={`truncate text-[11px] ${
                                            isLastUpdated
                                                ? 'font-semibold text-blue-600'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {voucher.narration || 'N/A'}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="text-right text-xs font-semibold">
                                    {formatBDTCurrency(voucher.total_amount)}
                                </div>

                                {/* Status */}
                                <div>
                                    <span
                                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                            voucher.status === 'PENDING'
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
                                        onClick={() => onCancel(voucher.id)}
                                        className="rounded bg-primary p-1 text-[10px] text-primary-foreground disabled:opacity-50"
                                    >
                                        <Eye className="h-4 w-4 text-primary-foreground" />
                                    </button>

                                    <button
                                        disabled={voucher.status == 'POSTED'}
                                        onClick={() => onCancel(voucher.id)}
                                        className="rounded bg-destructive px-2 py-1 text-[10px] text-destructive-foreground disabled:opacity-50"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex flex-wrap items-center justify-center gap-4 border-t bg-muted/30 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                            {`Total pending amount ${formatBDTCurrency(pendingAmount)} ,and posted ${formatBDTCurrency(
                                postedAmount,
                            )}`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VoucherQueueSection;
