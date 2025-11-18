<?php

namespace App\Accounting\Voucher\Models;

use App\Accounting\GlAccount\Models\GlAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalLine extends Model
{
    use HasFactory;

    protected $table = 'journal_lines';

    protected $fillable = [
        'journal_entry_id',
        'gl_account_id',
        'subledger_type',
        'subledger_id',
        'associate_ledger_type',
        'associate_ledger_id',
        'debit',
        'credit',
    ];

    /**
     * The journal entry this line belongs to.
     */
    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }

    /**
     * Linked GL account.
     */
    public function glAccount()
    {
        return $this->belongsTo(GlAccount::class);
    }

    /**
     * Optional subledger relation (polymorphic, if needed)
     */
    public function subledger()
    {
        // Replace with actual model mapping based on type
        // Example:
        // return $this->morphTo(null, 'subledger_type', 'subledger_id');
    }

    /**
     * Optional associate ledger relation (polymorphic, if needed)
     */
    public function associateLedger()
    {
        // Replace with actual model mapping based on associate_ledger_type
        // return $this->morphTo(null, 'associate_ledger_type', 'associate_ledger_id');
    }
}