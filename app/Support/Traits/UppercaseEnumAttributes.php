<?php

namespace App\Support\Traits;

trait UppercaseEnumAttributes
{
    public function setAttribute($key, $value)
    {
        if (in_array($key, $this->uppercaseEnumAttributes ?? [], true) && is_string($value)) {
            $value = strtoupper($value);
        }

        return parent::setAttribute($key, $value);
    }
}