<?php

namespace Database\Seeders;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\CustomerAddress;
use App\CustomerModule\Models\CustomerFamilyRelation;
use App\CustomerModule\Models\CustomerIntroducer;
use App\CustomerModule\Models\KycDocument;
use App\CustomerModule\Models\KycProfile;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $disk = Storage::disk('public');
        if ($disk->exists('uploads')) {
            $disk->deleteDirectory('uploads');
        }

        $mediaPath = database_path('seeders/media');

        $getMediaFiles = function ($path, $count = null) {
            $files = glob($path . '/*') ?: [];
            sort($files);
            return $count ? array_slice($files, 0, $count) : $files;
        };

        $malePhotos = $getMediaFiles($mediaPath . '/male', 2);
        $femalePhotos = $getMediaFiles($mediaPath . '/female', 1);
        $organizationPhotos = $getMediaFiles($mediaPath . '/organization', 1);
        $signatureFiles = $getMediaFiles($mediaPath . '/signatures', 3);
        $nidFiles = $getMediaFiles($mediaPath . '/nid');

        $organization = Organization::query()->where('code', 'ORG-001')->firstOrFail();
        $branchId = $organization->branches()->oldest('id')->value('id');

        if (
            count($malePhotos) < 2 ||
            count($femalePhotos) < 1 ||
            count($organizationPhotos) < 1 ||
            count($signatureFiles) < 3 ||
            count($nidFiles) === 0
        ) {
            throw new \Exception("Not enough media files in one of the folders.");
        }

        $customersData = [
            'john' => [
                'photo_group' => 'male',
                'signature_index' => 0,
                'attributes' => [
                    'customer_no' => 'IND-000001',
                    'type' => Customer::TYPE_INDIVIDUAL,
                    'name' => 'John Doe',
                    'primary_phone' => '+8801000000001',
                    'alternate_phone' => null,
                    'primary_email' => 'john.doe@example.test',
                    'alternate_email' => null,
                    'identification_type' => 'NATIONAL_IDENTIFICATION_NUMBER',
                    'identification_number' => 'DEMO-NID-JOHN-0001',
                    'dob' => '1985-02-14',
                    'gender' => 'MALE',
                    'marital_status' => 'MARRIED',
                    'blood_group' => 'O+',
                    'nationality' => 'Bangladeshi',
                    'occupation' => 'Accountant',
                    'education' => 'Bachelor',
                    'religion' => 'CHRISTIANITY',
                    'status' => 'ACTIVE',
                ],
            ],
            'jane' => [
                'photo_group' => 'female',
                'signature_index' => 1,
                'attributes' => [
                    'customer_no' => 'IND-000002',
                    'type' => Customer::TYPE_INDIVIDUAL,
                    'name' => 'Jane Doe',
                    'primary_phone' => '+8801000000002',
                    'alternate_phone' => null,
                    'primary_email' => 'jane.doe@example.test',
                    'alternate_email' => null,
                    'identification_type' => 'NATIONAL_IDENTIFICATION_NUMBER',
                    'identification_number' => 'DEMO-NID-JANE-0002',
                    'dob' => '1987-07-21',
                    'gender' => 'FEMALE',
                    'marital_status' => 'MARRIED',
                    'blood_group' => 'A+',
                    'nationality' => 'Bangladeshi',
                    'occupation' => 'Teacher',
                    'education' => 'Bachelor',
                    'religion' => 'CHRISTIANITY',
                    'status' => 'ACTIVE',
                ],
            ],
            'alex' => [
                'photo_group' => 'minor',
                'signature_index' => 2,
                'attributes' => [
                    'customer_no' => 'IND-000003',
                    'type' => Customer::TYPE_INDIVIDUAL,
                    'name' => 'Alex Doe',
                    'primary_phone' => null,
                    'alternate_phone' => null,
                    'primary_email' => null,
                    'alternate_email' => null,
                    'identification_type' => 'BIRTH_REGISTRATION_NUMBER',
                    'identification_number' => 'DEMO-BIRTH-ALEX-0003',
                    'dob' => '2014-10-04',
                    'gender' => 'MALE',
                    'marital_status' => 'SINGLE',
                    'blood_group' => 'B+',
                    'nationality' => 'Bangladeshi',
                    'occupation' => 'Student',
                    'education' => 'Primary',
                    'religion' => 'CHRISTIANITY',
                    'status' => 'ACTIVE',
                ],
            ],
            'organization' => [
                'photo_group' => 'organization',
                'signature_index' => null,
                'attributes' => [
                    'customer_no' => 'ORG-000001',
                    'type' => Customer::TYPE_ORGANIZATION,
                    'name' => 'ABC Corp.',
                    'primary_phone' => '+8801000000004',
                    'alternate_phone' => null,
                    'primary_email' => 'contact@abc-corp.example.test',
                    'alternate_email' => null,
                    'identification_type' => 'REGISTRATION_NO',
                    'identification_number' => 'DEMO-REG-ABC-0001',
                    'dob' => null,
                    'gender' => null,
                    'marital_status' => null,
                    'blood_group' => null,
                    'nationality' => null,
                    'occupation' => null,
                    'education' => null,
                    'religion' => null,
                    'status' => 'ACTIVE',
                ],
            ],
        ];

        $customers = collect();

        foreach ($customersData as $key => $customerData) {
            $attributes = array_merge($customerData['attributes'], [
                'organization_id' => $organization->id,
                'branch_id' => $branchId,
            ]);
            $customer = Customer::query()
                ->where('customer_no', $attributes['customer_no'])
                ->first()
                ?? Customer::query()
                    ->where('organization_id', $organization->id)
                    ->where('name', $attributes['name'])
                    ->oldest('id')
                    ->first()
                ?? new Customer();
            $customer->fill($attributes)->save();
            $customers->put($key, $customer);

            $basePath = "uploads/customers/{$customer->id}";

            $photoFile = match ($customerData['photo_group']) {
                'male' => $malePhotos[0],
                'female' => $femalePhotos[0],
                'minor' => $malePhotos[1],
                'organization' => $organizationPhotos[0],
            };
            $photoExt = pathinfo($photoFile, PATHINFO_EXTENSION);
            $photoFileName = 'photo_' . Str::slug($customer->customer_no) . '.' . $photoExt;
            $disk->putFileAs("{$basePath}/", $photoFile, $photoFileName);

            $createDocument = function (string $type, string $fileName, string $mime, string $status) use ($customer, $basePath): void {
                KycDocument::query()->updateOrCreate(
                    ['customer_id' => $customer->id, 'document_type' => $type],
                    [
                        'file_name' => $fileName,
                        'file_path' => "{$basePath}/{$fileName}",
                        'mime' => $mime,
                        'alt_text' => ucwords(str_replace('_', ' ', $type)),
                        'verification_status' => $status,
                        'verified_at' => $status === KycDocument::STATUS_VERIFIED ? now() : null,
                        'remarks' => null,
                    ],
                );
            };

            if ($key === 'organization') {
                $createDocument(
                    KycDocument::PHOTO,
                    $photoFileName,
                    'image/' . $photoExt,
                    KycDocument::STATUS_VERIFIED,
                );
                $createDocument(
                    KycDocument::TRADE_LICENSE,
                    $photoFileName,
                    'image/' . $photoExt,
                    KycDocument::STATUS_VERIFIED,
                );
            } else {
                $signatureFile = $signatureFiles[$customerData['signature_index']];
                $signatureExt = pathinfo($signatureFile, PATHINFO_EXTENSION);
                $signatureFileName = 'signature_' . Str::slug($customer->customer_no) . '.' . $signatureExt;
                $disk->putFileAs("{$basePath}/", $signatureFile, $signatureFileName);

                $nidFile = $nidFiles[0];
                $nidExt = pathinfo($nidFile, PATHINFO_EXTENSION);
                $nidFileName = 'nid_front_' . Str::slug($customer->customer_no) . '.' . $nidExt;
                $disk->putFileAs("{$basePath}/", $nidFile, $nidFileName);

                $createDocument(
                    KycDocument::PHOTO,
                    $photoFileName,
                    'image/' . $photoExt,
                    KycDocument::STATUS_PENDING,
                );
                $createDocument(
                    KycDocument::SIGNATURE,
                    $signatureFileName,
                    'image/' . $signatureExt,
                    KycDocument::STATUS_PENDING,
                );
                $createDocument(
                    KycDocument::NATIONAL_ID,
                    $nidFileName,
                    'image/' . $nidExt,
                    KycDocument::STATUS_PENDING,
                );
            }

            $address = $key === 'organization'
                ? [
                    'line1' => '24 Road 11',
                    'line2' => 'Banani',
                    'division' => 'Dhaka',
                    'district' => 'Dhaka',
                    'upazila' => 'Gulshan',
                    'union_ward' => 'Ward 19',
                    'postal_code' => '1213',
                ]
                : [
                    'line1' => '12 Road 5',
                    'line2' => 'Dhanmondi',
                    'division' => 'Dhaka',
                    'district' => 'Dhaka',
                    'upazila' => 'Dhanmondi',
                    'union_ward' => 'Ward 15',
                    'postal_code' => '1209',
                ];

            foreach (['CURRENT', 'PERMANENT', 'MAILING'] as $addressType) {
                CustomerAddress::query()->updateOrCreate(
                    ['customer_id' => $customer->id, 'type' => $addressType],
                    array_merge($address, [
                        'country' => 'Bangladesh',
                        'verification_status' => CustomerAddress::STATUS_PENDING,
                        'verified_at' => null,
                        'remarks' => null,
                    ]),
                );
            }

            KycProfile::query()->updateOrCreate(
                ['customer_id' => $customer->id],
                [
                    'primary_verified' => 0,
                    'other_verified' => 0,
                    'kyc_level' => KycProfile::LEVEL_MINIMAL,
                ],
            )->recalculateVerificationCounts();
        }

        $johnDoe = $customers->get('john');
        $janeDoe = $customers->get('jane');
        $minorCustomer = $customers->get('alex');
        $organizationCustomer = $customers->get('organization');

        foreach ([
            [$johnDoe, $janeDoe, CustomerIntroducer::FAMILY],
            [$janeDoe, $johnDoe, CustomerIntroducer::FAMILY],
            [$minorCustomer, $johnDoe, CustomerIntroducer::FAMILY],
            [$organizationCustomer, $janeDoe, CustomerIntroducer::BUSINESS],
        ] as [$introducedCustomer, $introducer, $relationshipType]) {
            CustomerIntroducer::query()->updateOrCreate(
                [
                    'introduced_customer_id' => $introducedCustomer->id,
                    'introducer_customer_id' => $introducer->id,
                ],
                [
                    'introducer_account_id' => null,
                    'relationship_type' => $relationshipType,
                    'verification_status' => CustomerIntroducer::STATUS_PENDING,
                    'verified_at' => null,
                    'remarks' => null,
                ],
            );
        }

        foreach ([
            [$minorCustomer, $johnDoe, CustomerFamilyRelation::FATHER],
            [$minorCustomer, $janeDoe, CustomerFamilyRelation::MOTHER],
            [$johnDoe, $janeDoe, CustomerFamilyRelation::WIFE],
            [$janeDoe, $johnDoe, CustomerFamilyRelation::HUSBAND],
        ] as [$customer, $relative, $relationType]) {
            CustomerFamilyRelation::query()->updateOrCreate(
                ['customer_id' => $customer->id, 'relative_id' => $relative->id],
                [
                    'relation_type' => $relationType,
                    'verification_status' => CustomerFamilyRelation::STATUS_VERIFIED,
                    'verified_at' => now(),
                    'remarks' => null,
                ],
            );
        }

        KycProfile::query()
            ->where('customer_id', $minorCustomer->id)
            ->first()
                ?->recalculateVerificationCounts();

        $this->command->info('Customers seeded with deterministic related data.');
    }
}