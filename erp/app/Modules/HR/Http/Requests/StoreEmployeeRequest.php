<?php

namespace App\Modules\HR\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name'      => ['required', 'string', 'max:100'],
            'last_name'       => ['required', 'string', 'max:100'],
            'email'           => ['nullable', 'email'],
            'phone'           => ['nullable', 'string', 'max:50'],
            'employee_number' => ['nullable', 'string', 'max:30',
                Rule::unique('employees')->where('tenant_id', auth()->user()?->tenant_id)
                    ->ignore($this->route('employee')),
            ],
            'department_id'   => ['nullable', 'integer', 'exists:departments,id'],
            'user_id'         => ['nullable', 'integer', 'exists:users,id'],
            // spec: job_title maps to position
            'job_title'       => ['nullable', 'string', 'max:191'],
            'position'        => ['nullable', 'string', 'max:150'],
            'employment_type' => ['required', Rule::in(['full_time', 'part_time', 'contract', 'intern'])],
            'status'          => ['sometimes', Rule::in(['active', 'on_leave', 'terminated'])],
            'start_date'      => ['nullable', 'date'],
            'hire_date'       => ['nullable', 'date'],  // alias for start_date
            'end_date'        => ['nullable', 'date'],
            'termination_date' => ['nullable', 'date'], // alias for end_date
            'salary_type'     => ['sometimes', Rule::in(['hourly', 'monthly'])],
            'salary_amount'   => ['nullable', 'numeric', 'min:0'],
            'salary'          => ['nullable', 'numeric', 'min:0'],  // alias
        ];
    }

    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);

        // Map spec field names to DB column names
        if (isset($data['job_title']) && !isset($data['position'])) {
            $data['position'] = $data['job_title'];
        }
        unset($data['job_title']);

        if (isset($data['hire_date']) && !isset($data['start_date'])) {
            $data['start_date'] = $data['hire_date'];
        }
        unset($data['hire_date']);

        if (isset($data['termination_date']) && !isset($data['end_date'])) {
            $data['end_date'] = $data['termination_date'];
        }
        unset($data['termination_date']);

        if (isset($data['salary']) && !isset($data['salary_amount'])) {
            $data['salary_amount'] = $data['salary'];
        }
        unset($data['salary']);

        // Default values
        if (!isset($data['status'])) {
            $data['status'] = 'active';
        }
        if (!isset($data['salary_type'])) {
            $data['salary_type'] = 'monthly';
        }
        if (!isset($data['start_date']) && !isset($data['hire_date'])) {
            $data['start_date'] = now()->toDateString();
        }

        return $data;
    }
}
