<?php

namespace App\FinanceAndAccounting\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Database\Factories\InstrumentTypeFactory;

class InstrumentType extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
    ];

    protected static function newFactory()
    {
        return InstrumentTypeFactory::new();
    }
}