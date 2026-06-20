<?php

namespace App\Modules\HR\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaveRequestRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'   => ['required', 'integer', 'exists:employees,id'],
            'leave_type_id' => ['nullable', 'integer', 'exists:leave_types,id'],
            'type'          => ['nullable', 'string', 'in:annual,sick,unpaid,maternity,paternity,other'],
            'start_date'    => ['required', 'date'],
            'end_date'      => ['required', 'date', 'after_or_equal:start_date'],
            'reason'        => ['nullable', 'string'],
            'notes'         => ['nullable', 'string'],
        ];
    }

    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);

        // Map reason -> notes
        if (isset($data['reason']) && !isset($data['notes'])) {
            $data['notes'] = $data['reason'];
        }
        unset($data['reason']);
        unset($data['type']); // type is not a DB column, it's derived from leave_type

        // Compute days if not provided
        if (!isset($data['days'])) {
            $start = \Carbon\Carbon::parse($data['start_date']);
            $end   = \Carbon\Carbon::parse($data['end_date']);
            $data['days'] = max(1, (int) $start->diffInDays($end) + 1);
        }

        return $data;
    }
}
