<?php

namespace App\Modules\HR\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseClaimResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'tenant_id'        => $this->tenant_id,
            'employee_id'      => $this->employee_id,
            'employee_name'    => $this->whenLoaded('employee', fn () => $this->employee?->full_name),
            'employee'         => $this->whenLoaded('employee', fn () => $this->employee
                ? ['id' => $this->employee->id, 'full_name' => $this->employee->full_name]
                : null),
            'submitted_by'     => $this->submitted_by,
            'submitted_by_name' => $this->whenLoaded('submitter', fn () => $this->submitter?->name),
            'title'            => $this->title,
            'description'      => $this->description,
            'expense_date'     => $this->expense_date?->toDateString(),
            'amount'           => $this->amount,
            'currency_code'    => $this->currency_code,
            'category'         => $this->category,
            'receipt_path'     => $this->receipt_path,
            'status'           => $this->status,
            'reviewed_by'      => $this->reviewed_by,
            'reviewed_by_name' => $this->whenLoaded('reviewer', fn () => $this->reviewer?->name),
            'reviewed_at'      => $this->reviewed_at?->toDateTimeString(),
            'review_notes'     => $this->review_notes,
            'created_by'       => $this->created_by,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
