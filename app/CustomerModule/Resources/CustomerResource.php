<?php

namespace App\CustomerModule\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'branch_id' => $this->branch_id,
            'customer_no' => $this->customer_no,
            'type' => $this->type,
            'name' => $this->name,
            'primary_phone' => $this->primary_phone,
            'alternate_phone' => $this->alternate_phone,
            'primary_email' => $this->primary_email,
            'alternate_email' => $this->alternate_email,
            'identification_type' => $this->identification_type,
            'identification_number' => $this->identification_number,
            'dob' => $this->dob?->format('Y-m-d'),
            'gender' => $this->gender,
            'marital_status' => $this->marital_status,
            'blood_group' => $this->blood_group,
            'nationality' => $this->nationality,
            'occupation' => $this->occupation,
            'education' => $this->education,
            'religion' => $this->religion,
            'status' => $this->status,
            'created_at' => $this->created_at?->toJson(),
            'updated_at' => $this->updated_at?->toJson(),
            'photo' => $this->whenLoaded('photo', fn() => new KycDocumentResource($this->photo)),
            'kyc_profile' => $this->whenLoaded('kycProfile'),
        ];
    }
}
