<?php

namespace App\Modules\HR\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'description'     => $this->description,
            'is_active'       => $this->is_active,
            'employees_count' => $this->when(isset($this->employees_count), $this->employees_count),
            'created_at'      => $this->created_at?->toDateString(),
        ];
    }
}
