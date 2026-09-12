<?php

namespace App\CustomerModule\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerFamilyRelationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'relative_id' => $this->relative_id,
            'customer' => $this->whenLoaded('customer', fn() => new CustomerResource($this->customer)),
            'relative' => $this->whenLoaded('relative', fn() => new CustomerResource($this->relative)),
            'relation_type' => $this->relation_type,
            'verification_status' => $this->verification_status,
            'remarks' => $this->remarks,
        ];
    }
}
