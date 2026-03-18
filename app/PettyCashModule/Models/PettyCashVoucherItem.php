<?php

namespace App\PettyCashModule\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PettyCashVoucherItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'petty_cash_voucher_id',
        'expense_category_id',
        'amount',
        'description',
        'receipt_no',
    ];

    public function voucher()
    {
        return $this->belongsTo(PettyCashVoucher::class);
    }

    public function expenseCategory()
    {
        return $this->belongsTo(ExpenseCategory::class);
    }
}