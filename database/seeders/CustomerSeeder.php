<?php

namespace Database\Seeders;

use App\CostomerMgmt\Models\Customer;
use App\CostomerMgmt\Models\CustomerAddress;
use App\CostomerMgmt\Models\CustomerFamilyRelation;
use App\CostomerMgmt\Models\CustomerIntroducer;
use App\CostomerMgmt\Models\KycDocument;
use App\CostomerMgmt\Models\KycProfile;
use App\CostomerMgmt\Models\OnlineServiceClient;
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
        if ($disk->exists('customers/nid')) {
            $disk->deleteDirectory('customers/nid');
        }

        // Source media folder
        $sourceFolder = database_path('seeders/media/images');
        $photoSource = $sourceFolder . '/person.jpg';
        $signatureSource = $sourceFolder . '/signature.jpg';
        $nidSource = $sourceFolder . '/nid.jpg';

        if (!file_exists($photoSource) || !file_exists($signatureSource) || !file_exists($nidSource)) {
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
                CustomerAddress::factory()->for($customer)->create([
                    'type' => $type,
                ]);
            }

            // ---------------------------
            // KYC Documents
            // ---------------------------
            // Photo
            $photoFileName = 'photo_' . Str::slug($customer->customer_no) . '.jpg';
            $photoPath = 'customers/photos/' . $photoFileName;
            $disk->putFileAs('customers/photos', $photoSource, $photoFileName);

            KycDocument::factory()->for($customer)->type('PHOTO')->verified()->create([
                'file_name' => $photoFileName,
                'file_path' => $photoPath,
                'mime' => 'image/jpeg',
            ]);

            // Signature
            $signatureFileName = 'signature_' . Str::slug($customer->customer_no) . '.jpg';
            $signaturePath = 'customers/signatures/' . $signatureFileName;
            $disk->putFileAs('customers/signatures', $signatureSource, $signatureFileName);

            KycDocument::factory()->for($customer)->type('SIGNATURE')->verified()->create([
                'file_name' => $signatureFileName,
                'file_path' => $signaturePath,
                'mime' => 'image/jpeg',
            ]);

            $states = ['approved', 'rejected', null];
            $state = collect($states)->random();
            $factory = KycProfile::factory()->for($customer); // do NOT create yet
            match ($state) {
                'approved' => $factory->approved()->create(),
                'rejected' => $factory->rejected()->create(),
                default => $factory->create(), // PENDING
            };

            // NID (Front)
            $nidFileName = 'nid_front_' . Str::slug($customer->customer_no) . '.jpg';
            $nidPath = 'customers/nid/' . $nidFileName;
            $disk->putFileAs('customers/nid', $nidSource, $nidFileName);

            KycDocument::factory()->for($customer)->type('NID_FRONT')->verified()->create([
                'file_name' => $nidFileName,
                'file_path' => $nidPath,
                'mime' => 'image/jpeg',
            ]);

            // ---------------------------
            // Online Service User (1)
            // ---------------------------
            OnlineServiceClient::create([
                'customer_id' => $customer->id,
                'username' => 'user_' . $customer->customer_no,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'password' => Hash::make('password'),
                'status' => 'ACTIVE',
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

        foreach ($customers as $customer) {

            // Skip family relations for organization customers
            if ($customer->type === 'ORGANIZATION') {
                continue;
            }

            $relatives = $customers
                ->where('id', '!=', $customer->id)
                ->where('type', '!=', 'ORGANIZATION') // optional: only individuals
                ->random(rand(2, 4));

            foreach ($relatives as $relative) {
                CustomerFamilyRelation::factory()->create([
                    'customer_id' => $customer->id,
                    'relative_id' => $relative->id,
                ]);
            }
        }

        $this->command->info('✅ Customers with Photo, Signature, and NID created.');
    }
}