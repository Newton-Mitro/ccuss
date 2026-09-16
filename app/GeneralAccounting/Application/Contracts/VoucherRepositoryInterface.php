<?php

namespace App\GeneralAccounting\Application\Contracts;

use App\GeneralAccounting\Models\Voucher;
use Illuminate\Database\Eloquent\Builder;

interface VoucherRepositoryInterface
{
    public function query(): Builder;

    public function nextNumber(int $organizationId, string $voucherType, int $year): string;

    public function createWithEntries(array $voucherData, array $entries): Voucher;

    public function updateWithEntries(Voucher $voucher, array $voucherData, array $entries): Voucher;

    public function updateStatus(Voucher $voucher, string $status, ?int $postedBy = null): Voucher;
}
