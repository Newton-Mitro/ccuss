<?php

namespace App\PettyCashModule\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpenseCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    public function voucherItems()
    {
        return $this->hasMany(PettyCashVoucherItem::class);
    }
}