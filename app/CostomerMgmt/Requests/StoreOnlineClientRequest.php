<?php

namespace App\CostomerMgmt\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOnlineClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return false;
    }

    public function rules(): array
    {
        return [
            //
        ];
    }
}
