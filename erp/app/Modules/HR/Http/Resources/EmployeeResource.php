<?php

namespace App\Modules\HR\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'employee_number' => $this->employee_number,
            'code'            => $this->code,
            'first_name'      => $this->first_name,
            'last_name'       => $this->last_name,
            'full_name'       => $this->full_name,
            'email'           => $this->email,
            'phone'           => $this->phone,
            'position'        => $this->position,
            'job_title'       => $this->position,
            'employment_type' => $this->employment_type,
            'status'          => $this->status,
            'start_date'      => $this->start_date?->toDateString(),
            'hire_date'       => $this->start_date?->toDateString(),
            'end_date'        => $this->end_date?->toDateString(),
            'termination_date' => $this->end_date?->toDateString(),
            'salary_type'     => $this->salary_type,
            'salary_amount'   => $this->salary_amount,
            'salary'          => $this->salary_amount,
            'department_id'   => $this->department_id,
            'user_id'         => $this->user_id,
            'department'      => $this->whenLoaded('department', fn () => $this->department
                ? ['id' => $this->department->id, 'name' => $this->department->name]
                : null),
            'user'            => $this->whenLoaded('user', fn () => $this->user
                ? ['id' => $this->user->id, 'name' => $this->user->name]
                : null),
            'leave_requests'  => $this->whenLoaded('leaveRequests', fn () => $this->leaveRequests->map(fn ($lr) => [
                'id'         => $lr->id,
                'leave_type' => $lr->leaveType?->name,
                'start_date' => $lr->start_date?->toDateString(),
                'end_date'   => $lr->end_date?->toDateString(),
                'days'       => $lr->days,
                'status'     => $lr->status,
            ])),
            'created_at'      => $this->created_at?->toDateString(),
        ];
    }
}
