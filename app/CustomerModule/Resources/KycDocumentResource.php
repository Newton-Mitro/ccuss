<?php

namespace App\CustomerModule\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class KycDocumentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'document_type' => $this->document_type,
            'file_name' => $this->file_name,
            'file_path' => $this->file_path,
            'mime' => $this->mime,
            'alt_text' => $this->alt_text,
            'verification_status' => $this->verification_status,
            'remarks' => $this->remarks,
            'url' => $this->url,
            'customer' => $this->whenLoaded('customer', fn() => new CustomerResource($this->customer)),
        ];
    }
}
