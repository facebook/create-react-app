<?php

namespace App\Modules\Finance\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAccountRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'code'        => ['required', 'string', 'max:20',
                Rule::unique('accounts')->where('tenant_id', auth()->user()->tenant_id)
                    ->ignore($this->route('account')),
            ],
            'name'        => ['required', 'string', 'max:255'],
            'type'        => ['required', Rule::in(['asset', 'liability', 'equity', 'income', 'expense'])],
            'parent_id'   => ['nullable', 'integer', 'exists:accounts,id'],
            'description' => ['nullable', 'string'],
            'is_active'   => ['boolean'],
        ];
    }
}
