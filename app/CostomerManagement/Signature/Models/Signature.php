<?php

namespace App\CostomerManagement\Signature\Models;

use App\CostomerManagement\Customer\Models\Customer;
use App\Media\Models\Media;
use Database\Factories\SignatureFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Signature extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'signature_path',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function media()
    {
        return $this->belongsTo(Media::class, 'signature');
    }

    protected static function newFactory()
    {
        return SignatureFactory::new();
    }
}
