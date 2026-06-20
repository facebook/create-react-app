<?php

namespace App\Modules\HR\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'employee_id'      => $this->employee_id,
            'employee'         => $this->whenLoaded('employee', fn () => $this->employee
                ? ['id' => $this->employee->id, 'full_name' => $this->employee->full_name]
                : null),
            'leave_type_id'    => $this->leave_type_id,
            'leave_type'       => $this->whenLoaded('leaveType', fn () => $this->leaveType
                ? ['id' => $this->leaveType->id, 'name' => $this->leaveType->name]
                : null),
            'type'             => $this->leaveType?->name ?? 'other',
            'start_date'       => $this->start_date?->toDateString(),
            'end_date'         => $this->end_date?->toDateString(),
            'days'             => $this->days,
            'days_requested'   => (float) ($this->attributes['days_requested'] ?? $this->days),
            'reason'           => $this->reason ?? $this->notes,
            'notes'            => $this->notes,
            'rejection_reason' => $this->rejection_reason,
            'status'           => $this->status,
            'approved_by'      => $this->approved_by ?? $this->reviewed_by,
            'approved_at'      => $this->approved_at?->toDateTimeString() ?? $this->reviewed_at?->toDateTimeString(),
            'reviewed_by'      => $this->reviewed_by,
            'reviewed_at'      => $this->reviewed_at?->toDateTimeString(),
            'approver'         => $this->whenLoaded('approver', fn () => $this->approver
                ? ['id' => $this->approver->id, 'name' => $this->approver->name]
                : null) ?? $this->whenLoaded('reviewer', fn () => $this->reviewer
                ? ['id' => $this->reviewer->id, 'name' => $this->reviewer->name]
                : null),
            'created_at'       => $this->created_at?->toDateString(),
        ];
    }
}
