<?php

namespace Database\Seeders;


use App\CostomerManagement\Address\Models\Address;
use App\CostomerManagement\Customer\Models\Customer;
use App\CostomerManagement\FamilyRelation\Models\FamilyRelation;
use App\CostomerManagement\OnlineClient\Models\OnlineClient;
use App\CostomerManagement\OnlineUser\Models\OnlineUser;
use App\CostomerManagement\Signature\Models\Signature;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        // Seed customers first
        Customer::factory()->count(20)->create()->each(function ($customer) {
            // Each customer gets some addresses
            Address::factory()->count(rand(1, 2))->create(['customer_id' => $customer->id]);

            // Add signature
            Signature::factory()->create(['customer_id' => $customer->id]);

            // Add online user (1:1)
            OnlineClient::factory()->create(['customer_id' => $customer->id]);
        });

        // Add family relations
        FamilyRelation::factory()->count(10)->create();

        $this->command->info('✅ Customer, Address, Signature, OnlineUser, and FamilyRelation data seeded successfully.');
    }
}
