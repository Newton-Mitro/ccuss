<?php

namespace App\ChequeManagement\Models;

use App\ChequeManagement\Models\ChequeBook;
use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cheque extends Model
{
    use HasFactory, Auditable;

    protected $table = 'cheques';

    protected $fillable = [
        'cheque_book_id',
        'issuer_account_id',

        'issuer_bank_name',
        'issuer_branch',

        'cheque_number',
        'cheque_date',

        'amount',
        'payee_name',
        'remarks',

        'status',
        'stop_payment',

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
        return $this->belongsTo(ChequeBook::class);
    }

    public function issuerAccount()
    {
        return $this->belongsTo(SubledgerAccount::class, 'issuer_account_id');
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
    | State Checks
    |--------------------------------------------------------------------------
    */

    public function isIssued(): bool
    {
        return $this->status === self::STATUS_ISSUED;
    }

    public function isPresented(): bool
    {
        return $this->status === self::STATUS_PRESENTED;
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

    public function isStopped(): bool
    {
        return (bool) $this->stop_payment;
    }

    public function isPayable(): bool
    {
        return $this->isIssued() && !$this->isStopped();
    }

    /*
    |--------------------------------------------------------------------------
    | Business Actions (Safe State Transitions)
    |--------------------------------------------------------------------------
    */

    public function markPresented(): void
    {
        if ($this->isStopped())
            return;

        if (!$this->isIssued())
            return;

        $this->update([
            'status' => self::STATUS_PRESENTED,
        ]);
    }

    public function markCleared(): void
    {
        if ($this->isStopped())
            return;

        if (!$this->isPresented())
            return;

        $this->update([
            'status' => self::STATUS_CLEARED,
            'cleared_at' => now(),
        ]);
    }

    public function markBounced(): void
    {
        if ($this->isCleared())
            return;

        $this->update([
            'status' => self::STATUS_BOUNCED,
            'bounced_at' => now(),
        ]);
    }

    public function stopPayment(): void
    {
        if ($this->isCleared())
            return;

        $this->update([
            'stop_payment' => true,
        ]);
    }
}