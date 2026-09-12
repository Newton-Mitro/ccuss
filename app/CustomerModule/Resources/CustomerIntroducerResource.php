<?php

namespace App\CustomerModule\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerIntroducerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'introduced_customer_id' => $this->introduced_customer_id,
            'introducer_customer_id' => $this->introducer_customer_id,
            'introducer_account_id' => $this->introducer_account_id,
            'relationship_type' => $this->relationship_type,
            'verification_status' => $this->verification_status,
            'remarks' => $this->remarks,
            'introduced_customer' => $this->whenLoaded('introducedCustomer', fn() => new CustomerResource($this->introducedCustomer)),
            'introducer_customer' => $this->whenLoaded('introducerCustomer', fn() => new CustomerResource($this->introducerCustomer)),
        ];
    }
}
