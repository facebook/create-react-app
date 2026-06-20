<?php

namespace App\Modules\HR\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseClaimRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id'   => 'required|exists:employees,id',
            'title'         => 'required|string|max:191',
            'description'   => 'nullable|string',
            'expense_date'  => 'required|date',
            'amount'        => 'required|numeric|min:0.01',
            'currency_code' => 'nullable|string|size:3',
            'category'      => 'required|in:travel,meals,supplies,accommodation,other',
        ];
    }
}
