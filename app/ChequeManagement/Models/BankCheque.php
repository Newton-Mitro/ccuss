<?php

namespace App\ChequeManagement\Models;

use App\ChequeManagement\Models\BankChequeBook;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankCheque extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'bank_cheque_book_id',
        'cheque_number',
        'cheque_date',
        'amount',
        'payee_name',
        'remarks',
        'status',
        'stop_payment',
        'created_by',
        'approved_by',
        'cleared_at',
        'bounced_at',
    ];

    protected $casts = [
        'cheque_date' => 'date',
        'amount' => 'decimal:2',
        'stop_payment' => 'boolean',
        'cleared_at' => 'datetime',
        'bounced_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Status Constants
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
    | Scopes
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
    | Domain Helpers
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

    // Helpers

    public function markCleared(): void
    {
        $this->update([
            'status' => self::STATUS_CLEARED,
            'cleared_at' => now(),
        ]);
    }

    public function markBounced(): void
    {
        $this->update([
            'status' => self::STATUS_BOUNCED,
            'bounced_at' => now(),
        ]);
    }
}