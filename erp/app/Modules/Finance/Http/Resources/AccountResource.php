<?php

namespace App\Modules\Finance\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'code'        => $this->code,
            'name'        => $this->name,
            'type'        => $this->type,
            'description' => $this->description,
            'is_active'   => $this->is_active,
            'parent_id'   => $this->parent_id,
            'parent'      => $this->whenLoaded('parent', fn () => [
                'id' => $this->parent->id, 'name' => $this->parent->name, 'code' => $this->parent->code,
            ]),
            'balance'     => $this->when(isset($this->resource->balance), $this->balance),
        ];
    }
}
