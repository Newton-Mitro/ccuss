import { Eye } from 'lucide-react';
import { useMemo } from 'react';
import { formatBDTCurrency } from '../../../../../lib/bdtCurrencyFormatter';
import { formatDate } from '../../../../../lib/date_util';

interface Props {
    voucher_entries: any[];
    onView: (id: number) => void;
    voucherCollectNowHandler: (id: number) => void;
    cancelVoucherHandler: (id: number) => void;
}

function VoucherQueueSection({
    voucher_entries,
    onView,
    voucherCollectNowHandler,
    cancelVoucherHandler,
}: Props) {
    const { pendingAmount, postedAmount } = useMemo(() => {
        return voucher_entries.reduce(
            (acc, voucher) => {
                const amount = Number(voucher.total_amount) || 0;

                if (voucher.status === 'pending') {
                    acc.pendingAmount += amount;
                }

                if (voucher.status === 'POSTED') {
                    acc.postedAmount += amount;
                }

                return acc;
            },
            { pendingAmount: 0, postedAmount: 0 },
        );
    }, [voucher_entries]);

    return (
        <div className="flex flex-col gap-4 bg-card">
            <div className="flex h-[calc(100vh/2+70px)] flex-col overflow-hidden rounded-md border">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-tl-md rounded-tr-md border-b bg-sidebar px-4 py-3">
                    <h2 className="text-sm font-medium text-card-foreground">
                        Voucher Queue
                    </h2>
                    <span className="text-xs text-muted-foreground">
                        {voucher_entries.length} voucher_entries
                    </span>
                </div>

                {/* Voucher List */}
                <div className="flex-1 divide-y overflow-y-auto">
                    {voucher_entries.map((voucher: any) => {
                        // Determine if this is the last updated voucher
                        const isLastUpdated =
                            Math.max(
                                ...voucher_entries.map((v) =>
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
                                                ? 'font-semibold text-orange-700'
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
                                            voucher.status === 'pending'
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
                                        onClick={() => onView(voucher.id)}
                                        className="rounded bg-primary px-2 py-1 text-[10px] text-primary-foreground disabled:opacity-50"
                                    >
                                        <Eye className="h-4 w-4 text-primary-foreground" />
                                    </button>
                                    <button
                                        disabled={voucher.status !== 'pending'}
                                        onClick={() =>
                                            voucherCollectNowHandler(voucher.id)
                                        }
                                        className="rounded bg-primary px-2 py-1 text-[10px] text-primary-foreground disabled:opacity-50"
                                    >
                                        Collect
                                    </button>

                                    <button
                                        disabled={voucher.status == 'POSTED'}
                                        onClick={() =>
                                            cancelVoucherHandler(voucher.id)
                                        }
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
                <div className="sticky bottom-0 z-20 border-t bg-sidebar">
                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                        {/* Pending */}
                        <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 text-amber-700">
                            <span className="text-xs font-medium tracking-wide uppercase">
                                {`Pending ${formatBDTCurrency(pendingAmount)}`}
                            </span>
                        </div>

                        {/* Posted */}
                        <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 text-emerald-700">
                            <span className="text-xs font-medium tracking-wide uppercase">
                                {`Posted ${formatBDTCurrency(postedAmount)}`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VoucherQueueSection;
