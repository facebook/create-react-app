<?php

namespace App\Modules\Finance\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'phone'      => $this->phone,
            'address'    => $this->address,
            'type'       => $this->type,
            'notes'      => $this->notes,
            'is_active'  => $this->is_active,
            'created_at' => $this->created_at?->toDateString(),
        ];
    }
}
