<?php

namespace App\CostomerMgmt\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CustomerPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'file_name',
        'file_path',
        'mime',
        'alt_text',
        'created_by',
        'updated_by',
    ];

    protected $appends = ['url'];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function getUrlAttribute(): string
    {
        // If using public disk
        return url(Storage::url($this->file_path));
    }
}
