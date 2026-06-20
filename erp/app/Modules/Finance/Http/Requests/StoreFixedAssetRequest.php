<?php

namespace App\Modules\Finance\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFixedAssetRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                    => ['required', 'string', 'max:191'],
            'category'                => ['required', 'in:equipment,vehicle,building,furniture,intangible,other'],
            'purchase_date'           => ['required', 'date'],
            'purchase_cost'           => ['required', 'numeric', 'min:0.01'],
            'salvage_value'           => ['nullable', 'numeric', 'min:0'],
            'useful_life_years'       => ['required', 'integer', 'min:1', 'max:100'],
            'asset_account_id'        => ['nullable', 'exists:accounts,id'],
            'depreciation_account_id' => ['nullable', 'exists:accounts,id'],
            'description'             => ['nullable', 'string'],
        ];
    }
}
