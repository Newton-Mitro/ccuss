<?php

namespace Database\Seeders;

use App\CostomerModule\Models\Customer;
use App\CostomerModule\Models\CustomerAddress;
use App\CostomerModule\Models\CustomerFamilyRelation;
use App\CostomerModule\Models\CustomerIntroducer;
use App\CostomerModule\Models\KycDocument;
use App\CostomerModule\Models\KycProfile;
use App\CostomerModule\Models\OnlineServiceClient;
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
        foreach (['photos', 'signatures', 'nid'] as $folder) {
            if ($disk->exists("customers/{$folder}")) {
                $disk->deleteDirectory("customers/{$folder}");
            }
        }

        $mediaPath = database_path('seeders/media');

        // Helper function to get files sorted by numeric name
        $getMediaFiles = function ($path, $count = null) {
            $files = glob($path . '/*');
            sort($files);
            if ($count)
                return array_slice($files, 0, $count);
            return $files;
        };

        // Load photos, signatures, and NID images
        $malePhotos = $getMediaFiles($mediaPath . '/male', 7);
        $femalePhotos = $getMediaFiles($mediaPath . '/female', 10);
        $organizationPhotos = $getMediaFiles($mediaPath . '/organization', 3);
        $signatureFiles = $getMediaFiles($mediaPath . '/signatures', 20);
        $nidFiles = $getMediaFiles($mediaPath . '/nid'); // all NID images

        if (count($malePhotos) < 7 || count($femalePhotos) < 10 || count($organizationPhotos) < 3 || count($signatureFiles) < 17 || count($nidFiles) === 0) {
            throw new \Exception("Not enough media files in one of the folders.");
        }

        // Prepare customer types: 7 male, 10 female, 3 org
        $customersData = array_merge(
            array_fill(0, 7, 'MALE'),
            array_fill(0, 10, 'FEMALE'),
            array_fill(0, 3, 'ORGANIZATION')
        );

        $customers = collect();

        foreach ($customersData as $index => $type) {
            $customer = match ($type) {
                'MALE' => Customer::factory()->individualMale()->create(),
                'FEMALE' => Customer::factory()->individualFemale()->create(),
                'ORGANIZATION' => Customer::factory()->organization()->create(),
            };
            $customers->push($customer);

            // Assign photo based on type
            $photoFile = match ($type) {
                'MALE' => $malePhotos[$index],
                'FEMALE' => $femalePhotos[$index - 7],
                'ORGANIZATION' => $organizationPhotos[$index - 17],
            };
            $photoExt = pathinfo($photoFile, PATHINFO_EXTENSION);
            $photoFileName = 'photo_' . Str::slug($customer->customer_no) . '.' . $photoExt;
            $photoPath = "customers/photos/{$photoFileName}";
            $disk->putFileAs('customers/photos', $photoFile, $photoFileName);

            // Pick a random NID image for this customer
            $nidFile = $nidFiles[array_rand($nidFiles)];
            $nidExt = pathinfo($nidFile, PATHINFO_EXTENSION);
            $nidFileName = 'nid_front_' . Str::slug($customer->customer_no) . '.' . $nidExt;
            $nidPath = "customers/nid/{$nidFileName}";
            $disk->putFileAs('customers/nid', $nidFile, $nidFileName);

            if ($type === 'ORGANIZATION') {
                // Org uses photo for Trade License
                KycDocument::factory()->for($customer)->type('PHOTO')->verified()->create([
                    'file_name' => $photoFileName,
                    'file_path' => $photoPath,
                    'mime' => 'image/' . $photoExt,
                ]);

                KycDocument::factory()->for($customer)->type('TRADE_LICENSE')->create([
                    'file_name' => $photoFileName,
                    'file_path' => $photoPath,
                    'mime' => 'image/' . $photoExt,
                ]);
            } else {
                // Assign signature
                $signatureFile = $signatureFiles[$index]; // 0-16
                $signatureExt = pathinfo($signatureFile, PATHINFO_EXTENSION);
                $signatureFileName = 'signature_' . Str::slug($customer->customer_no) . '.' . $signatureExt;
                $signaturePath = "customers/signatures/{$signatureFileName}";
                $disk->putFileAs('customers/signatures', $signatureFile, $signatureFileName);

                // KYC Documents
                KycDocument::factory()->for($customer)->type('PHOTO')->verified()->create([
                    'file_name' => $photoFileName,
                    'file_path' => $photoPath,
                    'mime' => 'image/' . $photoExt,
                ]);

                KycDocument::factory()->for($customer)->type('SIGNATURE')->verified()->create([
                    'file_name' => $signatureFileName,
                    'file_path' => $signaturePath,
                    'mime' => 'image/' . $signatureExt,
                ]);

                KycDocument::factory()->for($customer)->type('NID_FRONT')->create([
                    'file_name' => $nidFileName,
                    'file_path' => $nidPath,
                    'mime' => 'image/' . $nidExt,
                ]);
            }

            // Addresses
            foreach (['CURRENT', 'PERMANENT', 'MAILING'] as $typeAddr) {
                CustomerAddress::factory()->for($customer)->create(['type' => $typeAddr]);
            }

            // KYC Profile state
            $states = ['approved', 'rejected', null];
            $state = collect($states)->random();
            $factory = KycProfile::factory()->for($customer);
            match ($state) {
                'approved' => $factory->approved()->create(),
                'rejected' => $factory->rejected()->create(),
                default => $factory->create(),
            };

            // Online Service Client
            OnlineServiceClient::create([
                'customer_id' => $customer->id,
                'username' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'password' => Hash::make('password'),
                'status' => 'ACTIVE',
            ]);
        }

        // Introducers
        foreach ($customers as $customer) {
            $introducer = $customers->where('id', '!=', $customer->id)->random();
            CustomerIntroducer::create([
                'introduced_customer_id' => $customer->id,
                'introducer_customer_id' => $introducer->id,
                'introducer_account_id' => null,
                'relationship_type' => collect(['FAMILY', 'FRIEND', 'BUSINESS', 'COLLEAGUE', 'OTHER'])->random(),
                'verification_status' => 'VERIFIED',
                'verified_at' => now(),
            ]);
        }

        // Family relations (skip organizations)
        foreach ($customers as $customer) {

            if ($customer->type === 'ORGANIZATION') {
                continue;
            }

            $relatives = $customers
                ->where('id', '!=', $customer->id)
                ->where('type', 'INDIVIDUAL')
                ->shuffle()
                ->take(rand(2, 4));

            foreach ($relatives as $relative) {

                // Determine relation options based on both genders
                $relationshipOptions = [];

                if ($customer->gender === 'MALE') {

                    if ($relative->gender === 'MALE') {
                        $relationshipOptions = [
                            'FATHER',
                            'BROTHER',
                            'SON',
                            'GRANDFATHER',
                            'UNCLE',
                            'NEPHEW',
                            'FATHER_IN_LAW',
                            'SON_IN_LAW',
                            'BROTHER_IN_LAW'
                        ];
                    } else {
                        $relationshipOptions = [
                            'MOTHER',
                            'SISTER',
                            'DAUGHTER',
                            'WIFE',
                            'GRANDMOTHER',
                            'AUNT',
                            'NIECE',
                            'MOTHER_IN_LAW',
                            'DAUGHTER_IN_LAW',
                            'SISTER_IN_LAW'
                        ];
                    }

                } elseif ($customer->gender === 'FEMALE') {

                    if ($relative->gender === 'MALE') {
                        $relationshipOptions = [
                            'FATHER',
                            'BROTHER',
                            'SON',
                            'HUSBAND',
                            'GRANDFATHER',
                            'UNCLE',
                            'NEPHEW',
                            'FATHER_IN_LAW',
                            'SON_IN_LAW',
                            'BROTHER_IN_LAW'
                        ];
                    } else {
                        $relationshipOptions = [
                            'MOTHER',
                            'SISTER',
                            'DAUGHTER',
                            'WIFE',
                            'GRANDMOTHER',
                            'AUNT',
                            'NIECE',
                            'MOTHER_IN_LAW',
                            'DAUGHTER_IN_LAW',
                            'SISTER_IN_LAW'
                        ];
                    }
                }

                CustomerFamilyRelation::firstOrCreate([
                    'customer_id' => $customer->id,
                    'relative_id' => $relative->id,
                ], [
                    'relation_type' => collect($relationshipOptions)->random(),
                ]);
            }
        }


        $this->command->info('✅ Customers with male, female, organization photos, signatures, and NIDs created successfully.');
    }
}