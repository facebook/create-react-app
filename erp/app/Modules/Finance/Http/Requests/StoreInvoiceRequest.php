<?php

namespace App\Modules\Finance\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'contact_id'          => ['nullable', 'integer', 'exists:contacts,id'],
            'issue_date'          => ['required', 'date'],
            'due_date'            => ['nullable', 'date', 'after_or_equal:issue_date'],
            'notes'               => ['nullable', 'string'],
            'currency_code'       => ['nullable', 'string', 'size:3'],
            'exchange_rate'       => ['nullable', 'numeric', 'min:0.000001'],
            'items'               => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:500'],
            'items.*.quantity'    => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price'  => ['required', 'numeric', 'min:0'],
            'items.*.tax_rate'    => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
