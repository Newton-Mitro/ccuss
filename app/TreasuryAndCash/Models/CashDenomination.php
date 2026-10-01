<?php

namespace App\TreasuryAndCash\Models;

use App\SystemAdministration\Models\Organization;
use App\TreasuryAndCash\Models\CashCountDenomination;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashDenomination extends Model
{
    use HasFactory;

    protected $fillable = ['organization_id', 'currency', 'type', 'value', 'name', 'is_active', 'sort_order'];

    protected $casts = ['value' => 'decimal:4', 'is_active' => 'boolean'];

    public static function bangladeshPreset(): array
    {
        return [
            ['currency' => 'BDT', 'type' => 'NOTE', 'value' => 1, 'name' => '1 Taka', 'is_active' => true, 'sort_order' => 0],
            ['currency' => 'BDT', 'type' => 'NOTE', 'value' => 2, 'name' => '2 Taka', 'is_active' => true, 'sort_order' => 1],
            ['currency' => 'BDT', 'type' => 'NOTE', 'value' => 5, 'name' => '5 Taka', 'is_active' => true, 'sort_order' => 2],
            ['currency' => 'BDT', 'type' => 'NOTE', 'value' => 10, 'name' => '10 Taka', 'is_active' => true, 'sort_order' => 3],
            ['currency' => 'BDT', 'type' => 'NOTE', 'value' => 20, 'name' => '20 Taka', 'is_active' => true, 'sort_order' => 4],
            ['currency' => 'BDT', 'type' => 'NOTE', 'value' => 50, 'name' => '50 Taka', 'is_active' => true, 'sort_order' => 5],
            ['currency' => 'BDT', 'type' => 'NOTE', 'value' => 100, 'name' => '100 Taka', 'is_active' => true, 'sort_order' => 6],
            ['currency' => 'BDT', 'type' => 'NOTE', 'value' => 200, 'name' => '200 Taka', 'is_active' => true, 'sort_order' => 7],
            ['currency' => 'BDT', 'type' => 'NOTE', 'value' => 500, 'name' => '500 Taka', 'is_active' => true, 'sort_order' => 8],
            ['currency' => 'BDT', 'type' => 'NOTE', 'value' => 1000, 'name' => '1000 Taka', 'is_active' => true, 'sort_order' => 9],
            ['currency' => 'BDT', 'type' => 'NOTE', 'value' => 2000, 'name' => '2000 Taka', 'is_active' => true, 'sort_order' => 10],
            ['currency' => 'BDT', 'type' => 'NOTE', 'value' => 5000, 'name' => '5000 Taka', 'is_active' => true, 'sort_order' => 11],
            ['currency' => 'BDT', 'type' => 'COIN', 'value' => 1, 'name' => '1 Taka Coin', 'is_active' => true, 'sort_order' => 12],
            ['currency' => 'BDT', 'type' => 'COIN', 'value' => 2, 'name' => '2 Taka Coin', 'is_active' => true, 'sort_order' => 13],
            ['currency' => 'BDT', 'type' => 'COIN', 'value' => 5, 'name' => '5 Taka Coin', 'is_active' => true, 'sort_order' => 14],
        ];
    }

    public static function seedBangladeshPreset(int $organizationId): void
    {
        foreach (self::bangladeshPreset() as $denomination) {
            self::query()->firstOrCreate(
                [
                    'organization_id' => $organizationId,
                    'currency' => $denomination['currency'],
                    'type' => $denomination['type'],
                    'value' => $denomination['value'],
                ],
                [
                    'name' => $denomination['name'],
                    'is_active' => $denomination['is_active'],
                    'sort_order' => $denomination['sort_order'],
                ],
            );
        }
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function countLines(): HasMany
    {
        return $this->hasMany(CashCountDenomination::class);
    }
}