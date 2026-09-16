<?php

namespace App\GeneralAccounting\Infrastructure\Persistence;

use App\GeneralAccounting\Application\Contracts\VoucherRepositoryInterface;
use App\GeneralAccounting\Models\Voucher;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class EloquentVoucherRepository implements VoucherRepositoryInterface
{
    public function query(): Builder
    {
        return Voucher::query();
    }

    public function nextNumber(int $organizationId, string $voucherType, int $year): string
    {
        $prefix = strtoupper($voucherType) . '-' . $year . '-';
        $lastNumber = Voucher::query()
            ->where('organization_id', $organizationId)
            ->where('voucher_no', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->lockForUpdate()
            ->value('voucher_no');

        $sequence = $lastNumber ? ((int) substr($lastNumber, -6)) + 1 : 1;

        return $prefix . str_pad((string) $sequence, 6, '0', STR_PAD_LEFT);
    }

    public function createWithEntries(array $voucherData, array $entries): Voucher
    {
        return DB::transaction(function () use ($voucherData, $entries) {
            $voucher = Voucher::create($voucherData);
            $voucher->entries()->createMany($entries);

            return $voucher->load('entries.account');
        });
    }

    public function updateStatus(Voucher $voucher, string $status, ?int $postedBy = null): Voucher
    {
        $voucher->update([
            'status' => $status,
            'posted_by' => $postedBy,
            'posted_at' => $status === 'POSTED' ? now() : null,
        ]);

        return $voucher->fresh('entries.account');
    }
}
