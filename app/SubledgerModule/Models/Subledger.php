<?php

namespace App\SubledgerModule\Models;

use App\FinanceAndAccounting\Models\LedgerAccount;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subledger extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'short_name',
        'type',
        'sub_type',
        'is_active',
        'gl_account_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function glAccount()
    {
        return $this->belongsTo(LedgerAccount::class, 'gl_account_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes (Clean Query Layer)
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeBySubType($query, $subType)
    {
        return $query->where('sub_type', $subType);
    }

    /*
    |--------------------------------------------------------------------------
    | Constants (Enterprise-grade enum handling 🚀)
    |--------------------------------------------------------------------------
    */

    public const TYPE_DEPOSIT = 'deposit';
    public const TYPE_LOAN = 'loan';
    public const TYPE_CASH = 'cash';
    public const TYPE_PAYABLE = 'payable';
    public const TYPE_RECEIVABLE = 'receivable';

    public const SUBTYPE_SAVING = 'saving deposit';
    public const SUBTYPE_TERM = 'term deposit';
    public const SUBTYPE_RECURRING = 'recurring deposit';
    public const SUBTYPE_SHARE = 'share_deposit';

    public const SUBTYPE_MEMBER_LOAN = 'membr_loan';
    public const SUBTYPE_VEHICLE_LOAN = 'vehicle_loan';
    public const SUBTYPE_HOME_LOAN = 'home_loan';
    public const SUBTYPE_SMB_LOAN = 'smb_loan';
    public const SUBTYPE_EDUCATIONAL_LOAN = 'educational_loan';
    public const SUBTYPE_AGRI_LOAN = 'agri_loan';

    public const SUBTYPE_CASH_HAND = 'cash_at_hand';
    public const SUBTYPE_CASH_BANK = 'cash_at_bank';
    public const SUBTYPE_PETTY_CASH = 'petty_cash';

    /*
    |--------------------------------------------------------------------------
    | Helper Methods (DX boost)
    |--------------------------------------------------------------------------
    */

    public function isDeposit(): bool
    {
        return $this->type === self::TYPE_DEPOSIT;
    }

    public function isLoan(): bool
    {
        return $this->type === self::TYPE_LOAN;
    }

    public function isCash(): bool
    {
        return $this->type === self::TYPE_CASH;
    }
}