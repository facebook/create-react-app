<?php

namespace App\Modules\Finance\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['nullable', 'email', 'max:255'],
            'phone'     => ['nullable', 'string', 'max:50'],
            'address'   => ['nullable', 'string'],
            'type'      => ['required', Rule::in(['customer', 'vendor', 'both'])],
            'notes'     => ['nullable', 'string'],
            'is_active'     => ['boolean'],
            'price_list_id' => ['nullable', 'exists:price_lists,id'],
        ];
    }
}
