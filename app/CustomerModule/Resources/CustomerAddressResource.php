<?php

namespace App\CustomerModule\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerAddressResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'line1' => $this->line1,
            'line2' => $this->line2,
            'division' => $this->division,
            'district' => $this->district,
            'upazila' => $this->upazila,
            'union_ward' => $this->union_ward,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'type' => $this->type,
            'verification_status' => $this->verification_status,
            'remarks' => $this->remarks,
            'full_address' => $this->fullAddress(),
        ];
    }
}
