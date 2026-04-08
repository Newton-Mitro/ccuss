<?php

namespace App\ChequeManagement\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankCheque extends Model
{
    use HasFactory;

    protected $fillable = [
        'bank_cheque_book_id',
        'bank_account_id',
        'cheque_number',
        'cheque_date',
        'amount',
        'payee_name',
        'remarks',
        'status',
        'stop_payment',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'cheque_date' => 'date',
        'amount' => 'decimal:2',
        'stop_payment' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Status Constants (Single Source of Truth)
    |--------------------------------------------------------------------------
    */

    public const STATUS_ISSUED = 'issued';
    public const STATUS_PRESENTED = 'presented';
    public const STATUS_CLEARED = 'cleared';
    public const STATUS_BOUNCED = 'bounced';
    public const STATUS_CANCELLED = 'cancelled';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function chequeBook()
    {
        return $this->belongsTo(BankChequeBook::class, 'bank_cheque_book_id');
    }

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes (Query Optimization Layer)
    |--------------------------------------------------------------------------
    */

    public function scopeIssued($query)
    {
        return $query->where('status', self::STATUS_ISSUED);
    }

    public function scopePresented($query)
    {
        return $query->where('status', self::STATUS_PRESENTED);
    }

    public function scopeCleared($query)
    {
        return $query->where('status', self::STATUS_CLEARED);
    }

    public function scopeBounced($query)
    {
        return $query->where('status', self::STATUS_BOUNCED);
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', self::STATUS_CANCELLED);
    }

    public function scopePayable($query)
    {
        return $query->where('status', self::STATUS_ISSUED)
            ->where('stop_payment', false);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers (Business Logic Layer)
    |--------------------------------------------------------------------------
    */

    public function isIssued(): bool
    {
        return $this->status === self::STATUS_ISSUED;
    }

    public function isCleared(): bool
    {
        return $this->status === self::STATUS_CLEARED;
    }

    public function isBounced(): bool
    {
        return $this->status === self::STATUS_BOUNCED;
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function isPayable(): bool
    {
        return $this->isIssued() && !$this->stop_payment;
    }
}