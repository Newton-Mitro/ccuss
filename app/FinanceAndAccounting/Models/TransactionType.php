<?php

namespace App\FinanceAndAccounting\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionType extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'category',
        'is_cash',
        'affects_balance',
        'requires_approval',
        'is_system',
        'direction',
        'meta',
    ];

    protected $casts = [
        'is_cash' => 'boolean',
        'affects_balance' => 'boolean',
        'requires_approval' => 'boolean',
        'is_system' => 'boolean',
        'meta' => 'array',
    ];

    // 🔗 Relationship
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}