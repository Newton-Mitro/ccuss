<?php

namespace App\Accounting\Voucher\Models;

use App\Branch\Models\Branch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalEntry extends Model
{
    use HasFactory;

    protected $table = 'journal_entries';

    protected $fillable = [
        'tx_code',
        'tx_ref',
        'posted_at',
        'branch_id',
        'user_id',
        'memo',
    ];

    protected $casts = [
        'posted_at' => 'datetime',
    ];

    /**
     * Branch where this journal entry belongs.
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * User who posted this journal entry.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Journal lines related to this entry.
     */
    public function lines()
    {
        return $this->hasMany(JournalLine::class);
    }

    /**
     * Total debit for this entry.
     */
    public function getTotalDebitAttribute()
    {
        return $this->lines->sum('debit');
    }

    /**
     * Total credit for this entry.
     */
    public function getTotalCreditAttribute()
    {
        return $this->lines->sum('credit');
    }
}
