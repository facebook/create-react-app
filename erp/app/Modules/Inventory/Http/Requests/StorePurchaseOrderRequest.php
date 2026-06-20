<?php

namespace App\Modules\Inventory\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'supplier_id'              => ['required', 'integer', 'exists:suppliers,id'],
            'warehouse_id'             => ['required', 'integer', 'exists:warehouses,id'],
            'expected_date'            => ['nullable', 'date', 'after_or_equal:today'],
            'notes'                    => ['nullable', 'string'],
            'items'                    => ['required', 'array', 'min:1'],
            'items.*.product_id'       => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'         => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_cost'        => ['required', 'numeric', 'min:0'],
        ];
    }
}
