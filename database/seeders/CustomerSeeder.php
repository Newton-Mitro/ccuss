<?php

namespace Database\Seeders;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\CustomerAddress;
use App\CustomerModule\Models\CustomerFamilyRelation;
use App\CustomerModule\Models\CustomerIntroducer;
use App\CustomerModule\Models\KycDocument;
use App\CustomerModule\Models\KycProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $disk = Storage::disk('public');

        // Clean old uploads
        foreach (['photos', 'signatures', 'nid'] as $folder) {
            if ($disk->exists("customers/{$folder}")) {
                $disk->deleteDirectory("customers/{$folder}");
            }
        }

        $mediaPath = database_path('seeders/media');

        // Fixed helper to avoid "Only variables should be passed by reference"
        $getMediaFiles = function ($path, $count = null) {
            $files = glob($path . '/*') ?: [];
            sort($files);
            if ($count) {
                return array_slice($files, 0, $count);
            }
            return $files;
        };

        $malePhotos = $getMediaFiles($mediaPath . '/male', 7);
        $femalePhotos = $getMediaFiles($mediaPath . '/female', 10);
        $organizationPhotos = $getMediaFiles($mediaPath . '/organization', 3);
        $signatureFiles = $getMediaFiles($mediaPath . '/signatures', 20);
        $nidFiles = $getMediaFiles($mediaPath . '/nid');

        if (count($malePhotos) < 7 || count($femalePhotos) < 10 || count($organizationPhotos) < 3 || count($signatureFiles) < 17 || count($nidFiles) === 0) {
            throw new \Exception("Not enough media files in one of the folders.");
        }

        $customersData = array_merge(
            array_fill(0, 7, 'male'),
            array_fill(0, 10, 'female'),
            array_fill(0, 3, 'organization')
        );

        $customers = collect();

        foreach ($customersData as $index => $type) {
            $customerFactory = match ($type) {
                'male' => Customer::factory()->individualMale(),
                'female' => Customer::factory()->individualFemale(),
                'organization' => Customer::factory()->organization(),
            };

            $customer = $customerFactory->create();
            $customers->push($customer);

            $photoFile = match ($type) {
                'male' => $malePhotos[$index],
                'female' => $femalePhotos[$index - 7],
                'organization' => $organizationPhotos[$index - 17],
            };

            $photoExt = pathinfo($photoFile, PATHINFO_EXTENSION);
            $photoFileName = 'photo_' . Str::slug($customer->customer_no) . '.' . $photoExt;
            $disk->putFileAs('customers/photos', $photoFile, $photoFileName);

            $nidFile = $nidFiles[array_rand($nidFiles)];
            $nidExt = pathinfo($nidFile, PATHINFO_EXTENSION);
            $nidFileName = 'nid_front_' . Str::slug($customer->customer_no) . '.' . $nidExt;
            $disk->putFileAs('customers/nid', $nidFile, $nidFileName);

            if ($type === 'organization') {
                KycDocument::factory()->for($customer)->type('photo')->verified()->create([
                    'file_name' => $photoFileName,
                    'file_path' => "customers/photos/{$photoFileName}",
                    'mime' => 'image/' . $photoExt,
                ]);

                KycDocument::factory()->for($customer)->type('trade_license')->create([
                    'file_name' => $photoFileName,
                    'file_path' => "customers/photos/{$photoFileName}",
                    'mime' => 'image/' . $photoExt,
                ]);
            } else {
                $signatureFile = $signatureFiles[$index];
                $signatureExt = pathinfo($signatureFile, PATHINFO_EXTENSION);
                $signatureFileName = 'signature_' . Str::slug($customer->customer_no) . '.' . $signatureExt;
                $disk->putFileAs('customers/signatures', $signatureFile, $signatureFileName);

                KycDocument::factory()->for($customer)->type('photo')->verified()->create([
                    'file_name' => $photoFileName,
                    'file_path' => "customers/photos/{$photoFileName}",
                    'mime' => 'image/' . $photoExt,
                ]);

                KycDocument::factory()->for($customer)->type('signature')->verified()->create([
                    'file_name' => $signatureFileName,
                    'file_path' => "customers/signatures/{$signatureFileName}",
                    'mime' => 'image/' . $signatureExt,
                ]);

                KycDocument::factory()->for($customer)->type('nid')->create([
                    'file_name' => $nidFileName,
                    'file_path' => "customers/nid/{$nidFileName}",
                    'mime' => 'image/' . $nidExt,
                ]);
            }

            // Addresses
            foreach (['current', 'permanent', 'mailing'] as $addrType) {
                CustomerAddress::factory()->for($customer)->create(['type' => $addrType]);
            }

            // KYC Profile
            $factory = KycProfile::factory()->for($customer)->create();

        }

        // Introducers
        foreach ($customers as $customer) {
            $introducer = $customers->where('id', '!=', $customer->id)->random();
            CustomerIntroducer::create([
                'introduced_customer_id' => $customer->id,
                'introducer_customer_id' => $introducer->id,
                'introducer_account_id' => null,
                'relationship_type' => collect(['family', 'friend', 'business', 'colleague', 'other'])->random(),
                'verified_at' => now(),
            ]);
        }

        // Family relations
        foreach ($customers as $customer) {
            if ($customer->type === 'organization')
                continue;

            $relatives = $customers
                ->where('id', '!=', $customer->id)
                ->where('type', 'individual')
                ->shuffle()
                ->take(rand(2, 4));

            foreach ($relatives as $relative) {
                $relationshipOptions = [];

                if ($customer->gender === 'male') {
                    $relationshipOptions = $relative->gender === 'male'
                        ? ['father', 'brother', 'son', 'grandfather', 'uncle', 'nephew', 'father_in_law', 'son_in_law', 'brother_in_law']
                        : ['mother', 'sister', 'daughter', 'wife', 'grandmother', 'aunt', 'niece', 'mother_in_law', 'daughter_in_law', 'sister_in_law'];
                } elseif ($customer->gender === 'female') {
                    $relationshipOptions = $relative->gender === 'male'
                        ? ['father', 'brother', 'son', 'husband', 'grandfather', 'uncle', 'nephew', 'father_in_law', 'son_in_law', 'brother_in_law']
                        : ['mother', 'sister', 'daughter', 'wife', 'grandmother', 'aunt', 'niece', 'mother_in_law', 'daughter_in_law', 'sister_in_law'];
                }

                CustomerFamilyRelation::firstOrCreate([
                    'customer_id' => $customer->id,
                    'relative_id' => $relative->id,
                ], [
                    'relation_type' => collect($relationshipOptions)->random(),
                ]);
            }
        }

        $this->command->info('✅ Customers, KYC, addresses, online clients, introducers, and family relations seeded successfully.');
    }
}