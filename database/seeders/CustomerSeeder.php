<?php

namespace Database\Seeders;

use App\CostomerMgmt\Models\Customer;
use App\CostomerMgmt\Models\CustomerAddress;
use App\CostomerMgmt\Models\CustomerFamilyRelation;
use App\CostomerMgmt\Models\CustomerIntroducer;
use App\CostomerMgmt\Models\CustomerPhoto;
use App\CostomerMgmt\Models\CustomerSignature;
use App\CostomerMgmt\Models\OnlineServiceUser;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $disk = Storage::disk('public');

        // Clean old uploads
        if ($disk->exists('customers/photos')) {
            $disk->deleteDirectory('customers/photos');
        }

        if ($disk->exists('customers/signatures')) {
            $disk->deleteDirectory('customers/signatures');
        }

        // Source media folder
        $sourceFolder = database_path('seeders/media/images');
        $photoSource = $sourceFolder . '/person.jpg';
        $signatureSource = $sourceFolder . '/signature.jpg';

        if (!file_exists($photoSource) || !file_exists($signatureSource)) {
            throw new \Exception("Sample media files not found in {$sourceFolder}");
        }

        // Step 1: Create 20 base customers
        $customers = Customer::factory()->count(20)->create();

        $addressTypes = ['CURRENT', 'PERMANENT', 'MAILING'];

        foreach ($customers as $customer) {

            // ---------------------------
            // Addresses (2–3 per customer)
            // ---------------------------
            foreach ($addressTypes as $type) {
                CustomerAddress::factory()->create([
                    'customer_id' => $customer->id,
                    'type' => $type,
                ]);
            }

            // ---------------------------
            // Customer Photo (1)
            // ---------------------------
            $photoFileName = 'photo_' . Str::slug($customer->customer_no) . '.jpg';
            $photoPath = 'customers/photos/' . $photoFileName;
            $disk->putFileAs('customers/photos', $photoSource, $photoFileName);

            CustomerPhoto::create([
                'customer_id' => $customer->id,
                'file_name' => $photoFileName,
                'file_path' => $photoPath,
                'mime' => 'image/jpeg',
            ]);

            // ---------------------------
            // Signature (1)
            // ---------------------------
            $signatureFileName = 'signature_' . Str::slug($customer->customer_no) . '.jpg';
            $signaturePath = 'customers/signatures/' . $signatureFileName;
            $disk->putFileAs('customers/signatures', $signatureSource, $signatureFileName);

            CustomerSignature::create([
                'customer_id' => $customer->id,
                'file_name' => $signatureFileName,
                'file_path' => $signaturePath,
                'mime' => 'image/jpeg',
            ]);

            // ---------------------------
            // Online Service User (1)
            // ---------------------------
            OnlineServiceUser::create([
                'customer_id' => $customer->id,
                'username' => 'user_' . $customer->customer_no,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'password' => Hash::make('password'),
                'status' => 'ACTIVE',
            ]);

            // ---------------------------
            // Family Relations (2–4)
            // ---------------------------
            CustomerFamilyRelation::factory()
                ->count(rand(2, 4))
                ->create([
                    'customer_id' => $customer->id,
                ]);

            // ---------------------------
            // Introducer (1)
            // ---------------------------
            $introducerCustomer = $customers
                ->where('id', '!=', $customer->id)
                ->random();

            CustomerIntroducer::create([
                'introduced_customer_id' => $customer->id,
                'introducer_customer_id' => $introducerCustomer->id,
                'introducer_account_id' => null,
                'relationship_type' => collect([
                    'FAMILY',
                    'FRIEND',
                    'BUSINESS',
                    'COLLEAGUE',
                    'OTHER'
                ])->random(),
                'verification_status' => 'VERIFIED',
                'verified_at' => now(),
            ]);
        }
    }
}
